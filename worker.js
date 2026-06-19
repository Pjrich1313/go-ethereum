/**
 * Cloudflare Worker for go-ethereum
 *
 * Provides API endpoints for the go-ethereum project, including:
 * - Blockchain data and ETH balance auditing
 * - Wave sweep records (paginated)
 * - Payout tracking (GET + POST)
 * - Aggregated statistics (/stats)
 * - Health check and project info
 */

/**
 * Generate CORS headers for the response
 * In production, configure allowed origins in your wrangler.toml environment variables.
 * Add ALLOWED_ORIGINS variable with comma-separated list of allowed domains.
 */
function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env?.ALLOWED_ORIGINS?.split(',') || [];

  // Check if the origin is in the allowed list
  const isAllowedOrigin = allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : (allowedOrigins[0] || 'null'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Secret',
  };
}

/**
 * Fetch live ETH balances for a list of addresses via go-ethereum JSON-RPC.
 * Returns an array of { address, balanceWei, balanceEth } objects.
 * Requests are issued concurrently via Promise.all to minimise latency.
 *
 * @param {string[]} addresses - Ethereum addresses to query
 * @param {string} rpcUrl     - go-ethereum (or compatible) JSON-RPC endpoint URL
 */
async function fetchEthBalances(addresses, rpcUrl) {
  const requests = addresses.map(async (address) => {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`eth_getBalance failed for ${address}: HTTP ${response.status}`);
    }

    const data = await response.json();
    const balanceWei = BigInt(data.result || '0x0');

    // Compute ETH value using BigInt arithmetic to avoid floating-point
    // precision loss for large balances (>2^53 wei).
    const WEI_PER_ETH = 10n ** 18n;
    const SCALE = 10n ** 6n;
    const integerPart = balanceWei / WEI_PER_ETH;
    const remainder = balanceWei % WEI_PER_ETH;
    const decimalPart = (remainder * SCALE) / WEI_PER_ETH;
    const balanceEth = `${integerPart}.${decimalPart.toString().padStart(6, '0')}`;

    return { address, balanceWei: balanceWei.toString(), balanceEth };
  });

  return Promise.all(requests);
}

const WAVE_DEFAULT_LIMIT = 10;
const WAVE_MAX_LIMIT = 100;
const WAVE_DEFAULT_OFFSET = 0;

const PAYOUT_DEFAULT_LIMIT = 10;
const PAYOUT_MAX_LIMIT = 100;
const PAYOUT_DEFAULT_OFFSET = 0;

/**
 * Parse and clamp pagination query parameters.
 * @param {URLSearchParams} searchParams
 * @param {number} defaultLimit
 * @param {number} maxLimit
 * @param {number} defaultOffset
 * @returns {{ limit: number, offset: number }}
 */
