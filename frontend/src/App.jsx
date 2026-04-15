import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import LoginSuccess from './pages/LoginSuccess';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Market from './pages/Market';
import Packs from './pages/Packs';
import Quests from './pages/Quests';
import Tournaments from './pages/Tournaments';
import TournamentHub from './pages/TournamentHub';
import Trophies from './pages/Trophies';
import Upgrade from './pages/Upgrade';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AiAssistant from './components/AiAssistant';
import './styles/globals.css';

const COINS_KEY = 'fc_coins';

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/');
  return (
    <Link to={to} className={`nav-link${isActive ? ' active' : ''}`}>
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const coins = user?.coins || 0;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/squad', label: 'Squad' },
    { to: '/market', label: 'Market' },
    { to: '/packs', label: 'Packs' },
    { to: '/quests', label: 'Quests' },
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/trophies', label: 'Trophies' },
    { to: '/upgrade', label: 'Upgrade' },
  ];

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">FC CHALLENGE</Link>

        <div className="navbar-links">
          <NavLink to="/dashboard" label="Dashboard" />
          {isAuthenticated && (
            <>
              <NavLink to="/squad" label="Squad" />
              <NavLink to="/market" label="Market" />
              <NavLink to="/packs" label="Packs" />
              <NavLink to="/quests" label="Quests" />
              <NavLink to="/tournaments" label="Tournaments" />
              <NavLink to="/trophies" label="Trophies" />
              <NavLink to="/upgrade" label="Upgrade" />
            </>
          )}
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <div className="coins-badge">
                <span className="coin-icon">₡</span>
                <span className="coins-value">{coins.toLocaleString()}</span>
              </div>
              <button onClick={logout} className="btn btn-glass btn-sm navbar-logout">LOGOUT</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-gold btn-sm">LOGIN</Link>
          )}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${mobileOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(isAuthenticated ? navItems : [navItems[0]]).map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-nav-link ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button className="btn btn-glass btn-sm" style={{ marginTop: 16, width: '100%' }}
              onClick={() => { logout(); setMobileOpen(false); }}>LOGOUT</button>
          )}
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh' }}>
          <Navbar />
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(10, 15, 30, 0.85)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(240,195,45,0.2)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#f0c32d', secondary: '#0a0f1e' },
                style: { border: '1px solid rgba(240,195,45,0.4)' }
              },
              error: {
                iconTheme: { primary: '#ff4d4d', secondary: '#0a0f1e' },
                style: { border: '1px solid rgba(255,77,77,0.4)' }
              }
            }}
          />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/squad" element={<PrivateRoute><Squad /></PrivateRoute>} />
            <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
            <Route path="/packs" element={<PrivateRoute><Packs /></PrivateRoute>} />
            <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
            <Route path="/tournaments" element={<PrivateRoute><TournamentHub /></PrivateRoute>} />
            <Route path="/tournaments/:id" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
            <Route path="/trophies" element={<PrivateRoute><Trophies /></PrivateRoute>} />
            <Route path="/upgrade" element={<PrivateRoute><Upgrade /></PrivateRoute>} />
          </Routes>
          <AiAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
