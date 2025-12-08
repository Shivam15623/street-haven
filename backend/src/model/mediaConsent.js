import mongoose from "mongoose";

const mediaConsentSchema=new mongoose.Schema({
    date:{type:Date,required:true},
    name:{type:String,required:true},
    printedname:{
        type:String,required:true
    }
})

const MediaConsent=mongoose.model("MediaConsent",mediaConsentSchema);

export default MediaConsent;