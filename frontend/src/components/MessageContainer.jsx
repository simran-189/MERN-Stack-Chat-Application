import React from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector } from "react-redux";
import useGetMessages from "../hooks/useGetMessages";
import { useCall } from "./CallContext";

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers } = useSelector(
        store => store.user
    );

    const { setCall } = useCall();

    const isOnline = onlineUsers?.includes(selectedUser?._id);

    useGetMessages();

    const startCall = (callType) => {
        if (!selectedUser || !authUser) return;

        setCall({
            callType,
            to: selectedUser._id,
            from: authUser._id,
            callerName: authUser.fullName,
            isCaller: true,
            status: "calling"
        });
    };

    return (
        <>
            {selectedUser !== null ? (
                <div className="md:min-w-[550px] flex flex-col flex-1">

                    <div className="flex gap-2 items-center bg-pink-500 text-white px-4 py-2 mb-2">

                        <div className={`avatar ${isOnline ? "online" : ""}`}>
                            <div className="w-10 rounded-full">
                                <img
                                    src={selectedUser?.profilePhoto}
                                    alt="user-profile"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1">
                            <p>{selectedUser?.fullName}</p>
                        </div>

                        <div className="flex gap-3">

                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => startCall("audio")}
                            >
                                <i className="fa fa-phone"></i> Audio
                            </button>

                            <button
                                className="btn btn-sm btn-info"
                                onClick={() => startCall("video")}
                            >
                                <i className="fa fa-video"></i> Video
                            </button>

                        </div>
                    </div>

                    <Messages />
                    <SendInput />

                </div>
            ) : (
                <div className="md:min-w-[550px] flex flex-col justify-center items-center flex-1">

                    <h1 className="text-3xl text-pink-700 font-bold shadow-lg">
                        Hi, {authUser?.fullName}
                    </h1>

                    <h1 className="text-2xl text-pink-700 shadow-lg">
                        Let's Start Conversation...
                    </h1>

                </div>
            )}
        </>
    );
};

export default MessageContainer;