import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Zap, Play, ChevronRight, Lock, Loader2, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveMatch from '../components/InteractiveMatch';
import toast from 'react-hot-toast';

const TournamentHub = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [nextFixture, setNextFixture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInteractiveMatch, setShowInteractiveMatch] = useState(false);
    const [isQuickSimMode, setIsQuickSimMode] = useState(false);
    const [userOvr, setUserOvr] = useState(85);
    const [squadCards, setSquadCards] = useState([]);
    const [rewardModal, setRewardModal] = useState(null);

    const fetchData = React.useCallback(async () => {
        try {
            const [tourRes, nextFixRes, statsRes, cardsRes, squadRes] = await Promise.all([
                api.get(`/career/tournaments?userId=${user.id}`),
                api.get(`/career/next-fixture?userId=${user.id}`),
                api.get('/users/stats'),
                api.get(`/cards/user/${user.id}`),
                api.get('/squad')
            ]);
            
            setTournaments(tourRes.data);
            setNextFixture(nextFixRes.data);
            setUserOvr(statsRes.data.teamOvr);
            
            let lineup = {};
            try { lineup = JSON.parse(squadRes.data.lineupJson); } catch (e) {}
            const activeCards = Object.values(lineup).map(id => cardsRes.data.find(c => c.id === id)).filter(Boolean);
            setSquadCards(activeCards);
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    const handleAdvance = async (userHomeScore = null, userAwayScore = null, homePen = null, awayPen = null) => {
        try {
            let url = `/career/advance?userId=${user.id}&fixtureId=${nextFixture?.id}&isQuickSim=${isQuickSimMode}`;
            if (userHomeScore !== null && userAwayScore !== null) {
                url += `&userHomeScore=${userHomeScore}&userAwayScore=${userAwayScore}`;
                if (homePen !== null && awayPen !== null) url += `&homePen=${homePen}&awayPen=${awayPen}`;
            }
            const res = await api.post(url);
            
            setShowInteractiveMatch(false); // Close match immediately

            if (res.data && res.data.matchReward) {
                const reward = res.data.matchReward;
                const details = res.data.matchRewardDetails || {};
                
                setUser(prev => ({ ...prev, coins: prev.coins + reward }));
                
                setRewardModal({ reward, details }); // Open custom modal instead of toast
            }
            
            fetchData();
        } catch (err) {
            toast.error("Failed to simulate match.");
        }
    };

    const getInitials = (nick = "") => {
        if (!nick) return "?";
        const parts = nick.split(" ");
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return (nick[0] || "?").toUpperCase();
    };

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--gold)" />
            </div>
        );
    }

    // Types mapping for visual consistency
    const TOURNAMENT_CONFIG = {
        'LEAGUE': { color: 'var(--blue)', icon: Shield, defaultName: 'Professional League' },
        'CUP': { color: '#ff4f4f', icon: Zap, defaultName: 'National Cup' },
        'CONTINENTAL': { color: 'var(--gold)', icon: Trophy, defaultName: 'Champions Masters' },
        'SUPER_CUP': { color: '#2ecc71', icon: Trophy, defaultName: 'Season Shield' }
    };

    return (
        <div className="page">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <p className="section-tag">Career Mode</p>
                <h1 className="page-title" style={{ marginBottom: 0 }}>TOURNAMENT <span>HUB</span></h1>
                <p className="page-subtitle">Manage your active competitions and climb to glory.</p>
            </div>

            {/* Next Match Hero Section */}
            {nextFixture && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="match-hero hover-lift"
                >
                    <div className="match-hero-bg-icon">
                        <Trophy size={200} color="var(--gold)" />
                    </div>

                    <div className="match-hero-main">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="badge badge-gold">NEXT MATCH</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                                {nextFixture.tournamentName} • WEEK {nextFixture.matchWeek}
                            </div>
                        </div>

                        <div className="match-hero-teams">
                            <div className="team-badge-premium">
                                <div className={`team-badge-circle ${nextFixture.homeIsUser ? 'user-team' : ''}`}>
                                    {getInitials(nextFixture.homeIsUser ? user.clubName : nextFixture.homeAiClub?.name)}
                                </div>
                                <div className="team-badge-name">
                                    {nextFixture.homeIsUser ? user.clubName : nextFixture.homeAiClub?.name || 'TBA'}
                                </div>
                            </div>

                            <div className="match-hero-vs">VS</div>

                            <div className="team-badge-premium">
                                <div className={`team-badge-circle ${nextFixture.awayIsUser ? 'user-team' : ''}`}>
                                    {getInitials(nextFixture.awayIsUser ? user.clubName : nextFixture.awayAiClub?.name)}
                                </div>
                                <div className="team-badge-name">
                                    {nextFixture.awayIsUser ? user.clubName : nextFixture.awayAiClub?.name || 'TBA'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="match-hero-actions">
                        <button className="btn btn-gold" style={{ height: 54, fontSize: 16 }} onClick={() => { setIsQuickSimMode(false); setShowInteractiveMatch(true); }}>
                            <Play size={20} fill="currentColor" /> PLAY MATCH
                        </button>
                        <button className="btn btn-glass" style={{ height: 54, fontSize: 16 }} onClick={() => { setIsQuickSimMode(true); setShowInteractiveMatch(true); }}>
                            <Zap size={20} fill="currentColor" /> QUICK SIM
                        </button>
                    </div>
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {tournaments.map((tournament, i) => {
                    const config = TOURNAMENT_CONFIG[tournament.type] || TOURNAMENT_CONFIG['LEAGUE'];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={tournament.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass hover-lift"
                            style={{
                                borderRadius: 24,
                                padding: 32,
                                border: `1px solid ${config.color}33`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        >
                            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                                <Icon size={120} color={config.color} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: 64, height: 64, 
                                    borderRadius: 16, 
                                    background: `${config.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${config.color}33`
                                }}>
                                    <Icon size={32} color={config.color} />
                                </div>
                                {tournament.isEliminated ? (
                                    <div className="badge badge-red">ELIMINATED</div>
                                ) : (
                                    <div className="badge badge-gold">ACTIVE</div>
                                )}
                            </div>

                            <div>
                                <h3 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, marginBottom: 8 }}>
                                    {tournament.name}
                                </h3>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>TYPE: <span style={{ color: 'white', textTransform: 'uppercase' }}>{tournament.type}</span></div>
                                    {tournament.tier > 0 && (
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>TIER: <span style={{ color: 'var(--gold)' }}>{tournament.tier}</span></div>
                                    )}
                                </div>
                            </div>

                            <button className="btn btn-glass" style={{ width: '100%', borderColor: `${config.color}33`, marginTop: 'auto' }}>
                                VIEW DETAIL <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {showInteractiveMatch && nextFixture && (
                <InteractiveMatch
                    fixture={nextFixture}
                    userClubName={user.clubName || 'MY SQUAD'}
                    userOvr={userOvr}
                    squadCards={squadCards}
                    isQuickSim={isQuickSimMode}
                    opponentOvr={nextFixture.homeIsUser ? nextFixture.awayAiClub.baseOvr : nextFixture.homeAiClub.baseOvr}
                    opponentName={nextFixture.homeIsUser ? nextFixture.awayAiClub.name : nextFixture.homeAiClub.name}
                    onFinish={(hs, as, hp, ap) => handleAdvance(hs, as, hp, ap)}
                    onCancel={() => setShowInteractiveMatch(false)}
                />
            )}

            <AnimatePresence>
                {rewardModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 99999,
                            background: 'rgba(5, 8, 20, 0.9)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            style={{
                                background: 'linear-gradient(180deg, rgba(30, 40, 70, 0.9) 0%, rgba(15, 20, 40, 0.95) 100%)',
                                border: '1px solid var(--gold)',
                                borderRadius: 24, padding: 40, width: '100%', maxWidth: 460,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(240,195,45,0.2)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
                                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: 'white', letterSpacing: 2, marginBottom: 8 }}>MATCH REWARDS</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Match completed! Here is your payout:</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                                {Object.entries(rewardModal.details).map(([key, val]) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                        <span style={{ color: '#9ca3af', fontWeight: 500 }}>{key}</span>
                                        <span style={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            +{val.toLocaleString()} <Coins size={14} color="var(--gold)" />
                                        </span>
                                    </div>
                                ))}
                                <div style={{ 
                                    display: 'flex', justifyContent: 'space-between', padding: '16px', 
                                    background: 'rgba(46, 204, 113, 0.1)', borderRadius: 12, 
                                    border: '1px solid rgba(46, 204, 113, 0.3)', marginTop: 8 
                                }}>
                                    <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>TOTAL EARNED</span>
                                    <span style={{ color: '#2ecc71', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        +{rewardModal.reward.toLocaleString()} <Coins size={20} color="var(--gold)" />
                                    </span>
                                </div>
                            </div>

                            <button className="btn btn-gold" style={{ width: '100%', height: 56, fontSize: 18 }} onClick={() => setRewardModal(null)}>
                                CLAIM REWARDS
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TournamentHub;
