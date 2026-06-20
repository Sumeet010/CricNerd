import mongoose, { Mongoose } from "mongoose";

import { PLAYING_FORMAT } from "../constants/playingFormat.constant"
import { PLAYING_STATUS } from "../constants/playingStatus.constant";

const tournamentSchema = new mongoose.Schema({
    organizerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },
    tournamentName:{
        type: String,
        required: true
    },
   startDate:{
        type: Date,
        min: Date.now(),
        required: true
   },
   endDate:{
        type: Date,
        min: Date.now(),
        required: true
   },
   playingFormat:{
        type: String,
        enum: PLAYING_FORMAT,
        required: true
   },
   playingStatus:{
    type: String,
    enum: PLAYING_STATUS,
    default: PLAYING_STATUS[0]
   }
})

export const Tournament = mongoose.model("Tournament", tournamentSchema);