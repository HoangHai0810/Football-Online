import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowUp, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/PlayerCard';
import toast from 'react-hot-toast';

const BASE_SUCCESS_RATES = {
  1: 1.0, 2: 0.81, 3: 0.64, 4: 0.50, 5: 0.26, 6: 0.15, 7: 0.07, 8: 0.04, 9: 0.02
};

const SuccessMeter = ({ rate }) => {
  // rate is 0.0 to 1.0 (representing the totalChance in backend before level multiplier)
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
  const [upgrading, setUpgrading] = useState(false);

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

  const toggleMaterial = (card) => {
    if (card.id === targetCard?.id) {
      toast.error("Can't use the target card as material!");
      return;
    }
    if (materialCards.find(c => c.id === card.id)) {
      setMaterialCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      if (materialCards.length >= 5) {
        toast.error('Maximum 5 material cards allowed.');
        return;
      }
      setMaterialCards(prev => [...prev, card]);
    }
  };

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

  const doUpgrade = async () => {
    if (!targetCard) { toast.error('Select a target card first!'); return; }
    if (materialCards.length === 0) { toast.error('Select at least 1 material card!'); return; }
    setUpgrading(true);
    try {
      await api.post(`/cards/upgrade?targetCardId=${targetCard.id}`, materialCards.map(c => c.id));
      toast.success(`${targetCard.template?.name || 'Card'} upgraded successfully!`);
      setTargetCard(null);
      setMaterialCards([]);
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const availableMaterials = cards.filter(c => c.id !== targetCard?.id);
  const currentTotalChance = calculateSuccessRate();
  const nextLevelSuccessProb = (currentTotalChance * (BASE_SUCCESS_RATES[targetCard?.upgradeLevel] || 0.1) * 100).toFixed(1);

  return (
    <div className="page">
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
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

                <button
                  className="btn btn-gold"
                  style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', padding: '14px' }}
                  onClick={doUpgrade}
                  disabled={upgrading || materialCards.length === 0}
                >
                  <Zap size={18} />
                  {upgrading ? 'UPGRADING...' : 'CONFIRM UPGRADE'}
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
