import mongoose from "mongoose";

const playerMatchStatsSchema = new mongoose.Schema({
    matchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    playerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },

    // Batting
    runs:{
        type: Number,
        default: 0 
    },
    ballsFaced:{
        type: Number,
        default: 0
    },

    // Bowler
    ballsBowled:{
        type: Number,
        default: 0
    },
    runsConceded:{
        type: Number,
        default: 0
    },
    wicketsTaken:{
        type: Number,
        default: 0
    }
},{timestamps: true})

playerMatchStatsSchema.index(
  { matchId: 1, playerId: 1 },
  { unique: true }
);

export const PlayerMatchStats = mongoose.model("PlayerMatchStats", playerMatchStatsSchema)