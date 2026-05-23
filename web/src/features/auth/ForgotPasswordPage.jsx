import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from './authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await forgotPassword(email);
      setStatus({ type: 'success', message: 'If an account with that email exists, we have sent a password reset link.' });
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      // For security, it's often better to show success even if the email doesn't exist, 
      // but if the backend throws "User not found" we can display it.
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '400px' }}>
        <h2>Forgot Password</h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
          Enter your email address and we will send you a link to reset your password.
        </p>

        {status.message && (
          <p className={status.type} style={{ marginBottom: '15px', color: status.type === 'success' ? 'green' : 'red' }}>
            {status.message}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
