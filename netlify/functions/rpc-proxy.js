// netlify/functions/rpc-proxy.js
// -------------------------------------------------------------
//  Netlify Function: simple HTTP proxy for the Octra RPC endpoint.
//  It receives the JSON‑RPC request body, forwards it to the real
//  node, and returns the raw JSON response with CORS headers.
// -------------------------------------------------------------

export async function handler(event) {
  // The real RPC endpoint – you can override it with an env var
  const RPC_URL = process.env.OCTRA_RPC_URL || "http://46.101.86.250:8080/rpc";

  try {
    const response = await fetch(RPC_URL, {
      method: event.httpMethod,
      headers: {
        "Content-Type": "application/json"
      },
      body: event.body
    });

    const body = await response.text();   // keep raw JSON (string)

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        // Enable CORS for the browser‑side Explorer
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body
    };
  } catch (err) {
    console.error("[rpc-proxy] error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32000, message: err.message } })
    };
  }
}
