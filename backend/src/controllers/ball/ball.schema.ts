import { z } from "zod"
import { EXTRA_TYPES } from "../../constants/extraTypes.constant"
import { WICKET_TYPES } from "../../constants/wicketTypes.constant"

export const ballSchema = z.object({
    matchId: z.string().length(24),

    battingTeamId: z.string().length(24),
    bowlingTeamId: z.string().length(24),
    
    strikerId: z.string().length(24),
    bowlerId: z.string().length(24),
    
    overNumber: z.number().int().nonnegative(),
    ballNumber: z.number().int().positive(),
    
    runsOffBat: z.number().int().nonnegative().default(0),
    extraRuns: z.number().int().nonnegative().default(0),
    // isLegalDelivery: z.boolean().default(true), 
    extraType: z.enum(EXTRA_TYPES).default("NONE"),
    
    isWicket: z.boolean().default(false),
    dismissedPlayerId: z.string().length(24).optional(),
    wicketType: z.enum(WICKET_TYPES).optional()
})

export const undoBallSchema = z.object({
    matchId: z.string().length(24),
})