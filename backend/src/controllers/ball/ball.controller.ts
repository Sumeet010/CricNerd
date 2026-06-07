import { Request, Response } from "express";

import { ballSchema, undoBallSchema } from "./ball.schema";

import { Match } from "../../models/match.model";
import { Team } from "../../models/team.model";
import { PlayerTeamTournament } from "../../models/playerTeamTournament.model";
import { Player } from "../../models/player.model";
import { Ball } from "../../models/ball.model";
import { PlayerMatchStats } from "../../models/playerMatchStats.model";
import { Tournament } from "../../models/tournament.model";

export async function addBall(req: Request, res: Response) {
  try {
    const result = ballSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const {
      matchId,
      battingTeamId,
      bowlingTeamId,
      strikerId,
      bowlerId,
      extraType,
      overNumber,
      ballNumber,
      runsOffBat,
      extraRuns,
      isWicket,
      dismissedPlayerId,
      wicketType,
    } = result.data;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.matchStatus !== "LIVE") {
      return res.status(400).json({
        message: "Match is not live yet to be played!",
      });
    }

    // Newly added for over limit from frontend
    const tournament = await Tournament.findById(match.tournamentId);
    let maxOvers = 20;
    if (tournament) {
      if (tournament.playingFormat === "5 Overs") maxOvers = 5;
      else if (tournament.playingFormat === "6 Overs") maxOvers = 6;
      else if (tournament.playingFormat === "20 Overs") maxOvers = 20;
    }

    if (overNumber > maxOvers) {
      return res.status(400).json({
        message: `Cannot record ball. Over limit of ${maxOvers} reached for this match format.`,
      });
    }
    // -- Player existance and their team details --

    // Finding team if they exist
    const battingTeam = await Team.findById(battingTeamId);
    const bowlingTeam = await Team.findById(bowlingTeamId);

    if (!battingTeam || !bowlingTeam) {
      return res.status(404).json({
        message: "Batting or Bowling team doesn't exist",
      });
    }

    const teamAId = match.teamAId.toString();
    const teamBId = match.teamBId.toString();

    const validCombination =
      (teamAId === battingTeamId && teamBId === bowlingTeamId) ||
      (teamAId === bowlingTeamId && teamBId === battingTeamId);

    if (!validCombination) {
      return res.status(400).json({
        message: "Batting/Bowling teams do not belong to this match",
      });
    }

    //Logic - Stoping match when team is all out
    let currentWickets;
    if (battingTeamId === teamAId) {
      currentWickets = match.teamAWickets;
    } else {
      currentWickets = match.teamBWickets;
    }

    const battingSquadSize = await PlayerTeamTournament.countDocuments({
      teamId: battingTeamId,
      tournamentId: match.tournamentId,
    });

    const maxWickets = battingSquadSize > 0 ? battingSquadSize : 10;

    if (currentWickets >= maxWickets) {
      return res.status(400).json({
        message: `Cannot record ball. Batting team is already all out (${currentWickets}/${maxWickets} wickets).`,
      });
    }

    // Enforcing target check in second innings
    const isTeamABatting = battingTeamId === teamAId; // Can return true or false
    const otherTeamBalls = isTeamABatting ? match.teamBBalls : match.teamABalls;
    const otherTeamScore = isTeamABatting ? match.teamBScore : match.teamAScore;
    const currentBattingScore = isTeamABatting ? match.teamAScore : match.teamBScore;

    const isSecondInnings = otherTeamBalls > 0;

    if (isSecondInnings && currentBattingScore >= otherTeamScore + 1) {
      return res.status(400).json({
        message: `Cannot record ball. Target of ${otherTeamScore + 1} has already been chased.`,
      });
    }

    const striker = await Player.findById(strikerId);
    const bowler = await Player.findById(bowlerId);

    if (!striker || !bowler) {
      return res.status(404).json({
        message: "Striker or bowler does not exist",
      });
    }

    // Check if the striker / bowler actually are in the team
    const strikerAssignment = await PlayerTeamTournament.findOne({
      playerId: strikerId,
      teamId: battingTeamId,
      tournamentId: match.tournamentId,
    });

    if (!strikerAssignment) {
      return res.status(400).json({
        message: "Striker does not belong to batting team in this tournament",
      });
    }

    const bowlerAssignment = await PlayerTeamTournament.findOne({
      playerId: bowlerId,
      teamId: bowlingTeamId,
      tournamentId: match.tournamentId,
    });

    if (!bowlerAssignment) {
      return res.status(400).json({
        message: "Bowler does not belong to bowling team in this tournament",
      });
    }

    // Will find a collection from Ball where isWicket will be true for the provided strikerId which is already dismissed
    const isPlayerAlreadyDismissed = await Ball.findOne({
      matchId,
      dismissedPlayerId: strikerId,
      isWicket: true,
    });

    if (isPlayerAlreadyDismissed) {
      return res.status(400).json({
        message: "Player is already dismissed.",
      });
    }
    // -- Handling Wickets --
    if (isWicket) {
      if (!dismissedPlayerId || !wicketType) {
        return res.status(400).json({
          message:
            "dismissedPlayerId and wicketType are required when isWicket is true",
        });
      }
      if (dismissedPlayerId !== strikerId) {
        return res.status(400).json({
          message: "Only striker can be dismissed",
        });
      }
    } else {
      if (dismissedPlayerId || wicketType) {
        return res.status(400).json({
          message: "Wicket details provided but isWicket is false",
        });
      }
    }

    // -- Handling all kind of Ball events
    let isLegalDelivery = true;
    if (extraType === "WIDE" || extraType === "NO_BALL") {
      isLegalDelivery = false;
    }
    // EP - Change this Logic 
    if (extraType === "WIDE" && runsOffBat > 0) {
      return res.status(400).json({
        message: "Runs off bat cannot be recorded on a wide ball",
      });
    }

    const existingBallsInOver = await Ball.find({
      matchId,
      battingTeamId,
      overNumber,
    }).sort({ createdAt: 1 });

    const legalBallCount = existingBallsInOver.filter(
      (ball) => ball.isLegalDelivery,
    ).length;

    if (legalBallCount === 6) {
      return res.status(400).json({
        message: "Over already completed",
      });
    }

    // Checking server-side validations
    let expectedBallNumber: number;

    // no balls yet in this over
    if (existingBallsInOver.length === 0) {
      expectedBallNumber = 1;
    }
    // If there is last ball
    else {
      const lastBall = existingBallsInOver[existingBallsInOver.length - 1];

      // Normal ball
      if (lastBall.isLegalDelivery) {
        expectedBallNumber = lastBall.ballNumber + 1;
      }
      // Wide or noball
      else {
        expectedBallNumber = lastBall.ballNumber;
      }
    }

    // Validataing client-side against server-side validation
    if (ballNumber !== expectedBallNumber) {
      return res.status(400).json({
        message: `Invalid ball number. Expected ${expectedBallNumber}`,
      });
    }

    // Prevent same bowler from bowling consecutive overs
    if (ballNumber === 1 && overNumber > 1) {
      const previousOverBalls = await Ball.find({
        matchId,
        battingTeamId,
        overNumber: overNumber - 1,
        isLegalDelivery: true,
      });

      if (previousOverBalls.length < 6) {
        return res.status(400).json({
          message: "Previous over is not completed",
        });
      }

      const previousBowler =
        previousOverBalls[previousOverBalls.length - 1].bowlerId;

      if (previousBowler.toString() === bowlerId) {
        return res.status(400).json({
          message: "Bowler cannot bowl consecutive overs",
        });
      }
    }

    const newBall = await Ball.create({
      matchId,
      battingTeamId,
      bowlingTeamId,
      strikerId,
      bowlerId,
      overNumber,
      ballNumber,
      runsOffBat,
      extraRuns,
      extraType,
      isLegalDelivery,
      isWicket,
      dismissedPlayerId,
      wicketType,
    });

    // Note - after creation of a ball, player stats are getting immediately updated per ball !!

    // -- Player Stats --
    // Batter
    if (extraType !== "WIDE") {
      await PlayerMatchStats.updateOne(
        {
          matchId,
          playerId: strikerId,
        },
        {
          $inc: {
            runs: runsOffBat,
            ballsFaced: 1,
          },
        },
        { upsert: true },
      );
    }

    // Bowler

    const runsConceded = runsOffBat + extraRuns;

    await PlayerMatchStats.updateOne(
      {
        matchId,
        playerId: bowlerId,
      },
      {
        $inc: {
          runsConceded,
          ballsBowled: isLegalDelivery ? 1 : 0,
          wicketsTaken: isWicket ? 1 : 0,
          // Add more stats
        },
      },
      { upsert: true },
    );

    // -- Match Stats --

    const totalRunsThisBall = runsOffBat + extraRuns;

    if (battingTeamId === match.teamAId.toString()) {
      await Match.updateOne(
        {
          _id: matchId,
        },
        {
          $inc: {
            teamAScore: totalRunsThisBall,
            teamAWickets: isWicket ? 1 : 0,
            teamABalls: isLegalDelivery ? 1 : 0,
          },
        },
      );
    } else {
      await Match.updateOne(
        {
          _id: matchId,
        },
        {
          $inc: {
            teamBScore: totalRunsThisBall,
            teamBWickets: isWicket ? 1 : 0,
            teamBBalls: isLegalDelivery ? 1 : 0,
          },
        },
      );
    }

    // AI Gene
    // Fetch the updated Match document to check if the innings/match has completed
    const updatedMatch = await Match.findById(matchId);
    if (updatedMatch && isSecondInnings) {
      const newScore = isTeamABatting ? updatedMatch.teamAScore : updatedMatch.teamBScore;
      const newWickets = isTeamABatting ? updatedMatch.teamAWickets : updatedMatch.teamBWickets;
      const newBalls = isTeamABatting ? updatedMatch.teamABalls : updatedMatch.teamBBalls;

      const isChasingTeamWin = newScore >= otherTeamScore + 1;
      const isChasingTeamAllOut = newWickets >= maxWickets;
      const isChasingTeamOversEnd = newBalls >= maxOvers * 6;

      if (isChasingTeamWin || isChasingTeamAllOut || isChasingTeamOversEnd) {
        let winnerTeamId = null;
        if (newScore > otherTeamScore) {
          winnerTeamId = battingTeamId;
        } else if (newScore < otherTeamScore) {
          winnerTeamId = bowlingTeamId;
        }

        await Match.updateOne(
          { _id: matchId },
          {
            winnerTeamId,
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

        // Updating Individual Player Career Stats
        const playerStats = await PlayerMatchStats.find({ matchId });
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
      }
    }

    return res.status(201).json({
      newBall,
      message: "Ball recorded successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function undoLastBall(req: Request, res: Response) {
  try {
    const result = undoBallSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    const { matchId } = result.data;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (match.matchStatus !== "LIVE") {
      return res.status(400).json({
        message: "Match is not live. Cannot undo delivery.",
      });
    }

    // Find the last ball recorded for this match
    const lastBall = await Ball.findOne({ matchId }).sort({ createdAt: -1 });

    if (!lastBall) {
      return res.status(404).json({
        message: "No deliveries to undo in this match",
      });
    }

    // 1. Revert Batter Stats
    if (lastBall.extraType !== "WIDE") {
      await PlayerMatchStats.updateOne(
        {
          matchId,
          playerId: lastBall.strikerId,
        },
        {
          $inc: {
            runs: -lastBall.runsOffBat,
            ballsFaced: -1,
          },
        }
      );
    }

    // 2. Revert Bowler Stats
    const runsConceded = lastBall.runsOffBat + lastBall.extraRuns;
    await PlayerMatchStats.updateOne(
      {
        matchId,
        playerId: lastBall.bowlerId,
      },
      {
        $inc: {
          runsConceded: -runsConceded,
          ballsBowled: lastBall.isLegalDelivery ? -1 : 0,
          wicketsTaken: lastBall.isWicket ? -1 : 0,
        },
      }
    );

    // 3. Revert Match Stats
    const totalRunsThisBall = lastBall.runsOffBat + lastBall.extraRuns;
    if (lastBall.battingTeamId.toString() === match.teamAId.toString()) {
      await Match.updateOne(
        {
          _id: matchId,
        },
        {
          $inc: {
            teamAScore: -totalRunsThisBall,
            teamAWickets: lastBall.isWicket ? -1 : 0,
            teamABalls: lastBall.isLegalDelivery ? -1 : 0,
          },
        }
      );
    } else {
      await Match.updateOne(
        {
          _id: matchId,
        },
        {
          $inc: {
            teamBScore: -totalRunsThisBall,
            teamBWickets: lastBall.isWicket ? -1 : 0,
            teamBBalls: lastBall.isLegalDelivery ? -1 : 0,
          },
        }
      );
    }

    // 4. Delete the last ball
    await Ball.findByIdAndDelete(lastBall._id);

    return res.status(200).json({
      message: "Last delivery undone successfully",
      undoneBall: lastBall,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
