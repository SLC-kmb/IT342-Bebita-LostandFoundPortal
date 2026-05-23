import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportLostItem } from './itemsApi';
import { supabase } from '../../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.itemName || !form.description || !form.category || !form.location || !form.dateLost) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      await reportLostItem({ ...form, imageUrl });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Upload/Report Error:", err);
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || err.message || 'Failed to report lost item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <nav className="navbar">
        <a href="/dashboard" className="site-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">🔍</span>
          <span>Finder</span>
        </a>
        <div className="header-nav">
          <button onClick={() => navigate('/dashboard')}>← Back</button>
        </div>
      </nav>

      <div className="report-container">
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          ← Back to dashboard
        </button>

        <div className="report-header">
          <h1>Report a lost item</h1>
          <p>Describe what you lost so others can help you find it.</p>
        </div>

        <div className="form-card">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Lost item reported successfully! Redirecting...</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName">Item title *</label>
              <input
                id="itemName"
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="e.g. iPhone 14 Pro (Space Black)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Any unique details — scratches, stickers, contents, color — that help verify ownership."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="documents">Documents</option>
                  <option value="keys">Keys</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">Where did you lose it? *</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Engineering Hall"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateLost">Date lost *</label>
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
                <label htmlFor="contactInfo">Contact information</label>
                <input
                  id="contactInfo"
                  type="text"
                  name="contactInfo"
                  value={form.contactInfo}
                  onChange={handleChange}
                  placeholder="Phone or additional contact"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="photo">Item Photo</label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '4px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}