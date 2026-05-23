/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { loginAdmin, isAuthenticated } from '../../services/adminService';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await loginAdmin({ username, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-bg-grid"></div>
      <div className="login-card reveal visible">
        <div className="login-header">
          <div className="login-logo">
            CONQUEROR<span className="dot"></span>
          </div>
          <h3>Admin Control Center</h3>
          <p>Sign in to manage members, timing schedules, plans, and enquiries.</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="f-group">
            <label className="f-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="f-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          <div className="f-group">
            <label className="f-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="f-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="f-submit" disabled={loading}>
            {loading ? 'Authenticating securely...' : 'Secure Admin Sign In →'}
          </button>
        </form>

        <div className="login-footer">
          🔒 Encrypted JWT Session & Secure Password Hashing
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;
