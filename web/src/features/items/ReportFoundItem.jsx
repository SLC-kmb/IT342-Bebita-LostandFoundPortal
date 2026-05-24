import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportFoundItem } from './itemsApi';
import { supabase } from '../../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function ReportFoundItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: '',
    description: '',
    category: '',
    building: '',
    specificLocation: '',
    dateFound: '',
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

    if (!form.itemName || !form.description || !form.category || !form.building || !form.dateFound) {
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

      const finalLocation = form.specificLocation ? `${form.building} - ${form.specificLocation}` : form.building;
      await reportFoundItem({ ...form, location: finalLocation, imageUrl });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Upload/Report Error:", err);
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || err.message || 'Failed to report found item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
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
          <button onClick={() => navigate('/dashboard')}>← Back</button>
        </div>
      </nav>

      <div className="report-container">
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          ← Back to dashboard
        </button>

        <div className="report-header">
          <h1>Report a found item</h1>
          <p>Thanks for helping out. The more detail you share, the easier it is to find the owner.</p>
        </div>

        <div className="form-card">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Found item reported successfully! Redirecting...</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName">Item title *</label>
              <input
                id="itemName"
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="e.g. Black Leather Wallet"
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
                placeholder="Distinctive markings, contents, or condition — anything that helps verify the owner."
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
                <label htmlFor="building">Where did you find this item? *</label>
                <select
                  id="building"
                  name="building"
                  value={form.building}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select building</option>
                  <option value="NGE">NGE</option>
                  <option value="RTL">RTL</option>
                  <option value="ACAD">ACAD</option>
                  <option value="GLE">GLE</option>
                  <option value="Elem Building">Elem Building</option>
                  <option value="Annex">Annex</option>
                  <option value="Gym">Gym</option>
                  <option value="Covered Court">Covered Court</option>
                  <option value="Elementary Open Court">Elementary Open Court</option>
                  <option value="Canteen (Elem Building)">Canteen (Elem Building)</option>
                  <option value="Canteen (Engineering Building)">Canteen (Engineering Building)</option>
                  <option value="Canteen Main">Canteen Main</option>
                  <option value="Parking Area">Parking Area</option>
                </select>
                <input
                  type="text"
                  name="specificLocation"
                  value={form.specificLocation}
                  onChange={handleChange}
                  placeholder="Added description (e.g. 3rd Floor, near stairs)"
                  style={{ marginTop: '0.75rem' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateFound">Date found *</label>
                <input
                  id="dateFound"
                  type="date"
                  name="dateFound"
                  value={form.dateFound}
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