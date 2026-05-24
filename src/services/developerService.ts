/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from './authService';

/**
 * Developer Dashboard API Service
 * All CMS, content, settings, and audit endpoints.
 */

/** Fetch list of editable sections */
export async function fetchSections(): Promise<string[]> {
  const data = await apiRequest('/api/developer/sections');
  return data.sections;
}

/** Update a specific section's content */
export async function updateSectionData(section: string, sectionData: any): Promise<any> {
  return apiRequest(`/api/developer/sections/${section}`, {
    method: 'PUT',
    body: JSON.stringify(sectionData)
  });
}

/** Fetch all site settings */
export async function fetchSettings(): Promise<Record<string, string>> {
  const data = await apiRequest('/api/developer/settings');
  return data.settings;
}

/** Update site settings */
export async function updateSettings(settingsData: Record<string, string>): Promise<any> {
  return apiRequest('/api/developer/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData)
  });
}

/** Fetch audit logs with pagination */
export async function fetchAuditLogs(limit = 100, offset = 0): Promise<{
  logs: any[];
  total: number;
  limit: number;
  offset: number;
}> {
  return apiRequest(`/api/developer/audit-logs?limit=${limit}&offset=${offset}`);
}

/** Fetch full landing page data (public endpoint, for developer preview) */
export async function fetchLandingData(): Promise<any> {
  const response = await fetch('/api/landing-data');
  if (!response.ok) {
    throw new Error('Failed to fetch landing page data');
  }
  return response.json();
}
