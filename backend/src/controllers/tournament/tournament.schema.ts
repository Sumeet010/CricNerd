import { z } from "zod";
import { PLAYING_FORMAT } from "../../constants/playingFormat.constant";
import { PLAYING_STATUS } from "../../constants/playingStatus.constant";

// startDate: z.iso.date()
// Logic error previosly used - 
// startDate: z.coerce.date().min(new Date(),{message: "You can't start a tournament in past"}),
// endDate: z.coerce.date().min(new Date(),{message: "You can't end a tournament in past"}),
export const tournamentSchema = z.object({
    name:z.string(),    
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    playingFormat: z.enum(PLAYING_FORMAT),
    playingStatus: z.enum(PLAYING_STATUS).default(PLAYING_STATUS[0]).optional()
})

export const updateTournamentSchema = z.object({
  tournamentName: z.string().min(1, { message: "Tournament name is required" }),
});

export const updateTournamentStatusSchema = z.object({
  playingStatus: z.enum(PLAYING_STATUS),
});
