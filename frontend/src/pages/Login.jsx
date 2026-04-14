import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { username: form.username, password: form.password };
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, payload);
      if (res.data.token) {
        login(res.data.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse 50% 70% at 50% 50%, rgba(240,195,45,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div
          className="glass-dark"
          style={{ borderRadius: 24, overflow: 'hidden' }}
        >
          {/* Top accent */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-bright), var(--gold))',
          }} />

          <div style={{ padding: '40px 40px 44px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 42,
                letterSpacing: 4,
                color: 'var(--gold)',
                textShadow: '0 0 30px rgba(240,195,45,0.35)',
                lineHeight: 1,
              }}>
                FC CHALLENGE
              </div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)', margin: '16px 0' }} />
            </div>

            {/* Tab switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                padding: 4,
                marginBottom: 28,
              }}
            >
              {['Login', 'Register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setIsRegister(tab === 'Register'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: (tab === 'Register' ? isRegister : !isRegister)
                      ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))'
                      : 'transparent',
                    color: (tab === 'Register' ? isRegister : !isRegister)
                      ? '#0a0f1e'
                      : 'var(--text-muted)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1, marginBottom: 4 }}>
                {isRegister ? 'JOIN THE ' : 'BACK TO '}
                <span style={{ color: 'var(--gold)' }}>ARENA</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {isRegister ? 'Start your management career today.' : 'Manage your club and dominate the league.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email field (register only) */}
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="form-group">
                      <div className="input-wrap">
                        <Mail size={16} className="input-icon" />
                        <input
                          className="form-input with-icon"
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={form.email}
                          onChange={handleChange}
                          required={isRegister}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div className="form-group">
                <div className="input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    className="form-input with-icon"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    className="form-input with-icon"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(255,82,82,0.1)',
                      border: '1px solid rgba(255,82,82,0.3)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'var(--danger)',
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-gold btn-lg"
                style={{ marginTop: 4, width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? <Loader size={16} className="animate-spin" /> : null}
                {loading ? 'LOADING...' : (isRegister ? 'CREATE ACCOUNT' : 'LOGIN NOW')}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google OAuth2 Button */}
            <a
              id="google-login-btn"
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                padding: '11px 0',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                textDecoration: 'none',
                fontFamily: 'Outfit, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              {/* Google Icon SVG */}
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.8 32.5 35 35 32.3 36.6V43.1H40.2C44.7 39 47.5 32.3 47.5 24.5Z" fill="#4285F4"/>
                <path d="M24 48C30.6 48 36.1 45.9 40.2 43.1L32.3 36.6C30.2 38 27.4 38.9 24 38.9C17.6 38.9 12.1 34.7 10.2 29H2V35.7C6.1 43.8 14.4 48 24 48Z" fill="#34A853"/>
                <path d="M10.2 29C9.7 27.6 9.5 26.1 9.5 24.5C9.5 22.9 9.8 21.4 10.2 20V13.3H2C0.7 16 0 19.2 0 22.5C0 25.8 0.7 29 2 31.7L10.2 29Z" fill="#FBBC04"/>
                <path d="M24 9.5C27.7 9.5 31 10.8 33.6 13.3L40.4 6.5C36.1 2.5 30.6 0 24 0C14.4 0 6.1 4.2 2 12.3L10.2 19C12.1 13.3 17.6 9.5 24 9.5Z" fill="#EA4335"/>
              </svg>
              CONTINUE WITH GOOGLE
            </a>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button
                style={{ color: 'var(--gold)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                onClick={() => { setIsRegister(v => !v); setError(''); }}
              >
                {isRegister ? 'Login here' : 'Register now'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
