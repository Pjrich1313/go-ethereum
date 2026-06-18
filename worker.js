/**
 * Cloudflare Worker for go-ethereum
 *
 * This is a simple API endpoint that provides information about the go-ethereum project.
 * It can be extended to provide various functionalities such as:
 * - API endpoints for blockchain data
 * - Documentation server
 * - Status checks
 * - Webhook handlers
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
 *
 * @param {string[]} addresses - Ethereum addresses to query
 * @param {string} rpcUrl     - go-ethereum (or compatible) JSON-RPC endpoint URL
 */
async function fetchEthBalances(addresses, rpcUrl) {
  const results = [];
  for (const address of addresses) {
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
    const data = await response.json();
    const balanceWei = BigInt(data.result || '0x0');
    const balanceEth = (Number(balanceWei) / 1e18).toFixed(6);
    results.push({ address, balanceWei: balanceWei.toString(), balanceEth });
  }
  return results;
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
          'GET /wave': 'Returns the 10 most recent wave sweep records',
          'POST /wave': 'Initiates a wave sweep (requires X-Webhook-Secret header and proofOfWork body field)',
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
    // GET /wave — return the 10 most recent wave sweep records
    // -------------------------------------------------------------------------
    if (url.pathname === '/wave' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const result = await env.DB.prepare(
        `SELECT id, initiated_by, proof_of_work, addresses_audited, balances_snapshot, created_at
         FROM wave_sweeps
         ORDER BY created_at DESC
         LIMIT 10`
      ).all();

      return new Response(JSON.stringify({ sweeps: result.results }), {
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

      // 7. Persist individual balance records for audit trail
      for (const bal of balancesSnapshot) {
        await env.DB.prepare(
          `INSERT OR REPLACE INTO balances (address, balance_eth, recorded_at) VALUES (?, ?, ?)`
        ).bind(bal.address, bal.balanceEth, now).run();
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

    // 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  }
};
