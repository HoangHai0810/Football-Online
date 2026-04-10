import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy as TrophyIcon, Loader2, Award, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Trophies = () => {
    const { user } = useAuth();
    const [trophies, setTrophies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrophies = async () => {
             try {
                 const res = await api.get(`/career/trophies?userId=${user.id}`);
                 setTrophies(res.data);
                 setLoading(false);
             } catch (err) {
                 console.error(err);
                 setLoading(false);
             }
        };
        if (user) fetchTrophies();
    }, [user]);

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--gold)" />
            </div>
        );
    }

    const getTrophyColor = (rank) => {
        switch(rank) {
            case 'WINNER': return { main: 'var(--gold)', secondary: '#facc15' };
            case 'RUNNER_UP': return { main: '#cbd5e1', secondary: '#e2e8f0' };
            case 'TOP_4': return { main: '#b45309', secondary: '#d97706' };
            default: return { main: 'white', secondary: '#ccc' };
        }
    };

    const getRankLabel = (rank) => {
        switch(rank) {
            case 'WINNER': return 'CHAMPION';
            case 'RUNNER_UP': return '2ND PLACE';
            case 'TOP_4': return 'SEMI-FINALIST';
            default: return rank;
        }
    };

    return (
        <div className="page">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <p className="section-tag">Legacy</p>
                <h1 className="page-title">TROPHY <span>ROOM</span></h1>
                <p className="page-subtitle">A showcase of your club's historical achievements.</p>
            </div>

            {trophies.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '64px 20px', borderRadius: 24, opacity: 0.8 }}>
                    <div style={{ margin: '0 auto 24px', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <TrophyIcon size={40} color="gray" />
                    </div>
                    <h3 style={{ fontSize: 24, marginBottom: 8 }}>EMPTY CABINET</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Complete a season in the Tournament Hub to earn your first trophy.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                    {trophies.map((trophy, i) => {
                        const colors = getTrophyColor(trophy.rank);
                        return (
                            <motion.div
                                key={trophy.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass hover-lift"
                                style={{
                                    borderRadius: 24,
                                    padding: 32,
                                    border: `1px solid ${colors.main}40`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, height: 120,
                                    background: `linear-gradient(to bottom, ${colors.main}15, transparent)`,
                                    pointerEvents: 'none'
                                }} />
                                
                                <div style={{ 
                                    width: 100, height: 100, 
                                    borderRadius: '50%', 
                                    background: `radial-gradient(circle at top, ${colors.secondary}40, transparent)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 24,
                                    boxShadow: `0 10px 30px ${colors.main}20`
                                }}>
                                    <TrophyIcon size={56} color={colors.main} fill={trophy.rank === 'WINNER' ? colors.main : 'transparent'} />
                                </div>

                                <div className="badge" style={{ background: `${colors.main}20`, color: colors.main, marginBottom: 12, border: `1px solid ${colors.main}50` }}>
                                    <Award size={14} /> {getRankLabel(trophy.rank)}
                                </div>

                                <h3 style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginBottom: 4 }}>
                                    {trophy.tournamentName}
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    Season {trophy.seasonIndex}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Trophies;
