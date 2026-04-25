import mongoose from "mongoose";

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
    }

},{timestamps:true});


export const User = mongoose.model("User",userSchema);

