/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from './authService';

/**
 * Admin Dashboard API Service
 * Operational management: leads, stats, users.
 * 
 * NOTE: Auth functions (login, logout, token management) have been moved
 * to the centralized authService.ts.
 * 
 * NOTE: CMS/content CRUD functions have been moved to developerService.ts
 * and are only accessible to the developer role.
 */

// Re-export auth functions for backward compatibility
export { 
  isAuthenticated, 
  getAuthToken, 
  clearAuthData as clearAuthToken,
  hasRole 
} from './authService';

/** Fetch all lead submissions from MySQL */
export async function fetchAllLeads(): Promise<any[]> {
  return apiRequest('/api/admin/leads');
}

/** Delete a lead submission from MySQL */
export async function deleteLeadFromDb(leadId: string): Promise<any> {
  return apiRequest(`/api/admin/leads/${leadId}`, {
    method: 'DELETE'
  });
}

/** Fetch dashboard statistics from MySQL */
export async function fetchAdminStats(): Promise<{
  totalLeads: number;
  todayLeads: number;
  weekLeads: number;
  activePlans: number;
  plans: string[];
  dbStatus: string;
  totalUsers: number;
}> {
  return apiRequest('/api/admin/stats');
}
