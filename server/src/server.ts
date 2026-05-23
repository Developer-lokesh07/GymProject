/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { login, getProfile } from './controllers/authController.js';
import { getLandingPageData, updateSectionData } from './controllers/dataController.js';
import { createLead, getAllLeads, deleteLead } from './controllers/leadController.js';
import { authMiddleware } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Config CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Public Routes
app.get('/api/landing-data', getLandingPageData);
app.post('/api/leads', createLead);

// Admin Auth Routes
app.post('/api/admin/login', login);
app.get('/api/admin/profile', authMiddleware, getProfile);

// Admin Protected Enquiries Routes
app.get('/api/admin/leads', authMiddleware, getAllLeads);
app.delete('/api/admin/leads/:id', authMiddleware, deleteLead);

// Admin Protected Content CRUD Routes
app.put('/api/admin/sections/:section', authMiddleware, updateSectionData);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'healthy',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Initialize server
async function startServer() {
  console.log('🔌 Verifying Database Connection...');
  const isDbOk = await testConnection();
  
  if (!isDbOk) {
    console.warn('⚠️ Warning: Proceeding without active database connection pool. Please ensure MySQL is running.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Express API server running on http://localhost:${PORT}`);
  });
}

startServer();
