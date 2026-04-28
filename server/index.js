// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const corsOptions = require('./config/cors');
// const { generalLimiter } = require('./middleware/rateLimiter');
// const errorHandler = require('./middleware/errorHandler');

// const app = express();

// // Connect to MongoDB Atlas
// connectDB();

// // CORS — must be before all routes
// app.use(cors(corsOptions));

// // Handle preflight OPTIONS requests
// app.options('*', cors(corsOptions));

// // Body parsers — 10MB limit to handle Base64 image strings
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // General rate limiter — applies to all routes
// app.use(generalLimiter);

// // Health check — used by Render and uptime monitors
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     app: 'UniIlorin E-SIWES API',
//     version: '2.0.0',
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//   });
// });

// // Root — confirmation endpoint
// app.get('/', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'UniIlorin E-SIWES Progress Tracker API is running.',
//     docs: 'Refer to the project documentation for API usage.',
//     version: '2.0.0',
//   });
// });

// // API Routes — mounted at /api
// // Routes will be added in Phase 4
// app.use('/api', require('./routes'));

// // 404 handler — for unmatched routes
// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// // Global error handler — MUST be last
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log(
//     `UniIlorin E-SIWES Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
//   );
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received. Shutting down gracefully...');
//   server.close(() => {
//     console.log('HTTP server closed.');
//     process.exit(0);
//   });
// });

// process.on('unhandledRejection', (err) => {
//   console.error('UNHANDLED REJECTION:', err.name, err.message);
//   server.close(() => process.exit(1));
// });



// ================================== NEW CODE (after edits) ==================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    app: 'UniIlorin E-SIWES API',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UniIlorin E-SIWES Progress Tracker API is running.',
    version: '2.0.0',
  });
});

app.use('/api', require('./routes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`UniIlorin E-SIWES Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.name, err.message);
  server.close(() => process.exit(1));
});