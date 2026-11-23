import React, { useEffect, useRef, useState } from "react";
import { useCall } from "../CallContext";
import { useSelector } from "react-redux";

const Call = () => {
    const { call, setCall, incomingCall, setIncomingCall } = useCall();
    const { socket } = useSelector(store => store.socket);

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const pendingCandidatesRef = useRef([]);

    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [callStatus, setCallStatus] = useState("Connecting...");

    const closeConnection = () => {
        if (peerRef.current) {
            peerRef.current.ontrack = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }

        pendingCandidatesRef.current = [];
    };

    const endCall = () => {
        const remoteUser = call?.isCaller ? call?.to : call?.from;

        if (remoteUser) {
            socket?.emit("endCall", { to: remoteUser });
        }

        closeConnection();
        setCall(null);
        setIncomingCall(null);
        setMuted(false);
        setCameraOff(false);
    };

    const acceptCall = () => {
        if (!incomingCall) return;

        setCall({
            ...incomingCall,
            status: "accepted",
            isCaller: false
        });

        setIncomingCall(null);
    };

    const rejectCall = () => {
        if (incomingCall?.from) {
            socket?.emit("endCall", { to: incomingCall.from });
        }

        setIncomingCall(null);
    };

    // Socket events
    useEffect(() => {
        if (!socket) return;

        const handleCallAccepted = async ({ answer }) => {
            const peer = peerRef.current;
            if (!peer) return;

            try {
                await peer.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );

                for (const candidate of pendingCandidatesRef.current) {
                    await peer.addIceCandidate(candidate);
                }

                pendingCandidatesRef.current = [];
                setCallStatus("Connected");
            } catch (error) {
                console.error("Answer error:", error);
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (!candidate) return;

            const ice = new RTCIceCandidate(candidate);
            const peer = peerRef.current;

            if (!peer || !peer.remoteDescription) {
                pendingCandidatesRef.current.push(ice);
                return;
            }

            try {
                await peer.addIceCandidate(ice);
            } catch (error) {
                console.error("ICE error:", error);
            }
        };

        const handleCallEnded = () => {
            closeConnection();
            setCall(null);
            setIncomingCall(null);
        };

        socket.on("callAccepted", handleCallAccepted);
        socket.on("iceCandidate", handleIceCandidate);
        socket.on("callEnded", handleCallEnded);

        return () => {
            socket.off("callAccepted", handleCallAccepted);
            socket.off("iceCandidate", handleIceCandidate);
            socket.off("callEnded", handleCallEnded);
        };
    }, [socket, setCall, setIncomingCall]);

    // Start audio/video call
    useEffect(() => {
        if (!call || (call.status !== "accepted" && !call.isCaller)) {
            return;
        }

        let cancelled = false;

        const startCall = async () => {
            try {
                closeConnection();
                setCallStatus("Requesting camera and microphone...");

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: call.callType === "video"
                });

                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                localStreamRef.current = stream;

                if (localVideoRef.current && call.callType === "video") {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play().catch(console.error);
                }

                const peer = new RTCPeerConnection({
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }
                    ]
                });

                peerRef.current = peer;

                stream.getTracks().forEach(track => {
                    peer.addTrack(track, stream);
                });

                peer.ontrack = async (event) => {
                    console.log(
                        "REMOTE TRACK:",
                        event.track.kind,
                        event.track.readyState
                    );

                    const remoteStream = event.streams[0];

                    if (!remoteStream) return;

                    if (call.callType === "video" && remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;

                        try {
                            await remoteVideoRef.current.play();
                        } catch (error) {
                            console.error("Remote video play error:", error);
                        }
                    }

                    if (call.callType === "audio" && remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteStream;

                        try {
                            await remoteAudioRef.current.play();
                        } catch (error) {
                            console.error("Remote audio play error:", error);
                        }
                    }

                    setCallStatus("Media connected");
                };

                peer.onconnectionstatechange = () => {
                    setCallStatus(peer.connectionState);
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        const remoteUser = call.isCaller ? call.to : call.from;

                        socket?.emit("iceCandidate", {
                            to: remoteUser,
                            candidate: event.candidate
                        });
                    }
                };

                if (call.isCaller) {
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);

                    socket?.emit("callUser", {
                        to: call.to,
                        offer,
                        callerName: call.callerName,
                        callType: call.callType
                    });

                    setCallStatus("Calling...");
                } else {
                    await peer.setRemoteDescription(
                        new RTCSessionDescription(call.offer)
                    );

                    for (const candidate of pendingCandidatesRef.current) {
                        await peer.addIceCandidate(candidate);
                    }

                    pendingCandidatesRef.current = [];

                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);

                    socket?.emit("answerCall", {
                        to: call.from,
                        answer
                    });

                    setCallStatus("Connecting...");
                }
            } catch (error) {
                console.error("Call setup error:", error);
                alert("Camera/Microphone access ya call setup mein problem hai.");

                closeConnection();
                setCall(null);
            }
        };

        startCall();

        return () => {
            cancelled = true;
        };
    }, [call, socket]);

    // Cleanup
    useEffect(() => {
        return () => closeConnection();
    }, []);

    const toggleMute = () => {
        const stream = localStreamRef.current;
        if (!stream) return;

        stream.getAudioTracks().forEach(track => {
            track.enabled = muted;
        });

        setMuted(!muted);
    };

    const toggleCamera = () => {
        const stream = localStreamRef.current;
        if (!stream) return;

        stream.getVideoTracks().forEach(track => {
            track.enabled = cameraOff;
        });

        setCameraOff(!cameraOff);
    };

    if (incomingCall) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold">
                    Incoming {incomingCall.callType} Call
                </h1>

                <p className="mt-3 text-gray-300">
                    {incomingCall.callerName} is calling you
                </p>

                <div className="flex gap-5 mt-8">
                    <button
                        onClick={acceptCall}
                        className="bg-green-600 px-6 py-3 rounded-full"
                    >
                        Accept
                    </button>

                    <button
                        onClick={rejectCall}
                        className="bg-red-600 px-6 py-3 rounded-full"
                    >
                        Reject
                    </button>
                </div>
            </div>
        );
    }

    if (!call) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-2">
                {call.callType === "video" ? "Video Call" : "Audio Call"}
            </h2>

            <p className="text-gray-300 mb-4">{callStatus}</p>

            {call.callType === "video" && (
                <div className="relative w-full max-w-3xl">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-80 rounded-lg bg-gray-800 object-contain"
                    />

                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="absolute bottom-4 right-4 w-36 h-28 rounded-lg bg-gray-700 object-cover border-2 border-white"
                    />
                </div>
            )}

            <audio ref={remoteAudioRef} autoPlay />

            <div className="flex gap-4 mt-8">
                <button
                    onClick={toggleMute}
                    className="bg-blue-600 px-5 py-3 rounded-full"
                >
                    {muted ? "Unmute" : "Mute"}
                </button>

                {call.callType === "video" && (
                    <button
                        onClick={toggleCamera}
                        className="bg-blue-600 px-5 py-3 rounded-full"
                    >
                        {cameraOff ? "Camera On" : "Camera Off"}
                    </button>
                )}

                <button
                    onClick={endCall}
                    className="bg-red-600 px-6 py-3 rounded-full"
                >
                    End Call
                </button>
            </div>
        </div>
    );
};

export default Call;