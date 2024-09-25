/*
 ** We support the GET, HEAD, and OPTIONS methods from any origin, and accept the Content-Type header on requests.
 ** These headers must be present on all responses to all CORS requests.
 ** In practice, this means all responses to OPTIONS requests.
 **
 ** Modified by Alejandro Akbal
 */

async function handleRequest(request) {
    const urlStringFromQuery = new URL(request.url).searchParams.get('q')

    if (!urlStringFromQuery) {
        return new Response(null, {
            status: 422,
            statusText: 'You have to append a query: "?q=URL"',
        })
    }

    const urlFromQuery = new URL(urlStringFromQuery)

    request = new Request(urlFromQuery.toString(), {
        ...request,

        // Cloudflare settings
        cf: {
            cacheEverything: true,
        },
    })

    request.headers.set('Host', urlFromQuery.origin)
    request.headers.set('Referer', urlFromQuery.toString())

    const originalResponse = await fetch(request)

    const response = new Response(originalResponse.body, originalResponse)

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Vary', 'Origin')

    // Allow downloading
    response.headers.set('Content-Disposition', 'attachment')

    return response
}

async function handleOptions(request) {
    /*
     * Handle CORS pre-flight request.
     * If you want to check the requested method + headers you can do that here.
     */
    if (request.headers.get('Origin') !== null && request.headers.get('Access-Control-Request-Method') !== null && request.headers.get('Access-Control-Request-Headers') !== null) {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Max-Age': '86400',
            }
        })

        /*
         * Handle standard OPTIONS request.
         */
    } else {
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, OPTIONS'
            }
        })
    }
}

addEventListener('fetch', event => {
    const {request} = event

    switch (request.method) {

        case 'GET':
        case 'HEAD':
            event.respondWith(handleRequest(request))
            break

        case 'OPTIONS':
            event.respondWith(handleOptions(request))
            break

        default:
            event.respondWith(async () => {
                return new Response(null, {
                    status: 405,
                })
            })
            break
    }
})