function parsePaginationParams(searchParams, defaultLimit, maxLimit, defaultOffset) {
  const rawLimit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);
  const rawOffset = parseInt(searchParams.get('offset') || String(defaultOffset), 10);
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? defaultLimit : Math.min(rawLimit, maxLimit);
  const offset = Number.isNaN(rawOffset) || rawOffset < 0 ? defaultOffset : rawOffset;
  return { limit, offset };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: getCorsHeaders(request, env)
      });
    }

    // Handle different routes
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        name: 'go-ethereum Cloudflare Worker',
        version: '1.0.0',
        description: 'Cloudflare Worker for go-ethereum project',
        endpoints: {
          '/': 'This information endpoint',
          '/health': 'Health check endpoint',
          '/info': 'Project information',
          'GET /wave': 'Returns recent wave sweep records (supports ?limit and ?offset for pagination)',
          'POST /wave': 'Initiates a wave sweep (requires X-Webhook-Secret header and proofOfWork body field)',
          'GET /stats': 'Returns aggregated statistics: total sweeps, unique addresses audited, latest sweep timestamp',
          'GET /payout': 'Returns recent payout records (supports ?limit and ?offset for pagination)',
          'POST /payout': 'Records a payout request (requires X-Webhook-Secret header, recipientAddress, and amountEth)',
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env)
        }
      });
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env)
        }
      });
    }

    if (url.pathname === '/info') {
      return new Response(JSON.stringify({
        project: 'go-ethereum',
        description: 'Golang execution layer implementation of the Ethereum protocol',
        repository: 'https://github.com/Pjrich1313/go-ethereum',
        documentation: 'https://geth.ethereum.org/',
        license: 'LGPL-3.0 / GPL-3.0'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env)
        }
      });
    }

    // -------------------------------------------------------------------------
    // GET /stats — return aggregated statistics from the D1 database
    // -------------------------------------------------------------------------
    if (url.pathname === '/stats' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const [sweepStats, balanceStats] = await env.DB.batch([
        env.DB.prepare(
          `SELECT
             COUNT(*) AS total_sweeps,
             MAX(created_at) AS latest_sweep_at
           FROM wave_sweeps`
        ),
        env.DB.prepare(
          `SELECT COUNT(*) AS unique_addresses FROM balances`
        ),
      ]);

      const sweep = sweepStats.results[0] || {};
      const balance = balanceStats.results[0] || {};

      return new Response(JSON.stringify({
        totalSweeps: sweep.total_sweeps ?? 0,
        latestSweepAt: sweep.latest_sweep_at ?? null,
        uniqueAddressesAudited: balance.unique_addresses ?? 0,
      }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // -------------------------------------------------------------------------
    // GET /wave — return recent wave sweep records (paginated)
    //   ?limit  — number of records to return (default 10, max 100)
    //   ?offset — number of records to skip (default 0)
    // -------------------------------------------------------------------------
    if (url.pathname === '/wave' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const { limit, offset } = parsePaginationParams(
        url.searchParams, WAVE_DEFAULT_LIMIT, WAVE_MAX_LIMIT, WAVE_DEFAULT_OFFSET
      );

      const [result, countResult] = await env.DB.batch([
        env.DB.prepare(
          `SELECT id, initiated_by, proof_of_work, addresses_audited, balances_snapshot, created_at
           FROM wave_sweeps
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`
        ).bind(limit, offset),
        env.DB.prepare(`SELECT COUNT(*) AS total FROM wave_sweeps`),
      ]);

      const total = countResult.results[0]?.total ?? 0;

      return new Response(JSON.stringify({
        sweeps: result.results,
        pagination: { limit, offset, total },
      }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // -------------------------------------------------------------------------
    // POST /wave — initiate a wave sweep
    //   • Requires X-Webhook-Secret header matching env.WEBHOOK_SECRET        → 401
    //   • Requires non-empty proofOfWork string in request body               → 400
    //   • Accepts optional addresses[] (≤20); fetches live ETH balances       → audit
    // -------------------------------------------------------------------------
    if (url.pathname === '/wave' && request.method === 'POST') {
      // 1. Enforce webhook secret authorization
      const incomingSecret = request.headers.get('X-Webhook-Secret');
      if (!env.WEBHOOK_SECRET || incomingSecret !== env.WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 2. Parse and validate request body
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const { initiatedBy, proofOfWork, addresses } = body;

      // 3. Require non-empty proofOfWork
      if (!proofOfWork || typeof proofOfWork !== 'string' || proofOfWork.trim() === '') {
        return new Response(JSON.stringify({ error: 'proofOfWork is required and must be a non-empty string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 4. Validate addresses (optional, max 20)
      const addrs = Array.isArray(addresses) ? addresses : [];
      if (addrs.length > 20) {
        return new Response(JSON.stringify({ error: 'addresses must not exceed 20 entries' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 5. Fetch live ETH balances for audited addresses
      let balancesSnapshot = [];
      if (addrs.length > 0 && env.ETH_RPC_URL) {
        balancesSnapshot = await fetchEthBalances(addrs, env.ETH_RPC_URL);
      }

      // 6. Persist the sweep record
      const waveId = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO wave_sweeps (id, initiated_by, proof_of_work, addresses_audited, balances_snapshot, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        waveId,
        initiatedBy || null,
        proofOfWork.trim(),
        JSON.stringify(addrs),
        JSON.stringify(balancesSnapshot),
        now,
      ).run();

      // 7. Persist individual balance records in a single batched transaction
      if (balancesSnapshot.length > 0) {
        const balanceInserts = balancesSnapshot.map((bal) =>
          env.DB.prepare(
            `INSERT OR REPLACE INTO balances (address, balance_eth, recorded_at) VALUES (?, ?, ?)`
          ).bind(bal.address, bal.balanceEth, now)
        );
        await env.DB.batch(balanceInserts);
      }

      return new Response(JSON.stringify({
        waveId,
        proofOfWork: proofOfWork.trim(),
        ethAudit: {
          addressesAudited: addrs.length,
          balancesSnapshot,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // -------------------------------------------------------------------------
    // GET /payout — return recent payout records (paginated)
    //   ?limit  — number of records to return (default 10, max 100)
    //   ?offset — number of records to skip (default 0)
    // -------------------------------------------------------------------------
    if (url.pathname === '/payout' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const { limit, offset } = parsePaginationParams(
        url.searchParams, PAYOUT_DEFAULT_LIMIT, PAYOUT_MAX_LIMIT, PAYOUT_DEFAULT_OFFSET
      );

      const [result, countResult] = await env.DB.batch([
        env.DB.prepare(
          `SELECT id, recipient_address, amount_eth, status, initiated_by, note, created_at
           FROM payouts
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`
        ).bind(limit, offset),
        env.DB.prepare(`SELECT COUNT(*) AS total FROM payouts`),
      ]);

      const total = countResult.results[0]?.total ?? 0;

      return new Response(JSON.stringify({
        payouts: result.results,
        pagination: { limit, offset, total },
      }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // -------------------------------------------------------------------------
    // POST /payout — record a payout request
    //   • Requires X-Webhook-Secret header matching env.WEBHOOK_SECRET        → 401
    //   • Requires recipientAddress (non-empty string)                        → 400
    //   • Requires amountEth (positive numeric string)                        → 400
    //   • Optional: initiatedBy, note
    // -------------------------------------------------------------------------
    if (url.pathname === '/payout' && request.method === 'POST') {
      // 1. Enforce webhook secret authorization
      const incomingSecret = request.headers.get('X-Webhook-Secret');
      if (!env.WEBHOOK_SECRET || incomingSecret !== env.WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 2. Parse request body
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const { recipientAddress, amountEth, initiatedBy, note } = body;

      // 3. Validate recipientAddress
      if (!recipientAddress || typeof recipientAddress !== 'string' || recipientAddress.trim() === '') {
        return new Response(JSON.stringify({ error: 'recipientAddress is required and must be a non-empty string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 4. Validate amountEth (must be a positive number); store as the original
      //    string to preserve precision — do not round-trip through float.
      const parsedAmount = parseFloat(amountEth);
      if (amountEth === undefined || amountEth === null || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return new Response(JSON.stringify({ error: 'amountEth is required and must be a positive number' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }
      const amountEthStr = String(amountEth).trim();

      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 5. Persist the payout record with status 'pending'
      const payoutId = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO payouts (id, recipient_address, amount_eth, status, initiated_by, note, created_at)
         VALUES (?, ?, ?, 'pending', ?, ?, ?)`
      ).bind(
        payoutId,
        recipientAddress.trim(),
        amountEthStr,
        initiatedBy || null,
        note || null,
        now,
      ).run();

      return new Response(JSON.stringify({
        payoutId,
        recipientAddress: recipientAddress.trim(),
        amountEth: amountEthStr,
        status: 'pending',
        createdAt: now,
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  }
};
