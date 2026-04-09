import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SEASON_CLASS = {
  ICON: 'card-icon',
  TOTY: 'card-toty',
  LIVE: 'card-live',
  BASE: 'card-base',
};

const SEASON_GLOW = {
  ICON: 'rgba(245, 208, 32, 0.5)',
  TOTY: 'rgba(79, 172, 254, 0.5)',
  LIVE: 'rgba(67, 233, 123, 0.5)',
  BASE: 'rgba(102, 126, 234, 0.5)',
};

const getUpgradeColor = (level) => {
  if (level === 1) return 'linear-gradient(135deg, #94a3b8, #475569)'; // Gray
  if (level <= 4) return 'linear-gradient(135deg, #b45309, #78350f)';  // Bronze
  if (level <= 7) return 'linear-gradient(135deg, #cbd5e1, #64748b)';  // Silver
  return 'linear-gradient(135deg, #facc15, #a16207)';                 // Gold
};

const PlayerCard = ({ player, size = 'normal', onClick, upgradeLevel = 1 }) => {
  const [hovered, setHovered] = useState(false);
  if (!player) return null;

  const seasonClass = SEASON_CLASS[player.season] || 'card-base';
  const seasonGlow = SEASON_GLOW[player.season] || 'rgba(102, 126, 234, 0.5)';

  const cardStyle = size === 'large'
    ? { width: 260, height: 360 }
    : size === 'small'
    ? { width: 140, height: 196 }
    : { width: 200, height: 280 };

  const sizes = {
    large: { ovr: 52, pos: 15, season: 10, portrait: 130, initials: 64, name: 16, statsH: 80, statV: 16, statL: 8, badge: 14 },
    normal: { ovr: 42, pos: 13, season: 9, portrait: 100, initials: 52, name: 13, statsH: 64, statV: 13, statL: 7, badge: 12 },
    small: { ovr: 28, pos: 10, season: 8, portrait: 64, initials: 32, name: 11, statsH: 48, statV: 11, statL: 6, badge: 10 },
  };

  const curr = sizes[size] || sizes.normal;

  const stats = [
    { label: 'PAC', value: player.pace },
    { label: 'SHO', value: player.shooting },
    { label: 'PAS', value: player.passing },
    { label: 'DRI', value: player.dribbling },
    { label: 'DEF', value: player.defending },
    { label: 'PHY', value: player.physical },
  ];

  const initials = player.name
    ? player.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <motion.div
      className={`player-card ${seasonClass}`}
      style={{
        ...cardStyle,
        boxShadow: hovered
          ? `0 20px 60px ${seasonGlow}, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 8px 32px rgba(0,0,0,0.5)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Glossy shine overlay */}
      <div className="card-shine" />

      {/* OVR + Position */}
      <div className="card-top" style={{ 
        position: 'absolute', 
        top: size === 'small' ? 8 : 12, 
        left: size === 'small' ? 8 : 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="card-ovr" style={{ fontSize: curr.ovr }}>
            {player.ovr}
          </span>
          <span className="card-pos" style={{ fontSize: curr.pos, marginTop: size === 'small' ? -2 : -4 }}>
            {player.position || '—'}
          </span>
        </div>
      </div>

      {/* Season Badge */}
      <div className="card-season" style={{ fontSize: curr.season, padding: '2px 6px', top: size === 'small' ? 8 : 10, right: size === 'small' ? 8 : 10 }}>
        {player.season}
      </div>

      {/* Level Badge - Top Right Stacked */}
      {upgradeLevel > 0 && (
        <div style={{
          position: 'absolute',
          top: size === 'small' ? 32 : 40,
          right: size === 'small' ? 8 : 10,
          background: getUpgradeColor(upgradeLevel),
          color: upgradeLevel >= 5 ? '#fff' : '#000',
          fontWeight: 800,
          fontSize: curr.badge,
          padding: '1px 5px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          fontFamily: "'Bebas Neue', sans-serif",
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          +{upgradeLevel}
        </div>
      )}

      {/* Player Portrait */}
      <div className="card-portrait" style={{ bottom: curr.statsH + 4 }}>
        <div
          className="card-portrait-placeholder"
          style={{
            width: curr.portrait,
            height: curr.portrait,
            fontSize: curr.initials,
          }}
        >
          {initials}
        </div>
      </div>

      {/* Player Name */}
      <div className="card-name" style={{ bottom: curr.statsH + 4 }}>
        <h3 style={{ fontSize: curr.name }}>{player.name}</h3>
      </div>

      {/* Stats Footer */}
      <div className="card-stats" style={{ height: curr.statsH }}>
        {stats.map(s => (
          <div key={s.label} className="stat">
            <span className="stat-value" style={{ fontSize: curr.statV }}>
              {s.value ?? '—'}
            </span>
            <span className="stat-label" style={{ fontSize: curr.statL }}>{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
