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

// Minimum length (in hex characters, excluding the '0x' prefix) that a
// RLP-encoded Ethereum transaction must have.  A bare ETH value transfer
// (type-0, no data) encodes to roughly 110+ hex chars; 100 is a safe floor
// that rejects obviously malformed payloads while accepting all real txs.
const MIN_SIGNED_TX_HEX_LENGTH = 100;

// Maximum number of records returned by the GET /transfer listing endpoint.
const MAX_TRANSFER_RECORDS = 20;

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
          'GET /transfer': `Returns the ${MAX_TRANSFER_RECORDS} most recent ETH transfer records`,
          'POST /transfer': 'Broadcasts a pre-signed ETH transaction (requires X-Webhook-Secret header and signedTx body field)',
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
    // GET /transfer — return the 20 most recent transfer records
    // -------------------------------------------------------------------------
    if (url.pathname === '/transfer' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const result = await env.DB.prepare(
        `SELECT id, initiated_by, tx_hash, status, created_at
         FROM transfers
         ORDER BY created_at DESC
         LIMIT ${MAX_TRANSFER_RECORDS}`
      ).all();

      return new Response(JSON.stringify({ transfers: result.results }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // -------------------------------------------------------------------------
    // POST /transfer — broadcast a pre-signed ETH transaction
    //   • Requires X-Webhook-Secret header matching env.WEBHOOK_SECRET        → 401
    //   • Requires non-empty signedTx (0x-prefixed raw tx hex) in request body → 400
    //   • Calls eth_sendRawTransaction on env.ETH_RPC_URL                     → txHash
    //   • Audits the submission in the transfers D1 table
    //
    // The caller is responsible for signing the transaction offline (e.g. with
    // ethers.js or cast) and passing the resulting raw hex here.  The worker
    // never holds a private key.
    // -------------------------------------------------------------------------
    if (url.pathname === '/transfer' && request.method === 'POST') {
      // 1. Enforce webhook secret authorization
      const incomingSecret = request.headers.get('X-Webhook-Secret');
      if (!env.WEBHOOK_SECRET || incomingSecret !== env.WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      if (!env.ETH_RPC_URL) {
        return new Response(JSON.stringify({ error: 'ETH_RPC_URL is not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
          status: 503,
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

      const { signedTx, initiatedBy } = body;

      // 3. Require a non-empty 0x-prefixed hex string of at least 100 hex chars
      //    (a bare ETH transfer RLP-encodes to well over 100 characters).
      const signedTxRegex = new RegExp(`^0x[0-9a-fA-F]{${MIN_SIGNED_TX_HEX_LENGTH},}$`);
      if (!signedTx || typeof signedTx !== 'string' || !signedTxRegex.test(signedTx.trim())) {
        return new Response(JSON.stringify({ error: `signedTx is required and must be a 0x-prefixed hex string of at least ${MIN_SIGNED_TX_HEX_LENGTH} characters` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      // 4. Broadcast via eth_sendRawTransaction
      const rpcResponse = await fetch(env.ETH_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [signedTx.trim()],
          id: 1,
        }),
      });

      if (!rpcResponse.ok) {
        return new Response(JSON.stringify({ error: `RPC request failed: HTTP ${rpcResponse.status}` }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const rpcData = await rpcResponse.json();

      if (rpcData.error) {
        // Return only the message string to avoid leaking internal RPC details.
        return new Response(JSON.stringify({ error: rpcData.error.message || 'RPC error' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
        });
      }

      const txHash = rpcData.result;

      // 5. Audit the transfer in D1
      const transferId = crypto.randomUUID();
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO transfers (id, initiated_by, signed_tx, tx_hash, status, created_at)
         VALUES (?, ?, ?, ?, 'submitted', ?)`
      ).bind(
        transferId,
        initiatedBy || null,
        signedTx.trim(),
        txHash,
        now,
      ).run();

      return new Response(JSON.stringify({ transferId, txHash }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) },
      });
    }

    // 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  }
};
