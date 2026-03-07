import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const res = await register(form);
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError?.code === 'VALID-001' && typeof apiError.details === 'object') {
        setFieldErrors(apiError.details);
      } else {
        setError(apiError?.details || apiError?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔍</div>
          <span className="auth-logo-text">Lost&amp;Found Portal</span>
        </div>

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join the CIT-U Lost&amp;Found Portal.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First name</label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="Kent"
                value={form.firstname}
                onChange={handleChange}
                required
              />
              {fieldErrors.firstname && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.firstname}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last name</label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Bebita"
                value={form.lastname}
                onChange={handleChange}
                required
              />
              {fieldErrors.lastname && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.lastname}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@cit.edu"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
