import mongoose from "mongoose";

// mongoose.Schema.Types.ObjectId --> Foreign Key

const playerTeamTournamentSchema = new mongoose.Schema({
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
    tournamentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    }
},{ timestamps: true });

playerTeamTournamentSchema.index(
  { playerId: 1, tournamentId: 1 },
  { unique: true }
);

export const PlayerTeamTournament = mongoose.model("PlayerTeamTournament", playerTeamTournamentSchema);