import React, { useState } from 'react';
import { IoSend } from "react-icons/io5";
import { IoHappyOutline } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from './redux/messageSlice';

const SendInput = () => {
    const [message, setMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);

    const dispatch = useDispatch();
    const { selectedUser } = useSelector(store => store.user);
    const { messages } = useSelector(store => store.message);

    const onEmojiClick = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        try {
            const BACKEND_URL =
                process.env.REACT_APP_API_URL || "http://localhost:8080";

            const res = await axios.post(
                `${BACKEND_URL}/api/v1/message/send/${selectedUser?._id}`,
                { message },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            dispatch(setMessages([...(messages || []), res.data.newMessage]));

        } catch (error) {
            console.log(error);
        }

        setMessage("");
        setShowEmoji(false);
    };

    return (
        <form onSubmit={onSubmitHandler} className='px-4 my-3 mt-auto'>
            <div className='w-full relative flex items-center'>

                <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="absolute left-3 z-10 text-2xl text-pink-500"
                >
                    <IoHappyOutline />
                </button>

                {showEmoji && (
                    <div className="absolute bottom-14 left-0 z-50">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            height={350}
                            width={300}
                        />
                    </div>
                )}

                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type='text'
                    placeholder='Send a message...'
                    className='border text-md rounded-lg w-full p-3 pl-12 pr-12 border-pink-700 bg-gray-100 text-black'
                />

                <button
                    type='submit'
                    className='absolute flex inset-y-0 right-0 pr-4 items-center text-pink-600'
                >
                    <IoSend />
                </button>

            </div>
        </form>
    );
};

export default SendInput;