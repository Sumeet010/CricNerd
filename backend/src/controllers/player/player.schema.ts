import {z} from "zod";
import { PLAYING_ROLES } from "../../constants/playingRole.constant";

export const playerSchema = z.object({
    name: z.string().trim(),
    age: z.number().min(12,{message:"Player age must be greater 12 to play a tournament"}).max(70,{
        message:"Player age must be less than 70 to play a tournament"
    }),
    playingRole: z.enum(PLAYING_ROLES)
})
