import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingCart, X } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SEASON_CLASS = {
  ICON: 'badge-gold',
  TOTY: 'badge-blue',
  LIVE: 'badge-green',
  BASE: 'badge-blue',
};

const calculatePrice = (ovr) => {
  if (!ovr) return 1000;
  let price = 1000;
  
  if (ovr <= 74) price = 1000 + Math.max(0, ovr - 60) * 285; // 1k - 5k
  else if (ovr <= 84) price = 3000 + (ovr - 75) * 700;       // 3k - 10k
  else if (ovr <= 94) price = 8000 + (ovr - 85) * 700;       // 8k - 15k
  else if (ovr <= 104) price = 15000 + (ovr - 95) * 8500;    // 15k - 100k
  else price = 200000 + (ovr - 105) * 50000;                 // 200k+
  
  // Round to nearest 100 for cleaner looking prices
  return Math.round(price / 100) * 100;
};

const Market = () => {
  const { user, setUser } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSeason, setFilterSeason] = useState('ALL');
  const [filterPos, setFilterPos] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api.get('/templates')
      .then(res => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('Could not load transfer market — backend offline.');
      });
  }, []);

  const filtered = useMemo(() => {
    return players.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        || (p.nationality || '').toLowerCase().includes(search.toLowerCase());
      const matchSeason = filterSeason === 'ALL' || p.season === filterSeason;
      const matchPos = filterPos === 'ALL' || p.position === filterPos;
      return matchSearch && matchSeason && matchPos;
    });
  }, [players, search, filterSeason, filterPos]);

  const buyPlayer = async (player) => {
    if (!user) {
      toast.error("You must be logged in!");
      return;
    }
    const cost = calculatePrice(player.ovr);
    setBuying(true);
    try {
      await api.post(`/cards/buy?userId=${user.id}&templateId=${player.id}&cost=${cost}`);
      setUser(prev => ({ ...prev, coins: prev.coins - cost }));
      toast.success(`${player.name} added to your Reserve!`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Transaction failed. Not enough coins?");
    } finally {
      setBuying(false);
      setSelectedPlayer(null);
    }
  };

  const seasons = ['ALL', ...new Set(players.map(p => p.season))];
  const positions = ['ALL', ...new Set(players.map(p => p.position))];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">TRANSFER <span>MARKET</span></h1>
        <p className="page-subtitle">Browse and recruit world-class talents for your club.</p>
      </div>

      {/* Toolbar */}
      <div
        className="glass"
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          marginBottom: 28,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div className="input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} className="input-icon" />
          <input
            className="form-input with-icon"
            style={{ padding: '10px 12px 10px 40px' }}
            placeholder="Search players or nationality..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Season filter */}
        <select
          className="form-input"
          style={{ width: 140, padding: '10px 14px' }}
          value={filterSeason}
          onChange={e => setFilterSeason(e.target.value)}
        >
          {seasons.map(s => (
            <option key={s} value={s} style={{ background: '#0a1020' }}>{s}</option>
          ))}
        </select>

        {/* Position filter */}
        <select
          className="form-input"
          style={{ width: 120, padding: '10px 14px' }}
          value={filterPos}
          onChange={e => setFilterPos(e.target.value)}
        >
          {positions.map(p => (
            <option key={p} value={p} style={{ background: '#0a1020' }}>{p}</option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="glass" style={{ display: 'flex', padding: 4, gap: 4, borderRadius: 8 }}>
          <button
            className={`btn btn-sm ${view === 'grid' ? 'btn-gold' : 'btn-glass'}`}
            style={{ padding: '6px 12px' }}
            onClick={() => setView('grid')}
          >
            ⊞
          </button>
          <button
            className={`btn btn-sm ${view === 'list' ? 'btn-gold' : 'btn-glass'}`}
            style={{ padding: '6px 12px' }}
            onClick={() => setView('list')}
          >
            ≡
          </button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} players found
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 20 }}>
          <div className="spinner" style={{ width: 56, height: 56 }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading transfer market...</p>
        </div>
      ) : error ? (
        <div className="empty-state glass">
          <div className="empty-icon">⚡</div>
          <h3>Market Offline</h3>
          <p>{error}</p>
          <button className="btn btn-glass" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass">
          <div className="empty-icon"><Search size={32} /></div>
          <h3>No Players Found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : view === 'grid' ? (
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 28,
          }}
        >
          <AnimatePresence>
            {filtered.map((player, i) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <PlayerCard player={player} onClick={() => setSelectedPlayer(player)} upgradeLevel={1} />
                <button
                  className="btn btn-gold btn-sm"
                  style={{ fontWeight: 800, fontSize: 12 }}
                  onClick={() => buyPlayer(player)}
                  disabled={buying}
                >
                  <ShoppingCart size={13} />
                  BUY — {calculatePrice(player.ovr).toLocaleString()} COINS
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr auto',
              padding: '0 16px 12px',
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <span>Player</span>
            <span>OVR</span>
            <span>Season</span>
            <span>Pos</span>
            <span>PAC</span>
            <span>SHO</span>
            <span>PAS</span>
            <span>Action</span>
          </div>
          <AnimatePresence>
            {filtered.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="player-list-item"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px',
                  padding: '12px 16px',
                  cursor: 'default',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{player.name}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'var(--gold)' }}>{player.ovr}</div>
                <div><span className={`badge ${SEASON_CLASS[player.season] || 'badge-blue'}`}>{player.season}</span></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{player.position}</div>
                <div style={{ fontSize: 13 }}>{player.pace}</div>
                <div style={{ fontSize: 13 }}>{player.shooting}</div>
                <div style={{ fontSize: 13 }}>{player.passing}</div>
                <button
                  className="btn btn-gold btn-sm"
                  style={{ fontSize: 11, padding: '6px 14px' }}
                  title={`${calculatePrice(player.ovr).toLocaleString()} Coins`}
                  onClick={() => buyPlayer(player)}
                  disabled={buying}
                >
                  BUY
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 32,
            }}
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="glass-dark"
              style={{ padding: 40, borderRadius: 24, display: 'flex', gap: 40, maxWidth: 700, width: '100%', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPlayer(null)}
                style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <PlayerCard player={selectedPlayer} size="large" upgradeLevel={1} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>PLAYER PROFILE</div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 1 }}>
                    {selectedPlayer.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span className={`badge ${SEASON_CLASS[selectedPlayer.season] || 'badge-blue'}`}>{selectedPlayer.season}</span>
                    <span className="badge badge-blue">{selectedPlayer.position}</span>
                    <span className="badge badge-blue">{selectedPlayer.nationality}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Age', selectedPlayer.age],
                    ['Height', `${selectedPlayer.height} cm`],
                    ['Weight', `${selectedPlayer.weight} kg`],
                    ['Body Type', selectedPlayer.bodyType],
                    ['Att. WR', selectedPlayer.attackingWorkRate],
                    ['Def. WR', selectedPlayer.defensiveWorkRate],
                  ].map(([label, val]) => (
                    <div key={label} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{val ?? '—'}</div>
                    </div>
                  ))}
                </div>

                {selectedPlayer.traits && selectedPlayer.traits.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedPlayer.traits.map(t => (
                      <span key={t} className="badge badge-gold">{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                  <button className="btn btn-glass" style={{ flex: 1 }} onClick={() => setSelectedPlayer(null)}>CANCEL</button>
                  <button 
                    className="btn btn-gold" 
                    style={{ flex: 1 }}
                    onClick={() => buyPlayer(selectedPlayer)}
                    disabled={buying}
                  >
                    <ShoppingCart size={15} />
                    BUY — {calculatePrice(selectedPlayer.ovr).toLocaleString()} COINS
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Market;
