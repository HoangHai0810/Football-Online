import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import api from '../services/api';

const LeaderList = ({ title, icon: Icon, stats, type }) => (
    <div className="leader-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'rgba(255, 215, 0, 0.1)', borderRadius: 10, color: 'var(--gold)' }}>
                <Icon size={18} />
            </div>
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800 }}>{title}</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stats.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    Competition just started. Records will appear soon.
                </div>
            ) : (
                stats.map((item, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="stat-item-row"
                    >
                        <div className={`stat-rank ${index === 0 ? 'highlight-gold' : ''}`}>{index + 1}</div>
                        <div className="stat-player-info">
                            <div className="stat-player-name">{item.playerName}</div>
                            <div className="stat-player-club">{item.clubName}</div>
                        </div>
                        <div className="stat-value">{type === 'goals' ? item.goals : item.assists}</div>
                    </motion.div>
                ))
            )}
        </div>
    </div>
);

const TournamentLeaders = ({ tournamentId }) => {
    const [scorers, setScorers] = useState([]);
    const [assists, setAssists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tournamentId) return;
        setLoading(true);
        Promise.all([
            api.get(`/career/stats/${tournamentId}/scorers`),
            api.get(`/career/stats/${tournamentId}/assists`)
        ]).then(([scorersRes, assistsRes]) => {
            setScorers(scorersRes.data || []);
            setAssists(assistsRes.data || []);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch leaders", err);
            setLoading(false);
        });
    }, [tournamentId]);

    if (loading) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <LeaderList title="Golden Boot" icon={Target} stats={scorers} type="goals" />
            <LeaderList title="Assist Kings" icon={Zap} stats={assists} type="assists" />
        </div>
    );
};

export default TournamentLeaders;
