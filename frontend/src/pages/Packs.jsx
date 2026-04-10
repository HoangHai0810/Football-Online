import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, Sparkles, Zap, Star, Shield, Coins } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PACKS = [
  {
    id: 'starter',
    name: 'STARTER PACK',
    description: 'Perfect for building your squad foundation. Guaranteed 70+ OVR player.',
    price: 3000,
    guaranteed: '70+ OVR GUARANTEED',
    minOvr: 70,
    icon: PackageOpen,
    colorFrom: 'rgba(200,200,200,0.15)',
    colorTo: 'rgba(200,200,200,0.03)',
    border: 'rgba(200,200,200,0.35)',
    iconColor: '#c8c8c8',
    iconBg: 'rgba(200,200,200,0.12)',
    badgeClass: 'badge-silver',
    shimmerColor: 'rgba(200,200,200,0.3)',
  },
  {
    id: 'veteran',
    name: 'VETERAN PACK',
    description: 'A solid pick for mid-tier depth. Drops 80+ player upgraded +3 to +6.',
    price: 25000,
    guaranteed: '80+ OVR | +3 TO +6',
    minOvr: 80,
    minLevel: 3,
    maxLevel: 6,
    icon: Shield,
    colorFrom: 'rgba(230,126,34,0.15)',
    colorTo: 'rgba(230,126,34,0.03)',
    border: 'rgba(230,126,34,0.35)',
    iconColor: '#e67e22',
    iconBg: 'rgba(230,126,34,0.12)',
    badgeClass: 'badge-bronze',
    shimmerColor: 'rgba(230,126,34,0.3)',
  },
  {
    id: 'premium',
    name: 'PREMIUM PACK',
    description: 'A carefully curated selection of top-rated players. Guaranteed 85+ OVR.',
    price: 15000,
    guaranteed: '85+ OVR GUARANTEED',
    minOvr: 85,
    icon: Shield,
    colorFrom: 'rgba(240,195,45,0.15)',
    colorTo: 'rgba(240,195,45,0.03)',
    border: 'rgba(240,195,45,0.35)',
    iconColor: '#f0c32d',
    iconBg: 'rgba(240,195,45,0.12)',
    badgeClass: 'badge-gold',
    shimmerColor: 'rgba(240,195,45,0.3)',
  },
  {
    id: 'live_master',
    name: 'LIVE UPGRADE PACK',
    description: 'High risk, massive reward. Guaranteed LIVE season player between +5 to +8.',
    price: 45000,
    guaranteed: '+5 TO +8 LIVE SEASON',
    season: 'LIVE',
    minLevel: 5,
    maxLevel: 8,
    icon: Zap,
    colorFrom: 'rgba(46,204,113,0.15)',
    colorTo: 'rgba(46,204,113,0.03)',
    border: 'rgba(46,204,113,0.35)',
    iconColor: '#2ecc71',
    iconBg: 'rgba(46,204,113,0.12)',
    badgeClass: 'badge-live',
    shimmerColor: 'rgba(46,204,113,0.3)',
  },
  {
    id: 'all_star',
    name: 'ALL-STAR PACK',
    description: 'A pack containing only the best base formats. Guaranteed 90+ OVR.',
    price: 75000,
    guaranteed: '90+ OVR GUARANTEED',
    minOvr: 90,
    icon: Sparkles,
    colorFrom: 'rgba(155,89,182,0.15)',
    colorTo: 'rgba(155,89,182,0.03)',
    border: 'rgba(155,89,182,0.35)',
    iconColor: '#9b59b6',
    iconBg: 'rgba(155,89,182,0.12)',
    badgeClass: 'badge-purple',
    shimmerColor: 'rgba(155,89,182,0.3)',
  },
  {
    id: 'toty_upgrade',
    name: 'TOTY UPGRADE PACK',
    description: 'The ultimate Team of the Year pack. Guaranteed TOTY player +2 to +5.',
    price: 125000,
    guaranteed: '+2 TO +5 TOTY SEASON',
    season: 'TOTY',
    minLevel: 2,
    maxLevel: 5,
    icon: Star,
    colorFrom: 'rgba(64,196,255,0.15)',
    colorTo: 'rgba(64,196,255,0.03)',
    border: 'rgba(64,196,255,0.35)',
    iconColor: '#40c4ff',
    iconBg: 'rgba(64,196,255,0.12)',
    badgeClass: 'badge-blue',
    shimmerColor: 'rgba(64,196,255,0.3)',
  },
  {
    id: 'golden_ticket',
    name: 'GOLDEN TICKET PACK',
    description: 'A pack guaranteeing a highly upgraded card. Guaranteed 85+ OVR with +8 to +10 levels.',
    price: 200000,
    guaranteed: '85+ OVR | +8 TO +10',
    minOvr: 85,
    minLevel: 8,
    maxLevel: 10,
    icon: Sparkles,
    colorFrom: 'rgba(255,215,0,0.15)',
    colorTo: 'rgba(255,215,0,0.03)',
    border: 'rgba(255,215,0,0.35)',
    iconColor: '#ffd700',
    iconBg: 'rgba(255,215,0,0.12)',
    badgeClass: 'badge-ultimate',
    shimmerColor: 'rgba(255,215,0,0.3)',
  },
  {
    id: 'icon',
    name: 'ICON PACK',
    description: 'The rarest pack in existence. Guaranteed true legend pull.',
    price: 350000,
    guaranteed: 'GUARANTEED ICON',
    season: 'ICON',
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
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            {pack.description}
          </div>
          <div 
            className={`badge ${pack.badgeClass}`} 
            style={{ 
              fontSize: '15px', 
              fontWeight: 800, 
              padding: '10px 18px', 
              letterSpacing: 1, 
              textTransform: 'uppercase', 
              boxShadow: `0 4px 15px ${pack.shimmerColor}`,
              display: 'inline-flex',
              border: `1px solid ${pack.border}`
            }}
          >
            {pack.guaranteed}
          </div>
        </div>

        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: pack.iconColor, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          {pack.price.toLocaleString()} <Coins size={24} />
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
  const { user, setUser } = useAuth();
  const [state, setState] = useState('idle');  // idle | opening | result | error
  const [revealedCard, setRevealedCard] = useState(null);
  const [activePack, setActivePack] = useState(null);
  const skipRef = useRef(false);

  // Skippable sleep: resolves after `ms` OR immediately if skipped
  const skippableSleep = (ms) => new Promise(resolve => {
    if (skipRef.current) return resolve();
    const timeout = setTimeout(resolve, ms);
    const check = setInterval(() => {
      if (skipRef.current) {
        clearTimeout(timeout);
        clearInterval(check);
        resolve();
      }
    }, 50);
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state === 'result') {
          reset();
        } else if (['opening', 'reveal_nationality', 'reveal_position', 'reveal_club'].includes(state)) {
          skipRef.current = true;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state]);

  const openPack = async (packId) => {
    if (!user) {
      toast.error("You must be logged in to open packs");
      return;
    }
    const packObj = PACKS.find(p => p.id === packId);
    if (!packObj) return;

    skipRef.current = false;
    setActivePack(packId);
    setState('opening');

    try {
      const queryParams = new URLSearchParams({
        userId: user.id,
        cost: packObj.price,
        minOvr: packObj.minOvr || 0,
        season: packObj.season || '',
        minLevel: packObj.minLevel || 1,
        maxLevel: packObj.maxLevel || 1
      });

      const res = await api.post(`/cards/open-pack?${queryParams.toString()}`);
      const fullCard = res.data;
      // Instantly deduct the coins in the React UI
      setUser(prev => ({ ...prev, coins: prev.coins - packObj.price }));
      setRevealedCard(fullCard);

      // Sequential Reveal Logic — each step skippable with Space
      await skippableSleep(2000); // Initial charge
      
      setState('reveal_nationality');
      await skippableSleep(3000);

      setState('reveal_position');
      await skippableSleep(3000);

      setState('reveal_club');
      await skippableSleep(3000);

      setState('result');
    } catch (err) {
      console.error(err);
      setState('idle');
      toast.error(err.response?.data?.message || "Failed to open pack. Not enough coins?");
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
        {/* Reveal Phase */}
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
            {state === 'reveal_nationality' && (
              <motion.div key="nat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.6, marginBottom: 8 }}>PLAYER NATIONALITY</div>
                <div style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4 }}>{revealedCard.template.nationality}</div>
              </motion.div>
            )}

            {state === 'reveal_position' && (
              <motion.div key="pos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.6, marginBottom: 8 }}>FIELD POSITION</div>
                <div style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--gold)' }}>{revealedCard.template.position}</div>
              </motion.div>
            )}

            {state === 'reveal_club' && (
              <motion.div key="club" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.6, marginBottom: 8 }}>PROFESSIONAL CLUB</div>
                <div style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4 }}>{revealedCard.template.club}</div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, backdropFilter: 'blur(10px)', color: 'var(--text-muted)',
                fontSize: 12, fontWeight: 700, letterSpacing: 2
              }}
            >
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 4, 
                border: '1px solid rgba(255,255,255,0.2)', color: 'white' 
              }}>SPACE</div>
              BỎ QUA
            </motion.div>
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
            {(revealedCard.template.ovr >= 110 || revealedCard.template.season === 'ICON') && (
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
                ✨ SPECTACULAR PULL — {revealedCard.template.season} LEGEND ✨
              </motion.div>
            )}

            {/* Card reveal */}
            <motion.div
              initial={{ opacity: 0, rotateY: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ perspective: 1000 }}
            >
              <PlayerCard player={revealedCard.template} size="large" upgradeLevel={revealedCard.upgradeLevel || 1} />
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
