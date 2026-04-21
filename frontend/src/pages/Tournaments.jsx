import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Play, ChevronRight, Loader2, Info, Zap, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StandingsTable from '../components/StandingsTable';
import TournamentLeaders from '../components/TournamentLeaders';
import MatchSimulationModal from '../components/MatchSimulationModal';
import InteractiveMatch from '../components/InteractiveMatch';
import SeasonSummaryModal from '../components/SeasonSummaryModal';
import TournamentBracket from '../components/TournamentBracket';
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
    const [isQuickSimMode, setIsQuickSimMode] = useState(false);
    const [userOvr, setUserOvr] = useState(85);
    const [squadCards, setSquadCards] = useState([]);

    // Season End
    const [showSeasonSummary, setShowSeasonSummary] = useState(false);
    const [seasonSummaryData, setSeasonSummaryData] = useState(null);

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

            // Find next user fixture
            const nextFixRes = await api.get(`/career/next-fixture?userId=${user.id}`);
            setNextFixture(nextFixRes.data);

            // Fetch Cards & Squad
            const [cardsRes, squadRes] = await Promise.all([
                api.get(`/cards/user/${user.id}`),
                api.get('/squad')
            ]);
            let lineup = {};
            try { lineup = JSON.parse(squadRes.data.lineupJson); } catch (e) {}
            const activeCards = Object.values(lineup).map(id => cardsRes.data.find(c => c.id === id)).filter(Boolean);
            setSquadCards(activeCards);
            
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

    const handleAdvance = async (userHomeScore = null, userAwayScore = null, homePen = null, awayPen = null) => {
        try {
            let url = `/career/advance?userId=${user.id}&fixtureId=${nextFixture?.id}`;
            if (userHomeScore !== null && userAwayScore !== null) {
                url += `&userHomeScore=${userHomeScore}&userAwayScore=${userAwayScore}`;
                if (homePen !== null && awayPen !== null) {
                    url += `&homePen=${homePen}&awayPen=${awayPen}`;
                }
            }
            const result = await api.post(url);
            
            if (result.data.seasonSummary && result.data.seasonSummary.results) {
                setSeasonSummaryData(result.data.seasonSummary);
                setShowSeasonSummary(true);
            } else {
                toast.success("Match completed!");
                fetchData();
            }

            fetchData();
            setIsQuickSimMode(false);
        } catch (err) {
            toast.error("Failed to simulate match.");
        }
    };

    if (loading || !tournament) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--gold)" />
            </div>
        );
    }

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px' }}>
                            <Trophy size={14} /> SEASON {career.currentSeason}
                        </div>
                        <div className="badge badge-silver" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px' }}>
                            <Calendar size={14} /> WEEK {career.currentWeek}
                        </div>
                        <div className="badge badge-blue" style={{ padding: '4px 12px' }}>
                             {tournament.type} {tournament.tier > 0 ? `TIER ${tournament.tier}` : ''}
                        </div>
                    </div>
                    <h1 className="page-title" style={{ marginBottom: 4, fontSize: 48 }}>{getMainTitle()}</h1>
                    <p className="page-subtitle" style={{ fontSize: 16, opacity: 0.8 }}>Your journey to football dominance continues here.</p>
                </div>

                {isEliminated && (
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
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
                <div style={{ flex: 1 }}>
                    <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
                        <h2 style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Trophy size={20} className="highlight-gold" /> {isKnockoutOnly ? 'Knockout Stages' : 'Tournament Table'}
                        </h2>
                        {isKnockoutOnly ? (
                            <TournamentBracket 
                                fixtures={allFixtures} 
                                userClubName={user.clubName} 
                            />
                        ) : (
                            <StandingsTable standings={standings} userTeamName={user.clubName} />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <TournamentLeaders tournamentId={tournament.id} />
                    
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

            {/* InteractiveMatch removed from here */}

            <SeasonSummaryModal 
                isOpen={showSeasonSummary} 
                summary={seasonSummaryData} 
                onConfirm={() => {
                    setShowSeasonSummary(false);
                    fetchData();
                    navigate('/tournaments');
                }} 
            />
        </div>
    );
};

export default Tournaments;
