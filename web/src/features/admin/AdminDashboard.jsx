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
        <ul className="recent-claims-list">
          {pendingClaims.length === 0 && !loading && (
            <li style={{ padding: '1.5rem 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              All caught up — no pending claims.
            </li>
          )}
        </ul>
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
              <th>Item</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Type</th>
              <th>Created</th>
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
                  <td className="font-medium">{item.itemName}</td>
                  <td className="muted">{item.category}</td>
                  <td className="muted">📍 {item.location}</td>
                  <td className="capitalize">{getStatusLabel(item.status)}</td>
                  <td className="capitalize">{item.type}</td>
                  <td className="muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
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
          <div key={item.id} className="claim-card">
            <div className="claim-card-info">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <p className="item-id">Item #{String(item.id).padStart(6, '0')}</p>
                  <h3>{item.itemName}</h3>
                </div>
                <span className="pending-review-badge">Pending review</span>
              </div>
              <p className="claim-desc">"{item.description}"</p>
              <div className="claim-meta">
                <span><strong>{item.claimedBy ? `${item.claimedBy.firstname} ${item.claimedBy.lastname}` : '—'}</strong> · {item.claimedBy?.email || '—'}</span>
                <span>📍 {item.location}</span>
              </div>
            </div>
            <div className="claim-card-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleApprove(item.id)}
                disabled={actionLoading === item.id}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {actionLoading === item.id ? '...' : '✓ Approve claim'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleReject(item.id)}
                disabled={actionLoading === item.id}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {actionLoading === item.id ? '...' : '✗ Reject'}
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
          <span className="logo-icon">🔍</span>
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
