import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Zap, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOURNAMENTS = [
  { id: 'amateur', name: 'AMATEUR CUP', ovr: 75, reward: 5000, color: '#43e97b', icon: Shield },
  { id: 'pro', name: 'PRO LEAGUE', ovr: 88, reward: 15000, color: 'var(--blue)', icon: Zap },
  { id: 'world', name: 'WORLD CHAMPIONS', ovr: 105, reward: 50000, color: 'var(--gold)', icon: Trophy },
];

const Tournaments = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p className="section-tag">Global Events</p>
        <h1 className="page-title">WORLD <span>TOURNAMENTS</span></h1>
        <p className="page-subtitle">Climb the brackets and prove your tactical superiority.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {TOURNAMENTS.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass hover-lift"
              style={{
                borderRadius: 24,
                padding: 32,
                border: `1px solid ${t.color}33`,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => navigate('/solo')}
            >
              <div style={{
                position: 'absolute',
                top: -20, right: -20,
                opacity: 0.1
              }}>
                <Icon size={120} color={t.color} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 64, height: 64, 
                  borderRadius: 16, 
                  background: `${t.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${t.color}33`
                }}>
                  <Icon size={32} color={t.color} />
                </div>
                {t.id === 'world' && <span className="badge badge-gold">ELITE</span>}
              </div>

              <div>
                <h3 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, marginBottom: 8 }}>
                  {t.name}
                </h3>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>TEAM OVR: <span style={{ color: 'white' }}>{t.ovr}+</span></div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROUNDS: <span style={{ color: 'white' }}>4</span></div>
                </div>
              </div>

              <div style={{ 
                marginTop: 12, padding: '16px 20px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Grand Prize</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontWeight: 700 }}>
                  ₡ {t.reward.toLocaleString()}
                </div>
              </div>

              <button className="btn btn-glass" style={{ width: '100%', borderColor: `${t.color}33` }}>
                ENTER TOURNAMENT <ChevronRight size={16} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 40, padding: 24, background: 'rgba(240,195,45,0.05)', borderRadius: 16, border: '1px dashed rgba(240,195,45,0.3)', textAlign: 'center' }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
          <Lock size={14} /> MORE TOURNAMENTS UNLOCK AT PLAYER LEVEL 10
        </p>
      </div>
    </div>
  );
};

export default Tournaments;
