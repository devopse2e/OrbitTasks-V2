const express = require('express');
const serverless = require('serverless-http');
const app = require('../api/index');  // Path to your index.js (adjust if needed)

module.exports.handler = serverless(app);
