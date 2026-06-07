import { z } from "zod";
import { MATCH_STATUS } from "../../constants/matchStatus.constant";

export const createMatchSchema = z.object({
    tournamentId: z.string().length(24),
    teamAId: z.string().length(24),
    teamBId: z.string().length(24),
    matchDate: z.coerce.date(),
    matchStatus: z.enum(MATCH_STATUS).default(MATCH_STATUS[0])
})

export const getMatchSchema = z.object({
  tournamentId: z.string().length(24).optional()
})

export const updateMatchStatusSchema = z.object({
  matchStatus: z.enum(MATCH_STATUS),
});
