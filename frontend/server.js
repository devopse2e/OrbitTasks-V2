// server.js  ─ works both locally and on Vercel
require('dotenv').config();
const express = require('express');
const path    = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app  = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/* -------------------------------------------------
   Resolve the directory that contains index.html
   – Locally  :  projectRoot/frontend/dist
   – Vercel λ :  /var/task/frontend/dist
-------------------------------------------------- */
const staticDir =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'dist')               // __dirname === /var/task/frontend
    : path.join(__dirname, 'frontend', 'dist');  // __dirname === project root

console.log('[SERVER] Serving static files from:', staticDir);
app.use(express.static(staticDir));

/* ------------ proxy any /api request to backend ------------- */
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    logLevel: 'info'          //  set to 'debug' only when needed
  })
);

/* -------------- SPA fallback ---------------- */
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

/* -------------- start ------------------------ */
app.listen(PORT, HOST, () => {
  console.log(`[SERVER] Frontend running on http://${HOST}:${PORT}`);
  console.log(`[SERVER] Proxying /api → ${BACKEND_URL}`);
});
