import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleLogin } from './authApi';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    studentId: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const errors = {};
    if (!/^[A-Za-z\s]+$/.test(form.firstname)) {
      errors.firstname = "First name must only contain letters.";
    }
    if (!/^[A-Za-z\s]+$/.test(form.lastname)) {
      errors.lastname = "Last name must only contain letters.";
    }
    if (!/^\d{2}-\d{4}-\d{3}$/.test(form.studentId)) {
      errors.studentId = "ID Number must be in the format XX-XXXX-XXX.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(form.password)) {
      errors.password = "Password must be at least 6 chars with 1 uppercase, 1 lowercase, and 1 number.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await register(form);
      setSuccess(true);
      setForm({ firstname: '', lastname: '', studentId: '', email: '', password: '' });
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleLogin(credentialResponse.credential);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || 'Google Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.2rem' }}>Finder</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Lost and Found Portal</span>
        </div>
        <h3>Create an account</h3>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">Account created! Please check your email to verify your account before signing in.</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First Name</label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
              />
              {fieldErrors.firstname && <p className="error">{fieldErrors.firstname}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last Name</label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
              />
              {fieldErrors.lastname && <p className="error">{fieldErrors.lastname}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="studentId">Student ID Number</label>
            <input
              id="studentId"
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="23-6492-687"
              required
            />
            {fieldErrors.studentId && <p className="error">{fieldErrors.studentId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              theme="filled_blue"
              type="icon"
              shape="circle"
            />
          </div>
        </form>

        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
