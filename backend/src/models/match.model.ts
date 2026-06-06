import mongoose from "mongoose";
import { MATCH_STATUS } from "../constants/matchStatus.constant";

const matchSchema = new mongoose.Schema({
    tournamentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tournament",
        required:true
    },
    teamAId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true
    },
    teamBId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true
    },
    matchDate:{
        type: Date,
        required: true
    },
    matchStatus:{
        type: String,
        enum: MATCH_STATUS,
        default: MATCH_STATUS[0]
    },
    // Match Stats
    teamAScore:{
        type: Number,
        default: 0
    },
    teamAWickets:{
        type: Number,
        default: 0
    },
    teamABalls:{
        type:Number,
        default: 0
    },
    teamBScore:{
        type: Number,
        default: 0
    },
    teamBWickets:{
        type: Number,
        default: 0
    },
    teamBBalls:{
        type: Number,
        default: 0
    },
    winnerTeamId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        default: null
    }



},{timestamps:true})

export const Match = mongoose.model("Match", matchSchema);