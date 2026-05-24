/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Centralized Authentication Service
 * Used by both Admin and Developer login flows.
 */

const TOKEN_KEY = 'conqueror_auth_token';
const ROLE_KEY = 'conqueror_auth_role';
const USER_KEY = 'conqueror_auth_user';

/** Store auth data after successful login */
export function setAuthData(token: string, role: string, user: any): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Get authentication token */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Get current user's role */
export function getAuthRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

/** Get current user data */
export function getAuthUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Clear all auth data */
export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/** Check if authenticated user has a specific role */
export function hasRole(role: string): boolean {
  return getAuthRole() === role;
}

/** Send authenticated API requests with Bearer Token */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
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
    const errData = await response.json().catch(() => ({}));
    // Don't auto-redirect — let the caller handle this
    throw new Error(errData.error || 'Access denied. Session may have expired.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

/** Unified login — works for both admin and developer */
export async function login(credentials: { username: string; password: string }): Promise<any> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Invalid credentials.');
  }

  const data = await response.json();
  if (data.token) {
    setAuthData(data.token, data.user.role, data.user);
  }
  return data;
}

/** Logout — clears local auth and calls backend */
export async function logout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch {
    // Backend logout failed — still clear local state
  }
  clearAuthData();
}

/** Fetch current user profile from backend */
export async function fetchProfile(): Promise<any> {
  return apiRequest('/api/auth/profile');
}
