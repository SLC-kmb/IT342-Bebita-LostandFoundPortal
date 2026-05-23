import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, googleLogin, resendVerification } from './authApi';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setShowResend(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResend(false);

    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(true);
      setTimeout(() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard'), 1500);
    } catch (err) {
      const apiError = err.response?.data?.error;
      const message = apiError?.details || apiError?.message || 'Login failed. Please try again.';
      setError(message);
      if (message.toLowerCase().includes('verify your account')) {
        setShowResend(true);
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
      setTimeout(() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard'), 1500);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError?.details || apiError?.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendStatus('Sending...');
      await resendVerification(form.email);
      setResendStatus('Verification email sent! Check your inbox.');
    } catch (err) {
      setResendStatus(err.response?.data?.error?.message || 'Failed to resend email.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Finder</h2>
        <h3>Sign in to your account</h3>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">Login successful! Redirecting...</p>}
        {showResend && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button type="button" onClick={handleResend} className="btn" style={{ backgroundColor: '#4b5563', color: 'white', padding: '5px 10px', fontSize: '0.9rem' }}>
              Resend Verification Email
            </button>
            {resendStatus && <p style={{ marginTop: '5px', fontSize: '0.85rem', color: resendStatus.includes('sent') ? 'green' : 'red' }}>{resendStatus}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
                placeholder="Enter your password"
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
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_blue"
              type="icon"
              shape="circle"
            />
          </div>
        </form>

        <p>Don&apos;t have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
