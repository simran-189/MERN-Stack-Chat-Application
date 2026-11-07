import React, { useEffect } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "./redux/userSlice";
import useGetMessages from "../hooks/useGetMessages";

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const isOnline = onlineUsers?.includes(selectedUser?._id);
    useGetMessages();
  //  useEffect(() => {
   //     return () => dispatch(setSelectedUser(null));
   // }, []);
    return (
        <>
            {
                selectedUser !== null ? (
                    <div className="md:min-w-[550px] flex flex-col">
                        <div className="flex gap-2 items-center bg-pink-500 text-white px-4 py-2 mb-2">
                            <div className={`avatar ${isOnline ? 'online': ''}`}>
                                <div className="w-10 rounded-full">
                                    <img src={selectedUser?.profilePhoto} alt="user-profile"></img>
                                </div>
                            </div>
                            <div className='flex flex-col flex-1'>
                                <div className="flex justify-between gap-2">
                                    <p>{selectedUser?.fullName}</p>
                                </div>
                            </div>
                        </div>
                        <Messages />
                        <SendInput />
                    </div>

                ) : (
                    <div className="md:min-w-[550px] flex flex-col justify-center items-center">
                        <h1 className="text-3xl text-pink-700 font-bold shadow-lg"> Hi, {authUser?.fullName}</h1>

                        <h1 className="text-2xl text-pink-700 shadow-lg">Let's Start Conversation...</h1>
                    </div>
                )

            }
        </>
    )
}
export default MessageContainer;