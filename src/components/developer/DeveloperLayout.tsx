import React from 'react';
import { logout } from '../../services/authService';

interface DeveloperLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const DeveloperLayout: React.FC<DeveloperLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard Overview', group: 'main' },
    { id: 'hero', label: '🔥 Hero Section', group: 'content' },
    { id: 'about', label: '💪 About Section', group: 'content' },
    { id: 'timings', label: '⏰ Timings & Batches', group: 'content' },
    { id: 'facilities', label: '🏋️ Facilities', group: 'content' },
    { id: 'pricing', label: '💳 Pricing & Plans', group: 'content' },
    { id: 'bmi', label: '🧮 BMI Section', group: 'content' },
    { id: 'reviews', label: '⭐ Reviews', group: 'content' },
    { id: 'marquee', label: '🎗️ Marquee & Stats', group: 'content' },
    { id: 'settings', label: '⚙️ Site Settings', group: 'config' },
    { id: 'audit', label: '📋 Audit Log', group: 'system' },
  ];

  const groups = [
    { key: 'main', label: '' },
    { key: 'content', label: 'Content Management' },
    { key: 'config', label: 'Configuration' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="admin-layout developer-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar developer-sidebar">
        <div className="sidebar-brand">
          CONQUEROR<span className="dot"></span>
          <span className="badge dev-badge">Developer</span>
        </div>
        <nav className="sidebar-nav">
          {groups.map((group) => {
            const items = navItems.filter((i) => i.group === group.key);
            if (items.length === 0) return null;
            return (
              <div key={group.key} className="nav-group">
                {group.label && (
                  <div className="nav-group-label">{group.label}</div>
                )}
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header developer-header">
          <div className="header-title">
            <h2>Developer CMS Portal</h2>
            <p>Manage website content, sections, and configuration.</p>
          </div>
          <div className="header-status">
            <span className="status-indicator"></span> Live MySQL Connected
          </div>
        </header>
        <div className="admin-content-body">
          {children}
        </div>
      </main>
    </div>
  );
};
export default DeveloperLayout;
