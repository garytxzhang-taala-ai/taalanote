export default async function handler(request, response) {
  // CORS configuration
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Get API Key from environment variables (Server-side)
  // Or fallback to the incoming Authorization header (Client-side)
  const serverApiKey = process.env.VITE_VOLCENGINE_API_KEY || process.env.VOLCENGINE_API_KEY;
  const incomingAuth = request.headers['authorization'];
  
  let authHeader = incomingAuth;
  if (serverApiKey) {
    authHeader = `Bearer ${serverApiKey}`;
  }

  if (!authHeader) {
    console.error('Missing Authorization header and Server API Key');
    response.status(401).json({ error: 'Unauthorized', details: 'Missing API Key' });
    return;
  }

  try {
    const upstreamUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
    
    // Log the attempt (without sensitive data)
    console.log(`Proxying request to ${upstreamUrl}`);

    const fetchResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(request.body),
    });

    const data = await fetchResponse.json();
    
    if (!fetchResponse.ok) {
      console.error('Upstream API error:', data);
    }

    response.status(fetchResponse.status).json(data);
  } catch (error) {
    console.error('Proxy internal error:', error);
    response.status(500).json({ 
      error: 'Internal Proxy Error', 
      details: error.message,
      code: 'PROXY_CONNECTION_FAILED' 
    });
  }
}
