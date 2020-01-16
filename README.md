# Cloudflare Worker Cors Proxy

This is a modified version of a worker that I found on the [Cloudflare worker template gallery](https://developers.cloudflare.com/workers/templates/).

You can compare [my version](worker.js) against the [original](worker.original.js).

> This worker support GET, POST, HEAD, and OPTIONS

## Features

- Improved code readability
- Improved functionality (Changed 'IFs' to 'Switch', removed unnecessary code, etc.)
- Removed unnecessary HTML response

## Installing

Copy and paste the content from `worker.js` to your Cloudflare Worker code, thats it.

## Usage

Fetch directly to your worker with the 'q' query followed by the url you want to proxy

```javascript
https://corsproxy.example.workers.dev/?q=https://example.com/image.png
```
