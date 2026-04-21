import React from 'react';
import { motion } from 'framer-motion';

const ROUND_TITLES = {
    2: "ROUND OF 16",
    12: "QUARTER FINALS",
    22: "SEMI FINALS",
    32: "GRAND FINAL"
};

const TournamentBracket = ({ fixtures, userClubName }) => {
    // Group fixtures by matchWeek
    const rounds = fixtures.reduce((acc, fixture) => {
        const week = fixture.matchWeek;
        if (!acc[week]) acc[week] = [];
        acc[week].push(fixture);
        return acc;
    }, {});

    // Sort weeks
    const sortedWeeks = Object.keys(rounds).map(Number).sort((a, b) => a - b);

    const getInitials = (name = "") => {
        if (!name) return "?";
        const parts = name.split(" ");
        return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.charAt(0).toUpperCase();
    };

    const TeamRow = ({ teamName, score, isUser, isWinner, isPlayed }) => (
        <div className={`bracket-team-row ${isUser ? 'is-user-team' : ''} ${isWinner ? 'is-winner' : ''}`}>
            <div className="bracket-team-info">
                <div className="bracket-team-badge">
                    {getInitials(teamName)}
                </div>
                <div className="bracket-team-name">{teamName || 'TBD'}</div>
            </div>
            {isPlayed && <div className="bracket-score">{score}</div>}
        </div>
    );

    return (
        <div className="tournament-bracket-container">
            {sortedWeeks.map((week, roundIdx) => {
                const roundFixtures = rounds[week];
                const roundTitle = ROUND_TITLES[week] || `ROUND ${week}`;
                const isLastRound = roundIdx === sortedWeeks.length - 1;

                return (
                    <div key={week} className="bracket-round">
                        <div className="bracket-round-title">{roundTitle}</div>
                        
                        {roundFixtures.map((fixture, matchIdx) => {
                            const homeName = fixture.homeIsUser ? userClubName : fixture.homeAiClub?.name;
                            const awayName = fixture.awayIsUser ? userClubName : fixture.awayAiClub?.name;
                            const isUserMatch = fixture.homeIsUser || fixture.awayIsUser;
                            
                            const homeWinner = fixture.played && fixture.homeScore > fixture.awayScore;
                            const awayWinner = fixture.played && fixture.awayScore > fixture.homeScore;

                            return (
                                <div key={fixture.id} className="bracket-match-wrapper">
                                    {/* Inbound connector except for first round */}
                                    {roundIdx > 0 && <div className="bracket-connector-in" />}

                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: roundIdx * 0.2 + matchIdx * 0.05 }}
                                        className={`bracket-match-card ${isUserMatch ? 'is-user-match' : ''}`}
                                    >
                                        <TeamRow 
                                            teamName={homeName} 
                                            score={fixture.homeScore} 
                                            isUser={fixture.homeIsUser} 
                                            isWinner={homeWinner} 
                                            isPlayed={fixture.played}
                                        />
                                        <TeamRow 
                                            teamName={awayName} 
                                            score={fixture.awayScore} 
                                            isUser={fixture.awayIsUser} 
                                            isWinner={awayWinner} 
                                            isPlayed={fixture.played}
                                        />
                                    </motion.div>

                                    {/* Outbound connectors to next round matches */}
                                    {!isLastRound && (
                                        <div className="bracket-connector-out">
                                            <div className="bracket-connector-line line-horizontal" style={{ width: '30px' }} />
                                            <div className="bracket-connector-line line-vertical" style={{ 
                                                height: 'calc(50% + 2px)', 
                                                top: matchIdx % 2 === 0 ? '50%' : 'auto',
                                                bottom: matchIdx % 2 === 0 ? 'auto' : '50%',
                                                left: '30px'
                                            }} />
                                            <div className="bracket-connector-line line-horizontal" style={{ width: '30px', left: '30px', top: matchIdx % 2 === 0 ? '100%' : '0' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default TournamentBracket;
