import { z } from "zod";

export const inviteSchema = z.object({
    tournamentId: z.string().length(24),
    teamId: z.string().length(24)
})