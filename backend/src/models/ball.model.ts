import mongoose from "mongoose";
import { EXTRA_TYPES } from "../constants/extraTypes.constant";
import { WICKET_TYPES } from "../constants/wicketTypes.constant";


const ballSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    battingTeamId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    bowlingTeamId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    strikerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },
    bowlerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },
    overNumber:{
        type: Number,
        required: true
    },
    ballNumber:{
        type: Number,
        required: true
    },
    runsOffBat:{
        type: Number,
        default: 0
    },
    extraRuns:{
        type: Number,
        default: 0
    },
    extraType:{
        type: String,
        enum: EXTRA_TYPES,
        default: "NONE"
    },
    isLegalDelivery:{
        type: Boolean,
        default: false
    },
    isWicket:{
        type: Boolean,
        default: false
    },
    dismissedPlayerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
    },
    wicketType:{
        type: String,
        enum: WICKET_TYPES,

    }
}, {timestamps: true})

export const Ball = mongoose.model("Ball", ballSchema);
