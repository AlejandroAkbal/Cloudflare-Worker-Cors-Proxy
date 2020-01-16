/*
 ** We support the GET, POST, HEAD, and OPTIONS methods from any origin, and accept the Content-Type header on requests.
 ** These headers must be present on all responses to all CORS requests.
 ** In practice, this means all responses to OPTIONS requests.
 **
 ** Modified by Alejandro Akbal (VoidlessSeven7)
 */

/**
 * Fetches the request content and returns it
 * @param {*} request
 */
async function handleRequest(request) {
  // Initialize url and query
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  /*
   * Rewrite request to point to API url. This also makes the request mutable
   * so we can add the correct Origin header to make the API server think
   * that this request isn't cross-site.
   */

  request = new Request(query, request);

  /*
   * Set headers to make the endpoint think it's itself
   */
  request.headers.set('Host', new URL(query).origin);
  request.headers.set('Referer', new URL(query));
  // request.headers.set('Origin', new URL(query))

  // Fetch it
  let response = await fetch(request);

  // Recreate the response so we can modify the headers
  response = new Response(response.body, response);

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', url.origin);

  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append('Vary', 'Origin');

  // Return it
  return response;
}

/**
 * Makes sure that the necessary headers are present for this to be a valid pre-flight request
 * @param {*} request
 */
async function handleOptions(request) {
  /*
   * Handle CORS pre-flight request.
   * If you want to check the requested method + headers you can do that here.
   */
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    /*
     * Handle standard OPTIONS request.
     * If you want to allow other HTTP Methods, you can do that here.
     */
  } else {
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS'
      }
    });
  }
}

/*
 ** Event listener for fetching content (What starts everything)
 */
addEventListener('fetch', event => {
  // Initialize
  const request = event.request;

  // Handle CORS preflight requests
  switch (request.method) {
    case 'OPTIONS':
      event.respondWith(handleOptions(request));
      break;

    // Handle requests
    case 'GET':
    case 'HEAD':
    case 'POST':
      event.respondWith(handleRequest(request));
      break;

    // If no good option then return error
    default:
      event.respondWith(async () => {
        return new Response(null, {
          status: 405,

          statusText: 'Method Not Allowed'
        });
      });
      break;
  }
});
