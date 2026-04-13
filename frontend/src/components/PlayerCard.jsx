import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

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

export const getStatBonus = (level) => {
  switch (level) {
    case 2: return 1;
    case 3: return 2;
    case 4: return 4;
    case 5: return 6;
    case 6: return 8;
    case 7: return 11;
    case 8: return 15;
    case 9: return 18;
    case 10: return 21;
    default: return 0;
  }
};

const getFlameColor = (level) => {
  if (level <= 1) return null;
  if (level <= 4) return '#b45309'; // Bronze
  if (level <= 7) return '#cbd5e1'; // Silver
  return '#facc15';                // Gold
};

const PlayerCard = ({ 
  player, 
  size = 'medium', 
  onClick, 
  upgradeLevel = 0,
  showPurpleAura = false,
  isFlickeringPurple = false,
  isPenalty = false,
  effectiveOvrOverride = null
}) => {
  const [hovered, setHovered] = useState(false);
  if (!player) return null;

  const purpleColor = '#a855f7'; // Bright purple

  // Lightning Bolt Component for Super Saiyan effect
  const LightningBolt = ({ delay }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 0, 1, 1, 0],
        scale: [0.5, 1.5, 0.8, 1.8, 1.2, 1],
        x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30],
        y: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30],
        rotate: [0, 45, -45, 90, 0]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 0.3, 
        delay: delay,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        zIndex: 10,
        color: '#fff', // White core for brightness
        filter: `drop-shadow(0 0 8px ${purpleColor}) drop-shadow(0 0 15px ${purpleColor}) drop-shadow(0 0 25px #fff)`,
        pointerEvents: 'none'
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </motion.div>
  );

  const seasonClass = SEASON_CLASS[player.season] || 'card-base';
  const seasonGlow = SEASON_GLOW[player.season] || 'rgba(102, 126, 234, 0.5)';

  const cardStyle = size === 'large'
    ? { width: 260, height: 360 }
    : size === 'small'
    ? { width: 140, height: 196 }
    : size === 'mini'
    ? { width: 76, height: 106 }
    : { width: 200, height: 280 };

  const sizes = {
    large: { ovr: 52, pos: 15, season: 10, portrait: 130, initials: 64, name: 16, statsH: 80, statV: 16, statL: 8, badge: 14 },
    normal: { ovr: 42, pos: 13, season: 9, portrait: 100, initials: 52, name: 13, statsH: 64, statV: 13, statL: 7, badge: 12 },
    small: { ovr: 28, pos: 10, season: 8, portrait: 64, initials: 32, name: 11, statsH: 48, statV: 11, statL: 6, badge: 10 },
    mini: { ovr: 16, pos: 7, season: 6, portrait: 36, initials: 20, name: 7, statsH: 26, statV: 7, statL: 4, badge: 8 },
  };

  const curr = sizes[size] || sizes.normal;

  const bonus = getStatBonus(upgradeLevel);
  const effectiveOvr = effectiveOvrOverride !== null ? effectiveOvrOverride : ((player.ovr || 0) + bonus);

  const stats = [
    { label: 'PAC', value: (player.pace || 70) + bonus },
    { label: 'SHO', value: (player.shooting || 70) + bonus },
    { label: 'PAS', value: (player.passing || 70) + bonus },
    { label: 'DRI', value: (player.dribbling || 70) + bonus },
    { label: 'DEF', value: (player.defending || 70) + bonus },
    { label: 'PHY', value: (player.physical || 70) + bonus },
  ];

  const flameColor = getFlameColor(upgradeLevel);

  const initials = player.name
    ? player.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{ position: 'relative', ...cardStyle, display: 'inline-block' }}>
      {/* Super Saiyan Purple Aura & Lightning */}
      {(showPurpleAura || isFlickeringPurple) && (
        <div style={{ position: 'absolute', inset: -20, zIndex: -2 }}>
          {/* Main Aura Glow */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 30,
              background: `radial-gradient(circle, ${purpleColor}44 0%, transparent 80%)`,
              border: `3px solid ${purpleColor}`,
              boxShadow: `0 0 60px ${purpleColor}, 0 0 120px ${purpleColor}66, inset 0 0 40px ${purpleColor}`,
            }}
            animate={isFlickeringPurple ? {
              opacity: [0.4, 1, 0.4, 1, 0.4],
              scale: [1, 1.15, 1, 1.15, 1],
              filter: ['brightness(1)', 'brightness(2)', 'brightness(1)']
            } : {
              opacity: [0.7, 1, 0.7],
              scale: [1.1, 1.25, 1.1],
              filter: ['drop-shadow(0 0 20px #fff)', 'drop-shadow(0 0 40px #fff)', 'drop-shadow(0 0 20px #fff)']
            }}
            transition={{ repeat: Infinity, duration: isFlickeringPurple ? 0.2 : 0.8 }}
          />
          
          {/* Lightning Bolts - Increased count */}
          {showPurpleAura && [...Array(18)].map((_, i) => (
            <div key={i} style={{ 
              position: 'absolute', 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}>
              <LightningBolt delay={i * 0.05} />
            </div>
          ))}
        </div>
      )}

      {/* Subtle Card Aura (Close to edges, not distracting) */}
      {!showPurpleAura && !isFlickeringPurple && flameColor && (
        <div style={{ position: 'absolute', inset: -10, zIndex: -1 }}>
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 20,
              boxShadow: `0 0 40px ${flameColor}, inset 0 0 20px ${flameColor}`,
              opacity: 0.5
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      )}

      <motion.div
        className={`player-card ${seasonClass}`}
        style={{
          ...cardStyle,
          boxShadow: isPenalty 
            ? '0 0 15px rgba(255, 50, 50, 0.8), inset 0 0 10px rgba(255, 0, 0, 0.4)'
            : hovered
              ? `0 20px 60px ${seasonGlow}, 0 8px 32px rgba(0,0,0,0.5)`
              : '0 8px 32px rgba(0,0,0,0.5)',
          border: isPenalty ? '1px solid rgba(255,50,50,0.8)' : '1px solid rgba(255,255,255,0.1)',
          cursor: onClick ? 'pointer' : 'default',
        }}
        whileHover={!isPenalty && size !== 'mini' ? { y: -8, scale: 1.03 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
      >
        {/* Glossy shine overlay */}
        <div className="card-shine" />

        {isPenalty && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,0,0,0.15)', zIndex: 1, pointerEvents: 'none', borderRadius: 'inherit'
          }} />
        )}

        {/* OVR + Position */}
        <div className="card-top" style={{ 
          position: 'absolute', 
          top: size === 'mini' ? 4 : size === 'small' ? 8 : 12, 
          left: size === 'mini' ? 4 : size === 'small' ? 8 : 12,
          color: isPenalty ? '#ff4757' : 'inherit'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="card-ovr" style={{ fontSize: curr.ovr }}>
              {effectiveOvr}
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
            top: size === 'mini' ? 16 : size === 'small' ? 32 : 40,
            right: size === 'mini' ? 4 : size === 'small' ? 8 : 10,
            background: getUpgradeColor(upgradeLevel),
            color: upgradeLevel >= 5 ? '#fff' : '#000',
            fontWeight: 800,
            fontSize: curr.badge,
            padding: size === 'mini' ? '0 3px' : '1px 5px',
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
        <div className="card-portrait" style={{ bottom: size === 'mini' ? curr.statsH + 2 : curr.statsH + 4 }}>
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
        <div className="card-name" style={{ bottom: size === 'mini' ? curr.statsH : curr.statsH + 4 }}>
          <h3 style={{ fontSize: curr.name }}>{player.name}</h3>
        </div>

        {/* Stats Footer */}
        <div className="card-stats" style={{ height: curr.statsH, gap: size === 'mini' ? 0 : 4, paddingBottom: size === 'mini' ? 2 : 8 }}>
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
    </div>
  );
};

export default PlayerCard;
