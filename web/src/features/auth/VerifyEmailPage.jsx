import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from './authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully! You can now login.');
      } catch (err) {
        setStatus('error');
        const apiError = err.response?.data?.error;
        setMessage(apiError?.details || apiError?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2>Email Verification</h2>
        
        {status === 'loading' && <p>Verifying your email... please wait.</p>}
        
        {status === 'success' && (
          <div>
            <p className="success" style={{ marginBottom: '1rem' }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Go to Login
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <p className="error" style={{ marginBottom: '1rem' }}>{message}</p>
            <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-block' }}>
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
