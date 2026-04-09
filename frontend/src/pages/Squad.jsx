import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const FORMATIONS = {
  '4-3-3': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'CM',  left: '22%', top: '48%' },
    { slot: 6, pos: 'CDM', left: '50%', top: '53%' },
    { slot: 7, pos: 'CM',  left: '78%', top: '48%' },
    { slot: 8, pos: 'LW',  left: '16%', top: '24%' },
    { slot: 9, pos: 'ST',  left: '50%', top: '18%' },
    { slot: 10, pos: 'RW', left: '84%', top: '24%' },
  ],
  '4-4-2': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'LM',  left: '16%', top: '45%' },
    { slot: 6, pos: 'CM',  left: '34%', top: '50%' },
    { slot: 7, pos: 'CM',  left: '66%', top: '50%' },
    { slot: 8, pos: 'RM',  left: '84%', top: '45%' },
    { slot: 9, pos: 'ST',  left: '34%', top: '20%' },
    { slot: 10, pos: 'ST', left: '66%', top: '20%' },
  ],
  '4-2-3-1': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'CDM', left: '34%', top: '53%' },
    { slot: 6, pos: 'CDM', left: '66%', top: '53%' },
    { slot: 7, pos: 'CAM', left: '50%', top: '35%' },
    { slot: 8, pos: 'LM',  left: '16%', top: '38%' },
    { slot: 9, pos: 'RM',  left: '84%', top: '38%' },
    { slot: 10, pos: 'ST', left: '50%', top: '18%' },
  ],
  '3-5-2': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'CB',  left: '22%', top: '70%' },
    { slot: 2, pos: 'CB',  left: '50%', top: '73%' },
    { slot: 3, pos: 'CB',  left: '78%', top: '70%' },
    { slot: 4, pos: 'LWB', left: '10%', top: '50%' },
    { slot: 5, pos: 'CDM', left: '34%', top: '56%' },
    { slot: 6, pos: 'CDM', left: '66%', top: '56%' },
    { slot: 7, pos: 'RWB', left: '90%', top: '50%' },
    { slot: 8, pos: 'CAM', left: '50%', top: '40%' },
    { slot: 9, pos: 'ST',  left: '34%', top: '20%' },
    { slot: 10, pos: 'ST', left: '66%', top: '20%' },
  ]
};

const SEASON_COLOR = {
  ICON: 'linear-gradient(135deg,#f5d020,#c8901a)',
  TOTY: 'linear-gradient(135deg,#4facfe,#1a3c9e)',
  LIVE: 'linear-gradient(135deg,#43e97b,#1a9e55)',
  BASE: 'linear-gradient(135deg,#667eea,#4a2080)',
};

// Simplified positional groups to assess penalties
const getPosGroup = (pos) => {
  if (pos === 'GK') return 'GK';
  if (['CB','LB','RB','LWB','RWB'].includes(pos)) return 'DEF';
  if (['CDM','CM','CAM','LM','RM'].includes(pos)) return 'MID';
  return 'FWD';
};

const calculateEffectiveOvr = (player, slotPos) => {
  if (!player) return 0;
  const baseOvr = player.effectiveOvr || player.template?.ovr || 0;
  const natPos = player.template?.position;
  if (!natPos || !slotPos) return baseOvr;
  
  if (natPos === slotPos) return baseOvr;
  const natGroup = getPosGroup(natPos);
  const slotGroup = getPosGroup(slotPos);
  
  if (natGroup === slotGroup) return Math.max(1, baseOvr - 3); // minor penalty within same group
  if (natGroup === 'GK' || slotGroup === 'GK') return Math.max(1, baseOvr - 20); // big penalty for outfield as GK or vice versa
  return Math.max(1, baseOvr - 8); // wrong outfield group
};

