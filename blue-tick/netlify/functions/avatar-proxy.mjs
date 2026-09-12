const netlifyAvatarCache = new Map();
const MAX_LAMBDA_CACHE = 100;

export async function handler(event) {
  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Missing url param',
    };
  }

  // Check memory cache in warm instance
  if (netlifyAvatarCache.has(targetUrl)) {
    const cached = netlifyAvatarCache.get(targetUrl);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
      body: cached.base64,
      isBase64Encoded: true,
    };
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/',
      },
    });

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(buf).toString('base64');

    if (res.ok) {
      netlifyAvatarCache.set(targetUrl, { contentType, base64, buffer: buf });
      if (netlifyAvatarCache.size > MAX_LAMBDA_CACHE) {
        const oldest = netlifyAvatarCache.keys().next().value;
        netlifyAvatarCache.delete(oldest);
      }
    }

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Proxy error: ' + err.message,
    };
  }
}

export default async (req) => {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing url param', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (netlifyAvatarCache.has(targetUrl)) {
    const cached = netlifyAvatarCache.get(targetUrl);
    return new Response(cached.buffer, {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/',
      },
    });

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    if (res.ok) {
      netlifyAvatarCache.set(targetUrl, {
        contentType,
        base64: Buffer.from(buf).toString('base64'),
        buffer: buf,
      });
      if (netlifyAvatarCache.size > MAX_LAMBDA_CACHE) {
        const oldest = netlifyAvatarCache.keys().next().value;
        netlifyAvatarCache.delete(oldest);
      }
    }

    return new Response(buf, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response('Proxy error: ' + err.message, {
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
