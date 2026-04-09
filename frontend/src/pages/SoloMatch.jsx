import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sword, Users, Zap, Timer, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SoloMatch = () => {
  const [matchState, setMatchState] = useState('lobby'); // lobby | playing | finished
  const [result, setResult] = useState(null);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [visibleCommentary, setVisibleCommentary] = useState([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const { user } = useAuth();
  const [teamName, setTeamName] = useState(user?.clubName || user?.username || 'YOUR TEAM');
  
  useEffect(() => {
    if (user?.clubName) setTeamName(user.clubName);
    else if (user?.username) setTeamName(user.username);
  }, [user]);

  const commentaryEndRef = useRef(null);

  // Mock bot teams
  const botTeam = { name: "LEGENDARY BOTS", ovr: 92 };
  const userTeamOvr = 88; // This should ideally come from Squad calc

  const startSimulation = async () => {
    setMatchState('playing');
    setCurrentMinute(0);
    setVisibleCommentary([]);
    setHomeScore(0);
    setAwayScore(0);

    try {
      const res = await api.post('/gameplay/solo-match', {
        homeName: teamName || "YOUR TEAM",
        homeOvr: userTeamOvr,
        awayName: botTeam.name,
        awayOvr: botTeam.ovr
      });
      setResult(res.data);
      
      // Start the "clock"
      simulateClock(res.data);
    } catch (err) {
      console.error(err);
      setMatchState('lobby');
    }
  };

  const simulateClock = (data) => {
    let min = 0;
    const interval = setInterval(() => {
      min += 1;
      setCurrentMinute(min);

      // Check for events at this minute
      const event = data.commentary.find(e => e.minute === min);
      if (event) {
        setVisibleCommentary(prev => [...prev, event]);
        if (event.isGoal) {
          if (event.team === (teamName || "YOUR TEAM")) {
            setHomeScore(h => h + 1);
          } else {
            setAwayScore(a => a + 1);
          }
        }
      }

      if (min >= 90) {
        clearInterval(interval);
        setMatchState('finished');
      }
    }, 100); // Fast simulation: 100ms per minute
  };

  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCommentary]);

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 className="page-title">SOLO <span>CHALLENGE</span></h1>
        <p className="page-subtitle">Standard season simulation against elite AI clubs.</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="glass" style={{ padding: 32, borderRadius: 24, marginBottom: 24 }}>
          {/* Scoreboard Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={40} color="var(--blue)" />
              </div>
              {matchState === 'lobby' ? (
                <input 
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="TEAM NAME"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 24,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 200,
                    outline: 'none',
                    borderRadius: 8,
                    padding: '4px 8px'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
              ) : (
                <h3 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif" }}>{teamName || "MY TEAM"}</h3>
              )}
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>OVR: {userTeamOvr}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: 'var(--gold)', fontWeight: 700 }}>MATCH TIME</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ fontSize: 72, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>{homeScore}</div>
                <div style={{ fontSize: 40, opacity: 0.3 }}>:</div>
                <div style={{ fontSize: 72, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>{awayScore}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                {matchState === 'lobby' ? 'PRE-MATCH' : currentMinute + "'"}
              </div>
            </div>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={40} color="var(--red)" />
              </div>
              <h3 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif" }}>{botTeam.name}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>OVR: {botTeam.ovr}</div>
            </div>
          </div>

          {/* Action / Commentary Area */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, height: 300, display: 'flex', flexDirection: 'column' }}>
            {matchState === 'lobby' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400 }}>
                  Your team is ready for the kickoff. The win probability is calculated based on squad OVR and tactical depth.
                </p>
                <button className="btn btn-gold btn-lg" onClick={startSimulation} style={{ padding: '16px 48px' }}>
                  <Timer size={20} /> KICK OFF
                </button>
              </div>
            )}

            {(matchState === 'playing' || matchState === 'finished') && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {visibleCommentary.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        padding: '12px 16px', 
                        background: event.isGoal ? 'rgba(240,195,45,0.1)' : 'rgba(255,255,255,0.03)',
                        borderLeft: `3px solid ${event.isGoal ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: '0 8px 8px 0'
                      }}
                    >
                      <span style={{ fontWeight: 800, color: 'var(--gold)', marginRight: 12 }}>{event.minute}'</span>
                      <span style={{ fontSize: 14 }}>{event.description}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={commentaryEndRef} />
              </div>
            )}
          </div>
          
          {matchState === 'finished' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'var(--gold)', marginBottom: 16 }}>
                FULL TIME REAP
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                 <button className="btn btn-glass" onClick={() => setMatchState('lobby')}>REPLAY</button>
                 <button className="btn btn-gold">COLLECT REWARDS</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoloMatch;
