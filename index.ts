const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const indexFile = await Bun.file('./index.html').text(),
  scriptFile = await Bun.file('./script.js').text();

Bun.serve({
  development: process.env.NODE_ENV == 'development',
  port: process.env.PORT ?? 8080,
  static: {
    '/': new Response(indexFile, { headers: { 'Content-Type': 'text/html' } })
  },
  fetch: async (req) => {
    switch (req.method) {
      case 'GET':
        return req.url.includes('.js')
          ? new Response(scriptFile.replace('%URL%', new URL(req.url).origin), {
              headers: {
                ...HEADERS,
                'Content-Type': 'text/javascript',
                'Cache-Control': 'max-age=604800, immutable'
              }
            })
          : Response.redirect('/');
      case 'POST':
        try {
          const result = await fetch(await req.json());
          return new Response(await result.bytes(), {
            headers: {
              ...HEADERS,
              'Content-Type': result.headers.get('content-type') ?? 'application/octet-stream'
            }
          });
        } catch {
          return new Response(null, { status: 500, headers: HEADERS });
        }
      case 'OPTIONS':
        return new Response(null, { headers: HEADERS });
      default:
        return new Response(null, { status: 405, headers: HEADERS });
    }
  }
});
