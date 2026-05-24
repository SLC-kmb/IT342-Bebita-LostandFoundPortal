import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  getAllUsers,
  getAllItems,
  deleteUser,
  deleteItem
} from './adminApi';

const NAV = [
  { label: 'Dashboard', icon: '📊', key: 'dashboard' },
  { label: 'Active items', icon: '📦', key: 'items' },
  { label: 'Pending claims', icon: '📋', key: 'claims' },
  { label: 'Users', icon: '👥', key: 'users' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '' });
  const [pendingClaims, setPendingClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, claimsRes, usersRes, itemsRes] = await Promise.all([
        getDashboardStats(),
        getPendingClaims(),
        getAllUsers(),
        getAllItems(),
      ]);

      setStats(statsRes.data.data);
      setPendingClaims(claimsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setItems(itemsRes.data.data || []);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveClaim(id);
      await loadAllData();
    } catch {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to approve claim.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectClaim(id);
      await loadAllData();
    } catch {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to reject claim.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this user? All their reported items will also be deleted.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
        setActionLoading('delete-user-' + id);
        try {
          await deleteUser(id);
          await loadAllData();
        } catch (err) {
          setMessageModal({ isOpen: true, title: 'Error', message: err.response?.data?.error?.message || 'Failed to delete user.' });
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleDeleteItem = (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
        setActionLoading('delete-item-' + id);
        try {
          await deleteItem(id);
          await loadAllData();
        } catch (err) {
          setMessageModal({ isOpen: true, title: 'Error', message: err.response?.data?.error?.message || 'Failed to delete item.' });
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Available';
      case 'pending_claim': return 'Pending';
      case 'claimed': return 'Returned';
      default: return status;
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderDashboard = () => (
    <section>
      <h1 className="section-title">Overview</h1>
      <p className="section-subtitle">A snapshot of campus lost & found activity.</p>
      <div className="admin-stats-grid">
        <div className="stat-card">
          <p className="stat-label">Pending claims</p>
          <p className="stat-value accent-warning">{stats?.pendingClaims ?? 0}</p>
          <p className="stat-hint">Awaiting your review</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active items</p>
          <p className="stat-value accent-primary">{stats?.activeItems ?? 0}</p>
          <p className="stat-hint">Visible in the live feed</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total items</p>
          <p className="stat-value accent-success">{stats?.totalItems ?? 0}</p>
          <p className="stat-hint">Lost & found combined</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active users</p>
          <p className="stat-value accent-secondary">{stats?.totalUsers ?? 0}</p>
          <p className="stat-hint">Registered on portal</p>
        </div>
      </div>

      {/* Recent Claims Preview */}
      <div className="recent-claims-card">
        <div className="recent-claims-header">
          <h2>Recent claims</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('claims')}>View all</button>
        </div>
        <div className="recent-claims-list" style={{ marginTop: '1rem' }}>
          {pendingClaims.length === 0 && !loading && (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              All caught up — no pending claims.
            </div>
          )}
          {pendingClaims.slice(0, 3).map((item) => (
            <div key={item.id} className="recent-claim-item">
              <div className="recent-claim-left">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.itemName} className="recent-claim-img" />
                ) : (
                  <div className="recent-claim-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>No img</div>
                )}
                <div className="recent-claim-info">
                  <h4>{item.itemName}</h4>
                  <p>{item.claimedBy ? `${item.claimedBy.firstname} ${item.claimedBy.lastname}` : 'Unknown'} · {getRelativeTime(item.updatedAt || item.createdAt)}</p>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleApprove(item.id)} disabled={actionLoading === item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px' }}>
                {actionLoading === item.id ? '...' : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Approve</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderItems = () => (
    <section>
      <h1 className="section-title">Active items</h1>
      <p className="section-subtitle">Items currently visible to the campus community.</p>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th>CATEGORY</th>
              <th>LOCATION</th>
              <th>STATUS</th>
              <th>REPORTED</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  className="hoverable-row"
                >
                  <td className="font-medium">
                    <div className="admin-table-item-cell">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="admin-table-img" />
                      ) : (
                        <div className="admin-table-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.6rem' }}>No img</div>
                      )}
                      {item.itemName}
                    </div>
                  </td>
                  <td className="muted">{item.category}</td>
                  <td className="muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {item.location}
                  </td>
                  <td className="capitalize" style={{ fontWeight: '600', color: item.status === 'active' ? '#10B981' : item.status === 'pending_claim' ? '#F59E0B' : '#64748B' }}>{getStatusLabel(item.status)}</td>
                  <td className="muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {getRelativeTime(item.createdAt)}
                  </td>
                </tr>
                {expandedItemId === item.id && (
                  <tr className="expanded-row bg-muted/20">
                    <td colSpan="6" style={{ padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {item.imageUrl && (
                          <div style={{ marginBottom: '1rem' }}>
                            <img src={item.imageUrl} alt={item.itemName} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                          </div>
                        )}
                        <p><strong>Description:</strong> {item.description}</p>
                        <p><strong>Reported By:</strong> {item.reportedBy ? `${item.reportedBy.firstname} ${item.reportedBy.lastname} (${item.reportedBy.email})` : 'System / Unknown'}</p>
                        {item.claimedBy && (
                          <p><strong>Claimed By:</strong> {item.claimedBy.firstname} {item.claimedBy.lastname} ({item.claimedBy.email})</p>
                        )}
                        {item.contactInfo && (
                          <p><strong>Contact Info:</strong> {item.contactInfo}</p>
                        )}
                        <div style={{ marginTop: '1rem' }}>
                          <button 
                            className="btn btn-outline btn-sm" 
                            style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            disabled={actionLoading === 'delete-item-' + item.id}
                          >
                            {actionLoading === 'delete-item-' + item.id ? 'Deleting...' : '🗑 Delete Item'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderClaims = () => (
    <section>
      <h1 className="section-title">Pending claims</h1>
      <p className="section-subtitle">Approve verified claims to trigger an SMTP confirmation email.</p>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pendingClaims.length === 0 && !loading && (
          <div className="empty-state">
            <p>No pending claims</p>
            <p>Take a moment — you've earned it.</p>
          </div>
        )}
        {pendingClaims.map((item) => (
          <div key={item.id} className="pending-claim-container">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.itemName} className="pending-claim-img" />
            ) : (
              <div className="pending-claim-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
            )}
            
            <div className="pending-claim-content">
              <div className="pending-claim-id">ITEM #{String(item.id).padStart(6, '0')}</div>
              <h3>{item.itemName}</h3>
              <p className="pending-claim-desc">"{item.description}"</p>
              <div className="pending-claim-meta">
                <strong>{item.claimedBy ? `${item.claimedBy.firstname} ${item.claimedBy.lastname}` : 'Unknown'}</strong> · {item.claimedBy?.email || 'Unknown'} &nbsp;
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'text-bottom', margin: '0 4px'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {getRelativeTime(item.updatedAt || item.createdAt)}
              </div>
            </div>
            
            <div className="pending-claim-actions">
              <span className="badge-pending-review">Pending review</span>
              <button
                className="btn btn-primary"
                onClick={() => handleApprove(item.id)}
                disabled={actionLoading === item.id}
                style={{ width: '100%', borderRadius: '9999px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
              >
                {actionLoading === item.id ? '...' : <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Approve claim</>}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleReject(item.id)}
                disabled={actionLoading === item.id}
                style={{ width: '100%', borderRadius: '9999px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--border)' }}
              >
                {actionLoading === item.id ? '...' : <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Reject</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderUsers = () => (
    <section>
      <h1 className="section-title">Users</h1>
      <p className="section-subtitle">Members of your campus community.</p>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.firstName} {u.lastName}</td>
                <td className="muted">{u.email}</td>
                <td><span className="role-badge">{u.role}</span></td>
                <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ color: 'var(--destructive)' }}
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={actionLoading === 'delete-user-' + u.id}
                  >
                    {actionLoading === 'delete-user-' + u.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderContent = () => {
    if (loading && !stats) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'claims': return renderClaims();
      case 'users': return renderUsers();
      case 'items': return renderItems();
      default: return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          <div className="sidebar-header-text">
            <p>Finder</p>
            <p>Admin console</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((tab) => (
            <button
              key={tab.key}
              className={`sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="sidebar-link-content">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
              {tab.key === 'claims' && pendingClaims.length > 0 && (
                <span className="sidebar-badge">{pendingClaims.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/dashboard')}>↗ View public site</button>
          <button onClick={handleLogout} style={{ marginTop: '0.5rem', color: '#ef4444' }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-right">
            <span className="admin-header-name">Admin · {user.firstname} {user.lastname?.charAt(0)}.</span>
          </div>
          <button className="btn btn-ghost btn-sm refresh-btn" onClick={() => loadAllData()} disabled={loading}>
            {loading ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Confirm Action</h3>
            <p style={{ color: '#555' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmModal.onConfirm} style={{ backgroundColor: '#dc3545', color: 'white' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {messageModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>{messageModal.title}</h3>
            <p style={{ color: '#555' }}>{messageModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setMessageModal({ isOpen: false, title: '', message: '' })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
