import mongoose  from "mongoose";
import { PLAYING_ROLES } from "../constants/playingRole.constant";

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
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

// Users with accounts can still only have one player profile,
// but organizer-created players (userId: null or missing) are allowed without conflict
playerSchema.index(
  { userId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { userId: { $type: "objectId" } } 
  }
);

export const Player =  mongoose.model("Player",playerSchema)