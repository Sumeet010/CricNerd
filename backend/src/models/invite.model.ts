import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    createdBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

inviteSchema.index(
    { token : 1}, 
    { unique: true }
)

export const Invite = mongoose.model("Invite", inviteSchema);
