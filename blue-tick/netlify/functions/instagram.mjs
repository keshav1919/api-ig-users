import { fetchInstagramProfile } from '../../server/instagramService.js';

export async function handler(event) {
  let username = event.queryStringParameters?.username || event.queryStringParameters?.splat;
  if (!username && event.path) {
    const parts = event.path.split('/').filter(Boolean);
    username = parts[parts.length - 1];
  }

  if (!username || username === 'instagram.mjs') {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ exists: false, error: 'Username is required' }),
    };
  }

  try {
    const data = await fetchInstagramProfile(username);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ exists: false, error: err.message }),
    };
  }
}

export default async (req) => {
  const url = new URL(req.url);
  let username = url.searchParams.get('username') || url.searchParams.get('splat');
  if (!username) {
    const parts = url.pathname.split('/').filter(Boolean);
    username = parts[parts.length - 1];
  }

  if (!username || username === 'instagram') {
    return new Response(JSON.stringify({ exists: false, error: 'Username is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const data = await fetchInstagramProfile(username);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ exists: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