const PitchNode = ({ card, slotInfo, onDrop, onDragStart }) => {
  const player = card ? card.template : null;
  const initials = player ? player.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '+';
  const bg = player ? (SEASON_COLOR[player.season] || SEASON_COLOR.BASE) : 'rgba(255,255,255,0.08)';
  const effOvr = calculateEffectiveOvr(card, slotInfo.pos);
  const isPenalty = player && effOvr < (card.effectiveOvr || player.ovr);

  return (
    <div
      style={{
        position: 'absolute', left: slotInfo.left, top: slotInfo.top,
        transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2,
      }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={e => {
        e.preventDefault();
        const draggedCardId = Number(e.dataTransfer.getData('cardId'));
        const sourceSlot = e.dataTransfer.getData('sourceSlot');
        onDrop(draggedCardId, slotInfo.slot, sourceSlot ? Number(sourceSlot) : null);
      }}
    >
      <motion.div
        draggable={!!card}
        onDragStart={e => {
          if (card) {
            e.dataTransfer.setData('cardId', card.id);
            e.dataTransfer.setData('sourceSlot', slotInfo.slot);
          }
        }}
        whileHover={{ scale: 1.15 }}
        style={{
          width: 52, height: 52, borderRadius: '50%', background: bg,
          border: player ? (isPenalty ? '2px solid rgba(255,50,50,0.8)' : '2px solid rgba(255,255,255,0.5)') : '2px dashed rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif",
          fontSize: player ? 18 : 24, color: 'white', boxShadow: player ? '0 4px 16px rgba(0,0,0,0.5)' : 'none', position: 'relative', cursor: card ? 'grab' : 'default'
        }}
      >
        {initials}
        {player && (
          <div style={{
            position: 'absolute', bottom: -3, right: -4, background: isPenalty ? '#ff4757' : 'var(--gold)',
            color: isPenalty ? '#fff' : '#0a0f1e', fontSize: 10, fontWeight: 900, padding: '1px 5px', borderRadius: 4, fontFamily: 'Outfit, sans-serif',
          }}>
            {effOvr}
          </div>
        )}
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: isPenalty ? '#ff4757' : 'white', textShadow: '0 1px 4px rgba(0,0,0,0.9)', maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player ? player.name.split(' ').pop() : slotInfo.pos}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          {slotInfo.pos}
        </div>
      </div>
    </div>
  );
};

