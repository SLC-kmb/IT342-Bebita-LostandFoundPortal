import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLostItems, getFoundItems, claimItem } from '../items/itemsApi';
import { getNotifications, markNotificationAsRead, clearNotification, clearAllNotifications } from '../notifications/notificationsApi';
import webSocketService from '../../services/websocketService';
import ItemDetails from '../items/ItemDetails';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(null);
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '' });
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const buildingOptions = [
    "NGE", "RTL", "ACAD", "GLE", "Elem Building", "Annex", "Gym",
    "Covered Court", "Elementary Open Court", "Canteen (Elem Building)",
    "Canteen (Engineering Building)", "Canteen Main", "Parking Area"
  ];

  useEffect(() => {
    fetchAllItems();
    fetchNotifications();

    webSocketService.connect();
    
    // Listen for real-time item updates (new items, status changes, claims)
    webSocketService.subscribe('/topic/items', (updatedItem) => {
      setItems((prevItems) => {
        const index = prevItems.findIndex(item => item.id === updatedItem.id);
        if (index > -1) {
          // Item exists, update it
          const newItems = [...prevItems];
          newItems[index] = updatedItem;
          return newItems;
        }
        // New item, add it to the top
        return [updatedItem, ...prevItems];
      });
    });

    // Listen for real-time notifications for the logged-in user
    if (user.email) {
      const safeEmail = user.email.replace(/[@.]/g, '_');
      webSocketService.subscribe(`/topic/notifications/${safeEmail}`, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setToastNotification(newNotif);
        setTimeout(() => setToastNotification(null), 5000); // Hide toast after 5 seconds
      });
    }

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleClearNotification = async (id, e) => {
    e.stopPropagation(); // prevent clicking the notification body
    try {
      await clearNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to clear notification", err);
    }
  };

  const handleClearAllNotifications = async (e) => {
    e.stopPropagation();
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all notifications", err);
    }
  };

  const fetchAllItems = async () => {
    try {
      const [lostRes, foundRes] = await Promise.all([getLostItems(), getFoundItems()]);
      const lostItems = lostRes.data.data || [];
      const foundItems = foundRes.data.data || [];
      const combined = [...lostItems, ...foundItems];
      
      // Sort by latest date
      combined.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateFound || a.dateLost || 0);
        const dateB = new Date(b.createdAt || b.dateFound || b.dateLost || 0);
        return dateB - dateA;
      });
      
      setItems(combined);
    } catch {
      console.error('Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    setClaiming(itemId);
    try {
      await claimItem(itemId, {});
      await fetchAllItems();
      setMessageModal({ isOpen: true, title: 'Success', message: 'Action submitted! Awaiting admin approval.' });
    } catch {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to claim item. Please try again.' });
    } finally {
      setClaiming(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending_claim': return 'status-pending';
      case 'claimed': return 'status-claimed';
      default: return 'status-active';
    }
  };

  const getStatusLabel = (status, type) => {
    const isFound = type === 'found';
    switch (status) {
      case 'active': return isFound ? 'Item found' : 'Looking for item';
      case 'pending_claim': return isFound ? 'Claim pending' : 'Found report pending';
      case 'claimed': return isFound ? 'Returned' : 'Found';
      default: return status || (isFound ? 'Available' : 'Looking');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredItems = items.filter(item => {
    // Hide items that are already fully claimed/resolved
    if (item.status === 'claimed') return false;
    
    if (categoryFilter && item.category !== categoryFilter) return false;
    // Location filter just checks if location string includes building name since it's "Building - Specific"
    if (locationFilter && (!item.location || !item.location.includes(locationFilter))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.itemName && item.itemName.toLowerCase().includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="dashboard-page">
      {/* Header */}
      <nav className="dashboard-navbar">
        <a href="/dashboard" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          <span className="logo-text">Finder</span>
        </a>

        <div className="header-actions">
          {user.role === 'ADMIN' ? (
            <span className="admin-link" onClick={() => navigate('/admin')}>Admin</span>
          ) : null}
          
          {/* Notification Bell */}
          <div className="notification-container" style={{ position: 'relative', marginRight: '15px' }}>
            <div 
              className="notification-bell" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', 
                  color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown" style={{
                position: 'absolute', top: '35px', right: '0', width: '320px', 
                backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                zIndex: 1000, border: '1px solid #e2e8f0', overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAllNotifications}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                      onMouseOver={(e) => e.target.style.color = '#ef4444'}
                      onMouseOut={(e) => e.target.style.color = '#64748b'}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No notifications yet.</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleReadNotification(notif.id)}
                        style={{ 
                          padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                          backgroundColor: notif.isRead ? 'white' : '#eff6ff',
                          display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ color: '#1e293b', fontSize: '0.9rem', paddingRight: '20px' }}>{notif.title}</strong>
                          <button 
                            onClick={(e) => handleClearNotification(notif.id, e)}
                            style={{ 
                              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', 
                              padding: '2px', position: 'absolute', right: '10px', top: '10px'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#ef4444'}
                            onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                            title="Clear notification"
                          >
                            ✖
                          </button>
                        </div>
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>{notif.message}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-section" onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>
              {user.firstname || user.firstName || 'User'}
            </span>
            <div className="profile-icon" title="Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification Popup */}
      {toastNotification && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#3b82f6', color: 'white',
          padding: '15px 20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999, maxWidth: '350px', animation: 'slideInRight 0.3s ease-out'
        }}>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎉</span> {toastNotification.title}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{toastNotification.message}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">
          <span className="live-dot-green"></span>
          Live feed - updated in real time
        </div>
        <h1 className="hero-title">
          Lost something on campus? <span className="hero-highlight">It might already be here.</span>
        </h1>
        <p className="hero-subtitle">
          Browse items that have been recently lost. Think you've found one of them? Click "I found this" to help return it.
        </p>
        
        <div className="hero-search-filter">
          <div className="hero-input-group">
            <span className="search-icon-small">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
              type="text" 
              placeholder="What did you lose?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="documents">Documents</option>
            <option value="keys">Keys</option>
            <option value="other">Other</option>
          </select>
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All locations</option>
            {buildingOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button className="btn-primary apply-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
             Apply
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="quick-actions-row">
          <div className="action-card-mini" onClick={() => navigate('/report-found')}>
            <div className="action-icon-mini" style={{ backgroundColor: 'var(--success-muted)' }}>📦</div>
            <div className="action-text-mini">
              <h4>Report Found Item</h4>
              <p>Help return a lost item to its rightful owner by reporting it here.</p>
            </div>
          </div>
          <div className="action-card-mini" onClick={() => navigate('/report-lost')}>
            <div className="action-icon-mini" style={{ backgroundColor: 'var(--primary-muted)' }}>🔍</div>
            <div className="action-text-mini">
              <h4>Report Lost Item</h4>
              <p>Lost something? File a report so the community can help you find it.</p>
            </div>
          </div>
          <div className="action-card-mini" onClick={() => navigate('/lost-items')}>
            <div className="action-icon-mini" style={{ backgroundColor: 'var(--destructive-muted)' }}>📋</div>
            <div className="action-text-mini">
              <h4>View Lost Items</h4>
              <p>Browse the feed of items that people are currently looking for.</p>
            </div>
          </div>
          <div className="action-card-mini" onClick={() => navigate('/found-items')}>
            <div className="action-icon-mini" style={{ backgroundColor: 'var(--secondary-muted)' }}>✅</div>
            <div className="action-text-mini">
              <h4>View Found Items</h4>
              <p>Look through items that have been found to see if yours is there.</p>
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <div className="live-feed-header">
          <div>
            <h2>Live item feed</h2>
            <p className="feed-count">{filteredItems.length} items currently in our network</p>
          </div>
          <div className="streaming-badge">
             <span className="live-dot-green"></span> Streaming updates
          </div>
        </div>

        {loading ? (
          <div className="spinner-container" style={{ minHeight: '30vh' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p>No lost items match your criteria.</p>
          </div>
        ) : (
          <div className="live-items-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="live-item-card" onClick={() => setSelectedItemId(item.id)} style={{ cursor: 'pointer' }}>
                <div className="live-item-image-wrapper">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="live-item-img"
                    />
                  ) : (
                    <div className="live-item-no-image">No Image</div>
                  )}
                  <div className="live-item-badges-top">
                    <span className={`status-badge-small ${getStatusClass(item.status)}`}>
                      <span className="dot"></span> {getStatusLabel(item.status, item.type)}
                    </span>
                    <span className="verified-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      Verified
                    </span>
                  </div>
                </div>
                
                <div className="live-item-card-body">
                  <span className="live-item-category">{item.category}</span>
                  <h3 className="live-item-title">{item.itemName}</h3>
                  <div className="live-item-meta">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {item.location}
                    </span>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {item.dateLost ? new Date(item.dateLost).toLocaleDateString() : (item.dateFound ? new Date(item.dateFound).toLocaleDateString() : '—')}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(item.id);
                    }}
                    disabled={claiming === item.id || item.status === 'claimed' || item.status === 'pending_claim' || item.reportedBy?.email === user.email}
                    className={`claim-btn-full ${item.status === 'claimed' || item.status === 'pending_claim' || item.reportedBy?.email === user.email ? 'claim-btn-disabled' : ''}`}
                  >
                    {item.reportedBy?.email === user.email
                      ? 'Your Post'
                      : claiming === item.id
                      ? 'Submitting...'
                      : item.status === 'claimed'
                        ? (item.type === 'found' ? 'Returned to owner' : 'Item Found')
                        : item.status === 'pending_claim'
                          ? 'Review pending'
                          : (item.type === 'found' ? 'Claim This item' : 'I found this')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="site-footer" style={{ marginTop: '6rem' }}>
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>© {new Date().getFullYear()} Finder. All rights reserved.</p>
            <p>Made with care for campus communities.</p>
          </div>
        </div>
      </footer>

      {messageModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'var(--surface-color, white)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-color, #333)' }}>{messageModal.title}</h3>
            <p style={{ color: 'var(--text-muted, #555)' }}>{messageModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setMessageModal({ isOpen: false, title: '', message: '' })}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ItemDetails itemId={selectedItemId} onClose={() => setSelectedItemId(null)} userEmail={user?.email} />
    </div>
  );
}
