import { Request, Response } from "express";
import {
  createMatchSchema,
  getMatchSchema,
  updateMatchStatusSchema,
} from "./match.schema";
import { paramsSchema } from "../../schemas/params.schema";

import { Tournament } from "../../models/tournament.model";
import { Team } from "../../models/team.model";
import { validateMatchDate } from "../../services/validateMatchDate";
import { Match } from "../../models/match.model";
import { Ball } from "../../models/ball.model";
import { PlayerMatchStats } from "../../models/playerMatchStats.model";
import { Player } from "../../models/player.model";
import { getAccessibleTournamentIds } from "../../services/accessControl.service";
import mongoose from "mongoose";
import { getIO } from "../../services/socket.service";
import { getScorecardData } from "../../services/scorecard.service";

// helper fn
async function checkAndCompleteTournament(tournamentId: mongoose.Types.ObjectId | string) {
  const unfinishedMatches = await Match.countDocuments({
    tournamentId,
    matchStatus: { $ne: "COMPLETED" },
  });

  if (unfinishedMatches === 0) {
    await Tournament.findByIdAndUpdate(tournamentId, {
      playingStatus: "COMPLETED",
    });
  }
}

export async function createMatch(req: Request, res: Response) {
  try {
    const result = createMatchSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { tournamentId, teamAId, teamBId, matchDate, matchStatus } =
      result.data;

    // Check if same team match exist , and only create same teams matches when it SCHEDULED or COMPLETED , not in LIVE! 
    const liveMatchExist = await Match.findOne({
      tournamentId,
      matchStatus: "LIVE",
      $or: [
        { teamAId, teamBId },
        { teamAId: teamBId, teamBId: teamAId },
      ],
    });

    if (liveMatchExist) {
      return res.status(400).json({
        message: "Match already LIVE between these teams",
      });
    }

    if (teamAId === teamBId) {
      return res.status(409).json({
        message: "Same Team's cannot play against each other.",
      });
    }
    const tournamentExist = await Tournament.findById(tournamentId);
    const teamAExist = await Team.findById(teamAId);
    const teamBExist = await Team.findById(teamBId);

    if (!tournamentExist) {
      return res.status(404).json({
        message: "Tournament doesn't exist, can't create a match.",
      });
    }

    // Suppose team exist but team A === Team B
    if (!teamAExist || !teamBExist) {
      return res.status(404).json({
        message: "One or both teams do not exist.",
      });
    }

    const dateError = validateMatchDate(
      tournamentExist.startDate,
      tournamentExist.endDate,
      matchDate,
    );
    if (dateError) {
      return res.status(400).json({
        message: dateError,
      });
    }

    const match = await Match.create({
      tournamentId,
      teamAId,
      teamBId,
      matchDate,
      matchStatus,
    });

    return res.status(201).json({
      match,
      message: "Match created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMatches(req: Request, res: Response) {
  try {
    const result = getMatchSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }
    const { tournamentId } = result.data;
    const userId = (req as any).userId;

    const accessibleTournaments = await getAccessibleTournamentIds(userId);

    let filter: any = {};
    if (tournamentId) {
      if (!accessibleTournaments.includes(tournamentId.toString())) {
        return res.status(403).json({
          message: "Forbidden: You do not have access to this tournament's matches",
        });
      }
      filter = { tournamentId };
    } else {
      filter = { tournamentId: { $in: accessibleTournaments } };
    }

    const allMatches = await Match.find(filter).lean();

    return res.status(200).json({
      allMatches,
      message: "Matches fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMatchById(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;
    const userId = (req as any).userId;

    const matchExist = await Match.findById(id).lean();

    if (!matchExist) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const accessibleTournaments = await getAccessibleTournamentIds(userId);
    if (!accessibleTournaments.includes(matchExist.tournamentId.toString())) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this match",
      });
    }

    return res.status(200).json({
      matchExist,
      message: "Match fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteMatch(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        message: "Match doesn't exist",
      });
    }

    if (match.matchStatus !== "SCHEDULED") {
      return res.status(400).json({
        message: "Only scheduled matches can be deleted",
      });
    }

    await match.deleteOne();

    return res.status(200).json({
      match,
      message: "Match deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateMatchStatus(req: Request, res: Response) {
  try {
    const result = updateMatchStatusSchema.safeParse(req.body);
    const params = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    if (!params.success) {
      return res.status(400).json({
        error: params.error,
      });
    }

    const { matchStatus } = result.data;
    const { id } = params.data;
    const match = await Match.findById(id);

    if (!match) {
      return res.status(400).json({
        message: "Match not found",
      });
    }

    if (match.matchStatus === "COMPLETED") {
      return res.status(400).json({
        message: "Match is already completed",
      });
    }

    if (match.matchStatus === "SCHEDULED" && matchStatus !== "LIVE") {
      return res.status(400).json({
        message: "Match must go LIVE before it can be completed",
      });
    }

    if (match.matchStatus === "LIVE" && matchStatus !== "COMPLETED") {
      return res.status(400).json({
        message: "Invalid status transition",
      });
    }

    await Match.updateOne({ _id: id }, { matchStatus });

    if (matchStatus === "COMPLETED") {
      await checkAndCompleteTournament(match.tournamentId);
    }

    try {
      const io = getIO();
      const scorecardData = await getScorecardData(id);
      if (scorecardData) {
        io.emit("scorecardUpdate", scorecardData);
      }
    } catch (socketErr) {
      console.error("Socket emit error in updateMatchStatus:", socketErr);
    }

    return res.status(200).json({
      message: `Match status updated to ${matchStatus}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getScorecard(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;
    const userId = (req as any).userId;

    const match = await Match.findById(id)
      .populate("teamAId teamBId", "teamName")
      .lean();

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const accessibleTournaments = await getAccessibleTournamentIds(userId);
    if (!accessibleTournaments.includes(match.tournamentId.toString())) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this scorecard",
      });
    }

    const matchScore = {
      teamA: {
        teamName: (match?.teamAId as any).teamName,
        teamAScore: match?.teamAScore,
        teamAWickets: match?.teamAWickets,
        teamABalls: match?.teamABalls,
      },
      teamB: {
        teamName: (match?.teamBId as any).teamName,
        teamBScore: match?.teamBScore,
        teamBWickets: match?.teamBWickets,
        teamBBalls: match?.teamBBalls,
      },
    };

    const battingStats = await PlayerMatchStats.find({
      matchId: id,
      ballsFaced: { $gt: 0 },
    })
      .populate("playerId", "fullName")
      .lean();

    const batters = battingStats.map((p) => ({
      playerName: (p.playerId as any).fullName,
      runs: p.runs,
      balls: p.ballsFaced,
      // strikeRate
    }));

    const bowlingStats = await PlayerMatchStats.find({
      matchId: id,
      ballsBowled: { $gt: 0 },
    })
      .populate("playerId", "fullName")
      .lean();

    const bowlers = bowlingStats.map((p) => ({
      playerName: (p.playerId as any).fullName,
      wickets: p.wicketsTaken,
      runsConceded: p.runsConceded,
      overs: Math.floor(p.ballsBowled / 6) + "." + (p.ballsBowled % 6),
    }));

    const allBalls = await Ball.find({ matchId: id }).lean();
    const dismissedPlayerIds = allBalls
      .filter((b) => b.isWicket && b.dismissedPlayerId)
      .map((b) => b.dismissedPlayerId!.toString());

    const recentBalls = await Ball.find({ matchId: id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    // Reverse it later
    const ballsCommentary = recentBalls.map((b) => {
      if (b.isWicket) return "W";
      if (b.extraType !== "NONE") return b.extraType;
      return b.runsOffBat;
    });

    return res.status(200).json({
      matchScore,
      batters,
      bowlers,
      ballsCommentary,
      allBalls,
      dismissedPlayerIds,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function endMatch(req: Request, res: Response) {
  try {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { id } = result.data;

    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.matchStatus === "COMPLETED") {
      return res.status(400).json({
        message: "Match already completed",
      });
    }

    if (match.matchStatus !== "LIVE") {
      return res.status(400).json({
        message: "Match must be LIVE to end",
      });
    }

    // No Draw case added yet!
    let winnerTeamId;
    if (match.teamAScore > match.teamBScore) {
      winnerTeamId = match.teamAId;
    } else if (match.teamBScore > match.teamAScore) {
      winnerTeamId = match.teamBId;
    } else {
      winnerTeamId = null;
    }

    await Match.updateOne(
      { _id: id },
      {
        winnerTeamId: winnerTeamId,
        matchStatus: "COMPLETED",
      },
    );
    if (winnerTeamId) {
      await Team.updateOne(
        { _id: winnerTeamId },
        {
          $inc: { tournamentWins: 1 },
        },
      );
    }

    // Check if all tournament matches are now completed → auto-complete tournament
    await checkAndCompleteTournament(match.tournamentId);

    // Updating Indiviual Player Stats
    const playerStats = await PlayerMatchStats.find({ matchId: id });

    // playerStats.forEach((p)=>{
    //   await Player.findByIdAndUpdate({p.playerId},{

    //   })
    // })
    for (const player of playerStats) {
      await Player.updateOne(
        { _id: player.playerId },
        {
          $inc: {
            totalRuns: player.runs,
            totalWickets: player.wicketsTaken,
          },
          $max: {
            highestRunsInMatch: player.runs,
            highestWicketsInMatch: player.wicketsTaken,
          },
        },
      );
    }

    try {
      const io = getIO();
      const scorecardData = await getScorecardData(id);
      if (scorecardData) {
        io.emit("scorecardUpdate", scorecardData);
      }
    } catch (socketErr) {
      console.error("Socket emit error in endMatch:", socketErr);
    }

    return res.status(200).json({
      winnerTeamId,
      message: "Match Completed Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