const Squad = () => {
  const { user, setUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [lineup, setLineup] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentFormation, setCurrentFormation] = useState('4-3-3');
  const [clubName, setClubName] = useState('');
  const [editingClub, setEditingClub] = useState(false);

  useEffect(() => {
    if (user?.clubName) setClubName(user.clubName);
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get('/cards/user/1').catch(() => ({ data: [] })), // Hack fallback, actual API should use /cards/me or ignore the /1 if controller uses token
      api.get('/squad').catch(() => ({ data: {} }))
    ]).then(([cardsRes, squadRes]) => {
      setCards(cardsRes.data);
      if (squadRes.data && typeof squadRes.data === 'object' && Object.keys(squadRes.data).length > 0) {
        if (squadRes.data.lineupJson && typeof squadRes.data.lineupJson === 'string') {
           setLineup(JSON.parse(squadRes.data.lineupJson));
        } else {
           setLineup(squadRes.data.lineupJson || squadRes.data);
        }
        if (squadRes.data.formation) {
           setCurrentFormation(squadRes.data.formation);
        }
      } else {
        // Auto-fill if no lineup saved
        const initial = {};
        cardsRes.data.slice(0, 11).forEach((c, i) => initial[i] = c.id);
        setLineup(initial);
      }
      setLoading(false);
    });
  }, []);

  const handleDrop = (cardId, targetSlot, sourceSlot) => {
    setLineup(prev => {
      const next = { ...prev };
      // If dropping to an occupied slot, swap them
      const existingCardId = next[targetSlot];
      next[targetSlot] = cardId;
      
      if (sourceSlot !== null) {
        if (existingCardId) {
          next[sourceSlot] = existingCardId;
        } else {
          delete next[sourceSlot];
        }
      } else {
        // Dropped from bench, ensure we remove it from any other slot first
        Object.keys(next).forEach(k => {
          if (k != targetSlot && next[k] === cardId) delete next[k];
        });
      }
      return next;
    });
  };

  const saveLineup = () => {
    setSaving(true);
    api.post('/squad', { lineupJson: JSON.stringify(lineup), formation: currentFormation })
      .then(() => toast.success("Lineup saved successfully!"))
      .catch(() => toast.error("Failed to save lineup"))
      .finally(() => setSaving(false));
  };

  const saveClubName = async () => {
    if (!clubName.trim()) return;
    try {
      await api.patch('/users/club', { clubName });
      setUser(prev => ({ ...prev, clubName: clubName.trim().toUpperCase() }));
      setClubName(clubName.trim().toUpperCase());
      toast.success('Club name updated!');
    } catch (err) {
      toast.error('Failed to update club name');
    } finally {
      setEditingClub(false);
    }
  };

  const getCardForSlot = (slot) => {
    const cardId = lineup[slot];
    return cards.find(c => c.id === cardId) || null;
  };

  const calculateTeamOvr = () => {
    let sum = 0;
    let count = 0;
    FORMATIONS[currentFormation].forEach(slot => {
      const card = getCardForSlot(slot.slot);
      if (card) {
        sum += calculateEffectiveOvr(card, slot.pos);
        count++;
      }
    });
    return count > 0 ? Math.round(sum / 11) : 0; // Average of 11, penalized if missing players
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          {editingClub ? (
            <input
              autoFocus
              value={clubName}
              onChange={e => setClubName(e.target.value.toUpperCase())}
              onBlur={saveClubName}
              onKeyDown={e => e.key === 'Enter' && saveClubName()}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 38,
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--gold)',
                color: 'var(--gold)',
                outline: 'none',
                width: 340,
                letterSpacing: 2,
              }}
            />
          ) : (
            <h1
              className="page-title"
              onClick={() => setEditingClub(true)}
              title="Click to rename your club"
              style={{ cursor: 'pointer' }}
            >
              {clubName || 'MY'} <span>SQUAD</span> <span style={{ fontSize: 18, opacity: 0.4, verticalAlign: 'middle' }}>✏️</span>
            </h1>
          )}
          <p className="page-subtitle">Organize your 11 starters. Drag to swap positions.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="glass" style={{ display: 'flex', padding: '0 4px' }}>
            <div style={{ padding: '12px 20px', borderRight: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>TEAM OVR</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'var(--gold)' }}>{calculateTeamOvr()}</div>
            </div>
            <div style={{ padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>FORMATION</div>
              <select 
                value={currentFormation} 
                onChange={e => setCurrentFormation(e.target.value)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'white', 
                  fontFamily: "'Bebas Neue', sans-serif", 
                  fontSize: 28,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(FORMATIONS).map(f => (
                  <option key={f} value={f} style={{ color: 'black' }}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-gold" onClick={saveLineup} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE LINEUP'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="pitch-container">
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }} viewBox="0 0 400 580">
              <rect x="20" y="20" width="360" height="540" fill="none" stroke="white" strokeWidth="2" />
              <line x1="20" y1="290" x2="380" y2="290" stroke="white" strokeWidth="1.5" />
              <circle cx="200" cy="290" r="50" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="200" cy="290" r="3" fill="white" />
              <rect x="100" y="20" width="200" height="90" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="100" y="470" width="200" height="90" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="150" y="20" width="100" height="35" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="150" y="525" width="100" height="35" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="200" cy="95" r="3" fill="white" />
              <circle cx="200" cy="485" r="3" fill="white" />
              <path d="M 155 110 A 50 50 0 0 0 245 110" fill="none" stroke="white" strokeWidth="1.5" />
              <path d="M 155 470 A 50 50 0 0 1 245 470" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
            {FORMATIONS[currentFormation].map(slot => (
              <PitchNode
                key={slot.slot}
                slotInfo={slot}
                card={getCardForSlot(slot.slot)}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        <div className="glass-dark" style={{ width: 340, maxHeight: 580, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            ALL CARDS <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({cards.length})</span>
          </h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
          ) : (
            cards.filter(c => !Object.values(lineup).includes(c.id)).map(card => {
              const p = card.template;
              const bg = SEASON_COLOR[p.season] || SEASON_COLOR.BASE;
              return (
                <motion.div
                  key={card.id}
                  className="player-list-item"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('cardId', card.id)}
                  whileHover={{ x: 4 }}
                  style={{ cursor: 'grab' }}
                >
                  <div className="ovr-badge" style={{ background: bg, color: 'white' }}>
                    {card.effectiveOvr || p.ovr}
                  </div>
                  <div className="player-info">
                    <div className="player-name">{p.name}</div>
                    <div className="player-meta">
                      {p.position} · {p.season}
                      {card.upgradeLevel > 1 && <span style={{ color: 'var(--gold)', marginLeft: 6 }}>+{card.upgradeLevel}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge badge-${p.season === 'ICON' ? 'gold' : 'blue'}`}>{p.season}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Squad;
