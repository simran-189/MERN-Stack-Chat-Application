import mongoose from "mongoose";

const conversationModel =new mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"message"
    }],

}, {timestamps:true});
const conversation = mongoose.model("conversation",conversationModel);
export default conversation;