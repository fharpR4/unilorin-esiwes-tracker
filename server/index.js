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

// ===== TEMP DIAGNOSTIC — REMOVE AFTER DEBUGGING =====
app.get('/debug/projects', async (req, res) => {
  try {
    const Project = require('./models/Project');
    const Application = require('./models/Application');

    const projects = await Project.find({}).lean();
    const approvedApps = await Application.find({ status: 'approved' }).lean();

    res.json({
      totalProjects: projects.length,
      totalApprovedApps: approvedApps.length,
      projects: projects.map(p => ({
        _id: p._id,
        title: p.title,
        status: p.status,
        student: p.student,
        supervisor: p.supervisor,
        application: p.application,
        createdAt: p.createdAt,
      })),
      approvedApps: approvedApps.map(a => ({
        _id: a._id,
        student: a.student,
        supervisor: a.supervisor,
        organizationName: a.organizationName,
        status: a.status,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===== END TEMP DIAGNOSTIC =====

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