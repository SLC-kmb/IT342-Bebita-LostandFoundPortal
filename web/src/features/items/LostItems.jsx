import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLostItems, claimItem } from './itemsApi';
import webSocketService from '../../services/websocketService';
import ItemDetails from './ItemDetails';

export default function LostItems() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(null);
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '' });
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    fetchLostItems();
    
    // Connect to WebSocket and listen for new items
    webSocketService.connect();
    webSocketService.subscribe('/topic/items', (newItem) => {
      // Only add to list if it's a lost item
      if (newItem.type === 'lost') {
        setItems((prevItems) => {
          // Prevent duplicates
          if (prevItems.some(item => item.id === newItem.id)) return prevItems;
          return [newItem, ...prevItems];
        });
      }
    });

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchLostItems = async () => {
    try {
      const res = await getLostItems();
      setItems(res.data.data || []);
    } catch {
      setError('Failed to load lost items.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    setClaiming(itemId);
    try {
      await claimItem(itemId, {});
      await fetchLostItems();
      setMessageModal({ isOpen: true, title: 'Success', message: 'Claim submitted! Awaiting admin approval.' });
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Available';
      case 'pending_claim': return 'Claim pending';
      case 'claimed': return 'Returned';
      default: return status || 'Available';
    }
  };

  if (loading) return (
    <div className="items-page">
      <nav className="navbar">
        <a href="/dashboard" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text" style={{ lineHeight: '1.2' }}>Finder</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>Lost and Found Portal</span>
          </div>
        </a>
      </nav>
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    </div>
  );
  if (error) return <div className="error" style={{ margin: '2rem auto', maxWidth: '40rem' }}>{error}</div>;

  return (
    <div className="items-page">
      <nav className="navbar">
        <a href="/" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text" style={{ lineHeight: '1.2' }}>Finder</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>Lost and Found Portal</span>
          </div>
        </a>
      </nav>

      <div className="items-container">
        <button className="back-link" onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary-color, #1a73e8)', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
          ← Back to dashboard
        </button>
        <div className="items-header">
          <h2>Lost Items</h2>
          <p>{items.length} items reported missing</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>No lost items reported yet.</p>
            <p>Check back soon or report a lost item yourself.</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <article key={item.id} className="item-card" onClick={() => setSelectedItemId(item.id)} style={{ cursor: 'pointer' }}>
                <div className="item-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="item-card-category">{item.category}</span>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.imageUrl && (
                    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.itemName} 
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    </div>
                  )}
                  <h3 className="item-card-title">{item.itemName}</h3>
                  <p className="item-card-desc">{item.description}</p>
                  <div className="item-card-meta">
                    <span>📍 {item.location}</span>
                    <span>📅 {item.dateLost ? new Date(item.dateLost).toLocaleDateString() : '—'}</span>
                  </div>
                  {item.contactInfo && (
                    <div className="item-card-meta">
                      <span>📞 {item.contactInfo}</span>
                    </div>
                  )}
                  <div className="item-card-footer">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaim(item.id);
                      }}
                      disabled={claiming === item.id || item.status === 'claimed' || item.status === 'pending_claim' || item.reportedBy?.email === user.email}
                      className={`claim-btn ${item.status === 'claimed' || item.status === 'pending_claim' || item.reportedBy?.email === user.email ? 'claim-btn-disabled' : ''}`}
                    >
                      {item.reportedBy?.email === user.email
                        ? 'Your Post'
                        : claiming === item.id
                        ? 'Submitting...'
                        : item.status === 'claimed'
                          ? 'Returned to owner'
                          : item.status === 'pending_claim'
                            ? 'Claim pending review'
                            : 'I found this'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="site-footer">
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