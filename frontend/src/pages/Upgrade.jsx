import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowUp, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PlayerCard, { getStatBonus } from '../components/PlayerCard';
import toast from 'react-hot-toast';

// To add fireworks, we can use a simple emoji-based or CSS particle effect
// For now, we'll use a premium looking overlay

const BASE_SUCCESS_RATES = {
  1: 1.0, 2: 0.81, 3: 0.64, 4: 0.50, 5: 0.26, 6: 0.15, 7: 0.07, 8: 0.04, 9: 0.02
};

const SuccessMeter = ({ rate }) => {
  const segments = [0.2, 0.4, 0.6, 0.8, 1.0];
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {segments.map((s, i) => (
        <div 
          key={i} 
          style={{ 
            flex: 1, height: 8, 
            borderRadius: 4, 
            background: rate >= s ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
            boxShadow: rate >= s ? '0 0 10px rgba(240,195,45,0.3)' : 'none',
            transition: 'all 0.3s ease'
          }} 
        />
      ))}
    </div>
  );
};

// --- New Ceremony Components ---

const PyroFountain = ({ side }) => (
  <div style={{
    position: 'absolute', bottom: 0, 
    left: side === 'left' ? '15%' : '85%',
    transform: 'translateX(-50%)',
    zIndex: 5
  }}>
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 0, x: 0, opacity: 1, scale: 0.5 }}
        animate={{ 
          y: -400 - Math.random() * 200, 
          x: (Math.random() - 0.5) * 60,
          opacity: [1, 1, 0],
          scale: [0.5, 1, 0.2]
        }}
        transition={{ 
          duration: 1 + Math.random(), 
          repeat: Infinity,
          delay: Math.random() * 2
        }}
        style={{
          position: 'absolute',
          width: 3, height: 10,
          background: '#fff',
          boxShadow: '0 0 10px #fff, 0 0 20px var(--gold)',
          borderRadius: 2
        }}
      />
    ))}
  </div>
);

const LightBeams = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.1, 0.4, 0] }}
        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        style={{
          position: 'absolute',
          top: '-20%',
          left: `${15 + i * 15}%`,
          width: 80,
          height: '140%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
          transform: `rotate(${i % 2 === 0 ? 15 : -15}deg)`,
          filter: 'blur(30px)',
        }}
      />
    ))}
  </div>
);

const StadiumStage = () => (
  <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
    {/* Base Podium */}
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{
        width: 400, height: 60,
        background: 'linear-gradient(to bottom, #1a2a4a, #0a1020)',
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
        borderTop: '2px solid rgba(240,195,45,0.5)',
        boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(240,195,45,0.05) 10px, rgba(240,195,45,0.05) 20px)'
      }} />
      {/* Front lights */}
      <div style={{
        position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 4, background: 'var(--gold)',
        filter: 'blur(4px)', opacity: 0.6
      }} />
    </motion.div>
  </div>
);

