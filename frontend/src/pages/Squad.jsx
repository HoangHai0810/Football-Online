import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/PlayerCard';

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
  ],
  '4-1-2-1-2': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'CDM', left: '50%', top: '56%' },
    { slot: 6, pos: 'LM',  left: '18%', top: '44%' },
    { slot: 7, pos: 'RM',  left: '82%', top: '44%' },
    { slot: 8, pos: 'CAM', left: '50%', top: '32%' },
    { slot: 9, pos: 'ST',  left: '34%', top: '18%' },
    { slot: 10, pos: 'ST', left: '66%', top: '18%' },
  ],
  '4-3-2-1': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'CM',  left: '22%', top: '50%' },
    { slot: 6, pos: 'CM',  left: '50%', top: '53%' },
    { slot: 7, pos: 'CM',  left: '78%', top: '50%' },
    { slot: 8, pos: 'CAM', left: '32%', top: '32%' },
    { slot: 9, pos: 'CAM', left: '68%', top: '32%' },
    { slot: 10, pos: 'ST', left: '50%', top: '16%' },
  ],
  '5-3-2': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LWB', left: '12%', top: '62%' },
    { slot: 2, pos: 'CB',  left: '30%', top: '74%' },
    { slot: 3, pos: 'CB',  left: '50%', top: '76%' },
    { slot: 4, pos: 'CB',  left: '70%', top: '74%' },
    { slot: 5, pos: 'RWB', left: '88%', top: '62%' },
    { slot: 6, pos: 'CM',  left: '28%', top: '48%' },
    { slot: 7, pos: 'CDM', left: '50%', top: '52%' },
    { slot: 8, pos: 'CM',  left: '72%', top: '48%' },
    { slot: 9, pos: 'ST',  left: '34%', top: '22%' },
    { slot: 10, pos: 'ST', left: '66%', top: '22%' },
  ],
  '3-4-3': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'CB',  left: '22%', top: '70%' },
    { slot: 2, pos: 'CB',  left: '50%', top: '73%' },
    { slot: 3, pos: 'CB',  left: '78%', top: '70%' },
    { slot: 4, pos: 'LM',  left: '12%', top: '45%' },
    { slot: 5, pos: 'CM',  left: '34%', top: '50%' },
    { slot: 6, pos: 'CM',  left: '66%', top: '50%' },
    { slot: 7, pos: 'RM',  left: '88%', top: '45%' },
    { slot: 8, pos: 'LW',  left: '18%', top: '24%' },
    { slot: 9, pos: 'ST',  left: '50%', top: '18%' },
    { slot: 10, pos: 'RW', left: '82%', top: '24%' },
  ],
  '4-5-1': [
    { slot: 0, pos: 'GK',  left: '50%', top: '88%' },
    { slot: 1, pos: 'LB',  left: '12%', top: '68%' },
    { slot: 2, pos: 'CB',  left: '34%', top: '72%' },
    { slot: 3, pos: 'CB',  left: '66%', top: '72%' },
    { slot: 4, pos: 'RB',  left: '88%', top: '68%' },
    { slot: 5, pos: 'LM',  left: '12%', top: '44%' },
    { slot: 6, pos: 'CM',  left: '34%', top: '50%' },
    { slot: 7, pos: 'CM',  left: '50%', top: '46%' },
    { slot: 8, pos: 'CM',  left: '66%', top: '50%' },
    { slot: 9, pos: 'RM',  left: '88%', top: '44%' },
    { slot: 10, pos: 'ST', left: '50%', top: '20%' },
  ]
};

const SEASON_COLOR = {
  ICON: 'linear-gradient(135deg,#f5d020,#c8901a)',
  TOTY: 'linear-gradient(135deg,#4facfe,#1a3c9e)',
  LIVE: 'linear-gradient(135deg,#43e97b,#1a9e55)',
  BASE: 'linear-gradient(135deg,#667eea,#4a2080)',
};

const getStatBonus = (level) => {
  switch (level) {
    case 2: return 1;
    case 3: return 2;
    case 4: return 4;
    case 5: return 6;
    case 6: return 8;
    case 7: return 11;
    case 8: return 15;
    case 9: return 18;
    case 10: return 21;
    default: return 0;
  }
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
  
  // Calculate base OVR including upgrade bonus
  const bonus = getStatBonus(player.upgradeLevel || 1);
  const baseOvr = (player.effectiveOvr || player.template?.ovr || 0) + (player.effectiveOvr ? 0 : bonus);
  
  const natPos = player.template?.position;
  if (!natPos || !slotPos) return baseOvr;
  
  if (natPos === slotPos) return baseOvr;
  const natGroup = getPosGroup(natPos);
  const slotGroup = getPosGroup(slotPos);
  
  if (natGroup === slotGroup) return Math.max(1, baseOvr - 3); // minor penalty within same group
  if (natGroup === 'GK' || slotGroup === 'GK') return Math.max(1, baseOvr - 20); // big penalty for outfield as GK or vice versa
  return Math.max(1, baseOvr - 8); // wrong outfield group
};

