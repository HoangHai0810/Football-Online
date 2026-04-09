import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Coins, Trophy, Zap, Star, Package, RefreshCw } from 'lucide-react';
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
  const [swapping, setSwapping] = useState(null);
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

  const claimReward = async (id) => {
    setClaiming(id);
    try {
      await api.post(`/missions/${id}/claim`);
      const missionObj = missions.find(x => x.id === id);
      setUser(prev => ({ ...prev, coins: prev.coins + (missionObj?.mission?.rewardCoins || 0) }));
      toast.success("Reward claimed!");
      fetchMissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim reward");
    } finally {
      setClaiming(null);
    }
  };

  const swapMission = async (id) => {
    if (user.coins < 200) {
      toast.error("Not enough coins to swap mission!");
      return;
    }
    setSwapping(id);
    try {
      await api.post(`/missions/${id}/swap`);
      setUser(prev => ({ ...prev, coins: prev.coins - 200 }));
      toast.success("Mission swapped successfully!");
      fetchMissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to swap mission");
    } finally {
      setSwapping(null);
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: 18, marginBottom: 8, color: m.claimed ? 'var(--text-muted)' : 'white' }}>
                      {m.mission.description}
                    </h3>
                    {!m.completed && !m.claimed && (
                      <button 
                        onClick={() => swapMission(m.id)}
                        disabled={swapping === m.id}
                        title="Swap Mission (200 Coins)"
                        style={{ 
                          background: 'none', border: 'none', 
                          color: 'var(--text-muted)', cursor: 'pointer', 
                          padding: 4, display: 'flex', alignItems: 'center' 
                        }}
                      >
                         <RefreshCw size={18} className={swapping === m.id ? 'animate-spin cursor-not-allowed' : 'hover-spin'} />
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontSize: 14, fontWeight: 600 }}>
                      <Coins size={14} />
                      {m.mission.rewardCoins.toLocaleString()}
                    </div>
                    {!m.claimed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                        <Clock size={12} />
                        Resets in 3h
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
                  onClick={() => claimReward(m.id)}
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
