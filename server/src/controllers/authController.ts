/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { AuthenticatedRequest, logAudit } from '../middleware/auth.js';

/**
 * Unified login endpoint for both Admin and Developer users.
 * Returns JWT token with role information.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const users = rows as any[];

    if (users.length === 0) {
      await logAudit(null, username, 'auth.login_failed', 'auth', 'Invalid username', clientIp);
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await logAudit(user.id, username, 'auth.login_failed', 'auth', 'Invalid password', clientIp);
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    // Fetch role from RBAC tables
    const [roleRows] = await pool.query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = (roleRows as any[]).map(r => r.name);
    const primaryRole = roles[0] || user.role; // Fallback to legacy role column

    const secret = process.env.JWT_SECRET || 'super_secret_gym_key_change_me_in_production';
    const expires: any = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: primaryRole },
      secret,
      { expiresIn: expires }
    );

    // Fetch permissions for the user's role
    const [permRows] = await pool.query(
      `SELECT DISTINCT p.name FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const permissions = (permRows as any[]).map(p => p.name);

    await logAudit(user.id, username, 'auth.login_success', 'auth', `Login successful as ${primaryRole}`, clientIp);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: primaryRole,
        roles,
        permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

/**
 * Logout endpoint — logs the action for audit purposes.
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (req.user) {
    await logAudit(req.user.id, req.user.username, 'auth.logout', 'auth', 'User logged out', clientIp);
  }

  res.json({ message: 'Logged out successfully.' });
}

/**
 * Get profile of the authenticated user including role and permissions.
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    const users = rows as any[];

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Fetch RBAC roles
    const [roleRows] = await pool.query(
      `SELECT r.name, r.description FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [req.user.id]
    );
    const roles = (roleRows as any[]).map(r => r.name);

    // Fetch permissions
    const [permRows] = await pool.query(
      `SELECT DISTINCT p.name FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [req.user.id]
    );
    const permissions = (permRows as any[]).map(p => p.name);

    const user = users[0];
    res.json({
      user: {
        ...user,
        role: roles[0] || user.role,
        roles,
        permissions,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
