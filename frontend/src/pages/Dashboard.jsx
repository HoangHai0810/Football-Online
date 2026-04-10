import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, Trophy, TrendingUp, Star, Zap, Award, Coins } from 'lucide-react';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

const StatCard = ({ label, value, change, colorClass, icon: Icon, i }) => (
  <motion.div
    className={`stat-card glass ${colorClass}`}
    custom={i}
    initial="hidden"
    animate="visible"
    variants={fadeUp}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span className="stat-card-label">{label}</span>
      <Icon size={20} style={{ opacity: 0.5 }} />
    </div>
    <div className="stat-card-value">{value}</div>
    {change && (
      <div className="stat-card-change text-success">
        ↑ {change}
      </div>
    )}
  </motion.div>
);

const QuickCard = ({ to, icon: Icon, title, desc, color, i }) => (
  <motion.div custom={i} initial="hidden" animate="visible" variants={fadeUp}>
    <Link to={to} style={{ display: 'block' }}>
      <div
        className="glass"
        style={{
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          borderRadius: 16,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.borderColor = color + '55';
          e.currentTarget.style.background = color + '10';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: color + '20',
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} color={color} />
        </div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
    </Link>
  </motion.div>
);

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [statsData, setStatsData] = React.useState(null);
  const [statsLoading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated) {
      api.get('/users/stats')
        .then(res => {
          setStatsData(res.data);
          setStatsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch stats", err);
          setStatsLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (loading || (isAuthenticated && statsLoading)) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: 'var(--gold)' }}>WELCOME TO THE ARENA</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Please login to manage your squad and compete.</p>
        <Link to="/login" className="btn btn-gold btn-lg">LOGIN NOW</Link>
      </div>
    );
  }

  const stats = [
    { label: 'Current Balance', value: statsData?.coins?.toLocaleString() || '0', change: 'Live Update', colorClass: 'gold-card', icon: TrendingUp },
    { label: 'Squad OVR', value: statsData?.teamOvr || '0', change: 'Top 11 Players', colorClass: 'blue-card', icon: Star },
    { label: 'Cards Owned', value: statsData?.totalCards || '0', change: 'Collection', colorClass: 'green-card', icon: Zap },
    { label: 'Season Rank', value: statsData?.rank || '#--', colorClass: 'purple-card', icon: Award },
  ];

  const quickLinks = [
    { to: '/squad', icon: Users, title: 'MY SQUAD', desc: 'Manage your 11 starters, formations, and tactical setup.', color: '#40c4ff' },
    { to: '/packs', icon: Package, title: 'OPEN PACKS', desc: 'Try your luck with elite player packs — ICON guaranteed.', color: '#f0c32d' },
    { to: '/market', icon: ShoppingCart, title: 'TRANSFER MARKET', desc: 'Browse and recruit world-class talents for your club.', color: '#00e676' },
    { to: '/trophies', icon: Trophy, title: 'TROPHIES', desc: 'View your achievements, streaks, and season ranking.', color: '#ff6b6b' },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          padding: '48px 0 56px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(240,195,45,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <p style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600 }}>
          Welcome Back, Manager
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, letterSpacing: 4, lineHeight: 1, marginBottom: 20 }}>
          YOUR <span style={{ color: 'var(--gold)', textShadow: '0 0 40px rgba(240,195,45,0.4)' }}>ARENA</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Build the ultimate squad, open legendary packs, and dominate
          the transfer market in the most premium football experience.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="stats-row" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} i={i} />
        ))}
      </div>

      {/* Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {quickLinks.map((q, i) => (
          <QuickCard key={q.title} {...q} i={i + 4} />
        ))}
      </div>

      {/* Balance Banner */}
      <motion.div
        custom={8}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          marginTop: 32,
          padding: '32px 40px',
          background: 'linear-gradient(135deg, rgba(240,195,45,0.12) 0%, rgba(240,195,45,0.03) 50%, rgba(10,18,40,0.3) 100%)',
          border: '1px solid rgba(240,195,45,0.25)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
            Account Balance
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 2, lineHeight: 1, color: 'var(--gold)' }}>
            {statsData?.coins?.toLocaleString() || '0'} <Coins size={20} style={{ opacity: 0.7, verticalAlign: 'text-bottom' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Complete <strong style={{ color: 'var(--gold)' }}>Quests</strong> to earn more coins!
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/quests" className="btn btn-glass">VIEW QUESTS</Link>
          <Link to="/packs" className="btn btn-gold">OPEN PACKS</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
