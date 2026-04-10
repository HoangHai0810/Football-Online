import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
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
  
  const coins = user?.coins || 0;

  return (
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
              {coins.toLocaleString()}
            </div>
            <button onClick={logout} className="btn btn-glass btn-sm">LOGOUT</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-gold btn-sm">LOGIN</Link>
        )}
      </div>
    </nav>
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
            <Route path="/squad" element={<PrivateRoute><Squad /></PrivateRoute>} />
            <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
            <Route path="/packs" element={<PrivateRoute><Packs /></PrivateRoute>} />
            <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
            <Route path="/tournaments" element={<PrivateRoute><TournamentHub /></PrivateRoute>} />
            <Route path="/career/:id" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
            <Route path="/trophies" element={<PrivateRoute><Trophies /></PrivateRoute>} />
            <Route path="/upgrade" element={<PrivateRoute><Upgrade /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
