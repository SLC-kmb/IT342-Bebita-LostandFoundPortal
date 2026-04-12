import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportLostItem } from '../services/api';

export default function ReportLostItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: '',
    description: '',
    category: '',
    location: '',
    dateLost: '',
    contactInfo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.itemName || !form.description || !form.category || !form.location || !form.dateLost) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      await reportLostItem(form);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || 'Failed to report lost item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Report Lost Item</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">Lost item reported successfully! Redirecting...</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">Item Name *</label>
            <input
              id="itemName"
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="documents">Documents</option>
              <option value="keys">Keys</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location Lost *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateLost">Date Lost *</label>
            <input
              id="dateLost"
              type="date"
              name="dateLost"
              value={form.dateLost}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactInfo">Contact Information</label>
            <input
              id="contactInfo"
              type="text"
              name="contactInfo"
              value={form.contactInfo}
              onChange={handleChange}
              placeholder="Phone number or additional contact info"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Reporting...' : 'Report Lost Item'}
          </button>
        </form>

        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}