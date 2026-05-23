/* eslint-disable @typescript-eslint/no-explicit-any */
const TOKEN_KEY = 'conqueror_admin_token';

/** Set authentication token in localStorage */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Get authentication token from localStorage */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Clear authentication token from localStorage */
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Check if admin is currently authenticated */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/** Send authenticated API requests with Bearer Token */
async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    clearAuthToken();
    window.location.href = '/admin';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

/** Admin Login */
export async function loginAdmin(credentials: any): Promise<any> {
  const data = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!data.ok) {
    const errData = await data.json().catch(() => ({}));
    throw new Error(errData.error || 'Invalid credentials.');
  }

  const res = await data.json();
  if (res.token) {
    setAuthToken(res.token);
  }
  return res;
}

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

/** Update specific landing page section in MySQL */
export async function updateSectionData(section: string, sectionData: any): Promise<any> {
  return apiRequest(`/api/admin/sections/${section}`, {
    method: 'PUT',
    body: JSON.stringify(sectionData)
  });
}
