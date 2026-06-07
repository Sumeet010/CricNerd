import mongoose, { Mongoose } from 'mongoose';

const teamSchema = new mongoose.Schema({
    teamName:{
        type: String,
        required: true
    },
    tournamentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    tournamentWins:{
        type: Number,
        default: 0 
    }
},{timestamps: true}) 

export const Team = mongoose.model("Team",teamSchema);





