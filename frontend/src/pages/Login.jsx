import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { authApi } from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('gymsphere_token', data.token);
      localStorage.setItem('gymsphere_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12) 0%, rgba(9, 13, 22, 1) 70%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: '1.25rem',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.15)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
          }}>
            <Dumbbell size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Gym<span style={{ color: '#10b981' }}>Sphere</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Full-Stack DBMS Gym Membership System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                required
                placeholder="admin@gymsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.625rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.625rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to System</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(51, 65, 85, 0.4)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick Demo Login Accounts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@gymsphere.com', 'admin123')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', flexDirection: 'column', gap: '0.2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontWeight: 700 }}>
                <Shield size={12} />
                <span>Admin Demo</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>admin@gymsphere.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('staff@gymsphere.com', 'staff123')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem', flexDirection: 'column', gap: '0.2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8', fontWeight: 700 }}>
                <Shield size={12} />
                <span>Staff Demo</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>staff@gymsphere.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
