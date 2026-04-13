import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, TrendingUp, TrendingDown, Coins, Star, ChevronRight } from 'lucide-react';

const SeasonSummaryModal = ({ isOpen, summary, onConfirm }) => {
  if (!isOpen || !summary) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" style={{ 
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', 
        backdropFilter: 'blur(20px)', zIndex: 10000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 
      }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="glass"
          style={{ 
            maxWidth: 800, width: '100%', borderRadius: 32, overflow: 'hidden',
            border: '1px solid rgba(240, 195, 45, 0.3)',
            boxShadow: '0 0 100px rgba(240, 195, 45, 0.15)'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '60px 40px 40px', textAlign: 'center',
            background: 'radial-gradient(circle at center, rgba(240, 195, 45, 0.1), transparent)'
          }}>
            <motion.div 
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              style={{ marginBottom: 24 }}
            >
              <Trophy size={100} color="var(--gold)" />
            </motion.div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: 'white', letterSpacing: 4, lineHeight: 1 }}>
              SEASON {summary.season} <span style={{ color: 'var(--gold)' }}>WRAPPED</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 12 }}>Congratulations on completing the season, Manager!</p>
          </div>

          {/* Results Grid */}
          <div style={{ padding: '0 40px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {summary.results.map((res, i) => (
                <div key={i} className="glass" style={{ padding: 24, borderRadius: 20, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{res.type}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'white', marginBottom: 4 }}>{res.name}</div>
                  <div style={{ 
                    fontSize: 48, fontWeight: 900, 
                    color: res.rank === 1 ? 'var(--gold)' : (res.rank <= 4 ? '#4fcaff' : 'white')
                  }}>
                    #{res.rank}
                  </div>
                </div>
              ))}
            </div>

            {/* Reward Summary (Simulated for UI) */}
            <div style={{ 
              marginTop: 32, padding: 32, borderRadius: 24, 
              background: 'rgba(240, 195, 45, 0.05)', border: '1px dashed rgba(240, 195, 45, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40
            }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--gold)', marginBottom: 4 }}>
                    <Award size={20} />
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>STATUS</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>PROMOTED</div>
               </div>
               <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
               <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--gold)', marginBottom: 4 }}>
                    <Coins size={20} />
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>REWARDS</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>MAX REWARDS</div>
               </div>
            </div>

            <button 
              className="btn btn-gold btn-lg" 
              onClick={onConfirm}
              style={{ width: '100%', height: 72, marginTop: 40, fontSize: 24 }}
            >
              START NEXT SEASON <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SeasonSummaryModal;
