import { z } from "zod";

export const assignPlayerToTeamSchema = z.object({
    tournamentId: z.string().length(24),
    // temp fix for getPlayerTournamentTeam
    teamId: z.string().length(24).optional(),
    // Temp fix for getTeamSquad
    playerId: z.string().length(24).optional()
});
