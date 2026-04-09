import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowUp, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/PlayerCard';
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

const Upgrade = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetCard, setTargetCard] = useState(null);
  const [materialCards, setMaterialCards] = useState([]);
  
  // Phase management: selection | suspense | result
  const [phase, setPhase] = useState('selection'); 
  const [result, setResult] = useState(null); // { success: boolean, newLevel: number, oldLevel: number }
  const skipRef = useRef(false);

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
        toast.error('Tỉ lệ thành công đã đạt tối đa!');
        return;
      }
      if (materialCards.length >= 5) {
        toast.error('Tối đa 5 phôi nâng cấp.');
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
      const updatedCard = res.data;
      const isSuccess = updatedCard.upgradeLevel > targetCard.upgradeLevel;
      
      setResult({
        success: isSuccess,
        newLevel: updatedCard.upgradeLevel,
        oldLevel: targetCard.upgradeLevel,
        card: updatedCard
      });
      setPhase('result');
      fetchCards();
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
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 101, background: 'rgba(10,15,30,0.98)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}
          >
            {result.success ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', marginBottom: 30 }}
                >
                  <h1 style={{ fontSize: 80, color: 'var(--gold)', marginBottom: 0, lineHeight: 1 }}>SUCCESS!</h1>
                  <p style={{ letterSpacing: 4, color: '#4ade80', fontWeight: 700 }}>LEVEL UP TO +{result.newLevel}</p>
                </motion.div>
                <div style={{ position: 'relative' }}>
                  <PlayerCard player={result.card.template} size="large" upgradeLevel={result.newLevel} />
                  {/* Confetti effect placeholder */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600 }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: 10, height: 10, background: ['#f0c32d', '#4ade80', '#fff'][i%3],
                        borderRadius: i%2 === 0 ? '50%' : '0'
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', marginBottom: 30 }}
                >
                  <h1 style={{ fontSize: 80, color: '#ff4757', marginBottom: 0, lineHeight: 1 }}>FAILED</h1>
                  <p style={{ letterSpacing: 4, color: 'var(--text-muted)', fontWeight: 700 }}>LEVEL DROPPED TO +{result.newLevel}</p>
                </motion.div>
                <div style={{ filter: 'grayscale(1) brightness(0.7)' }}>
                  <PlayerCard player={result.card.template} size="large" upgradeLevel={result.newLevel} />
                </div>
              </>
            )}

            <button 
              className="btn btn-glass" 
              style={{ marginTop: 60, padding: '12px 48px' }}
              onClick={closeResult}
            >
              CONTINUE <kbd style={{ marginLeft: 12, opacity: 0.5, fontSize: 10 }}>SPACE</kbd>
            </button>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                  {cards.map(c => (
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
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TARGET PLAYER</div>
                  <PlayerCard player={targetCard.template} size="large" upgradeLevel={targetCard.upgradeLevel} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>
                      {targetCard.template?.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Effective OVR: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{(targetCard.template?.ovr || 0) + (targetCard.upgradeLevel || 0)}</span>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {availableMaterials.map(c => {
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
                      +{(targetCard.upgradeLevel || 0) + 1}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontStyle: 'italic' }}>
                   * Nếu thất bại, cấp bậc thẻ có thể bị giảm.
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
