# Player Module
player.controller.ts
- addPlayer ✅
- getPlayers ✅
- getPlayerById ✅
- updatePlayer (Later)
- deletePlayer ✅

# Team Module
team.model.ts
- teamName
- No.players in that team (min 5)
- Each player details 
- no. of tournament wins by the team 
- total matches played by team

team.controller.ts
- addTeam ✅
- getTeams ✅
- getTeamById ✅
- updateTeam (later)
- deleteTeam ✅


# Tournament Module
tournament.model.ts
- name ✅
- startDate ✅
- endDate ✅
- format (T20 / ODI / TEST)   // optional ✅
- status (UPCOMING / ONGOING / COMPLETED) ✅
- winnerTeamId (optional)

tournament.controller.ts
- addTournament ✅
- getTournaments ✅
- getTournamentById ✅
- updateTournament (Later)
- deleteTournament ✅

playerTeamTournament.controller.ts
- assignPlayerToTeam ✅
- removePlayerFromTeam ✅
- getTeamSquad ✅  // uss team ka uss tournament ke liye squad
- getPlayerTournamentTeam ✅

# Match Controller
match.controller.ts
- createMatch ✅ 
- getMatches ✅ 
- getMatchById ✅
- updateMatchStatus (Later)
- deleteMatch ✅
NOTE - creating multiple matches of same teams in a tournament do not exist now  (Later)


# Ball module

Ball ✅
- matchId
- battingTeamId
- bowlingTeamId
- strikerId
- bowlerId
- runs (0–6)
- isWicket (boolean)
- dismissedPlayerId (optional)
- overNumber
- ballNumber
NOTE - MongoDB Transaction is not used yet
- Ball.create
- PlayerMatchStats.update
- Match.update

# IMP 
- Check playingFormat and over number ✅


# Remaining IMP 
- getScorecard API ✅
- endMatch controller ✅
    - Update Each Player career stats ✅

# getScorecard API ✅

- Match info 
- Current score
- Overs
- Batters stats
- Bowlers stats
- Recent balls


# Future Updates 

- getMatchSummary

` {
  "winner": "Warriors",
  "teamAScore": "92/6",
  "teamBScore": "78/5",
  "topBatter": "Rahul",
  "topBowler": "Arjun"
}`

- getRecentBalls
    directly

- Add teamOwnership, matchOwnerShip, ballOwnership middlewares

# Minor Error 
- Prevent overNumber skipping
- New Batter Validation After Wicket ✅
- Consecutive Bowler Validtion ✅
- Innings Logic
- Target Chase Logic


