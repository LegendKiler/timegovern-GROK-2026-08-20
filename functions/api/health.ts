const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequest(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'TimeGovern Cloudflare Pages & D1 Edge Service',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

export async function onRequestGet(): Promise<Response> {
  return onRequest();
}
