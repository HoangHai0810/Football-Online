import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Zap, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TournamentHub = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
             try {
                 const res = await api.get(`/career/tournaments?userId=${user.id}`);
                 setTournaments(res.data);
                 setLoading(false);
             } catch (err) {
                 console.error(err);
                 setLoading(false);
             }
        };
        if (user) fetchTournaments();
    }, [user]);

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
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <p className="section-tag">Career Mode</p>
                <h1 className="page-title">TOURNAMENT <span>HUB</span></h1>
                <p className="page-subtitle">Manage your active competitions and climb to glory.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
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
                            onClick={() => navigate(`/career/${tournament.id}`)}
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
                                    <div className="badge" style={{ background: 'rgba(255, 79, 79, 0.15)', color: '#ff4f4f', border: '1px solid rgba(255, 79, 79, 0.3)' }}>ELIMINATED</div>
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
                                ENTER TOURNAMENT <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default TournamentHub;
