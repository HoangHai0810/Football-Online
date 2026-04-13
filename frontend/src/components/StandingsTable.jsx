import React from 'react';

const StandingsTable = ({ standings, userTeamName }) => {
    return (
        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th style={{ textAlign: 'left' }}>CLUB</th>
                        <th style={{ width: '60px' }}>P</th>
                        <th style={{ width: '60px' }}>W</th>
                        <th style={{ width: '60px' }}>D</th>
                        <th style={{ width: '60px' }}>L</th>
                        <th style={{ width: '60px' }}>GD</th>
                        <th style={{ width: '60px' }}>PTS</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((team, index) => {
                        const isUser = team.isUserTeam || team.userTeam;
                        const clubName = isUser ? (userTeamName || team.user?.clubName || 'My Club') : (team.aiClub?.name || 'AI Club');
                        const gd = team.goalsFor - team.goalsAgainst;
                        
                        return (
                            <tr key={team.id || index} className={isUser ? 'user-row' : ''}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className={`team-badge-circle sm ${isUser ? 'user-team' : ''}`} style={{ width: 32, height: 32, fontSize: 13 }}>
                                            {clubName[0]}
                                        </div>
                                        <span style={{ fontWeight: isUser ? 800 : 500, fontSize: 14 }}>
                                            {clubName}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{team.played}</td>
                                <td style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{team.won}</td>
                                <td style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{team.drawn}</td>
                                <td style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{team.lost}</td>
                                <td style={{ 
                                    fontFamily: "'Bebas Neue', sans-serif", 
                                    fontSize: 18,
                                    color: gd > 0 ? 'var(--success)' : gd < 0 ? 'var(--danger)' : 'white'
                                }}>
                                    {gd > 0 ? `+${gd}` : gd}
                                </td>
                                <td style={{ 
                                    fontFamily: "'Bebas Neue', sans-serif", 
                                    fontSize: 22, 
                                    color: 'var(--gold)',
                                    textShadow: isUser ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                                }}>
                                    {team.points}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StandingsTable;
