import { Match } from "../models/match.model";
import { Ball } from "../models/ball.model";
import { PlayerMatchStats } from "../models/playerMatchStats.model";

export async function getScorecardData(matchId: string) {
  const match = await Match.findById(matchId)
    .populate("teamAId teamBId", "teamName")
    .lean();

  if (!match) {
    return null;
  }

  const matchScore = {
    teamA: {
      teamName: (match?.teamAId as any)?.teamName || "Team A",
      teamAScore: match?.teamAScore || 0,
      teamAWickets: match?.teamAWickets || 0,
      teamABalls: match?.teamABalls || 0,
    },
    teamB: {
      teamName: (match?.teamBId as any)?.teamName || "Team B",
      teamBScore: match?.teamBScore || 0,
      teamBWickets: match?.teamBWickets || 0,
      teamBBalls: match?.teamBBalls || 0,
    },
  };

  const battingStats = await PlayerMatchStats.find({
    matchId,
    ballsFaced: { $gt: 0 },
  })
    .populate("playerId", "fullName")
    .lean();

  const batters = battingStats.map((p: any) => ({
    playerName: p.playerId?.fullName || "Unknown",
    runs: p.runs,
    balls: p.ballsFaced,
  }));

  const bowlingStats = await PlayerMatchStats.find({
    matchId,
    ballsBowled: { $gt: 0 },
  })
    .populate("playerId", "fullName")
    .lean();

  const bowlers = bowlingStats.map((p: any) => ({
    playerName: p.playerId?.fullName || "Unknown",
    wickets: p.wicketsTaken,
    runsConceded: p.runsConceded,
    overs: Math.floor(p.ballsBowled / 6) + "." + (p.ballsBowled % 6),
  }));

  const allBalls = await Ball.find({ matchId }).lean();
  const dismissedPlayerIds = allBalls
    .filter((b) => b.isWicket && b.dismissedPlayerId)
    .map((b) => b.dismissedPlayerId!.toString());

  const recentBalls = await Ball.find({ matchId })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const ballsCommentary = recentBalls.map((b) => {
    if (b.isWicket) return "W";
    if (b.extraType !== "NONE") return b.extraType;
    return b.runsOffBat;
  });

  return {
    matchId: match._id.toString(),
    matchStatus: match.matchStatus,
    winnerTeamId: match.winnerTeamId,
    matchScore,
    batters,
    bowlers,
    ballsCommentary,
    allBalls,
    dismissedPlayerIds,
  };
}
