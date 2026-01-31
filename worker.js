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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle different routes
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        name: 'go-ethereum Cloudflare Worker',
        version: '1.0.0',
        description: 'Cloudflare Worker for go-ethereum project',
        endpoints: {
          '/': 'This information endpoint',
          '/health': 'Health check endpoint',
          '/info': 'Project information'
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
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
          'Access-Control-Allow-Origin': '*'
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
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  }
};