const getUpgradeColor = (level) => {
  if (level === 1) return 'linear-gradient(135deg, #94a3b8, #475569)'; // Gray
  if (level <= 4) return 'linear-gradient(135deg, #b45309, #78350f)';  // Bronze
  if (level <= 7) return 'linear-gradient(135deg, #cbd5e1, #64748b)';  // Silver
  return 'linear-gradient(135deg, #facc15, #a16207)';                 // Gold
};

const PitchNode = ({ slotInfo, card, onDrop, onSelect, active, sourceSlot }) => {
  const player = card ? card.template : null;
  const effOvr = calculateEffectiveOvr(card, slotInfo.pos);
  const isPenalty = player && effOvr < (card.effectiveOvr || player.ovr || 0);

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
      <div
        draggable={!!card}
        onDragStart={e => {
          if (card) {
            e.dataTransfer.setData('cardId', card.id);
            e.dataTransfer.setData('sourceSlot', slotInfo.slot);
          }
        }}
        style={{ cursor: card ? 'grab' : 'default', display: 'inline-block' }}
      >
        {card ? (
          <PlayerCard 
            player={player} 
            size="mini" 
            upgradeLevel={card.upgradeLevel}
            isPenalty={isPenalty}
            effectiveOvrOverride={effOvr}
          />
        ) : (
          <div style={{
            width: 76, height: 106, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
            border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24
          }}>
             +
          </div>
        )}
      </div>
      
      {!card && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {slotInfo.pos}
          </div>
        </div>
      )}
      {card && player.position !== slotInfo.pos && (
        <div style={{ textAlign: 'center', marginTop: -4 }}>
          <div style={{ fontSize: 9, color: '#ff4757', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: 4 }}>
            {slotInfo.pos}
          </div>
        </div>
      )}
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
  const [benchVisibleCount, setBenchVisibleCount] = useState(20);
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('ovr');
  const [activeTab, setActiveTab] = useState('reserve'); // 'lineup' or 'reserve'

  useEffect(() => {
    if (user?.clubName) setClubName(user.clubName);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/cards/user/${user.id}`).catch(() => ({ data: [] })),
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
    const cardToDrop = cards.find(c => c.id === cardId);
    if (!cardToDrop) return;

    setLineup(prev => {
      // Check if this player name is already in another slot
      const duplicateSlot = Object.entries(prev).find(([slot, id]) => {
        if (Number(slot) === targetSlot) return false;
        if (sourceSlot !== null && Number(slot) === sourceSlot) return false;
        const c = cards.find(x => x.id === id);
        return c && c.template.name === cardToDrop.template.name;
      });

      if (duplicateSlot) {
        toast.error(`${cardToDrop.template.name} is already in the lineup!`);
        return prev;
      }

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

  const optimizeLineup = () => {
    const availableCards = [...cards];
    const newLineup = {};
    const unassignedSlots = [...FORMATIONS[currentFormation]];
    const usedPlayerNames = new Set();

    while (unassignedSlots.length > 0) {
      let bestMatch = null;

      // Global Greedy Search: Find the best card for any available slot
      unassignedSlots.forEach(slot => {
        availableCards.forEach(card => {
          if (!card || usedPlayerNames.has(card.template.name)) return;

          const effOvr = calculateEffectiveOvr(card, slot.pos);
          const isNatural = card.template.position === slot.pos;

          // Selection logic:
          // 1. Highest Effective OVR
          // 2. Natural Position (tie-breaker)
          // 3. Upgrade Level (tie-breaker)
          if (!bestMatch || 
              effOvr > bestMatch.effOvr || 
              (effOvr === bestMatch.effOvr && isNatural && !bestMatch.isNatural) ||
              (effOvr === bestMatch.effOvr && isNatural === bestMatch.isNatural && card.upgradeLevel > bestMatch.card.upgradeLevel)) {
            bestMatch = { slot, card, effOvr, isNatural };
          }
        });
      });

      if (bestMatch) {
        newLineup[bestMatch.slot.slot] = bestMatch.card.id;
        usedPlayerNames.add(bestMatch.card.template.name);
        
        // Mark as used
        const cIdx = availableCards.findIndex(c => c?.id === bestMatch.card.id);
        if (cIdx !== -1) availableCards[cIdx] = null;
        
        const sIdx = unassignedSlots.findIndex(s => s.slot === bestMatch.slot.slot);
        if (sIdx !== -1) unassignedSlots.splice(sIdx, 1);
      } else {
        break; // No more matches possible
      }
    }

    setLineup(newLineup);
    toast.success("Squad Optimized!");
  };

  return (
    <div className="page squad-page">
      <div className="squad-header" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
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
            <div 
              style={{ padding: '12px 20px', textAlign: 'center', position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowFormationMenu(!showFormationMenu)}
            >
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 4 }}>FORMATION</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {currentFormation}
                <span style={{ fontSize: 16 }}>▾</span>
              </div>
              
              {showFormationMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'rgba(15, 20, 35, 0.95)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  width: 160, zIndex: 100, overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                }}>
                  {Object.keys(FORMATIONS).map(f => (
                    <div 
                      key={f}
                      onClick={() => setCurrentFormation(f)}
                      style={{
                        padding: '12px 16px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                        color: f === currentFormation ? 'var(--gold)' : 'white',
                        background: f === currentFormation ? 'rgba(255,215,0,0.1)' : 'transparent',
                        textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { if(f !== currentFormation) e.currentTarget.style.color = 'var(--gold)'; }}
                      onMouseLeave={e => { if(f !== currentFormation) e.currentTarget.style.color = 'white'; }}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className="btn btn-gold" onClick={optimizeLineup} style={{ marginRight: 8 }}>
            ⚡ OPTIMIZE
          </button>
          <button className="btn btn-gold" onClick={saveLineup} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE LINEUP'}
          </button>
        </div>
      </div>

      <div className="squad-content" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div className="pitch-wrapper" style={{ flex: 1 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, gap: 16 }}>
              <button 
                onClick={() => setActiveTab('lineup')}
                style={{
                  background: 'transparent', border: 'none', color: activeTab === 'lineup' ? 'var(--gold)' : 'var(--text-muted)',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, cursor: 'pointer',
                  borderBottom: activeTab === 'lineup' ? '2px solid var(--gold)' : 'none',
                  paddingBottom: 4, transition: 'all 0.2s'
                }}
              >
                LINEUP ({Object.keys(lineup).length})
              </button>
              <button 
                onClick={() => setActiveTab('reserve')}
                style={{
                  background: 'transparent', border: 'none', color: activeTab === 'reserve' ? 'var(--gold)' : 'var(--text-muted)',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, cursor: 'pointer',
                  borderBottom: activeTab === 'reserve' ? '2px solid var(--gold)' : 'none',
                  paddingBottom: 4, transition: 'all 0.2s'
                }}
              >
                REGISTERED ({cards.length - Object.keys(lineup).length})
              </button>
            </div>
          </div>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search players..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bench-search-input"
            />
          </div>

          <div className="bench-sort-controls">
            <span className="sort-label">SORT BY</span>
            <div className="sort-tabs">
              <button 
                className={`sort-tab ${sortType === 'ovr' ? 'active' : ''}`}
                onClick={() => setSortType('ovr')}
              >
                OVR
              </button>
              <button 
                className={`sort-tab ${sortType === 'name' ? 'active' : ''}`}
                onClick={() => setSortType('name')}
              >
                NAME
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
          ) : (
            <>
              {cards
                .filter(c => {
                  const alreadyInLineup = Object.values(lineup).includes(c.id);
                  const isMatch = activeTab === 'lineup' ? alreadyInLineup : !alreadyInLineup;
                  const matchesSearch = c.template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     c.template.position.toLowerCase().includes(searchTerm.toLowerCase());
                  return isMatch && matchesSearch;
                })
                .sort((a, b) => {
                  if (sortType === 'ovr') {
                    const ovrA = a.effectiveOvr || a.template.ovr;
                    const ovrB = b.effectiveOvr || b.template.ovr;
                    if (ovrB !== ovrA) return ovrB - ovrA;
                    return a.template.name.localeCompare(b.template.name);
                  } else {
                    return a.template.name.localeCompare(b.template.name);
                  }
                })
                .slice(0, benchVisibleCount)
                .map(card => {
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
                      <div className="ovr-badge" style={{ background: bg, color: 'white', position: 'relative' }}>
                        {card.effectiveOvr || p.ovr}
                        {card.upgradeLevel > 0 && (
                          <span style={{ position: 'absolute', top: -4, right: -12, fontSize: 8, background: 'var(--gold)', color: '#000', padding: '0 3px', fontWeight: 900, borderRadius: 2 }}>
                            +{card.upgradeLevel}
                          </span>
                        )}
                      </div>
                      <div className="player-info">
                        <div className="player-name">
                          {p.name}
                        </div>
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
                })}
              
              {cards.filter(c => {
                const alreadyInLineup = Object.values(lineup).includes(c.id);
                return activeTab === 'lineup' ? alreadyInLineup : !alreadyInLineup;
              }).length > benchVisibleCount && (
                <button 
                  className="btn btn-glass btn-sm" 
                  style={{ marginTop: 8, width: '100%', fontSize: 11 }}
                  onClick={() => setBenchVisibleCount(prev => prev + 20)}
                >
                  SHOW MORE ({cards.filter(c => {
                    const alreadyInLineup = Object.values(lineup).includes(c.id);
                    return activeTab === 'lineup' ? alreadyInLineup : !alreadyInLineup;
                  }).length - benchVisibleCount})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Squad;
