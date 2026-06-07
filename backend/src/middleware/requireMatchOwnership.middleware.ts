import { Request, Response, NextFunction } from "express";
import { Match } from "../models/match.model";
import { Tournament } from "../models/tournament.model";

export async function requireMatchOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = req.params.id || req.body.matchId;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const tournament = await Tournament.findById(
      match.tournamentId
    );

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (
      tournament.organizerId.toString() !==
      (req as any).userId
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}