import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, Sparkles, Zap, Star, Shield } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import api from '../services/api';

const PACKS = [
  {
    id: 'premium',
    name: 'PREMIUM PACK',
    description: 'A carefully curated selection of top-rated players. Guaranteed 100+ OVR.',
    price: 500,
    guaranteed: '100+ OVR GUARANTEED',
    icon: PackageOpen,
    colorFrom: 'rgba(240,195,45,0.15)',
    colorTo: 'rgba(240,195,45,0.03)',
    border: 'rgba(240,195,45,0.35)',
    iconColor: '#f0c32d',
    iconBg: 'rgba(240,195,45,0.12)',
    badgeClass: 'badge-gold',
    shimmerColor: 'rgba(240,195,45,0.3)',
  },
  {
    id: 'elite',
    name: 'ELITE PACK',
    description: 'Access the top 1% of players. Includes TOTY and LIVE season exclusives.',
    price: 1500,
    guaranteed: 'TOTY / LIVE SEASON',
    icon: Zap,
    colorFrom: 'rgba(64,196,255,0.15)',
    colorTo: 'rgba(64,196,255,0.03)',
    border: 'rgba(64,196,255,0.35)',
    iconColor: '#40c4ff',
    iconBg: 'rgba(64,196,255,0.12)',
    badgeClass: 'badge-blue',
    shimmerColor: 'rgba(64,196,255,0.3)',
  },
  {
    id: 'icon',
    name: 'ICON PACK',
    description: 'The rarest pack in existence. Guaranteed ICON-season legend pull.',
    price: 5000,
    guaranteed: 'ICON GUARANTEED',
    icon: Star,
    colorFrom: 'rgba(255,100,200,0.15)',
    colorTo: 'rgba(255,100,200,0.03)',
    border: 'rgba(255,100,200,0.35)',
    iconColor: '#ff64c8',
    iconBg: 'rgba(255,100,200,0.12)',
    badgeClass: 'badge-red',
    shimmerColor: 'rgba(255,100,200,0.3)',
  },
];

const PackCard = ({ pack, onOpen }) => {
  const Icon = pack.icon;
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: `0 20px 60px ${pack.shimmerColor}` }}
      transition={{ type: 'spring', stiffness: 250, damping: 18 }}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${pack.colorFrom}, ${pack.colorTo})`,
        border: `2px solid ${pack.border}`,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', position: 'relative' }}>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: pack.iconBg,
            border: `1px solid ${pack.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={48} color={pack.iconColor} />
        </motion.div>

        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, marginBottom: 8 }}>
            {pack.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {pack.description}
          </div>
          <span className={`badge ${pack.badgeClass}`}>{pack.guaranteed}</span>
        </div>

        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: pack.iconColor }}>
          {pack.price.toLocaleString()} COINS
        </div>

        <button
          className="btn btn-gold"
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${pack.iconColor}, ${pack.iconColor}cc)`,
            color: pack.id === 'premium' ? '#0a0f1e' : 'white',
            boxShadow: `0 4px 20px ${pack.shimmerColor}`,
          }}
          onClick={() => onOpen(pack.id)}
        >
          <PackageOpen size={16} /> OPEN PACK
        </button>
      </div>
    </motion.div>
  );
};

const Packs = () => {
  const [state, setState] = useState('idle');  // idle | opening | result | error
  const [revealedCard, setRevealedCard] = useState(null);
  const [activePack, setActivePack] = useState(null);

  const openPack = async (packId) => {
    setActivePack(packId);
    setState('opening');

    try {
      const res = await api.post('/cards/open-pack?userId=1');
      const card = res.data.template;
      setRevealedCard(card);

      // Sequential Reveal Logic
      await new Promise(r => setTimeout(r, 2000)); // Initial charge
      
      setState('reveal_nationality');
      await new Promise(r => setTimeout(r, 3000));

      setState('reveal_position');
      await new Promise(r => setTimeout(r, 3000));

      setState('reveal_club');
      await new Promise(r => setTimeout(r, 3000));

      setState('result');
    } catch (err) {
      console.error(err);
      setState('idle');
      alert("Failed to open pack. Check balance.");
    }
  };

  const reset = () => {
    setState('idle');
    setRevealedCard(null);
    setActivePack(null);
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
            Player Card Store
          </p>
          <h1 className="page-title" style={{ fontSize: 72, textAlign: 'center' }}>
            OPEN <span>PACKS</span>
          </h1>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>
            Unleash the power of legendary icons and future stars.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {PACKS.map((pack, i) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PackCard pack={pack} onOpen={openPack} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 32 }}
          >
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '4px solid var(--gold)',
                  boxShadow: '0 0 30px var(--gold)',
                  opacity: 0.3
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={80} color="var(--gold)" />
              </motion.div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 4, color: 'var(--gold)' }}>
                INITIATING TRANSFER...
              </h2>
            </div>
          </motion.div>
        )}

        {state.startsWith('reveal_') && (
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              minHeight: 500, textAlign: 'center' 
            }}
          >
            <div style={{ 
              fontSize: 24, letterSpacing: 8, color: 'var(--text-muted)', 
              textTransform: 'uppercase', marginBottom: 20 
            }}>
              {state.replace('reveal_', '')}
            </div>
            <div style={{ 
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, 
              color: 'var(--gold)', textShadow: '0 0 40px rgba(240,195,45,0.4)',
              lineHeight: 1
            }}>
              {state === 'reveal_nationality' && revealedCard.nationality}
              {state === 'reveal_position' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Shield size={120} style={{ marginBottom: 20 }} />
                  {revealedCard.position}
                </div>
              )}
              {state === 'reveal_club' && revealedCard.club}
            </div>
          </motion.div>
        )}

        {state === 'result' && revealedCard && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}
          >
            {/* Walkout banner */}
            {(revealedCard.ovr >= 110 || revealedCard.season === 'ICON') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '16px 48px',
                  background: 'linear-gradient(135deg, var(--gold), #ffcc33)',
                  borderRadius: 12,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24,
                  letterSpacing: 6,
                  color: '#0a0f1e',
                  boxShadow: '0 10px 40px rgba(240,195,45,0.5)',
                  textAlign: 'center',
                }}
              >
                ✨ SPECTACULAR PULL — {revealedCard.season} LEGEND ✨
              </motion.div>
            )}

            {/* Card reveal */}
            <motion.div
              initial={{ opacity: 0, rotateY: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ perspective: 1000 }}
            >
              <PlayerCard player={revealedCard} size="large" />
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 16 }}
            >
              <button className="btn btn-glass btn-lg px-8" onClick={reset}>
                CONTINUE
              </button>
              <button className="btn btn-gold btn-lg px-8" onClick={() => openPack(activePack)}>
                <PackageOpen size={18} /> OPEN ANOTHER
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Packs;
