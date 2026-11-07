import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
const Message = ({ message }) => {
    const scroll = useRef();
    const { authUser, selectedUser } = useSelector(store => store.user);
    const isOwnMessage = String(authUser?._id) === String(message?.senderId);
   
    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);
    return (
        <div ref={scroll} className="px-4 flex-1 overflow-auto">
            <div className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}>
                <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                        <img
                            alt="Tailwind CSS chat bubble component"
                            src={isOwnMessage ? authUser?.profilePhoto : selectedUser?.profilePhoto}
                        />
                    </div>
                </div>
                <div className="chat-header">
                    <time className="text-xs opacity-50">12:45</time>
                </div>
                <div className="chat-bubble bg-pink-600 text-white">{message?.message}</div>
            </div>
        </div>
    )
}
export default Message;