import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Users, Package, ShoppingCart, Trophy, TrendingUp, Star, Zap, Award, Coins, ChevronRight, Play, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveMatch from '../components/InteractiveMatch';
import SeasonSummaryModal from '../components/SeasonSummaryModal';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

const StatCard = ({ label, value, change, colorClass, icon: Icon, i }) => (
  <motion.div
    className={`stat-card glass ${colorClass}`}
    custom={i}
    initial="hidden"
    animate="visible"
    variants={fadeUp}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span className="stat-card-label">{label}</span>
      <Icon size={20} style={{ opacity: 0.5 }} />
    </div>
    <div className="stat-card-value">{value}</div>
    {change && (
      <div className="stat-card-change text-success">
        ↑ {change}
      </div>
    )}
  </motion.div>
);

const QuickCard = ({ to, icon: Icon, title, desc, color, i }) => (
  <motion.div custom={i} initial="hidden" animate="visible" variants={fadeUp}>
    <Link to={to} style={{ display: 'block' }}>
      <div
        className="glass"
        style={{
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          borderRadius: 16,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.borderColor = color + '55';
          e.currentTarget.style.background = color + '10';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: color + '20',
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} color={color} />
        </div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [nextFixture, setNextFixture] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Match related
  const [showMatch, setShowMatch] = useState(false);
  const [isQuickSim, setIsQuickSim] = useState(false);
  const [userOvr, setUserOvr] = useState(85);
  const [squadCards, setSquadCards] = useState([]);
  const [career, setCareer] = useState(null);
  
  // New user flow states
  const [hasCards, setHasCards] = useState(true);
  const [hasFullSquad, setHasFullSquad] = useState(true);

  // Season End
  const [showSeasonSummary, setShowSeasonSummary] = useState(false);
  const [seasonSummaryData, setSeasonSummaryData] = useState(null);

  const fetchData = async () => {
    if (!isAuthenticated || !user) return;
    try {
      setLoading(true);
      const [statsRes, fixtureRes, careerRes, cardsRes, squadRes] = await Promise.all([
        api.get('/users/stats'),
        api.get(`/career/next-fixture?userId=${user.id}`),
        api.get(`/career/state?userId=${user.id}`),
        api.get(`/cards/user/${user.id}`),
        api.get('/squad')
      ]);

      setStatsData(statsRes.data);
      setNextFixture(fixtureRes.data);
      setCareer(careerRes.data);
      setUserOvr(statsRes.data.teamOvr || 85);

      // Squad data
      let lineup = {};
      if (squadRes.data && squadRes.data.lineupJson) {
        try { lineup = JSON.parse(squadRes.data.lineupJson); } catch (e) {
          console.error("JSON parse error for lineup", e);
        }
      }
      const activeCards = Object.values(lineup).map(id => cardsRes.data.find(c => c.id === id)).filter(Boolean);
      setSquadCards(activeCards);
      
      setHasCards(cardsRes.data && cardsRes.data.length > 0);
      setHasFullSquad(activeCards.length === 11);

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      toast.success("Payment successful! Your coins will be added shortly.", { icon: '💎', duration: 5000 });
      window.history.replaceState({}, document.title, "/dashboard");
      setTimeout(fetchData, 1000); 
    } else if (params.get('payment_cancel') === 'true') {
      toast.error("Payment was cancelled or failed.");
      window.history.replaceState({}, document.title, "/dashboard");
    }
    
    fetchData();
  }, [isAuthenticated, user]);

  const handleFinishMatch = async (homeScore, awayScore, homePen, awayPen) => {
    setShowMatch(false);
    try {
      let url = `/career/advance?userId=${user.id}&userHomeScore=${homeScore}&userAwayScore=${awayScore}&fixtureId=${nextFixture.id}`;
      if (homePen !== undefined) url += `&homePen=${homePen}&awayPen=${awayPen}`;
      
      const res = await api.post(url);
      
      if (res.data.seasonSummary && res.data.seasonSummary.results) {
          setSeasonSummaryData(res.data.seasonSummary);
          setShowSeasonSummary(true);
      } else {
          toast.success("Match results recorded!");
          fetchData();
      }
    } catch (err) {
      toast.error("Failed to advance career.");
    }
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: 'var(--gold)' }}>WELCOME TO THE ARENA</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Please login to manage your squad and compete.</p>
        <Link to="/login" className="btn btn-gold btn-lg">LOGIN NOW</Link>
      </div>
    );
  }

  const stats = [
    { label: 'Current Balance', value: statsData?.coins?.toLocaleString() || (user?.coins?.toLocaleString() || '0'), change: 'Live Update', colorClass: 'gold-card', icon: TrendingUp },
    { label: 'Squad OVR', value: statsData?.teamOvr || '0', change: 'Top 11 Players', colorClass: 'blue-card', icon: Star },
    { label: 'Cards Owned', value: statsData?.totalCards || '0', change: 'Collection', colorClass: 'green-card', icon: Zap },
    { label: 'Season Rank', value: statsData?.rank || '#--', colorClass: 'purple-card', icon: Award },
  ];

  const quickLinks = [
    { to: '/squad', icon: Users, title: 'MY SQUAD', desc: 'Manage your 11 starters, formations, and tactical setup.', color: '#40c4ff' },
    { to: '/packs', icon: Package, title: 'OPEN PACKS', desc: 'Try your luck with elite player packs — ICON guaranteed.', color: '#f0c32d' },
    { to: '/market', icon: ShoppingCart, title: 'TRANSFER MARKET', desc: 'Browse and recruit world-class talents for your club.', color: '#00e676' },
    { to: '/trophies', icon: Trophy, title: 'TROPHIES', desc: 'View your achievements, streaks, and season ranking.', color: '#ff6b6b' },
  ];

  return (
    <div className="page">
      <Helmet>
        <title>Dashboard — FC Challenge</title>
        <meta name="description" content={`Welcome back, Manager ${user?.username || ''}. Track your squad OVR, club balance, and prepare for the next fixture in your FC Challenge career.`} />
      </Helmet>
      
      <style>
        {`
          @keyframes pulseGold {
            0% { box-shadow: 0 0 0 0 rgba(240, 195, 45, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(240, 195, 45, 0); }
            100% { box-shadow: 0 0 0 0 rgba(240, 195, 45, 0); }
          }
          .pulse-gold {
            animation: pulseGold 2s infinite;
          }
          .stat-value-animated {
            display: inline-block;
          }
        `}
      </style>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'left',
          padding: '12px 0 20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 40% 100% at 0% 50%, rgba(240,195,45,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2, lineHeight: 1, margin: 0 }}>
          YOUR <span style={{ color: 'var(--gold)', textShadow: '0 0 40px rgba(240,195,45,0.4)' }}>MANAGER</span> HUB
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, margin: 0, opacity: 0.7 }}>
          Ultimate Squad Operations — Season {career?.currentSeason} • Rank {statsData?.rank || '--'}
        </p>
      </motion.div>

      {/* FIRST ACTION / EARLY DOPAMINE (New User Flow) */}
      {!hasCards ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(240,195,45,0.15) 0%, rgba(240,195,45,0.02) 100%)',
            border: '1px solid rgba(240,195,45,0.4)', borderRadius: 24, padding: '32px 40px', marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
            boxShadow: '0 0 40px rgba(240,195,45,0.1)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ background: 'var(--gold)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>WELCOME BONUS</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: 'var(--gold)', margin: 0, letterSpacing: 1, textShadow: '0 0 20px rgba(240,195,45,0.3)' }}>
              🎁 CLAIM YOUR FREE STARTER PACK
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '8px 0 0 0', maxWidth: 600 }}>
              Kickstart your managerial career! Open your very first pack to discover your captain and build your squad foundation.
            </p>
          </div>
          <Link to="/packs" className="btn btn-gold btn-lg pulse-gold" style={{ padding: '16px 40px', fontSize: 18 }}>
            <Package size={24} /> OPEN NOW
          </Link>
        </motion.div>
      ) : !hasFullSquad ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(64,196,255,0.15) 0%, rgba(64,196,255,0.02) 100%)',
            border: '1px solid rgba(64,196,255,0.4)', borderRadius: 24, padding: '32px 40px', marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
            boxShadow: '0 0 40px rgba(64,196,255,0.1)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ background: 'var(--info)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>ACTION REQUIRED</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: 'var(--info)', margin: 0, letterSpacing: 1, textShadow: '0 0 20px rgba(64,196,255,0.3)' }}>
              ⚡ ASSEMBLE YOUR SQUAD
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '8px 0 0 0', maxWidth: 600 }}>
              You don't have a full starting 11 yet. Assign players to your lineup to start competing in matches!
            </p>
          </div>
          <Link to="/squad" className="btn" style={{ background: 'var(--info)', color: '#000', padding: '16px 40px', borderRadius: 8, fontWeight: 700, fontSize: 18, boxShadow: '0 4px 20px rgba(64,196,255,0.3)' }}>
            <Users size={24} /> GO TO SQUAD
          </Link>
        </motion.div>
      ) : null}

      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)', gap: 32, marginBottom: 32 }}>
        {/* Left Column: Stats & Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                {stats.map((s, i) => (
                <StatCard key={s.label} {...s} i={i} />
                ))}
            </div>

            <motion.div
                custom={8} initial="hidden" animate="visible" variants={fadeUp}
                className="balance-card-row"
                style={{
                padding: '32px 40px',
                background: 'linear-gradient(135deg, rgba(240,195,45,0.1) 0%, rgba(10,18,40,0.3) 100%)',
                border: '1px solid rgba(240, 195, 45, 0.2)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Account Balance</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: 'var(--gold)' }}>
                        <motion.span 
                            className="stat-value-animated"
                            key={statsData?.coins}
                            initial={{ scale: 1.3, color: '#fff' }} 
                            animate={{ scale: 1, color: 'var(--gold)' }} 
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                            {statsData?.coins?.toLocaleString() || '0'}
                        </motion.span> <Coins size={20} style={{ opacity: 0.7, verticalAlign: 'text-bottom' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/quests" className="btn btn-glass" style={{ padding: '10px 20px' }}>QUESTS</Link>
                    <Link to="/packs" className="btn btn-gold" style={{ padding: '10px 20px' }}>PACKS</Link>
                </div>
            </motion.div>
        </div>

        {/* Right Column: Match Center */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="glass" style={{ borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 800, color: 'var(--gold)', marginBottom: 24, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} /> NEXT FIXTURE
            </div>
            
            {nextFixture ? (
                <>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 24, letterSpacing: 1, fontWeight: 800 }}>WEEK {nextFixture.matchWeek} • {nextFixture.tournamentName}</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12 }}>
                            <div className="team-badge-premium" style={{ width: 110 }}>
                                <div className={`team-badge-circle ${nextFixture.homeIsUser ? 'user-team' : ''}`} style={{ width: 56, height: 56, fontSize: 24 }}>
                                    {(nextFixture.homeIsUser ? user.clubName : nextFixture.homeAiClub.name)[0]}
                                </div>
                                <div className="team-badge-name" style={{ fontSize: 12, marginTop: 8 }}>{nextFixture.homeIsUser ? (user.clubName || "YOUR CLUB") : nextFixture.homeAiClub.name}</div>
                            </div>
                            
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, opacity: 0.3, marginTop: 14 }}>VS</div>
                            
                            <div className="team-badge-premium" style={{ width: 110 }}>
                                <div className={`team-badge-circle ${nextFixture.awayIsUser ? 'user-team' : ''}`} style={{ width: 56, height: 56, fontSize: 24 }}>
                                    {(nextFixture.awayIsUser ? user.clubName : nextFixture.awayAiClub.name)[0]}
                                </div>
                                <div className="team-badge-name" style={{ fontSize: 12, marginTop: 8 }}>{nextFixture.awayIsUser ? (user.clubName || "YOUR CLUB") : nextFixture.awayAiClub.name}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {!hasFullSquad ? (
                            <button className="btn" disabled style={{ width: '100%', height: 50, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                BUILD SQUAD BEFORE PLAYING
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-gold" onClick={() => { setIsQuickSim(false); setShowMatch(true); }} style={{ width: '100%', height: 50 }}>
                                    <Play size={18} fill="currentColor" /> PLAY MATCH
                                </button>
                                <button className="btn btn-glass" onClick={() => { setIsQuickSim(true); setShowMatch(true); }} style={{ width: '100%', height: 50 }}>
                                    QUICK SIM
                                </button>
                            </>
                        )}
                    </div>

                    <Link to={`/tournaments/${nextFixture.tournamentId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
                        View Tournament <ChevronRight size={14} />
                    </Link>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                    <div style={{ 
                        width: 80, height: 80, borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Trophy size={40} />
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, marginBottom: 8 }}>No Matches Scheduled</div>
                    <div style={{ fontSize: 13, maxWidth: 200, margin: '0 auto' }}>Check tournaments to see your full season calendar.</div>
                </div>
            )}
        </motion.div>
      </div>

      <div className="quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {quickLinks.map((q, i) => (
          <QuickCard key={q.title} {...q} i={i + 10} />
        ))}
      </div>

      {/* Match Overlay */}
      <AnimatePresence>
        {showMatch && nextFixture && (
           <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
              <InteractiveMatch
                fixture={nextFixture}
                userClubName={user.clubName || "YOUR CLUB"}
                userOvr={userOvr}
                opponentOvr={nextFixture.homeIsUser ? nextFixture.awayAiClub.baseOvr : nextFixture.homeAiClub.baseOvr}
                opponentName={nextFixture.homeIsUser ? nextFixture.awayAiClub.name : nextFixture.homeAiClub.name}
                squadCards={squadCards}
                isQuickSim={isQuickSim}
                onFinish={handleFinishMatch}
                onCancel={() => setShowMatch(false)}
              />
           </div>
        )}
      </AnimatePresence>

      <SeasonSummaryModal 
        isOpen={showSeasonSummary} 
        summary={seasonSummaryData} 
        onConfirm={() => {
            setShowSeasonSummary(false);
            fetchData();
        }} 
      />
    </div>
  );
};

export default Dashboard;
