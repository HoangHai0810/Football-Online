import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Coins, Trophy, Zap, Star, Package } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MissionIcon = ({ type }) => {
  switch (type) {
    case 'OPEN_PACK': return <Package className="text-blue-400" />;
    case 'WIN_MATCH': return <Trophy className="text-gold" />;
    case 'UPGRADE_PLAYER': return <Zap className="text-purple-400" />;
    case 'COLLECT_PLAYER': return <Star className="text-amber-400" />;
    default: return <CheckCircle2 className="text-green-400" />;
  }
};

const Quests = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [rerolling, setRerolling] = useState(null);
  const { user, setUser } = useAuth();

  const fetchMissions = async () => {
    try {
      const res = await api.get('/missions');
      setMissions(res.data);
    } catch (err) {
      console.error("Failed to fetch missions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const claimReward = async (id, m) => {
    setClaiming(id);
    try {
      const res = await api.post(`/missions/${id}/claim`);
      const results = res.data.results;
      
      // Update local coins
      const coinsWon = results.rewardCoins || 0;
      setUser(prev => ({ ...prev, coins: prev.coins + coinsWon }));
      
      // Detailed feedback
      let msg = `Claimed ${coinsWon.toLocaleString()} Coins!`;
      if (results.luckyBp) {
        msg = `BOOM! Lucky BP: +${results.luckyBp.toLocaleString()}! Total: ${coinsWon.toLocaleString()} Coins.`;
      }
      
      if (results.rewardPackId) {
        const packName = results.rewardPackId.replace('_', ' ').toUpperCase();
        toast.success(msg, { duration: 4000 });
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24 }}>🧰</div>
            <div>
              <div style={{ fontWeight: 700 }}>PACK RECEIVED!</div>
              <div style={{ fontSize: 12, color: '#666' }}>1x {packName} PACK sent to Inventory.</div>
            </div>
          </div>
        ), { duration: 5000, icon: '📦' });
      } else {
        toast.success(msg);
      }
      
      fetchMissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim reward");
    } finally {
      setClaiming(null);
    }
  };

  const rerollMission = async (id) => {
    if (user.coins < 200) {
      toast.error("Not enough coins to reroll!");
      return;
    }
    setRerolling(id);
    try {
      await api.post(`/missions/${id}/reroll`);
      setUser(prev => ({ ...prev, coins: prev.coins - 200 }));
      toast.success("Mission refreshed for 200 Coins!");
      fetchMissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reroll mission");
    } finally {
      setRerolling(null);
    }
  };

  if (loading) return <div className="page center">Loading quests...</div>;

  return (
    <div className="page">
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-tag">Daily Challenges</p>
          <h1 className="page-title">ARENA <span>QUESTS</span></h1>
          <p className="page-subtitle">Complete tasks to earn coins and build your dream squad.</p>
        </motion.div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: 24 
      }}>
        {missions.map((m, i) => {
          const progress = (m.currentAmount / m.mission.targetAmount) * 100;
          const isReady = m.completed && !m.claimed;
          
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`quest-card ${m.claimed ? 'claimed' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isReady ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20,
                padding: 24,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isReady && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: 4,
                  background: 'var(--gold)',
                  boxShadow: '0 0 15px var(--gold)'
                }} />
              )}

              {/* Top-Right Corner Reroll Pill */}
              {!isReady && !m.claimed && (
                <button 
                  onClick={() => rerollMission(m.id)}
                  disabled={rerolling === m.id}
                  className="btn btn-glass"
                  title="Reroll Mission"
                  style={{
                    position: 'absolute',
                    top: 16, right: 16,
                    padding: '4px 8px',
                    fontSize: 11,
                    display: 'flex', gap: 4, alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted)',
                    borderRadius: 12,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <span style={{ fontSize: 10 }}>🔄</span>
                  {rerolling === m.id ? '...' : <span>- <Coins size={9} style={{display: 'inline', verticalAlign: 'middle'}}/> 200</span>}
                </button>
              )}

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 56, height: 56, 
                  borderRadius: 16, 
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MissionIcon type={m.mission.type} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 8, color: m.claimed ? 'var(--text-muted)' : 'white', paddingRight: 56 }}>
                    {m.mission.description}
                  </h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    {/* Standard Coins or Lucky BP */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Coins size={16} color="var(--gold)" />
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
                        {m.mission.rewardLuckyBp ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            LUCKY BP <Zap size={12} fill="var(--gold)" />
                          </span>
                        ) : (
                          m.mission.rewardCoins.toLocaleString()
                        )}
                      </div>
                    </div>

                    {/* Player Pack Reward */}
                    {m.mission.rewardPackId && (
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 6, 
                        background: 'rgba(52, 152, 219, 0.15)', 
                        padding: '2px 8px', borderRadius: 6,
                        border: '1px solid rgba(52, 152, 219, 0.3)'
                      }}>
                        <Package size={14} color="#3498db" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#3498db', textTransform: 'uppercase' }}>
                          {m.mission.rewardPackId.replace('_', ' ')} PACK
                        </span>
                      </div>
                    )}

                    {!m.claimed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                        <Clock size={12} />
                        3h
                      </div>
                    )}
                  </div>

                  {!m.claimed ? (
                    <>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          style={{ height: '100%', background: isReady ? 'var(--gold)' : 'var(--blue)', borderRadius: 3 }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Progress</span>
                        <span>{m.currentAmount} / {m.mission.targetAmount}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 14 }}>
                      <CheckCircle2 size={16} /> COMPLETED & CLAIMED
                    </div>
                  )}
                </div>
              </div>

              {isReady && (
                <button 
                  className="btn btn-gold btn-sm" 
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => claimReward(m.id, m)}
                  disabled={claiming === m.id}
                >
                  {claiming === m.id ? 'CLAIMING...' : 'CLAIM REWARD'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Quests;