const CeremonyFlames = ({ level }) => {
  const getFlameColor = (lvl) => {
    if (lvl <= 1) return null;
    if (lvl <= 4) return '#b45309'; // Bronze
    if (lvl <= 7) return '#cbd5e1'; // Silver
    return '#facc15';                // Gold
  };
  const color = getFlameColor(level);
  if (!color) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {[25, 75].map((pos, idx) => (
        <div key={pos} style={{ position: 'absolute', left: `${pos}%`, bottom: '5%', transform: 'translateX(-50%)' }}>
          {/* Sparks */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{ opacity: [0, 1, 0], y: -200 - Math.random() * 200, x: (Math.random() - 0.5) * 80 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              style={{
                position: 'absolute', width: 3, height: 3, background: '#fff',
                boxShadow: `0 0 10px ${color}`, borderRadius: '50%'
              }}
            />
          ))}
          {/* Main Sword Flame */}
          <motion.div
            style={{
              color: color,
              filter: `drop-shadow(0 0 30px ${color}) drop-shadow(0 0 60px ${color})`,
              transformOrigin: 'bottom center'
            }}
            animate={{ 
              scaleY: [1.2, 2.2, 1.5, 2.0, 1.2],
              scaleX: [0.8, 1.2, 0.9, 1.1, 0.8],
              opacity: [0.6, 1, 0.8, 1, 0.6],
              rotate: idx === 0 ? [-3, 3, -1, 4, -3] : [3, -3, 4, -1, 3]
            }}
            transition={{ repeat: Infinity, duration: 1.2 + idx * 0.2, ease: "easeInOut" }}
          >
            <svg width={100} height={400} viewBox="0 0 40 100" fill="currentColor">
              <path d="M20 0C20 0 40 40 35 70C30 100 0 100 5 70C0 40 20 0 20 0Z" />
              <path d="M20 15C20 15 32 50 30 75C28 95 12 95 10 75C8 50 20 15 20 15Z" fill="white" opacity="0.7" />
            </svg>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const Upgrade = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetCard, setTargetCard] = useState(null);
  const [materialCards, setMaterialCards] = useState([]);
  
  // Phase management: selection | suspense | result
  const [phase, setPhase] = useState('selection'); 
  const [result, setResult] = useState(null); 
  const [ceremonyStage, setCeremonyStage] = useState('normal'); // 'normal' | 'checking' | 'final'
  const skipRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [materialVisibleCount, setMaterialVisibleCount] = useState(20);

  const fetchCards = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/cards/user/${user.id}`);
      setCards(res.data);
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  // Space listener
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'suspense') {
          skipRef.current = true;
        } else if (phase === 'result') {
          closeResult();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  const calculateSuccessRate = () => {
    if (!targetCard || materialCards.length === 0) return 0;
    let totalChance = 0;
    const targetOvr = targetCard.template?.ovr || 0;
    
    materialCards.forEach(m => {
      const materialOvr = m.template?.ovr || 0;
      const diff = materialOvr - targetOvr;
      totalChance += 0.2 * Math.pow(1.5, diff);
    });
    
    return Math.min(1.0, totalChance);
  };

  const toggleMaterial = (card) => {
    if (card.id === targetCard?.id) {
      toast.error("Can't use the target card as material!");
      return;
    }
    if (materialCards.find(c => c.id === card.id)) {
      setMaterialCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      if (calculateSuccessRate() >= 1.0) {
        toast.error('Success chance is already maximized!');
        return;
      }
      if (materialCards.length >= 5) {
        toast.error('Maximum 5 upgrade materials allowed.');
        return;
      }
      setMaterialCards(prev => [...prev, card]);
    }
  };

  const sleep = (ms) => new Promise(resolve => {
    const timeout = setTimeout(resolve, ms);
    const check = setInterval(() => {
      if (skipRef.current) {
        clearTimeout(timeout);
        clearInterval(check);
        resolve();
      }
    }, 50);
  });

  const doUpgrade = async () => {
    if (!targetCard) return;
    skipRef.current = false;
    setPhase('suspense');
    
    // Start backend call immediately
    const upgradePromise = api.post(`/cards/upgrade?targetCardId=${targetCard.id}`, materialCards.map(c => c.id));
    
    // Wait for animation (or skip)
    await sleep(3000);

    try {
      const res = await upgradePromise;
      const data = res.data; // UpgradeResultDTO
      
      setResult(data);
      setPhase('result');
      setCeremonyStage('normal');
      fetchCards();

      // Orchestrate the ceremony if successful
      if (data.success) {
        // If there was a jump chance (same-player fodder used), show the suspenseful check
        if (data.hasJumpChance) {
          // Wait 2 seconds showing normal success
          await sleep(2000);
          
          // Show flickering purple for 2 seconds
          setCeremonyStage('checking');
          await sleep(2000);
          
          // Final reveal
          setCeremonyStage('final');
        } else {
          // No jump chance, just show final success immediately
          setCeremonyStage('final');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
      setPhase('selection');
    }
  };

  const closeResult = () => {
    setPhase('selection');
    setResult(null);
    setTargetCard(null);
    setMaterialCards([]);
  };

  const availableMaterials = cards.filter(c => c.id !== targetCard?.id);
  const currentTotalChance = calculateSuccessRate();
  const nextLevelSuccessProb = (currentTotalChance * (BASE_SUCCESS_RATES[targetCard?.upgradeLevel] || 0.1) * 100).toFixed(1);

  return (
    <div className="page">
      <AnimatePresence>
        {phase === 'suspense' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <motion.div
              animate={{ 
                x: [0, -2, 2, -2, 2, 0],
                rotate: [0, -1, 1, -1, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              style={{ position: 'relative' }}
            >
              <PlayerCard player={targetCard.template} size="large" upgradeLevel={targetCard.upgradeLevel} />
              <motion.div
                animate={{ opacity: [0, 0.8, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{
                  position: 'absolute', inset: -20, borderRadius: '50%',
                  background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)',
                  zIndex: -1
                }}
              />
            </motion.div>
            <h2 style={{ marginTop: 40, letterSpacing: 8, color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32 }}>
              UPGRADING...
            </h2>
            <div style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2 }}>
              PRESS <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>SPACE</kbd> TO SKIP
            </div>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 101, 
              background: result.success 
                ? 'radial-gradient(circle at center, #1a3a5a 0%, #060b1a 80%)'
                : 'radial-gradient(circle at center, #3a1a1a 0%, #060b1a 80%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {result.success && <LightBeams />}
            {result.success && <CeremonyFlames level={ceremonyStage === 'final' ? result.card.upgradeLevel : result.intermediateLevel} />}
            {result.success && <PyroFountain side="left" />}
            {result.success && <PyroFountain side="right" />}
            {result.success && <StadiumStage />}

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: 1200 }}>
              {result.success ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={{ marginBottom: 10 }}
                  >
                    <div style={{ 
                      display: 'inline-block', padding: '4px 24px', borderRadius: 4, 
                      background: result.criticalSuccess && ceremonyStage === 'final' ? '#a855f7' : 'var(--gold)', 
                      color: result.criticalSuccess && ceremonyStage === 'final' ? '#fff' : '#000', 
                      fontWeight: 900, 
                      fontSize: 32, marginBottom: 16, fontFamily: "'Bebas Neue', sans-serif",
                      boxShadow: result.criticalSuccess && ceremonyStage === 'final' ? '0 0 20px #a855f7' : 'none',
                      transition: 'all 0.5s ease'
                    }}>
                      +{ceremonyStage === 'final' ? result.card.upgradeLevel : result.intermediateLevel}
                    </div>
                    <h1 style={{ 
                      fontSize: ceremonyStage === 'final' && result.criticalSuccess ? 96 : 84, 
                      color: ceremonyStage === 'final' && result.criticalSuccess ? '#a855f7' : '#fff', 
                      margin: 0, 
                      fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4,
                      textShadow: ceremonyStage === 'final' && result.criticalSuccess 
                        ? '0 0 40px rgba(168,85,247,0.6)' 
                        : '0 0 30px rgba(255,255,255,0.3)',
                      transition: 'all 0.5s ease'
                    }}>
                      {ceremonyStage === 'checking' ? 'CHECKING CRITICAL JUMP...' : 
                       (ceremonyStage === 'final' && result.criticalSuccess ? 'CRITICAL JUMP!' : 'UPGRADE SUCCESSFUL')}
                    </h1>
                    <motion.p 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      style={{ fontSize: 32, color: ceremonyStage === 'final' && result.criticalSuccess ? '#d8b4fe' : 'var(--gold)', fontWeight: 800, margin: '8px 0', letterSpacing: 2 }}
                    >
                      {Math.floor(Math.random() * 900 + 100).toLocaleString()},000,000 BP
                    </motion.p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    style={{ position: 'relative', marginTop: 20, marginBottom: 60 }}
                  >
                    <PlayerCard 
                      player={result.card.template} 
                      size="large" 
                      upgradeLevel={ceremonyStage === 'final' ? result.card.upgradeLevel : result.intermediateLevel}
                      showPurpleAura={ceremonyStage === 'final' && result.criticalSuccess}
                      isFlickeringPurple={ceremonyStage === 'checking'}
                    />
                    {/* Atmospheric Glow behind card */}
                    <div style={{
                      position: 'absolute', inset: -100, borderRadius: '50%',
                      background: ceremonyStage === 'final' && result.criticalSuccess
                        ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(240,195,45,0.2) 0%, transparent 70%)',
                      zIndex: -1,
                      transition: 'all 1s ease'
                    }} />
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginBottom: 40 }}
                  >
                    <h1 style={{ 
                      fontSize: 100, color: '#ff4757', margin: 0, 
                      fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 6,
                      textShadow: '0 0 50px rgba(255,71,87,0.4)'
                    }}>
                      FAILED
                    </h1>
                    <p style={{ letterSpacing: 4, color: 'var(--text-muted)', fontWeight: 700, fontSize: 20 }}>
                      LEVEL DROPPED TO +{result.card.upgradeLevel}
                    </p>
                  </motion.div>
                  <div style={{ filter: 'grayscale(1) brightness(0.6)', transform: 'rotateX(20deg)' }}>
                    <PlayerCard player={result.card.template} size="large" upgradeLevel={result.card.upgradeLevel} />
                  </div>
                </>
              )}

              <button 
                className="btn btn-gold" 
                style={{ marginTop: 40, padding: '16px 64px', fontSize: 18 }}
                onClick={closeResult}
              >
                CONTINUE <kbd style={{ marginLeft: 16, opacity: 0.6, fontSize: 12 }}>SPACE</kbd>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-tag">Enhancement Lab</p>
          <h1 className="page-title">UPGRADE <span>PLAYER</span></h1>
          <p className="page-subtitle">Sacrifice material cards to boost your star players.</p>
        </motion.div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading your cards...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
          {/* Left: Target Card Selector */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>
              Step 1 — Select Target Card
            </div>
            <div className="glass" style={{ padding: 24, borderRadius: 20, minHeight: 400, overflowY: 'auto' }}>
              {!targetCard ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                    {cards.slice(0, visibleCount).map(c => (
                      <motion.div
                        key={c.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setTargetCard(c); setMaterialCards([]); }}
                      >
                        <PlayerCard player={c.template} size="small" upgradeLevel={c.upgradeLevel} />
                      </motion.div>
                    ))}
                  </div>
                  {cards.length > visibleCount && (
                    <button 
                      className="btn btn-glass btn-sm" 
                      style={{ width: '100%', marginTop: 20 }}
                      onClick={() => setVisibleCount(prev => prev + 20)}
                    >
                      SHOW MORE ({cards.length - visibleCount})
                    </button>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TARGET PLAYER</div>
                  <PlayerCard player={targetCard.template} size="large" upgradeLevel={targetCard.upgradeLevel} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>
                      {targetCard.template?.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Effective OVR: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{(targetCard.template?.ovr || 0) + getStatBonus(targetCard.upgradeLevel)}</span>
                    </div>
                    <button className="btn btn-glass btn-sm" onClick={() => { setTargetCard(null); setMaterialCards([]); }}>
                      SELECT OTHER PLAYER
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Material Cards + Upgrade Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>
                Step 2 — Select Material Cards ({materialCards.length}/5)
              </div>
              <div className="glass" style={{ padding: 24, borderRadius: 20, minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
                {!targetCard ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: 14 }}>
                    Select a target card first.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                      {availableMaterials.slice(0, materialVisibleCount).map(c => {
                        const isMaterial = materialCards.some(m => m.id === c.id);
                        return (
                          <motion.div
                            key={c.id}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggleMaterial(c)}
                            style={{
                              cursor: 'pointer',
                              position: 'relative',
                              opacity: isMaterial ? 1 : 0.6,
                              border: isMaterial ? '2px solid var(--gold)' : '2px solid transparent',
                              borderRadius: 12,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <PlayerCard player={c.template} size="small" upgradeLevel={c.upgradeLevel} />
                            {isMaterial && (
                              <div style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'var(--gold)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 800, color: '#000',
                              }}>✓</div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    {availableMaterials.length > materialVisibleCount && (
                      <button 
                        className="btn btn-glass btn-sm" 
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={() => setMaterialVisibleCount(prev => prev + 20)}
                      >
                        SHOW MORE ({availableMaterials.length - materialVisibleCount})
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Upgrade Summary */}
            {targetCard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: 24, borderRadius: 20, border: '1px solid rgba(240,195,45,0.2)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>UPGRADE SUCCESS PROBABILITY</div>
                    <SuccessMeter rate={currentTotalChance} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                       Calculated Chance: <span style={{ color: 'var(--gold)' }}>{nextLevelSuccessProb}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', paddingLeft: 24 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>IF SUCCESS</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#4ade80', lineHeight: 1 }}>
                      +{(targetCard.upgradeLevel || 1) + 1}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontStyle: 'italic' }}>
                   * If upgrade fails, the card level may decrease.
                </div>

                <button
                  className="btn btn-gold"
                  style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', padding: '14px' }}
                  onClick={doUpgrade}
                  disabled={materialCards.length === 0}
                >
                  <Zap size={18} />
                  CONFIRM UPGRADE
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upgrade;
