import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <div className="auth-card" style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2.5rem 2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0284C7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {user.firstname ? user.firstname[0].toUpperCase() : 'U'}
          </div>
        </div>
        
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.5rem', fontWeight: '700' }}>
          {user.firstname} {user.lastname}
        </h2>
        
        <div style={{ backgroundColor: '#F1F5F9', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</span>
            <div style={{ color: '#334155', fontWeight: '500', fontSize: '0.95rem' }}>{user.email}</div>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Student ID Number</span>
            <div style={{ color: '#334155', fontWeight: '500', fontSize: '0.95rem' }}>{user.studentId || 'N/A'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={handleResetPassword}
            style={{ width: '100%', backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', color: '#334155', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#F8FAFC'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            Reset Password
          </button>
          
          <button 
            onClick={handleLogout}
            style={{ width: '100%', backgroundColor: '#FEE2E2', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', color: '#DC2626', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#FECACA'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FEE2E2'}
          >
            Log Out
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.875rem', marginTop: '1rem', fontWeight: '500' }}
            onMouseOver={(e) => e.target.style.color = '#0F172A'}
            onMouseOut={(e) => e.target.style.color = '#64748B'}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
