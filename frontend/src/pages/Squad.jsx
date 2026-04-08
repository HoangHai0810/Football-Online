import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// Formation 4-3-3 positions as percentages of pitch [left%, top%]
const FORMATION_433 = [
  { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
  { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
  { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
  { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
  { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
  { slot: 5, pos: 'CM',  left: '22%', top: '48%' },
  { slot: 6, pos: 'CDM', left: '50%', top: '53%' },
  { slot: 7, pos: 'CM',  left: '78%', top: '48%' },
  { slot: 8, pos: 'LW',  left: '16%', top: '24%' },
  { slot: 9, pos: 'ST',  left: '50%', top: '18%' },
  { slot: 10, pos: 'RW', left: '84%', top: '24%' },
];

const SEASON_COLOR = {
  ICON: 'linear-gradient(135deg,#f5d020,#c8901a)',
  TOTY: 'linear-gradient(135deg,#4facfe,#1a3c9e)',
  LIVE: 'linear-gradient(135deg,#43e97b,#1a9e55)',
  BASE: 'linear-gradient(135deg,#667eea,#4a2080)',
};

const PitchNode = ({ player, slotInfo, onClick, isEmpty }) => {
  const initials = player
    ? player.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '+';

  const bg = player
    ? (SEASON_COLOR[player.season] || SEASON_COLOR.BASE)
    : 'rgba(255,255,255,0.08)';

  return (
    <div
      style={{
        position: 'absolute',
        left: slotInfo.left,
        top: slotInfo.top,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        zIndex: 2,
      }}
      onClick={() => onClick && onClick(slotInfo.slot)}
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: bg,
          border: player ? '2px solid rgba(255,255,255,0.5)' : '2px dashed rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: player ? 18 : 24,
          color: 'white',
          boxShadow: player ? '0 4px 16px rgba(0,0,0,0.5)' : 'none',
          position: 'relative',
        }}
      >
        {initials}
        {player && (
          <div style={{
            position: 'absolute',
            bottom: -3,
            right: -4,
            background: 'var(--gold)',
            color: '#0a0f1e',
            fontSize: 9,
            fontWeight: 900,
            padding: '1px 5px',
            borderRadius: 4,
            fontFamily: 'Outfit, sans-serif',
          }}>
            {player.ovr}
          </div>
        )}
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          maxWidth: 64,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {player ? player.name.split(' ').pop() : slotInfo.pos}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          {slotInfo.pos}
        </div>
      </div>
    </div>
  );
};

const Squad = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/cards/user/1')
      .then(res => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('Could not load cards — backend may be offline.');
      });
  }, []);

  // Map cards to formation slots (best available)
  const assigned = cards.slice(0, 11).map((c, i) => ({
    slot: i,
    player: c.template,
  }));

  const getPlayerForSlot = (slot) =>
    assigned.find(a => a.slot === slot)?.player || null;

  const avgOvr = cards.length > 0
    ? Math.round(cards.slice(0, 11).reduce((s, c) => s + (c.template?.ovr || 0), 0) / Math.min(cards.length, 11))
    : '—';

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">MY <span>SQUAD</span></h1>
          <p className="page-subtitle">Organize your 11 starters and tactical formation.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="glass" style={{ display: 'flex', padding: '0 4px' }}>
            <div style={{ padding: '12px 20px', borderRight: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>TEAM OVR</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'var(--gold)' }}>{avgOvr}</div>
            </div>
            <div style={{ padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>FORMATION</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>4-3-3</div>
            </div>
          </div>
          <button className="btn btn-gold">SAVE LINEUP</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Pitch */}
        <div style={{ flex: 1 }}>
          <div className="pitch-container">
            {/* Pitch field lines overlay */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}
              viewBox="0 0 400 580"
            >
              {/* Border */}
              <rect x="20" y="20" width="360" height="540" fill="none" stroke="white" strokeWidth="2" />
              {/* Halfway line */}
              <line x1="20" y1="290" x2="380" y2="290" stroke="white" strokeWidth="1.5" />
              {/* Centre circle */}
              <circle cx="200" cy="290" r="50" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="200" cy="290" r="3" fill="white" />
              {/* Penalty areas */}
              <rect x="100" y="20" width="200" height="90" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="100" y="470" width="200" height="90" fill="none" stroke="white" strokeWidth="1.5" />
              {/* Goal areas */}
              <rect x="150" y="20" width="100" height="35" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="150" y="525" width="100" height="35" fill="none" stroke="white" strokeWidth="1.5" />
              {/* Penalty spots */}
              <circle cx="200" cy="95" r="3" fill="white" />
              <circle cx="200" cy="485" r="3" fill="white" />
              {/* Penalty arcs */}
              <path d="M 155 110 A 50 50 0 0 0 245 110" fill="none" stroke="white" strokeWidth="1.5" />
              <path d="M 155 470 A 50 50 0 0 1 245 470" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>

            {/* Formation player nodes */}
            {FORMATION_433.map(slot => (
              <PitchNode
                key={slot.slot}
                slotInfo={slot}
                player={getPlayerForSlot(slot.slot)}
                onClick={(s) => setSelected(s === selected ? null : s)}
              />
            ))}
          </div>
        </div>

        {/* Reserves panel */}
        <div
          className="glass-dark"
          style={{ width: 340, maxHeight: 580, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              ALL CARDS <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({cards.length})</span>
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <h3>Connection Error</h3>
              <p>{error}</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ fontSize: 36 }}>📦</div>
              <h3>No Cards Yet</h3>
              <p>Open packs or visit the market to get your first players.</p>
            </div>
          ) : (
            cards.map(card => {
              const p = card.template;
              const bg = SEASON_COLOR[p.season] || SEASON_COLOR.BASE;
              return (
                <motion.div
                  key={card.id}
                  className="player-list-item"
                  whileHover={{ x: 4 }}
                >
                  <div
                    className="ovr-badge"
                    style={{ background: bg, color: 'white' }}
                  >
                    {p.ovr}
                  </div>
                  <div className="player-info">
                    <div className="player-name">{p.name}</div>
                    <div className="player-meta">
                      {p.position} · {p.season}
                      {card.upgradeLevel > 0 && (
                        <span style={{ color: 'var(--gold)', marginLeft: 6 }}>+{card.upgradeLevel}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge badge-${p.season === 'ICON' ? 'gold' : p.season === 'TOTY' ? 'blue' : p.season === 'LIVE' ? 'green' : 'blue'}`}>
                      {p.season}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Squad;
