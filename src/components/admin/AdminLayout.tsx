import React from 'react';
import { logout } from '../../services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
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
    { id: 'dashboard', label: '📊 Dashboard Overview' },
    { id: 'leads', label: '📞 Enquiries & Leads' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          CONQUEROR<span className="dot"></span>
          <span className="badge">Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Secure Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h2>Welcome Back, Administrator</h2>
            <p>Manage enquiries, analytics, and operations.</p>
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
export default AdminLayout;
