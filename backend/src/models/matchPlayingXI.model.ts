// Scraped for now

import mongoose from "mongoose";

const matchPlayingXISchema = new mongoose.Schema({
    playerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },
    teamId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    matchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    }
},{timestamps:true});

export const MatchPlayingXI = mongoose.model("MatchPlayingXI", matchPlayingXISchema);