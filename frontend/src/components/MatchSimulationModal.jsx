import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Settings, Trophy, Shield, Goal, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIMULATION_MESSAGES = [
    "Kicking off...",
    "Intense midfield battle...",
    "Working the wings...",
    "A dangerous attack developing...",
    "Second half underway...",
    "Approaching full time...",
    "The referee blows the final whistle!"
];

const MatchSimulationModal = ({ fixture, userOvr, onClose, onSimulateMatch }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [phase, setPhase] = useState('PRE_MATCH'); // PRE_MATCH, SIMULATING, POST_MATCH
    const [simMsgIdx, setSimMsgIdx] = useState(0);
    const [stats, setStats] = useState(null);
    const [finalFixture, setFinalFixture] = useState(fixture);

    // Dynamic stat generation based on score
    const generateRealisticStats = (homeScore, awayScore, homeOvr, awayOvr) => {
        // Base possession tilted towards higher OVR
        const basePossession = 50 + (homeOvr - awayOvr) * 0.5;
        // Shift possession slightly based on who won
        const possessionShift = (homeScore - awayScore) * 3;
        
        // Clamp possession between 25 and 75
        let hPossession = Math.round(Math.min(75, Math.max(25, basePossession + possessionShift + (Math.random() * 6 - 3))));
        let aPossession = 100 - hPossession;

        // Shots based on score
        let hShots = homeScore + Math.floor(Math.random() * 5) + 2;
        let aShots = awayScore + Math.floor(Math.random() * 5) + 2;

        return {
            home: {
                possession: hPossession,
                shots: hShots,
                shotsOnTarget: homeScore + Math.floor(Math.random() * 3),
                passes: Math.floor((hPossession / 100) * 800) + Math.floor(Math.random() * 50),
                fouls: Math.floor(Math.random() * 12)
            },
            away: {
                possession: aPossession,
                shots: aShots,
                shotsOnTarget: awayScore + Math.floor(Math.random() * 3),
                passes: Math.floor((aPossession / 100) * 800) + Math.floor(Math.random() * 50),
                fouls: Math.floor(Math.random() * 12)
            }
        };
    };

    const handleStartSimulation = async () => {
        setPhase('SIMULATING');
        
        let msgInterval = setInterval(() => {
            setSimMsgIdx(prev => Math.min(prev + 1, SIMULATION_MESSAGES.length - 1));
        }, 600);

        try {
            const updatedFixture = await onSimulateMatch();
            setFinalFixture(updatedFixture);
            
            // Wait for animation to feel meaningful (at least 3 seconds)
            setTimeout(() => {
                clearInterval(msgInterval);
                const aOvr = updatedFixture.homeIsUser ? (updatedFixture.awayAiClub?.baseOvr || 70) : (updatedFixture.homeAiClub?.baseOvr || 70);
                const hOvr = updatedFixture.homeIsUser ? userOvr : (updatedFixture.homeAiClub?.baseOvr || 70);
                
                setStats(generateRealisticStats(updatedFixture.homeScore, updatedFixture.awayScore, hOvr, aOvr));
                setPhase('POST_MATCH');
            }, 4000);
            
        } catch (error) {
            clearInterval(msgInterval);
            console.error("Match sim failed", error);
            onClose(); // Fallback on error
        }
    };

    const opponentName = fixture.homeIsUser ? (fixture.awayAiClub?.name || 'Unknown AI') : (fixture.homeAiClub?.name || 'Unknown AI');
    const opponentOvr = fixture.homeIsUser ? (fixture.awayAiClub?.baseOvr || 70) : (fixture.homeAiClub?.baseOvr || 70);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="glass premium-border"
                    style={{
                        width: '90%', maxWidth: 800, minHeight: 400, borderRadius: 24,
                        padding: 32, position: 'relative', overflow: 'hidden'
                    }}
                >
                    {phase === 'PRE_MATCH' && (
                        <div>
                            <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                <X size={28} />
                            </button>
                            <h2 style={{ textAlign: 'center', fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, marginBottom: 40 }}>
                                MATCH <span style={{ color: 'var(--gold)' }}>PREVIEW</span>
                            </h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 }}>
                                {/* HOME */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <Shield size={48} color={fixture.homeIsUser ? "var(--gold)" : "#888"} />
                                    </div>
                                    <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                                        {fixture.homeIsUser ? user.clubName : fixture.homeAiClub?.name}
                                    </h3>
                                    <div className="badge badge-gold" style={{ display: 'inline-block' }}>OVR {fixture.homeIsUser ? userOvr : fixture.homeAiClub?.baseOvr}</div>
                                </div>
                                
                                {/* VS */}
                                <div style={{ fontSize: 40, fontFamily: "'Bebas Neue', sans-serif", color: 'rgba(255,255,255,0.2)', padding: '0 30px' }}>
                                    VS
                                </div>
                                
                                {/* AWAY */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <Shield size={48} color={fixture.awayIsUser ? "var(--gold)" : "#888"} />
                                    </div>
                                    <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                                        {fixture.awayIsUser ? user.clubName : fixture.awayAiClub?.name}
                                    </h3>
                                    <div className="badge badge-blue" style={{ display: 'inline-block' }}>OVR {fixture.awayIsUser ? userOvr : fixture.awayAiClub?.baseOvr}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 16, flexDirection: 'column', alignItems: 'center' }}>
                                {userOvr === 0 && (
                                    <div style={{ color: 'var(--red)', background: 'rgba(255, 0, 0, 0.1)', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1px solid rgba(255, 0, 0, 0.2)', marginBottom: 16, textAlign: 'center', maxWidth: 400 }}>
                                        ⚠️ Incomplete lineup (need 11 players). Please visit SQUAD to set your formation before the match.
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                    <button className="btn btn-glass" onClick={() => navigate('/squad')}>
                                        <Settings size={18} /> ADJUST SQUAD
                                    </button>
                                    <button 
                                        className={`btn ${userOvr === 0 ? 'btn-disabled' : 'btn-gold'}`} 
                                        onClick={handleStartSimulation}
                                        disabled={userOvr === 0}
                                        style={userOvr === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        <Play size={18} /> START SIMULATION
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 'SIMULATING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    border: '4px dashed var(--gold)', borderTopColor: 'transparent',
                                    marginBottom: 30
                                }}
                            />
                            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
                                {SIMULATION_MESSAGES[simMsgIdx]}
                            </h3>
                        </div>
                    )}

                    {phase === 'POST_MATCH' && stats && finalFixture && (
                        <div className="post-match">
                            <h2 style={{ textAlign: 'center', fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, marginBottom: 30 }}>
                                FULL TIME <span style={{ color: 'var(--gold)' }}>RESULT</span>
                            </h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 40, background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: '20px 40px' }}>
                                <div style={{ flex: 1, textAlign: 'right', fontSize: 24, fontWeight: 700 }}>
                                    {finalFixture.homeIsUser ? user.clubName : finalFixture.homeAiClub?.name}
                                </div>
                                <div style={{ width: 140, textAlign: 'center', fontSize: 48, fontFamily: "'Bebas Neue', sans-serif", color: 'var(--gold)', letterSpacing: 4 }}>
                                    {finalFixture.homeScore ?? '-'} - {finalFixture.awayScore ?? '-'}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left', fontSize: 24, fontWeight: 700 }}>
                                    {finalFixture.awayIsUser ? user.clubName : finalFixture.awayAiClub?.name}
                                </div>
                            </div>
                            
                            {/* Stats Chart */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 40 }}>
                                <StatBar label="POSSESSION (%)" hVal={stats.home.possession} aVal={stats.away.possession} total={100} />
                                <StatBar label="TOTAL SHOTS" hVal={stats.home.shots} aVal={stats.away.shots} total={Math.max(stats.home.shots + stats.away.shots, 1)} />
                                <StatBar label="SHOTS ON TARGET" hVal={stats.home.shotsOnTarget} aVal={stats.away.shotsOnTarget} total={Math.max(stats.home.shotsOnTarget + stats.away.shotsOnTarget, 1)} />
                                <StatBar label="PASSES COMPLETED" hVal={stats.home.passes} aVal={stats.away.passes} total={Math.max(stats.home.passes + stats.away.passes, 1)} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button className="btn btn-gold" onClick={onClose}>CONTINUE TO HUB</button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const StatBar = ({ label, hVal, aVal, total }) => {
    const hPct = (hVal / total) * 100;
    const aPct = 100 - hPct;
    
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{hVal}</span>
                <span>{label}</span>
                <span>{aVal}</span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: '#222' }}>
                <div style={{ flex: `0 0 ${hPct}%`, background: '#fff' }} />
                <div style={{ flex: `0 0 ${aPct}%`, background: 'var(--gold)' }} />
            </div>
        </div>
    );
};

export default MatchSimulationModal;
