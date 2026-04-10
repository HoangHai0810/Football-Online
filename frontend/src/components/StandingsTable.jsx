import React from 'react';

const StandingsTable = ({ standings, userTeamName = "FC ARENA" }) => {
  return (
    <div className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.05)', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
            <th style={{ padding: '16px 20px' }}>Pos</th>
            <th style={{ padding: '16px 20px' }}>Club</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>P</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>W</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>D</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>L</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>GD</th>
            <th style={{ padding: '16px 20px', textAlign: 'center' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const isUser = s.userTeam;
            const clubName = isUser ? userTeamName : s.aiClub?.name;
            const pos = i + 1;
            
            // Highlight zones
            let rowStyle = { borderBottom: '1px solid rgba(255,255,255,0.05)' };
            if (isUser) rowStyle.background = 'rgba(240,195,45,0.1)';
            
            let posColor = 'var(--text-secondary)';
            if (pos <= 4) posColor = '#4fcaff'; // Champions League
            if (pos > standings.length - 3) posColor = '#ff4f4f'; // Relegation
            
            return (
              <tr key={s.id} style={rowStyle}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: posColor }}>{pos}</td>
                <td style={{ padding: '14px 20px', fontWeight: isUser ? 700 : 400 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: 6, 
                      background: isUser ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10
                    }}>
                      {clubName[0]}
                    </div>
                    {clubName}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>{s.played}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>{s.won}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>{s.drawn}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>{s.lost}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    {s.goalsFor - s.goalsAgainst > 0 ? `+${s.goalsFor - s.goalsAgainst}` : s.goalsFor - s.goalsAgainst}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: isUser ? 'var(--gold)' : 'white' }}>
                  {s.points}
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
