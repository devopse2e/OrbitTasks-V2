// Updated /api/index.js with all routes mounted

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import all route handlers
const todoRoutes = require('../src/routes/todoRoutes');
const authRoutes = require('../src/routes/authRoutes');
const userRoutes = require('../src/routes/userRoutes');
const nlpRoutes = require('../src/routes/nlpRoutes');

const errorHandler = require('../src/middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount all routes
app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/nlp', nlpRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'Ready',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Todo API is running!',
    version: '1.0.0',
    docs: '/todos'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection (lazy-loaded for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const mongoUri = process.env.MONGO_URI;

  // Conditional TLS Configuration
  let mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  if (mongoUri.includes('ssl=true')) {
    console.log('✅ SSL/TLS connection detected. Applying DocumentDB options.');
    mongooseOptions = {
      ...mongooseOptions,
      tls: true,
      tlsCAFile: '/etc/ssl/certs/rds-combined-ca-bundle.pem',
    };
  } else {
    console.log('ℹ️ Standard MongoDB connection detected (no TLS).');
  }

  await mongoose.connect(mongoUri, mongooseOptions);
  cachedDb = mongoose.connection;
  console.log('✅ Connected to MongoDB');
  return cachedDb;
}

// Connect to DB on each request (serverless-friendly)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// No app.listen() - Vercel handles it
module.exports = app;
