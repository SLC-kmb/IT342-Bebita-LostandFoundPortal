import { useState, useEffect } from 'react';
import { getItemById, claimItem } from './itemsApi';

export default function ItemDetails({ itemId, onClose, userEmail }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await getItemById(itemId);
      setItem(res.data.data);
    } catch (err) {
      setError('Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimItem(itemId, {});
      await fetchItem();
      setMessageModal({ isOpen: true, title: 'Success', message: 'Action submitted! Awaiting admin review.' });
    } catch {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to process request. Please try again.' });
    } finally {
      setClaiming(false);
    }
  };

  if (!itemId) return null;

  return (
    <div className="item-details-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '2rem' }} onClick={onClose}>
      <div className="item-details-modal-content" style={{ backgroundColor: '#F8FAFC', borderRadius: '24px', maxWidth: '1000px', width: '100%', position: 'relative', margin: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#64748B', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#64748B'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {loading ? (
          <div className="spinner-container" style={{ padding: '4rem' }}>
            <div className="spinner"></div>
          </div>
        ) : error || !item ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#EF4444' }}>{error || 'Item not found.'}</div>
        ) : (
          <div style={{ padding: '2.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
              
              {/* Left Column: Image */}
              <div style={{ position: 'relative', backgroundColor: '#E2E8F0', borderRadius: '16px', overflow: 'hidden', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'white', padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 2 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                  Reviewed by Moderation
                </div>
                
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: '#94A3B8' }}>No image provided</div>
                )}
                
                {item.imageUrl && (
                  <>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', backgroundColor: '#F8FAFC' }}></div>
                    <img src={item.imageUrl} alt={item.itemName} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 16px 0 0', clipPath: 'inset(0 0 40px 0)' }} />
                  </>
                )}
              </div>

              {/* Right Column: Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ backgroundColor: getStatusDisplay(item.status, item.type).bg, color: getStatusDisplay(item.status, item.type).color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: getStatusDisplay(item.status, item.type).color, borderRadius: '50%' }}></span>
                    {getStatusDisplay(item.status, item.type).label}
                  </span>
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem', lineHeight: '1.2' }}>{item.itemName}</h1>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{item.description}</p>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 1.5rem', backgroundColor: 'white', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      Category
                    </span>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem', textTransform: 'capitalize' }}>{item.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Location
                    </span>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>{item.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Reported
                    </span>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>
                      {item.createdAt || item.dateFound || item.dateLost ? new Date(item.createdAt || item.dateFound || item.dateLost).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16v11H4z"/><path d="M4 9l8-4 8 4"/><path d="M12 5v4"/></svg>
                      ID Number
                    </span>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>
                      {item.reportedBy?.studentId || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {item.type === 'found' ? 'Turned in by' : 'Reported by'}
                    </span>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' }}>
                      {item.reportedBy ? `${item.reportedBy.firstname} ${item.reportedBy.lastname}` : 'Unknown'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleClaim}
                  disabled={claiming || item.status !== 'active' || (userEmail && item.reportedBy?.email === userEmail)}
                  style={{ width: '100%', backgroundColor: (item.status !== 'active' || (userEmail && item.reportedBy?.email === userEmail)) ? '#E2E8F0' : '#0284C7', color: (item.status !== 'active' || (userEmail && item.reportedBy?.email === userEmail)) ? '#94A3B8' : 'white', padding: '1rem', borderRadius: '9999px', fontWeight: '600', fontSize: '1rem', border: 'none', cursor: (item.status !== 'active' || (userEmail && item.reportedBy?.email === userEmail)) ? 'not-allowed' : 'pointer', marginBottom: '1rem', transition: 'background-color 0.2s' }}
                >
                  {userEmail && item.reportedBy?.email === userEmail 
                    ? 'Your Post' 
                    : claiming 
                      ? 'Submitting...' 
                      : item.status !== 'active' 
                        ? 'Action Pending/Completed' 
                        : (item.type === 'lost' ? 'I found this' : 'Initiate claim')}
                </button>
                
                <p style={{ color: '#64748B', fontSize: '0.75rem', textAlign: 'center' }}>
                  Claims are reviewed by campus staff. You'll be asked to verify ownership details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action feedback modal (layered on top) */}
        {messageModal.isOpen && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: messageModal.title === 'Success' ? '#D1FAE5' : '#FEE2E2', color: messageModal.title === 'Success' ? '#10B981' : '#EF4444', marginBottom: '1rem' }}>
                {messageModal.title === 'Success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
              </div>
              <h3 style={{ marginTop: 0, color: '#0F172A', fontSize: '1.25rem' }}>{messageModal.title}</h3>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>{messageModal.message}</p>
              <button 
                onClick={() => {
                  setMessageModal({ isOpen: false, title: '', message: '' });
                  if (messageModal.title === 'Success') onClose();
                }}
                style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.75rem 2rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusDisplay(status, type) {
  const isLost = type === 'lost';
  switch (status) {
    case 'active': return { label: isLost ? 'Looking for item' : 'Available', color: '#10B981', bg: '#D1FAE5' };
    case 'pending_claim': return { label: 'Review Pending', color: '#F59E0B', bg: '#FEF3C7' };
    case 'claimed': return { label: isLost ? 'Found' : 'Returned', color: '#64748B', bg: '#F1F5F9' };
    default: return { label: status, color: '#10B981', bg: '#D1FAE5' };
  }
}
