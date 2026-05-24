/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { fetchAllLeads, deleteLeadFromDb, fetchAdminStats } from '../../services/adminService';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load Leads from MySQL
  const loadLeads = async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const data = await fetchAllLeads();
      setLeads(data);
    } catch (err: any) {
      setLeadsError(err.message || 'Failed to load leads.');
    } finally {
      setLeadsLoading(false);
    }
  };

  // Load dashboard stats from backend
  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadLeads();
    loadStats();
  }, []);

  const triggerNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Lead Deletion
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      await deleteLeadFromDb(leadId);
      triggerNotification('Lead deleted successfully from database!', 'success');
      loadLeads();
      loadStats();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to delete lead.', 'error');
    }
  };

  return (
    <div className="dashboard-wrapper">
      {notification && (
        <div className={`dashboard-notification ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.text}
        </div>
      )}

      {/* 1. Dashboard Overview Tab */}
      {activeTab === 'dashboard' && (
        <div className="tab-pane">
          <div className="stats-row">
            <div className="stat-card" onClick={() => setActiveTab('leads')}>
              <span className="card-icon">📈</span>
              <h4>Total Enquiries</h4>
              <div className="stat-val">{stats?.totalLeads ?? leads.length}</div>
              <p>All-time website enquiries</p>
            </div>
            <div className="stat-card">
              <span className="card-icon">📅</span>
              <h4>Today's Enquiries</h4>
              <div className="stat-val">{stats?.todayLeads ?? 0}</div>
              <p>Received today</p>
            </div>
            <div className="stat-card">
              <span className="card-icon">⚡</span>
              <h4>Database Status</h4>
              <div className="stat-val" style={{ color: stats?.dbStatus === 'connected' ? '#10b981' : '#ef4444' }}>
                {stats?.dbStatus === 'connected' ? 'Connected' : 'Checking...'}
              </div>
              <p>MySQL Pool Status</p>
            </div>
            <div className="stat-card">
              <span className="card-icon">🏋️</span>
              <h4>Active Plans</h4>
              <div className="stat-val">{stats?.activePlans ?? 0}</div>
              <p>{stats?.plans?.join(', ') || 'Loading...'}</p>
            </div>
          </div>

          <div className="recent-activity-panel">
            <h3>Recent Enquiries</h3>
            {leadsLoading ? (
              <div className="loader-box">Loading leads...</div>
            ) : leadsError ? (
              <div className="error-box">{leadsError}</div>
            ) : leads.length === 0 ? (
              <p className="no-data">No lead enquiries received yet.</p>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Selected Plan</th>
                    <th>Fitness Goal</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.first_name} {l.last_name || ''}</strong></td>
                      <td>{l.phone}</td>
                      <td><span className="lead-badge plan">{l.plan || 'Not selected'}</span></td>
                      <td><span className="lead-badge goal">{l.goal || 'General'}</span></td>
                      <td>{new Date(l.submitted_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 2. Customer Enquiries CRUD Grid Tab */}
      {activeTab === 'leads' && (
        <div className="tab-pane">
          <div className="section-header-row">
            <h3>Website Enquiries (MySQL)</h3>
            <button className="btn-refresh" onClick={loadLeads} disabled={leadsLoading}>
              🔄 Refresh List
            </button>
          </div>

          {leadsLoading ? (
            <div className="loader-box">Loading all leads from MySQL...</div>
          ) : leadsError ? (
            <div className="error-box">{leadsError}</div>
          ) : leads.length === 0 ? (
            <p className="no-data">No enquiries found in the database.</p>
          ) : (
            <div className="table-responsive">
              <table className="leads-table full">
                <thead>
                  <tr>
                    <th>Submitted At</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>WhatsApp Number</th>
                    <th>Email Address</th>
                    <th>Interested Plan</th>
                    <th>Preferred Batch</th>
                    <th>Fitness Goal</th>
                    <th>Message Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td className="time-col">{new Date(l.submitted_at).toLocaleString()}</td>
                      <td><strong>{l.first_name}</strong></td>
                      <td>{l.last_name || '-'}</td>
                      <td>
                        <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="wa-link">
                          💬 {l.phone}
                        </a>
                      </td>
                      <td>{l.email || '-'}</td>
                      <td><span className="lead-badge plan">{l.plan || '-'}</span></td>
                      <td><span className="lead-badge batch">{l.batch || '-'}</span></td>
                      <td><span className="lead-badge goal">{l.goal || '-'}</span></td>
                      <td className="msg-col" title={l.message}>{l.message || '-'}</td>
                      <td>
                        <button className="btn-delete" onClick={() => handleDeleteLead(l.id)}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
