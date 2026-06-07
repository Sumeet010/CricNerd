import { z } from "zod";

export const teamSchema = z.object({
    name: z.string().trim(),
    tournamentId:z.string().length(24)
}) 