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

    // Static templates for the visual hub
    const ALL_TOURNAMENTS = [
        { type: 'LEAGUE', name: 'SUPER LEAGUE', color: 'var(--blue)', icon: Shield, defaultLocked: false },
        { type: 'CUP', name: 'NATIONAL CUP', color: '#ff4f4f', icon: Zap, defaultLocked: true, req: 'Complete 1 Season to Unlock' },
        { type: 'CONTINENTAL', name: 'CHAMPIONS MASTERS', color: 'var(--gold)', icon: Trophy, defaultLocked: true, req: 'Top 4 Finish in Super League Required' },
    ];

    return (
        <div className="page">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <p className="section-tag">Career Mode</p>
                <h1 className="page-title">TOURNAMENT <span>HUB</span></h1>
                <p className="page-subtitle">Manage your active competitions and climb to glory.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {ALL_TOURNAMENTS.map((t, i) => {
                    const activeTournament = tournaments.find(active => active.type === t.type);
                    const isLocked = !activeTournament && t.defaultLocked;
                    const Icon = t.icon;

                    return (
                        <motion.div
                            key={t.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass ${!isLocked ? 'hover-lift' : ''}`}
                            style={{
                                borderRadius: 24,
                                padding: 32,
                                border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : t.color + '33'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: isLocked ? 0.6 : 1,
                                filter: isLocked ? 'grayscale(100%)' : 'none'
                            }}
                            onClick={() => {
                                if (!isLocked && activeTournament) {
                                    navigate(`/career/${activeTournament.id}`);
                                }
                            }}
                        >
                            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                                <Icon size={120} color={isLocked ? 'white' : t.color} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: 64, height: 64, 
                                    borderRadius: 16, 
                                    background: isLocked ? 'rgba(255,255,255,0.05)' : `${t.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${isLocked ? 'transparent' : t.color + '33'}`
                                }}>
                                    <Icon size={32} color={isLocked ? '#666' : t.color} />
                                </div>
                                {isLocked && <div className="badge" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #333' }}><Lock size={12} /> LOCKED</div>}
                            </div>

                            <div>
                                <h3 style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, marginBottom: 8 }}>
                                    {activeTournament ? activeTournament.name : t.name}
                                </h3>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>STATUS: <span style={{ color: 'white' }}>{isLocked ? 'UNAVAILABLE' : 'ACTIVE'}</span></div>
                                </div>
                            </div>

                            {isLocked ? (
                                <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                                    {t.req}
                                </div>
                            ) : (
                                <button className="btn btn-glass" style={{ width: '100%', borderColor: `${t.color}33`, marginTop: 'auto' }}>
                                    ENTER TOURNAMENT <ChevronRight size={16} />
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default TournamentHub;
