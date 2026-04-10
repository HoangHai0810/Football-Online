import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Play, ChevronRight, Loader2, Info, Zap, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StandingsTable from '../components/StandingsTable';
import MatchSimulationModal from '../components/MatchSimulationModal';
import toast from 'react-hot-toast';

const Tournaments = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [career, setCareer] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [standings, setStandings] = useState([]);
    const [nextFixture, setNextFixture] = useState(null);
    const [allFixtures, setAllFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [userOvr, setUserOvr] = useState(85);

    const fetchData = async () => {
        try {
            const stateRes = await api.get(`/career/state?userId=${user.id}`);
            const state = stateRes.data;
            setCareer(state);

            // Fetch tournament details
            const tournamentsRes = await api.get(`/career/tournaments?userId=${user.id}`);
            const currentT = tournamentsRes.data.find(t => t.id.toString() === id);
            setTournament(currentT);

            // Fetch Standings
            if (currentT.type === 'LEAGUE' || currentT.type === 'CONTINENTAL') {
                 const leagueRes = await api.get(`/career/standings/${id}`);
                 setStandings(leagueRes.data);
            }

            // Fetch All Fixtures
            const allFixturesRes = await api.get(`/career/fixtures/${id}`);
            setAllFixtures(allFixturesRes.data);

            // Find next user fixture (Look ahead if current week has none)
            let currentWeekFixtures = allFixturesRes.data.filter(f => f.matchWeek === state.currentWeek);
            let userFixture = currentWeekFixtures.find(f => f.homeIsUser || f.awayIsUser);
            
            if (!userFixture) {
                // Look for the soonest user match in the future
                userFixture = allFixturesRes.data
                    .filter(f => (f.homeIsUser || f.awayIsUser) && f.matchWeek > state.currentWeek)
                    .sort((a,b) => a.matchWeek - b.matchWeek)[0];
            }
            setNextFixture(userFixture);
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching career data:", err);
            toast.error("Failed to load tournament data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
            api.get('/users/stats').then(res => setUserOvr(res.data.teamOvr)).catch(() => {});
        }
    }, [user, id]);

    const handleAdvance = async () => {
        try {
            const result = await api.post(`/career/advance?userId=${user.id}`);
            const { career: newCareer } = result.data;
            
            // Check if season ended
            if (newCareer.currentSeason > career.currentSeason) {
                toast.success("SEASON COMPLETED! Rewards have been issued to your account.", { duration: 5000 });
            }

            fetchData();
            return result.data.fixtures.find(f => f.homeIsUser || f.awayIsUser);
        } catch (err) {
            toast.error("Failed to simulate matches.");
            throw err;
        }
    };

    if (loading || !tournament) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--gold)" />
            </div>
        );
    }

    const opponent = nextFixture?.homeIsUser ? nextFixture.awayAiClub : nextFixture?.homeAiClub;

    const getMainTitle = () => {
        const parts = tournament.name.split(' ');
        if (parts.length > 1) {
            const last = parts.pop();
            return <>{parts.join(' ')} <span>{last}</span></>;
        }
        return tournament.name;
    };

    const isKnockoutOnly = tournament.type === 'CUP' || tournament.type === 'SUPER_CUP';
    const isEliminated = tournament.isEliminated;

    return (
        <div className="page">
            <button 
                onClick={() => navigate('/tournaments')}
                className="btn-back"
                style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', marginBottom: 24, fontSize: 14, fontWeight: 500,
                    transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={16} /> BACK TO TOURNAMENT HUB
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Trophy size={14} /> SEASON {career.currentSeason}
                        </div>
                        <div className="badge badge-silver" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} /> WEEK {career.currentWeek}
                        </div>
                        <div className="badge badge-blue">
                             {tournament.type} {tournament.tier > 0 ? `TIER ${tournament.tier}` : ''}
                        </div>
                    </div>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>{getMainTitle()}</h1>
                    <p className="page-subtitle">Your journey to football dominance continues here.</p>
                </div>

                {isEliminated ? (
                    <div style={{ 
                        padding: '12px 24px', 
                        background: 'rgba(255, 79, 79, 0.1)', 
                        border: '1px solid rgba(255, 79, 79, 0.3)', 
                        borderRadius: 12,
                        color: '#ff4f4f',
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <Info size={18} /> ELIMINATED FROM TOURNAMENT
                    </div>
                ) : (
                    <button 
                        className={`btn ${!nextFixture ? 'btn-disabled' : 'btn-gold'}`}
                        style={{ height: 50, padding: '0 32px', fontSize: 16 }}
                        onClick={() => nextFixture && setShowMatchModal(true)}
                        disabled={!nextFixture}
                    >
                        <Play size={20} fill="currentColor" />
                        {nextFixture ? 'PLAY NEXT MATCH' : 'NO MATCH SCHEDULED'}
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                {/* Left Column: Standings or Fixtures */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>
                            {isKnockoutOnly ? 'Knockout Stages' : 'Tournament Table'}
                        </h2>
                    </div>
                    
                    {isKnockoutOnly ? (
                        <div className="glass" style={{ padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {allFixtures.length === 0 && <p className="text-muted">No fixtures generated yet.</p>}
                            {allFixtures
                                .sort((a,b) => a.matchWeek - b.matchWeek)
                                .map(f => (
                                <div key={f.id} style={{ 
                                    padding: '16px 20px', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: (f.homeIsUser || f.awayIsUser) ? '1px solid rgba(240,195,45,0.3)' : '1px solid transparent',
                                    opacity: f.played ? 0.6 : 1
                                }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 60 }}>WK {f.matchWeek}</div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                                        <span style={{ fontWeight: f.homeIsUser ? 700 : 400 }}>{f.homeIsUser ? user.clubName : f.homeAiClub?.name}</span>
                                        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                            {(f.homeIsUser ? user.clubName : f.homeAiClub?.name)[0]}
                                        </div>
                                    </div>
                                    <div style={{ width: 80, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>
                                        {f.played ? `${f.homeScore} - ${f.awayScore}` : 'VS'}
                                        {f.extraTimeUsed && <div style={{ fontSize: 10, color: 'var(--gold)' }}>ET {f.homePenaltyScore != null ? `(${f.homePenaltyScore}-${f.awayPenaltyScore} P)` : ''}</div>}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                            {(f.awayIsUser ? user.clubName : f.awayAiClub?.name)[0]}
                                        </div>
                                        <span style={{ fontWeight: f.awayIsUser ? 700 : 400 }}>{f.awayIsUser ? user.clubName : f.awayAiClub?.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <StandingsTable standings={standings} userTeamName={user.clubName} />
                    )}
                </div>

                {/* Right Column: Next Match & Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {!isEliminated && (
                        <div className="glass" style={{ padding: 32, borderRadius: 24, border: '1px solid rgba(240,195,45,0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>Next Fixture</div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                                        {user.clubName[0]}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{user.clubName}</div>
                                </div>

                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)', opacity: 0.5 }}>VS</div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                                        {opponent?.name?.[0] || '?'}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{opponent?.name || 'TBA'}</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                                <Zap size={20} color="var(--gold)" />
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PREDICTED DIFFICULTY</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                                        {tournament.tier === 1 ? 'LEGENDARY' : 'NORMAL'} {opponent?.baseOvr ? `(${opponent.baseOvr} OVR)` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass" style={{ padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Info size={18} color="var(--blue)" />
                            <div style={{ fontSize: 14, fontWeight: 700 }}>Tournament Rules</div>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                            {tournament.type === 'LEAGUE' ? (
                                <>
                                    <li>Win: 3 Points, Draw: 1 Point, Loss: 0 Points</li>
                                    <li>Ranking priority: Points {'>'} GD {'>'} Goals For</li>
                                    {tournament.tier === 1 && <li>Top 4 qualify for <span style={{ color: '#f0c32d' }}>Champions Cup</span></li>}
                                    {tournament.tier > 1 && <li>Top 3 promoted to Higher Division</li>}
                                    {tournament.tier < 3 && <li>Bottom 3 relegated to Lower Division</li>}
                                </>
                            ) : (
                                <>
                                    <li>Knockout format: Win or Go Home</li>
                                    <li>Includes Extra Time and Penalties</li>
                                    <li>Ultimate Glory and Massive Rewards</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {showMatchModal && nextFixture && (
                <MatchSimulationModal
                    fixture={nextFixture}
                    userOvr={userOvr}
                    onClose={() => setShowMatchModal(false)}
                    onSimulateMatch={handleAdvance}
                />
            )}
        </div>
    );
};

export default Tournaments;
