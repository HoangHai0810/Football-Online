import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      setStatus('error');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    try {
      login(token);
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (e) {
      setStatus('error');
      setTimeout(() => navigate('/login'), 2500);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ textAlign: 'center', maxWidth: 400 }}
      >
        <div className="glass-dark" style={{ borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-bright), var(--gold))' }} />
          <div style={{ padding: '48px 40px' }}>
            {status === 'loading' && (
              <>
                <Loader size={52} className="animate-spin" style={{ color: 'var(--gold)', margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>
                  AUTHENTICATING...
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Đang xử lý tài khoản Google của bạn
                </p>
              </>
            )}

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CheckCircle size={52} style={{ color: 'var(--gold)', margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>
                  WELCOME BACK!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Log in with Google successfully. Redirecting...
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <XCircle size={52} style={{ color: 'var(--danger)', margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>
                  AUTH FAILED
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Log in with Google failed. Redirecting...
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSuccess;
