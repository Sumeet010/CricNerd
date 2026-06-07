import { Request, Response, NextFunction } from "express";
import { Team } from "../models/team.model";
import { Tournament } from "../models/tournament.model";

export async function requireTeamOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teamId = req.params.id || req.body.teamId;

    if (!teamId) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const tournament = await Tournament.findById(team.tournamentId);

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