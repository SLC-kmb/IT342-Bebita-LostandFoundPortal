import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <span><strong>Lost &amp; Found Portal</strong></span>
        <span>
          {user.firstname} {user.lastname} &nbsp;|
          <button onClick={handleLogout}>Logout</button>
        </span>
      </nav>

      <div className="dashboard-content">
        <h2>Welcome, {user.firstname}!</h2>
        <p>Email: {user.email}</p>
        <hr />
        <div className="dashboard-actions">
          <button onClick={() => navigate('/report-found')}>Report Found Item</button>
          <button onClick={() => navigate('/report-lost')}>Report Lost Item</button>
          <button onClick={() => navigate('/lost-items')}>View Lost Items</button>
          <button onClick={() => navigate('/found-items')}>View Found Items</button>
        </div>
      </div>
    </div>
  );
}
