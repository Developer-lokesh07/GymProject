/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

/**
 * Core JWT authentication middleware.
 * Verifies Bearer token and attaches decoded user to request.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_gym_key_change_me_in_production';
    const decoded = jwt.verify(token, secret) as {
      id: number;
      username: string;
      role: string;
    };
    
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Role-based authorization middleware.
 * Must be used AFTER authMiddleware.
 * Checks if the authenticated user has one of the allowed roles.
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    try {
      // Query actual role from database (don't rely solely on JWT claim)
      const [rows] = await pool.query(
        `SELECT r.name FROM roles r
         INNER JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [req.user.id]
      );
      const userRoles = (rows as any[]).map(r => r.name);
      
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        res.status(403).json({ 
          error: 'Access denied. Insufficient role privileges.',
          required: allowedRoles,
          current: userRoles
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Authorization check failed.' });
    }
  };
}

/**
 * Permission-based authorization middleware.
 * Must be used AFTER authMiddleware.
 * Checks if the user's role(s) have the required permission.
 */
export function requirePermission(permissionName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    try {
      const [rows] = await pool.query(
        `SELECT p.name FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         INNER JOIN user_roles ur ON ur.role_id = rp.role_id
         WHERE ur.user_id = ? AND p.name = ?`,
        [req.user.id, permissionName]
      );

      if ((rows as any[]).length === 0) {
        res.status(403).json({ 
          error: `Access denied. Missing permission: ${permissionName}` 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed.' });
    }
  };
}

/**
 * Audit logging utility.
 * Records user actions to the audit_logs table.
 */
export async function logAudit(
  userId: number | null,
  username: string,
  action: string,
  resource: string,
  details: string,
  ipAddress: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, username, action, resource, details, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, username, action, resource, details, ipAddress]
    );
  } catch (error) {
    console.error('Audit log write error:', error);
    // Don't throw — audit logging should never break the request
  }
}
