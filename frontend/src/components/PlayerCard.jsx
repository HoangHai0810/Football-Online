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

const PlayerCard = ({ player, size = 'normal', onClick }) => {
  const [hovered, setHovered] = useState(false);
  if (!player) return null;

  const seasonClass = SEASON_CLASS[player.season] || 'card-base';
  const seasonGlow = SEASON_GLOW[player.season] || 'rgba(102, 126, 234, 0.5)';

  const cardStyle = size === 'large'
    ? { width: 260, height: 360 }
    : { width: 200, height: 280 };

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
      <div className="card-top">
        <span className="card-ovr" style={{ fontSize: size === 'large' ? 52 : 42 }}>
          {player.ovr}
        </span>
        <span className="card-pos" style={{ fontSize: size === 'large' ? 15 : 13 }}>
          {player.position || '—'}
        </span>
      </div>

      {/* Season Badge */}
      <div className="card-season">{player.season}</div>

      {/* Player Portrait */}
      <div className="card-portrait" style={{ bottom: size === 'large' ? 84 : 68 }}>
        <div
          className="card-portrait-placeholder"
          style={{
            width: size === 'large' ? 130 : 100,
            height: size === 'large' ? 130 : 100,
            fontSize: size === 'large' ? 64 : 52,
          }}
        >
          {initials}
        </div>
      </div>

      {/* Player Name */}
      <div className="card-name" style={{ bottom: size === 'large' ? 84 : 68 }}>
        <h3 style={{ fontSize: size === 'large' ? 16 : 13 }}>{player.name}</h3>
      </div>

      {/* Stats Footer */}
      <div className="card-stats" style={{ height: size === 'large' ? 80 : 64 }}>
        {stats.map(s => (
          <div key={s.label} className="stat">
            <span className="stat-value" style={{ fontSize: size === 'large' ? 16 : 13 }}>
              {s.value ?? '—'}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
