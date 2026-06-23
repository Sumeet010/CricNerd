import { Request, Response, NextFunction } from "express";
import { Tournament } from "../models/tournament.model";
import { Player } from "../models/player.model";
import { PlayerTeamTournament } from "../models/playerTeamTournament.model";


// next time use CASL!!
export async function attachAccessibleTournaments(req: Request, res: Response, next: NextFunction) {
  
  try {
    const userId = (req as any).userId;

    const organizedTournaments = await Tournament.find({ organizerId: userId }).select("_id").lean();
    const organizedIds = organizedTournaments.map((t) => t._id.toString());

    const player = await Player.findOne({ userId }).lean();
    let playerTournaments: string[] = [];
    if (player) {
      const playerSquads = await PlayerTeamTournament.find({ playerId: player._id }).select("tournamentId").lean();
      playerTournaments = playerSquads.map((s) => s.tournamentId.toString());
    }

    (req as any).accessibleTournamentIds = Array.from(new Set([...organizedIds, ...playerTournaments]));
    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}
