import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoundItems, claimItem } from '../services/api';

export default function FoundItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchFoundItems();
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
      // Refresh the list
      await fetchFoundItems();
      alert('Item claimed successfully!');
    } catch {
      alert('Failed to claim item. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div className="loading">Loading found items...</div>;
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
        <h2>Found Items</h2>

        {items.length === 0 ? (
          <p>No found items reported yet.</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <h3>{item.itemName}</h3>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Description:</strong> {item.description}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Date Found:</strong> {new Date(item.dateFound).toLocaleDateString()}</p>
                {item.contactInfo && <p><strong>Contact:</strong> {item.contactInfo}</p>}
                <p><strong>Status:</strong> {item.status || 'Found'}</p>
                <button
                  onClick={() => handleClaim(item.id)}
                  disabled={claiming === item.id || item.status === 'claimed'}
                  className="claim-btn"
                >
                  {claiming === item.id ? 'Claiming...' : item.status === 'claimed' ? 'Claimed' : 'This is Mine'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}