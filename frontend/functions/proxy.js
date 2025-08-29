const { createProxyMiddleware } = require('http-proxy-middleware');

exports.handler = async (event, context) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  // Proxy only /api paths
  if (event.path.startsWith('/api')) {
    return new Promise((resolve, reject) => {
      const proxy = createProxyMiddleware({
        target: backendUrl,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },  // Strip /api from path
        onError: (err) => reject(err)
      });

      proxy(event, context, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });
  }

  // Fallback for non-API (though Netlify handles static)
  return { statusCode: 404, body: 'Not Found' };
};
