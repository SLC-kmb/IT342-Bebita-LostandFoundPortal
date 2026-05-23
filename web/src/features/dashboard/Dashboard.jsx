import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <a href="/dashboard" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">🔍</span>
          <span>Finder</span>
        </a>
        <div className="header-nav">
          <span className="header-user-info">
            {user.firstname} {user.lastname}
          </span>
          {user.role === 'ADMIN' ? (
            <button onClick={() => navigate('/admin')}>← Admin Dashboard</button>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Welcome back, {user.firstname}!</h2>
        <p>What would you like to do today?</p>
        <hr />
        <div className="dashboard-actions">
          <button onClick={() => navigate('/report-found')}>
            📦 Report Found Item
          </button>
          <button onClick={() => navigate('/report-lost')}>
            🔍 Report Lost Item
          </button>
          <button onClick={() => navigate('/lost-items')}>
            📋 View Lost Items
          </button>
          <button onClick={() => navigate('/found-items')}>
            ✅ View Found Items
          </button>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>© {new Date().getFullYear()} Finder. All rights reserved.</p>
            <p>Made with care for campus communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
