import conversation from "../models/conversationModel.js";
import { message as Message } from "../models/messagemodel.js";
import { io, getRecieverSocketId } from "../socket/socket.js";

export const sendMessage =async(req ,res) =>{
    try{
        const senderId = req.id;
        const recieverId =req.params.id;
        const {message} = req.body;

        let gotConversation = await conversation.findOne({
            participants:{$all: [senderId, recieverId]},
        });
        if(!gotConversation){
            gotConversation = await conversation.create({
                participants:[senderId, recieverId]
            })   
        };
        const newMessage = await Message.create({
            senderId,
            recieverId,
            message
        });
        if(newMessage){
            gotConversation.messages.push(newMessage._id);
        };
        await Promise.all([gotConversation.save(), newMessage.save() ]);

        //socket IO
        const recieverSocketId = getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }


        return res.status(201).json({
            newMessage
        });
    }
    catch(error){
        console.log(error);
    }
}
export const getMessage = async (req, res)=>{
    try{
        const recieverId = req.params.id;
        const senderId = req.id;
        const foundconversation = await conversation.findOne({
            participants:{$all : [senderId,recieverId]}
        }).populate("messages");
        return res.status(200).json(foundconversation?.messages);
    }
    catch(error){
        console.log(error);
    }
}