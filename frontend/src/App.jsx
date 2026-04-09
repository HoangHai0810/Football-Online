import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Market from './pages/Market';
import Packs from './pages/Packs';
import Quests from './pages/Quests';
import Tournaments from './pages/Tournaments';
import SoloMatch from './pages/SoloMatch';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
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
      <Link to="/dashboard" className="navbar-brand">FC CHALLANGE</Link>

      <div className="navbar-links">
        <NavLink to="/dashboard" label="Dashboard" />
        {isAuthenticated && (
          <>
            <NavLink to="/squad" label="Squad" />
            <NavLink to="/market" label="Market" />
            <NavLink to="/packs" label="Packs" />
            <NavLink to="/quests" label="Quests" />
            <NavLink to="/tournaments" label="Tournaments" />
            <NavLink to="/solo" label="Sim Match" />
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/squad" element={<PrivateRoute><Squad /></PrivateRoute>} />
            <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
            <Route path="/packs" element={<PrivateRoute><Packs /></PrivateRoute>} />
            <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
            <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
            <Route path="/solo" element={<PrivateRoute><SoloMatch /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
