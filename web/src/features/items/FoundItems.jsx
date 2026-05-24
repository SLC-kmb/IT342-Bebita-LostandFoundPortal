import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoundItems, claimItem } from './itemsApi';
import webSocketService from '../../services/websocketService';
import ItemDetails from './ItemDetails';

export default function FoundItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(null);
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '' });
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    fetchFoundItems();

    // Connect to WebSocket and listen for new items
    webSocketService.connect();
    webSocketService.subscribe('/topic/items', (newItem) => {
      // Only add to list if it's a found item
      if (newItem.type === 'found') {
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

  const fetchFoundItems = async () => {
    try {
      const res = await getFoundItems();
      setItems(res.data.data || []);
    } catch {
      setError('Failed to load found items.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    setClaiming(itemId);
    try {
      await claimItem(itemId, {});
      await fetchFoundItems();
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
          <span className="logo-text">Finder</span>
        </a>
        <div className="header-nav">
          <button onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
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
        <a href="/dashboard" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </span>
          <span className="logo-text">Finder</span>
        </a>
        <div className="header-nav">
          <button onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </nav>

      <div className="items-container">
        <div className="items-header">
          <h2>Found Items</h2>
          <p>{items.length} items currently in our network</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>No found items reported yet.</p>
            <p>Check back soon or report a found item yourself.</p>
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
                    <span>📅 {item.dateFound ? new Date(item.dateFound).toLocaleDateString() : '—'}</span>
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
                      disabled={claiming === item.id || item.status === 'claimed' || item.status === 'pending_claim'}
                      className="claim-btn"
                    >
                      {claiming === item.id
                        ? 'Submitting...'
                        : item.status === 'claimed'
                          ? 'Returned to owner'
                          : item.status === 'pending_claim'
                            ? 'Claim pending review'
                            : 'Initiate claim'}
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