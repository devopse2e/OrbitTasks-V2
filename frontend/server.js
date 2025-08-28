// server.js  ─ Express entrypoint for Vercel & local dev
require('dotenv').config();
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app   = express();
const PORT  = process.env.PORT || 80;
const HOST  = '0.0.0.0';

// ---------------- Static frontend -----------------
/*  Resolve once at start so the same path works:
    – locally        : /absolute/path/to/project/frontend/dist
    – in Vercel λ    : /var/task/frontend/dist              */
const STATIC_DIR = path.join(__dirname, 'frontend', 'dist');
console.log('[SERVER] Serving static files from:', STATIC_DIR);
app.use(express.static(STATIC_DIR));

// ---------------- API proxy -----------------
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    logLevel: 'info',       // set to 'debug' for verbose proxy logs
  })
);

// ---------------- SPA fallback -----------------
app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// ---------------- Start server -----------------
app.listen(PORT, HOST, () => {
  console.log(`[SERVER] Frontend running on http://${HOST}:${PORT}`);
  console.log(`[SERVER] Proxying /api → ${BACKEND_URL}`);
});
