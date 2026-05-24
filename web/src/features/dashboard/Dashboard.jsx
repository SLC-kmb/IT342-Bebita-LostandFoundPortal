import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLostItems, getFoundItems, claimItem } from '../items/itemsApi';
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
    webSocketService.connect();
    webSocketService.subscribe('/topic/items', (newItem) => {
      setItems((prevItems) => {
        if (prevItems.some(item => item.id === newItem.id)) return prevItems;
        return [newItem, ...prevItems];
      });
    });
    return () => {
      webSocketService.disconnect();
    };
  }, []);

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
                    disabled={claiming === item.id || item.status === 'claimed' || item.status === 'pending_claim'}
                    className={`claim-btn-full ${item.status === 'claimed' || item.status === 'pending_claim' ? 'claim-btn-disabled' : ''}`}
                  >
                    {claiming === item.id
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

      <ItemDetails itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
    </div>
  );
}
