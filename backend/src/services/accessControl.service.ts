import { Tournament } from "../models/tournament.model";
import { Player } from "../models/player.model";
import { PlayerTeamTournament } from "../models/playerTeamTournament.model";

/**
 * Returns all tournament IDs that the given user has permission to access.
 * An organizer has access to tournaments they created.
 * A player has access to tournaments where they are registered in a team squad.
 */
export async function getAccessibleTournamentIds(userId: string): Promise<string[]> {
  // 1. Tournaments created by the user as organizer
  const organizedTournaments = await Tournament.find({ organizerId: userId }).select("_id").lean();
  const organizedIds = organizedTournaments.map((t) => t._id.toString());

  // 2. Tournaments where the user is a registered player
  const player = await Player.findOne({ userId }).lean();
  let playerTournaments: string[] = [];
  if (player) {
    const playerSquads = await PlayerTeamTournament.find({ playerId: player._id }).select("tournamentId").lean();
    playerTournaments = playerSquads.map((s) => s.tournamentId.toString());
  }

  // Combine both sets
  return Array.from(new Set([...organizedIds, ...playerTournaments]));
}
