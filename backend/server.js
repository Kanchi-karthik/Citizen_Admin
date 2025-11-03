import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic route for server status
app.get('/', (req, res) => {
  res.send('Citizen Admin Backend API is running...');
});

// Error handling middleware (optional, for more robust error messages)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!', error: err.message });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

// Function to find an available port
const findAvailablePort = (port) => {
  return new Promise((resolve, reject) => {
    const testServer = app.listen(port, () => {
      testServer.close(() => {
        resolve(port);
      });
    });

    testServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Start server with port management
findAvailablePort(PORT).then((availablePort) => {
  const server = app.listen(availablePort, () => {
    console.log(`\n✅ Server running on port ${availablePort}`);
    console.log(`🌐 Backend API: http://localhost:${availablePort}/api`);
    console.log('\nTo connect frontend, update API_BASE_URL in constants.js to:');
    console.log(`http://localhost:${availablePort}/api\n`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${availablePort} is already in use.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // graceful shutdown
  const shutdown = () => {
    console.log('\n⏹️  Shutting down server...');
    server.close(() => {
      console.log('✅ Server closed.');
      process.exit(0);
    });

    // force exit if not closed in 10s
    setTimeout(() => {
      console.error('❌ Forcing shutdown.');
      process.exit(1);
    }, 10000);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
