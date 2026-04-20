import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, Shield, Activity, Users, ChevronRight, MessageSquare, Timer } from 'lucide-react';
import { DECISIONS } from '../data/matchScenarios';
import '../styles/MatchSimulation.css';

const InteractiveMatch = ({ fixture, userClubName, userOvr, opponentOvr, opponentName, squadCards, isQuickSim, onFinish, onCancel }) => {
  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [penalties, setPenalties] = useState(null); 

  const [activeMoment, setActiveMoment] = useState(null);
  const [momentResult, setMomentResult] = useState(null);
  const [floatingMessage, setFloatingMessage] = useState('');
  const [matchLog, setMatchLog] = useState([]);

  const timelineRef = useRef({ userMoments: [], aiGoals: [], userGoals: [] });
  const timerRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [matchLog]);

  const addLog = (text, type = 'info', min = minute) => {
      setMatchLog(prev => [...prev, { id: Date.now() + Math.random(), text, type, minute: min }]);
  };

  useEffect(() => {
    const aiStrength = opponentOvr - userOvr;
    let aiGoalCount = 0;
    if (aiStrength > 10) aiGoalCount = 2 + Math.floor(Math.random() * 2);
    else if (aiStrength > 5) aiGoalCount = 1 + Math.floor(Math.random() * 2);
    else if (aiStrength > -5) aiGoalCount = Math.floor(Math.random() * 2);
    else if (aiStrength > -15) aiGoalCount = Math.random() > 0.7 ? 1 : 0;

    const aiGoals = [];
    for (let i = 0; i < aiGoalCount; i++) aiGoals.push(10 + Math.floor(Math.random() * 75));

    const userMoments = [];
    const userGoals = [];

    if (isQuickSim) {
        const userStrength = userOvr - opponentOvr;
        let uGoals = 0;
        if (userStrength > 10) uGoals = 2 + Math.floor(Math.random() * 2);
        else if (userStrength > 5) uGoals = 1 + Math.floor(Math.random() * 2);
        else if (userStrength > -5) uGoals = Math.floor(Math.random() * 2);
        else if (userStrength > -15) uGoals = Math.random() > 0.7 ? 1 : 0;
        for (let i = 0; i < uGoals; i++) {
            const m = 10 + Math.floor(Math.random() * 75);
            let pool = squadCards || [];
            if (pool.length > 0) {
               const am = pool.filter(c => ['ST','LW','RW','CAM','CM','LM','RM'].includes(c.template.position));
               if(am.length > 0) pool = am;
            }
            const actor = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
            userGoals.push({ minute: m, scorer: actor ? actor.template.name : userClubName });
        }
    } else {
        const userMomentCount = 2 + Math.floor(Math.random() * 2);
        let lastM = 0;
        for (let i = 0; i < userMomentCount; i++) {
            let m = lastM + 15 + Math.floor(Math.random() * 20);
            if (m > 88) m = 88;
            userMoments.push({ minute: m, data: DECISIONS[Math.floor(Math.random() * DECISIONS.length)] });
            lastM = m;
        }
    }

    timelineRef.current = { aiGoals, userMoments, userGoals };
  }, [fixture, userOvr, opponentOvr, isQuickSim, squadCards]);

  useEffect(() => {
    if (isPlaying && !matchEnded && !activeMoment && !momentResult) {
      if (minute === 0 && matchLog.length === 0) {
        addLog(`Match Kick-off! ${fixture.homeIsUser ? userClubName : opponentName} vs ${fixture.awayIsUser ? userClubName : opponentName}`, 'info', 0);
      }
      timerRef.current = setInterval(() => {
        setMinute(m => {
          if (m >= 90) return 90;
          return m + 1;
        });
      }, isQuickSim ? 30 : 150);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, matchEnded, activeMoment, momentResult, isQuickSim]);

  useEffect(() => {
    if (minute >= 90 && !matchEnded) {
      handleFullTime();
    } else if (minute < 90 && isPlaying && !activeMoment && !momentResult) {
      if (isQuickSim) {
         const goal = timelineRef.current.userGoals.find(g => g.minute === minute);
         if (goal) {
             if (fixture.homeIsUser) setHomeScore(s => s + 1); else setAwayScore(s => s + 1);
             showFloating(`⚽ GOAL! ${goal.scorer}`, "var(--gold)");
             addLog(`GOAL! Brilliant strike by ${goal.scorer}!`, 'goal', minute);
             timelineRef.current.userGoals = timelineRef.current.userGoals.filter(g => g.minute !== minute);
         }
      } else {
         const moment = timelineRef.current.userMoments.find(m => m.minute === minute);
         if (moment) {
           let pool = squadCards || [];
           if (pool.length > 0) {
              let allowedPos = ['ST','LW','RW','CAM','CM','LM','RM'];
              if (moment.data.type === 'gk') allowedPos = ['GK'];
              else if (moment.data.type === 'defense') allowedPos = ['CB','LB','RB','CDM'];
              else if (moment.data.type === 'midfield') allowedPos = ['CM','CDM','CAM','LM','RM'];
              const am = pool.filter(c => allowedPos.includes(c.template.position));
              if(am.length > 0) pool = am;
           }
           const actor = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
           setActiveMoment({ ...moment.data, actor });
           addLog(`Danger! ${actor ? actor.template.name : "A player"} is in a critical position.`, 'info', minute);
         }
      }
      
      if (timelineRef.current.aiGoals.includes(minute)) {
        if (fixture.homeIsUser) setAwayScore(s => s + 1);
        else setHomeScore(s => s + 1);
        showFloating("⚽ OPPONENT SCORED!", "#ff4757");
        addLog(`GOAL! ${opponentName} have found the back of the net.`, 'ai-goal', minute);
        timelineRef.current.aiGoals = timelineRef.current.aiGoals.filter(m => m !== minute);
      }
    }
  }, [minute]);

  const showFloating = (msg, color) => {
    setFloatingMessage({ text: msg, color });
    setTimeout(() => setFloatingMessage(null), 2000);
  };

  const getStatBonus = (level) => {
    const bonuses = [0, 0, 1, 2, 4, 6, 8, 11, 15, 18, 21];
    return bonuses[level] || 0;
  };

  const handleDecision = (option) => {
    const actor = activeMoment?.actor;
    setActiveMoment(null);
    let baseWinProb = 50;
    if (actor && actor.template[option.reqStat] !== undefined) {
      const specificStat = actor.template[option.reqStat] + getStatBonus(actor.upgradeLevel);
      baseWinProb = 50 + (specificStat - opponentOvr) * 1.5 + option.bonus;
    } else {
      baseWinProb = 50 + (userOvr - opponentOvr) * 1.5 + option.bonus;
    }
    const winProb = Math.max(5, Math.min(95, baseWinProb));
    const rand = Math.random() * 100;
    const isWin = rand <= winProb;

    setMomentResult({
      isWin,
      msg: isWin ? option.passMsg : option.failMsg,
      scorer: isWin && option.winAddsUserGoal ? (actor ? actor.template.name : userClubName) : null
    });

    if (isWin) {
        addLog(`Excellent! ${actor ? actor.template.name : "The player"} succeeded with: ${option.text}`, 'info', minute);
        if (option.winAddsUserGoal) {
            if (fixture.homeIsUser) setHomeScore(s => s + 1); else setAwayScore(s => s + 1);
            addLog(`GOAL! Incredible finish by ${actor ? actor.template.name : "our player"}!`, 'goal', minute);
        }
    } else {
        addLog(`Failed! ${actor ? actor.template.name : "The player"} lost the duel.`, 'info', minute);
        if (option.failAddsOpponentGoal) {
            if (fixture.homeIsUser) setAwayScore(s => s + 1); else setHomeScore(s => s + 1);
            addLog(`GOAL! ${opponentName} capitalize on the mistake and score.`, 'ai-goal', minute);
        }
    }
    setTimeout(() => setMomentResult(null), 2500);
  };

  const handleFullTime = () => {
    setMatchEnded(true);
    setIsPlaying(false);
    addLog(`Full Time! Final score: ${homeScore} - ${awayScore}`, 'info', 90);
    if (fixture.knockout && homeScore === awayScore) {
      let userP = 3 + Math.floor(Math.random() * 3);
      let aiP = 3 + Math.floor(Math.random() * 3);
      while (userP === aiP) aiP = 3 + Math.floor(Math.random() * 3);
      setPenalties({ home: fixture.homeIsUser ? userP : aiP, away: fixture.homeIsUser ? aiP : userP });
      addLog(`Penalties: ${fixture.homeIsUser ? userP : aiP} - ${fixture.homeIsUser ? aiP : userP}`, 'info', 90);
    }
  };

  useEffect(() => {
      // Auto-advance match after full time
      if (matchEnded) {
          const t = setTimeout(() => {
              handleFinish();
          }, 2500);
          return () => clearTimeout(t);
      }
  }, [matchEnded]);

  const handleFinish = () => {
    onFinish(homeScore, awayScore, penalties?.home, penalties?.away);
  };

  const homeTeamName = fixture.homeIsUser ? userClubName : opponentName;
  const awayTeamName = fixture.awayIsUser ? userClubName : opponentName;
  const homeOvrVal = fixture.homeIsUser ? userOvr : opponentOvr;
  const awayOvrVal = fixture.awayIsUser ? userOvr : opponentOvr;

  const getOptionIcon = (req) => {
      if (req.includes('shot') || req.includes('finishing')) return <Target size={20} />;
      if (req.includes('Passing')) return <Users size={20} />;
      if (req.includes('Tackle') || req.includes('strength')) return <Shield size={20} />;
      if (req.includes('Pace') || req.includes('Speed') || req.includes('acceleration')) return <Zap size={20} />;
      return <Activity size={20} />;
  };

  return (
    <div className="match-container">
      <div className="stadium-bg" />
      <div className="stadium-lights" />


      <div className="scoreboard-wrapper">
        <div className="team-panel home">
           <div className="team-info">
             <div className="team-name-lg">{homeTeamName}</div>
             <div className="team-ovr-label">OVR {homeOvrVal}</div>
           </div>
           <div className="team-logo-squircle">{homeTeamName[0]}</div>
        </div>

        <div className="score-center">
            <div style={{ color: 'var(--gold)', fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
                {minute}' {isQuickSim && <span style={{fontSize: 10, opacity: 0.7}}></span>}
            </div>
            <div className="score-digits">
                <span className={homeScore > 0 ? 'active' : ''}>{homeScore}</span>
                <span className="separator">:</span>
                <span className={awayScore > 0 ? 'active' : ''}>{awayScore}</span>
            </div>
            {penalties && (
                <div className="penalties-score">
                   PENS: {penalties.home} - {penalties.away}
                </div>
            )}
        </div>

        <div className="team-panel away">
           <div className="team-logo-squircle">{awayTeamName[0]}</div>
           <div className="team-info">
             <div className="team-name-lg">{awayTeamName}</div>
             <div className="team-ovr-label">OVR {awayOvrVal}</div>
           </div>
        </div>
      </div>

      {/* Match Log Panel - NOW CENTERED */}
      <div className="match-feed-panel">
         <div className="feed-header">
            <span>MATCH LOG</span>
            <MessageSquare size={14} opacity={0.5} />
         </div>
         <div className="feed-content">
            {matchLog.map(log => (
                <div key={log.id} className={`feed-item ${log.type}`}>
                    <div className="feed-minute">{log.minute}'</div>
                    <div className="feed-text">{log.text}</div>
                </div>
            ))}
            <div ref={logEndRef} />
         </div>
      </div>

      <AnimatePresence>
        {floatingMessage && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
            style={{ position: 'absolute', top: '40%', right: 20, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '15px 30px', borderRadius: '0 10px 10px 0', borderLeft: `4px solid ${floatingMessage.color}`, zIndex: 50 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: 'white' }}>{floatingMessage.text}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flexShrink: 0, paddingBottom: 16, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {!isPlaying && minute === 0 && !matchEnded && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: 'white', marginBottom: 16 }}>KICK OFF INBOUND</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-gold" onClick={() => setIsPlaying(true)} style={{ height: 42, padding: '0 24px', fontSize: 14 }}>START MATCH</button>
                <button className="btn btn-glass" onClick={onCancel} style={{ height: 42, fontSize: 14 }}>CANCEL</button>
            </div>
          </motion.div>
        )}

        {activeMoment && (
          <motion.div className="tactical-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} style={{ textAlign: 'center', marginBottom: 40, padding: '0 20px' }}>
                <div style={{ background: 'var(--danger)', color: 'white', padding: '6px 18px', borderRadius: 100, fontSize: 11, fontWeight: 900, display: 'inline-block', marginBottom: 16, letterSpacing: 2 }}>CRITICAL MOMENT</div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: 'white', lineHeight: 0.9, marginBottom: 16 }}>{activeMoment.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 640, margin: '0 auto 24px', lineHeight: 1.6 }}>{activeMoment.desc}</p>
                {activeMoment.actor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', color: 'var(--gold)', background: 'rgba(240,195,45,0.1)', padding: '8px 20px', borderRadius: 50, width: 'fit-content', margin: '0 auto' }}>
                        <Users size={18} />
                        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>{activeMoment.actor.template.name.toUpperCase()} ON THE BALL</span>
                    </div>
                )}
            </motion.div>
            
            <div className="decision-card-group">
                {activeMoment.options.map((opt, i) => (
                    <motion.div key={i} className={`decision-card ${opt.bonus < 0 ? 'risky' : opt.bonus > 5 ? 'safe' : 'normal'}`} 
                        whileHover={{ scale: 1.05 }} onClick={() => handleDecision(opt)}>
                        <div className="stat-badge">{opt.reqStat}</div>
                        <div style={{ color: 'var(--gold)', marginBottom: 20 }}>{getOptionIcon(opt.reqStat)}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 12 }}>{opt.text}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.bonus < 0 ? 'High Risk / Reward' : 'Standard Approach'}</div>
                    </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {momentResult && (
          <motion.div className="goal-banner" initial={{ x: '-100%', y: '-50%', opacity: 0 }} animate={{ x: 0, y: '-50%', opacity: 1 }} exit={{ x: '100%', y: '-50%', opacity: 0 }}>
             <div className="goal-title">{momentResult.isWin ? 'BRILLIANT!' : 'MISSED!'}</div>
             <div className="goal-scorer">{momentResult.scorer || momentResult.msg}</div>
             {momentResult.isWin && momentResult.scorer && <div style={{ color: 'white', opacity: 0.6, marginTop: 10 }}>{momentResult.msg}</div>}
          </motion.div>
        )}

        {matchEnded && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'white', textShadow: '0 0 15px rgba(0,0,0,0.4)', marginBottom: 8, letterSpacing: 4 }}>FULL TIME</div>
            <div className="match-status-label" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>FINALIZING RESULTS...</div>
            <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }}
               style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, letterSpacing: 1 }}
            >
               Please wait...
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMatch;
