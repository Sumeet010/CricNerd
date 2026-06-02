import mongoose  from "mongoose";
import { PLAYING_ROLES } from "../constants/playingRole.constant";

const playerSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        min: 10
    },
    playingRole:{
        type: String,
        enum: PLAYING_ROLES,
        required: true
    },
    // Career Stats
    tournamentWins:{
        type: Number,
        default: 0
    },
    totalRuns:{
        type: Number,
        default: 0
    },
    totalWickets:{
        type: Number,
        default: 0
    },
    highestRunsInMatch:{
        type: Number,
        default: 0
    },
    highestWicketsInMatch:{
        type:Number,
        default: 0
    }
},{timestamps:true})

export const Player =  mongoose.model("Player",playerSchema)