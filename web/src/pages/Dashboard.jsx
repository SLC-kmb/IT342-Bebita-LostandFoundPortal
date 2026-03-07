import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-icon">🔍</div>
          Lost&amp;Found Portal
        </div>
        <div className="navbar-actions">
          <span className="navbar-user">
            Logged in as <strong>{user.firstname} {user.lastname}</strong>
          </span>
          <button className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Welcome, {user.firstname}! 👋</h1>
          <p>
            You are now logged in to the CIT-U Lost&amp;Found Portal. Report found items,
            browse the live feed, and claim your lost belongings.
          </p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="label">Full Name</div>
            <div className="value">{user.firstname} {user.lastname}</div>
          </div>
          <div className="info-card">
            <div className="label">Email</div>
            <div className="value">{user.email}</div>
          </div>
          <div className="info-card">
            <div className="label">Role</div>
            <div className="value">
              <span className="badge">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
