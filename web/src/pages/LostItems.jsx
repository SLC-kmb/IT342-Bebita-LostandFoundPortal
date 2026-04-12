import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLostItems, claimItem } from '../services/api';

export default function LostItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchLostItems();
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
      // Refresh the list
      await fetchLostItems();
      alert('Item claimed successfully!');
    } catch {
      alert('Failed to claim item. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div className="loading">Loading lost items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <span><strong>Lost &amp; Found Portal</strong></span>
        <span>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </span>
      </nav>

      <div className="dashboard-content">
        <h2>Lost Items</h2>

        {items.length === 0 ? (
          <p>No lost items reported yet.</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <h3>{item.itemName}</h3>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Description:</strong> {item.description}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Date Lost:</strong> {new Date(item.dateLost).toLocaleDateString()}</p>
                {item.contactInfo && <p><strong>Contact:</strong> {item.contactInfo}</p>}
                <p><strong>Status:</strong> {item.status || 'Lost'}</p>
                <button
                  onClick={() => handleClaim(item.id)}
                  disabled={claiming === item.id || item.status === 'claimed'}
                  className="claim-btn"
                >
                  {claiming === item.id ? 'Claiming...' : item.status === 'claimed' ? 'Claimed' : 'I Found This'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}