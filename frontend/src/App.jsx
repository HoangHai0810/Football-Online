import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Market from './pages/Market';
import Packs from './pages/Packs';
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
  const [coins, setCoins] = useState(() => {
    const stored = localStorage.getItem(COINS_KEY);
    return stored ? parseInt(stored, 10) : 1250500;
  });

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">FC ONLINE</Link>

      <div className="navbar-links">
        <NavLink to="/dashboard" label="Dashboard" />
        <NavLink to="/squad" label="Squad" />
        <NavLink to="/market" label="Market" />
        <NavLink to="/packs" label="Packs" />
      </div>

      <div className="navbar-right">
        <div className="coins-badge">
          <span className="coin-icon">₡</span>
          {coins.toLocaleString()}
        </div>
        <Link to="/login" className="btn btn-glass btn-sm">LOGIN</Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/market" element={<Market />} />
          <Route path="/packs" element={<Packs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
