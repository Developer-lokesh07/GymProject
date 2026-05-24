/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { login, logout, getProfile } from './controllers/authController.js';
import { getLandingPageData } from './controllers/dataController.js';
import { createLead, getAllLeads, deleteLead } from './controllers/leadController.js';
import {
  getSections,
  updateSection,
  getSettings,
  updateSettings,
  getAuditLogs,
  getAdminStats
} from './controllers/developerController.js';
import { authMiddleware, requireRole } from './middleware/auth.js';
import { loginRateLimiter } from './middleware/rateLimiter.js';

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

// Disable caching for dynamic API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ============================================
// Public Routes (No Auth Required)
// ============================================
app.get('/api/landing-data', getLandingPageData);
app.post('/api/leads', createLead);

// ============================================
// Auth Routes (Shared by Admin & Developer)
// ============================================
app.post('/api/auth/login', loginRateLimiter, login);
app.post('/api/auth/logout', authMiddleware, logout);
app.get('/api/auth/profile', authMiddleware, getProfile);

// ============================================
// Admin-Only Routes (requireRole('admin'))
// ============================================
app.get('/api/admin/leads', authMiddleware, requireRole('admin'), getAllLeads);
app.delete('/api/admin/leads/:id', authMiddleware, requireRole('admin'), deleteLead);
app.get('/api/admin/stats', authMiddleware, requireRole('admin'), getAdminStats);

// ============================================
// Developer-Only Routes (requireRole('developer'))
// ============================================
app.get('/api/developer/sections', authMiddleware, requireRole('developer'), getSections);
app.put('/api/developer/sections/:section', authMiddleware, requireRole('developer'), updateSection);
app.get('/api/developer/settings', authMiddleware, requireRole('developer'), getSettings);
app.put('/api/developer/settings', authMiddleware, requireRole('developer'), updateSettings);
app.get('/api/developer/audit-logs', authMiddleware, requireRole('developer'), getAuditLogs);

// ============================================
// Health Check
// ============================================
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
    console.log('');
    console.log('📋 Route Groups:');
    console.log('   Public:    GET /api/landing-data, POST /api/leads');
    console.log('   Auth:      POST /api/auth/login, POST /api/auth/logout, GET /api/auth/profile');
    console.log('   Admin:     GET /api/admin/leads, DELETE /api/admin/leads/:id, GET /api/admin/stats');
    console.log('   Developer: GET/PUT /api/developer/sections, GET/PUT /api/developer/settings, GET /api/developer/audit-logs');
  });
}

startServer();
