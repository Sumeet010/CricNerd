import mongoose from "mongoose";
import { ROLE } from "../constants/roles.constant";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        lowercase:true,
        trim:true
    },
    passwordHashed:{
        type:String,
        required: true,
    },
    name:{
        type:String,
    },
    isEmailVerified:{
        type: Boolean,
        default:false
    },
    role:{
        type: [String],
        enum:ROLE,
        default:"PLAYER",
        required: true,
    }

},{timestamps:true});


export const User = mongoose.model("User",userSchema);

