/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { updateSectionData, fetchSettings, updateSettings, fetchAuditLogs, fetchLandingData } from '../../services/developerService';

interface DeveloperDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ activeTab, setActiveTab }) => {
  const [landingData, setLandingData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Section form states
  const [heroForm, setHeroForm] = useState<any>({});
  const [aboutForm, setAboutForm] = useState<any>({});
  const [timingsForm, setTimingsForm] = useState<any>({});
  const [pricingForm, setPricingForm] = useState<any>({});
  const [bmiForm, setBmiForm] = useState<any>({});
  const [reviewsForm, setReviewsForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);

  // Load landing page data from API
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await fetchLandingData();
      setLandingData(data);
      // Initialize forms from live data
      setHeroForm({
        eyebrow: data.hero?.eyebrow || '',
        titleLines: data.hero?.titleLines || ['', '', ''],
        subtitle: data.hero?.subtitle || '',
        badge: data.hero?.badge || { rating: '', stars: '', text: '' }
      });
      setAboutForm({
        eyebrow: data.about?.eyebrow || '',
        titleHtml: data.about?.titleHtml || '',
        badge: data.about?.badge || { rating: '', text: '' }
      });
      setTimingsForm({
        eyebrow: data.timings?.eyebrow || '',
        titleHtml: data.timings?.titleHtml || '',
        description: data.timings?.description || '',
        closedNote: data.timings?.closedNote || ''
      });
      setPricingForm({
        eyebrow: data.pricing?.eyebrow || '',
        titleHtml: data.pricing?.titleHtml || '',
        subtitle: data.pricing?.subtitle || ''
      });
      setBmiForm({
        eyebrow: data.bmi?.eyebrow || '',
        titleHtml: data.bmi?.titleHtml || '',
        description: data.bmi?.description || ''
      });
      setReviewsForm({
        eyebrow: data.reviews?.eyebrow || '',
        titleHtml: data.reviews?.titleHtml || '',
        overall: data.reviews?.overall || { rating: '', stars: '', count: '' }
      });
    } catch (err: any) {
      console.error('Failed to load landing data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const settings = await fetchSettings();
      setSettingsForm({
        contactInfo_phone: settings.contactInfo_phone || '',
        contactInfo_whatsappUrl: settings.contactInfo_whatsappUrl || '',
        contactInfo_address: settings.contactInfo_address || '',
        contactInfo_instagram: settings.contactInfo_instagram || '',
        contactInfo_instagramUrl: settings.contactInfo_instagramUrl || '',
        contactInfo_mapUrl: settings.contactInfo_mapUrl || '',
        footer_brandDesc: settings.footer_brandDesc || '',
        footer_copy: settings.footer_copy || '',
        contactOptions_eyebrow: settings.contactOptions_eyebrow || '',
        contactOptions_titleHtml: settings.contactOptions_titleHtml || '',
        facilities_eyebrow: settings.facilities_eyebrow || '',
        facilities_titleHtml: settings.facilities_titleHtml || '',
      });
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const data = await fetchAuditLogs(50, 0);
      setAuditLogs(data.logs);
      setAuditTotal(data.total);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadSettings();
  }, [loadData, loadSettings]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, loadAuditLogs]);

  const triggerNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSectionUpdate = async (section: string, data: any, e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSectionData(section, data);
      triggerNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully!`, 'success');
      loadData();
    } catch (err: any) {
      triggerNotification(err.message || `Failed to update ${section}.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSettings(settingsForm);
      triggerNotification('Site settings updated successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerNotification(err.message || 'Failed to update settings.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="loader-box">Loading CMS data from database...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {notification && (
        <div className={`dashboard-notification ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.text}
        </div>
      )}

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="tab-pane">
          <div className="stats-row">
            <div className="stat-card" onClick={() => setActiveTab('hero')}>
              <span className="card-icon">🔥</span>
              <h4>Hero Section</h4>
              <div className="stat-val" style={{ fontSize: '16px' }}>{landingData?.hero?.eyebrow || 'Not set'}</div>
              <p>Click to edit hero content</p>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('pricing')}>
              <span className="card-icon">💳</span>
              <h4>Pricing Plans</h4>
              <div className="stat-val">{landingData?.pricing?.plans?.length || 0}</div>
              <p>Active membership plans</p>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('reviews')}>
              <span className="card-icon">⭐</span>
              <h4>Reviews</h4>
              <div className="stat-val">{landingData?.reviews?.items?.length || 0}</div>
              <p>Published member reviews</p>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('settings')}>
              <span className="card-icon">⚙️</span>
              <h4>Site Settings</h4>
              <div className="stat-val" style={{ fontSize: '16px' }}>Configure</div>
              <p>Contact, footer, SEO</p>
            </div>
          </div>
          <div className="recent-activity-panel">
            <h3>Quick Section Navigation</h3>
            <div className="quick-nav-grid">
              {['hero', 'about', 'timings', 'facilities', 'pricing', 'bmi', 'reviews', 'marquee', 'settings'].map(tab => (
                <button key={tab} className="quick-nav-btn" onClick={() => setActiveTab(tab)}>
                  Edit {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Editor */}
      {activeTab === 'hero' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>🔥 Hero Section Settings</h4>
            <form onSubmit={(e) => handleSectionUpdate('hero', heroForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow Text</label>
                <input type="text" className="f-input" value={heroForm.eyebrow} onChange={(e) => setHeroForm({ ...heroForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-row">
                {[0, 1, 2].map(i => (
                  <div className="f-group" key={i}>
                    <label className="f-label">Title Line {i + 1}</label>
                    <input type="text" className="f-input" value={heroForm.titleLines?.[i] || ''}
                      onChange={(e) => { const lines = [...(heroForm.titleLines || ['', '', ''])]; lines[i] = e.target.value; setHeroForm({ ...heroForm, titleLines: lines }); }} />
                  </div>
                ))}
              </div>
              <div className="f-group">
                <label className="f-label">Subtitle</label>
                <textarea className="f-input" rows={2} value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Badge Rating</label>
                  <input type="text" className="f-input" value={heroForm.badge?.rating || ''} onChange={(e) => setHeroForm({ ...heroForm, badge: { ...heroForm.badge, rating: e.target.value } })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Badge Stars</label>
                  <input type="text" className="f-input" value={heroForm.badge?.stars || ''} onChange={(e) => setHeroForm({ ...heroForm, badge: { ...heroForm.badge, stars: e.target.value } })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Badge Text</label>
                  <input type="text" className="f-input" value={heroForm.badge?.text || ''} onChange={(e) => setHeroForm({ ...heroForm, badge: { ...heroForm.badge, text: e.target.value } })} />
                </div>
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Hero Section'}</button>
            </form>
          </div>
        </div>
      )}

      {/* About Editor */}
      {activeTab === 'about' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>💪 About Section Settings</h4>
            <form onSubmit={(e) => handleSectionUpdate('about', aboutForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow</label>
                <input type="text" className="f-input" value={aboutForm.eyebrow} onChange={(e) => setAboutForm({ ...aboutForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Title (HTML)</label>
                <input type="text" className="f-input" value={aboutForm.titleHtml} onChange={(e) => setAboutForm({ ...aboutForm, titleHtml: e.target.value })} />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Badge Rating</label>
                  <input type="text" className="f-input" value={aboutForm.badge?.rating || ''} onChange={(e) => setAboutForm({ ...aboutForm, badge: { ...aboutForm.badge, rating: e.target.value } })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Badge Text</label>
                  <input type="text" className="f-input" value={aboutForm.badge?.text || ''} onChange={(e) => setAboutForm({ ...aboutForm, badge: { ...aboutForm.badge, text: e.target.value } })} />
                </div>
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update About Section'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Timings Editor */}
      {activeTab === 'timings' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>⏰ Timings & Batches Settings</h4>
            <form onSubmit={(e) => handleSectionUpdate('timings', timingsForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow</label>
                <input type="text" className="f-input" value={timingsForm.eyebrow} onChange={(e) => setTimingsForm({ ...timingsForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Title (HTML)</label>
                <input type="text" className="f-input" value={timingsForm.titleHtml} onChange={(e) => setTimingsForm({ ...timingsForm, titleHtml: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Description</label>
                <textarea className="f-input" rows={2} value={timingsForm.description} onChange={(e) => setTimingsForm({ ...timingsForm, description: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Closed Note</label>
                <input type="text" className="f-input" value={timingsForm.closedNote} onChange={(e) => setTimingsForm({ ...timingsForm, closedNote: e.target.value })} />
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Timings Section'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Facilities Editor */}
      {activeTab === 'facilities' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>🏋️ Facilities Section</h4>
            <p className="editor-desc">Facilities items are managed through the section headers below. Full item CRUD coming soon.</p>
            <form onSubmit={(e) => handleSectionUpdate('facilities', { eyebrow: settingsForm.facilities_eyebrow, titleHtml: settingsForm.facilities_titleHtml }, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Section Eyebrow</label>
                <input type="text" className="f-input" value={settingsForm.facilities_eyebrow || ''} onChange={(e) => setSettingsForm({ ...settingsForm, facilities_eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Section Title (HTML)</label>
                <input type="text" className="f-input" value={settingsForm.facilities_titleHtml || ''} onChange={(e) => setSettingsForm({ ...settingsForm, facilities_titleHtml: e.target.value })} />
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Facilities'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Editor */}
      {activeTab === 'pricing' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>💳 Pricing Section Headers</h4>
            <form onSubmit={(e) => handleSectionUpdate('pricing', pricingForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow</label>
                <input type="text" className="f-input" value={pricingForm.eyebrow} onChange={(e) => setPricingForm({ ...pricingForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Title (HTML)</label>
                <input type="text" className="f-input" value={pricingForm.titleHtml} onChange={(e) => setPricingForm({ ...pricingForm, titleHtml: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Subtitle</label>
                <input type="text" className="f-input" value={pricingForm.subtitle} onChange={(e) => setPricingForm({ ...pricingForm, subtitle: e.target.value })} />
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Pricing'}</button>
            </form>
          </div>
        </div>
      )}

      {/* BMI Editor */}
      {activeTab === 'bmi' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>🧮 BMI Section Settings</h4>
            <form onSubmit={(e) => handleSectionUpdate('bmi', bmiForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow</label>
                <input type="text" className="f-input" value={bmiForm.eyebrow} onChange={(e) => setBmiForm({ ...bmiForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Title (HTML)</label>
                <input type="text" className="f-input" value={bmiForm.titleHtml} onChange={(e) => setBmiForm({ ...bmiForm, titleHtml: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Description</label>
                <textarea className="f-input" rows={3} value={bmiForm.description} onChange={(e) => setBmiForm({ ...bmiForm, description: e.target.value })} />
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update BMI Section'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Editor */}
      {activeTab === 'reviews' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>⭐ Reviews Section Headers</h4>
            <form onSubmit={(e) => handleSectionUpdate('reviews', reviewsForm, e)} className="crud-form">
              <div className="f-group">
                <label className="f-label">Eyebrow</label>
                <input type="text" className="f-input" value={reviewsForm.eyebrow} onChange={(e) => setReviewsForm({ ...reviewsForm, eyebrow: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Title (HTML)</label>
                <input type="text" className="f-input" value={reviewsForm.titleHtml} onChange={(e) => setReviewsForm({ ...reviewsForm, titleHtml: e.target.value })} />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Overall Rating</label>
                  <input type="text" className="f-input" value={reviewsForm.overall?.rating || ''} onChange={(e) => setReviewsForm({ ...reviewsForm, overall: { ...reviewsForm.overall, rating: e.target.value } })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Overall Stars</label>
                  <input type="text" className="f-input" value={reviewsForm.overall?.stars || ''} onChange={(e) => setReviewsForm({ ...reviewsForm, overall: { ...reviewsForm.overall, stars: e.target.value } })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Review Count</label>
                  <input type="text" className="f-input" value={reviewsForm.overall?.count || ''} onChange={(e) => setReviewsForm({ ...reviewsForm, overall: { ...reviewsForm.overall, count: e.target.value } })} />
                </div>
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Reviews'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Marquee & Stats Editor */}
      {activeTab === 'marquee' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>🎗️ Marquee & Stats Banner</h4>
            <p className="editor-desc">The marquee and stats banner are populated from the database. Current marquee items:</p>
            {landingData?.marquee && (
              <div className="preview-list">
                {landingData.marquee.map((item: string, idx: number) => (
                  <span key={idx} className="lead-badge plan">{item}</span>
                ))}
              </div>
            )}
            <p className="editor-desc" style={{ marginTop: '16px' }}>Current Stats Banner:</p>
            {landingData?.statsBanner && (
              <div className="preview-list">
                {landingData.statsBanner.map((item: any, idx: number) => (
                  <span key={idx} className="lead-badge goal">{item.target}{item.suffix} — {item.label}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Editor */}
      {activeTab === 'settings' && (
        <div className="tab-pane">
          <div className="editor-card">
            <h4>⚙️ Site Settings & Configuration</h4>
            <form onSubmit={handleSettingsUpdate} className="crud-form">
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Phone Number</label>
                  <input type="text" className="f-input" value={settingsForm.contactInfo_phone || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_phone: e.target.value })} />
                </div>
                <div className="f-group">
                  <label className="f-label">WhatsApp Link</label>
                  <input type="text" className="f-input" value={settingsForm.contactInfo_whatsappUrl || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_whatsappUrl: e.target.value })} />
                </div>
              </div>
              <div className="f-group">
                <label className="f-label">Address</label>
                <input type="text" className="f-input" value={settingsForm.contactInfo_address || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_address: e.target.value })} />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Instagram Handle</label>
                  <input type="text" className="f-input" value={settingsForm.contactInfo_instagram || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_instagram: e.target.value })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Instagram URL</label>
                  <input type="text" className="f-input" value={settingsForm.contactInfo_instagramUrl || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_instagramUrl: e.target.value })} />
                </div>
              </div>
              <div className="f-group">
                <label className="f-label">Google Maps URL</label>
                <input type="text" className="f-input" value={settingsForm.contactInfo_mapUrl || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactInfo_mapUrl: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Footer Brand Description</label>
                <textarea className="f-input" rows={2} value={settingsForm.footer_brandDesc || ''} onChange={(e) => setSettingsForm({ ...settingsForm, footer_brandDesc: e.target.value })} />
              </div>
              <div className="f-group">
                <label className="f-label">Footer Copyright</label>
                <input type="text" className="f-input" value={settingsForm.footer_copy || ''} onChange={(e) => setSettingsForm({ ...settingsForm, footer_copy: e.target.value })} />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label">Contact Section Eyebrow</label>
                  <input type="text" className="f-input" value={settingsForm.contactOptions_eyebrow || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactOptions_eyebrow: e.target.value })} />
                </div>
                <div className="f-group">
                  <label className="f-label">Contact Section Title (HTML)</label>
                  <input type="text" className="f-input" value={settingsForm.contactOptions_titleHtml || ''} onChange={(e) => setSettingsForm({ ...settingsForm, contactOptions_titleHtml: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="f-submit inline" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Update Site Settings'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Viewer */}
      {activeTab === 'audit' && (
        <div className="tab-pane">
          <div className="section-header-row">
            <h3>Audit Log ({auditTotal} total entries)</h3>
            <button className="btn-refresh" onClick={loadAuditLogs}>🔄 Refresh</button>
          </div>
          {auditLogs.length === 0 ? (
            <p className="no-data">No audit log entries found.</p>
          ) : (
            <div className="table-responsive">
              <table className="leads-table full">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="time-col">{new Date(log.created_at).toLocaleString()}</td>
                      <td><strong>{log.username || 'System'}</strong></td>
                      <td><span className="lead-badge plan">{log.action}</span></td>
                      <td>{log.resource || '-'}</td>
                      <td className="msg-col" title={log.details}>{log.details || '-'}</td>
                      <td>{log.ip_address || '-'}</td>
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
export default DeveloperDashboard;
