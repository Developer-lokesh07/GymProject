/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { fetchAllLeads, deleteLeadFromDb, updateSectionData } from '../../services/adminService';

interface AdminDashboardProps {
  initialLandingPageData: any;
  onRefreshLandingPage: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialLandingPageData,
  onRefreshLandingPage
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  // Content Editors State
  const [heroForm, setHeroForm] = useState({
    eyebrow: initialLandingPageData?.hero?.eyebrow || '',
    titleLines: initialLandingPageData?.hero?.titleLines || ['', '', ''],
    subtitle: initialLandingPageData?.hero?.subtitle || '',
    badge: {
      rating: initialLandingPageData?.hero?.badge?.rating || '',
      stars: initialLandingPageData?.hero?.badge?.stars || '',
      text: initialLandingPageData?.hero?.badge?.text || ''
    }
  });

  const [timingsForm, setTimingsForm] = useState({
    eyebrow: initialLandingPageData?.timings?.eyebrow || '',
    titleHtml: initialLandingPageData?.timings?.titleHtml || '',
    description: initialLandingPageData?.timings?.description || '',
    closedNote: initialLandingPageData?.timings?.closedNote || ''
  });

  const [pricingForm, setPricingForm] = useState({
    eyebrow: initialLandingPageData?.pricing?.eyebrow || '',
    titleHtml: initialLandingPageData?.pricing?.titleHtml || '',
    subtitle: initialLandingPageData?.pricing?.subtitle || ''
  });

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    loadLeads();
  }, []);

  const triggerNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Lead Deletion CRUD Operation
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      await deleteLeadFromDb(leadId);
      triggerNotification('Lead deleted successfully from database!', 'success');
      loadLeads();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to delete lead.', 'error');
    }
  };

  // Dynamic Section Updates CRUD Operations
  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSectionData('hero', heroForm);
      triggerNotification('Hero section successfully updated in MySQL database!', 'success');
      onRefreshLandingPage();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to update Hero section.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTimings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSectionData('timings', timingsForm);
      triggerNotification('Timings section successfully updated in MySQL database!', 'success');
      onRefreshLandingPage();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to update Timings section.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSectionData('pricing', pricingForm);
      triggerNotification('Pricing headers successfully updated in MySQL database!', 'success');
      onRefreshLandingPage();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to update Pricing headers.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Dynamic Status Notifications banner */}
      {notification && (
        <div className={`dashboard-notification ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.text}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Stats & Summary
        </button>
        <button
          className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          📞 Customer Enquiries ({leads.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          ✏️ Editable Site Content
        </button>
      </div>

      {/* 1. Dashboard Overview Tab */}
      {activeTab === 'dashboard' && (
        <div className="tab-pane">
          <div className="stats-row">
            <div className="stat-card">
              <span className="card-icon">📈</span>
              <h4>Total Enquiries</h4>
              <div className="stat-val">{leads.length}</div>
              <p>Received directly through website contact form</p>
            </div>
            <div className="stat-card">
              <span className="card-icon">⚡</span>
              <h4>Synced Status</h4>
              <div className="stat-val">100%</div>
              <p>All records successfully stored in MySQL database</p>
            </div>
            <div className="stat-card">
              <span className="card-icon">🏋️</span>
              <h4>Active Plans Offered</h4>
              <div className="stat-val">
                {initialLandingPageData?.pricing?.plans?.length || 4}
              </div>
              <p>Basic, Premium, Quarterly, and Annual memberships</p>
            </div>
          </div>

          <div className="recent-activity-panel">
            <h3>Recent Enquiries</h3>
            {leadsLoading ? (
              <div className="loader-box">Loading dynamic leads...</div>
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
            <h3>Website Enquiries (MySQL Backed)</h3>
            <button className="btn-refresh" onClick={loadLeads} disabled={leadsLoading}>
              🔄 Refresh List
            </button>
          </div>

          {leadsLoading ? (
            <div className="loader-box">Loading all leads securely from MySQL...</div>
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

      {/* 3. Site Dynamic Content CRUD Editors Tab */}
      {activeTab === 'content' && (
        <div className="tab-pane">
          <div className="accordion-section">
            <div className="editor-card">
              <h4>🔥 Hero Section Settings</h4>
              <form onSubmit={handleUpdateHero} className="crud-form">
                <div className="f-group">
                  <label className="f-label">Hero Eyebrow Text</label>
                  <input
                    type="text"
                    className="f-input"
                    value={heroForm.eyebrow}
                    onChange={(e) => setHeroForm({ ...heroForm, eyebrow: e.target.value })}
                  />
                </div>
                <div className="f-row">
                  <div className="f-group">
                    <label className="f-label">Title Line 1</label>
                    <input
                      type="text"
                      className="f-input"
                      value={heroForm.titleLines[0]}
                      onChange={(e) => {
                        const lines = [...heroForm.titleLines];
                        lines[0] = e.target.value;
                        setHeroForm({ ...heroForm, titleLines: lines });
                      }}
                    />
                  </div>
                  <div className="f-group">
                    <label className="f-label">Title Line 2</label>
                    <input
                      type="text"
                      className="f-input"
                      value={heroForm.titleLines[1]}
                      onChange={(e) => {
                        const lines = [...heroForm.titleLines];
                        lines[1] = e.target.value;
                        setHeroForm({ ...heroForm, titleLines: lines });
                      }}
                    />
                  </div>
                  <div className="f-group">
                    <label className="f-label">Title Line 3</label>
                    <input
                      type="text"
                      className="f-input"
                      value={heroForm.titleLines[2]}
                      onChange={(e) => {
                        const lines = [...heroForm.titleLines];
                        lines[2] = e.target.value;
                        setHeroForm({ ...heroForm, titleLines: lines });
                      }}
                    />
                  </div>
                </div>
                <div className="f-group">
                  <label className="f-label">Hero Subtitle</label>
                  <textarea
                    className="f-input"
                    rows={2}
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  />
                </div>
                <button type="submit" className="f-submit inline" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Update Hero Section'}
                </button>
              </form>
            </div>

            <div className="editor-card">
              <h4>⏰ Operation Hours & Timings Settings</h4>
              <form onSubmit={handleUpdateTimings} className="crud-form">
                <div className="f-group">
                  <label className="f-label">Timings Eyebrow</label>
                  <input
                    type="text"
                    className="f-input"
                    value={timingsForm.eyebrow}
                    onChange={(e) => setTimingsForm({ ...timingsForm, eyebrow: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label className="f-label">Title (HTML Supported)</label>
                  <input
                    type="text"
                    className="f-input"
                    value={timingsForm.titleHtml}
                    onChange={(e) => setTimingsForm({ ...timingsForm, titleHtml: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label className="f-label">Timing Subtitle Description</label>
                  <textarea
                    className="f-input"
                    rows={2}
                    value={timingsForm.description}
                    onChange={(e) => setTimingsForm({ ...timingsForm, description: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label className="f-label">Closed Day Announcement Note</label>
                  <input
                    type="text"
                    className="f-input"
                    value={timingsForm.closedNote}
                    onChange={(e) => setTimingsForm({ ...timingsForm, closedNote: e.target.value })}
                  />
                </div>
                <button type="submit" className="f-submit inline" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Update Timings Section'}
                </button>
              </form>
            </div>

            <div className="editor-card">
              <h4>💳 Membership Price Plans Headers</h4>
              <form onSubmit={handleUpdatePricing} className="crud-form">
                <div className="f-group">
                  <label className="f-label">Pricing Eyebrow</label>
                  <input
                    type="text"
                    className="f-input"
                    value={pricingForm.eyebrow}
                    onChange={(e) => setPricingForm({ ...pricingForm, eyebrow: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label className="f-label">Title (HTML Supported)</label>
                  <input
                    type="text"
                    className="f-input"
                    value={pricingForm.titleHtml}
                    onChange={(e) => setPricingForm({ ...pricingForm, titleHtml: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label className="f-label">Pricing Subtitle</label>
                  <input
                    type="text"
                    className="f-input"
                    value={pricingForm.subtitle}
                    onChange={(e) => setPricingForm({ ...pricingForm, subtitle: e.target.value })}
                  />
                </div>
                <button type="submit" className="f-submit inline" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Update Pricing Content'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
