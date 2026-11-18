const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middlewares
// Allow CORS for requests coming from local dev or deployed frontend (e.g., Vercel)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // For college testing, permit any origin if CLIENT_URL is not strictly set
      if (!process.env.CLIENT_URL) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify server and database connectivity
 */
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected (Healthy)',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    server: 'Student Management System Backend',
    database: statusMap[dbStatus] || 'Unknown',
    databaseConnected: dbStatus === 1,
    timestamp: new Date().toISOString(),
  });
});

// Student REST API Routes
app.use('/api/students', studentRoutes);

// Fallback to frontend index.html for any unhandled GET routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎓 Student Management System Server Started`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
