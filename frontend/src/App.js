import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './components/HomePage';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { io } from "socket.io-client";
import { setSocket } from './components/redux/socketSlice';
import { setOnlineUsers } from './components/redux/userSlice';
import { CallProvider, useCall } from './components/CallContext';
import Call from './components/calling/Call';

const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/register", element: <Signup /> },
    { path: "/login", element: <Login /> }
]);

function AppContent() {
    const { authUser } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const { setIncomingCall } = useCall();

    useEffect(() => {
        if (!authUser) {
            dispatch(setSocket(null));
            return;
        }

        const BACKEND_URL =
            process.env.REACT_APP_API_URL || "http://localhost:8080";

        const newSocket = io(BACKEND_URL, {
            withCredentials: true,
            query: { userId: authUser._id }
        });

        newSocket.on("connect", () => {
            console.log("SOCKET CONNECTED:", newSocket.id);
        });

        newSocket.on("connect_error", (error) => {
            console.log("SOCKET ERROR:", error.message);
        });

        newSocket.on("getOnlineUsers", (onlineUsers) => {
            dispatch(setOnlineUsers(onlineUsers));
        });

        newSocket.on("incomingCall", (data) => {
            setIncomingCall(data);
        });

        dispatch(setSocket(newSocket));

        return () => {
            newSocket.close();
            dispatch(setSocket(null));
        };
    }, [authUser, dispatch, setIncomingCall]);

    return (
        <div className="p-4 h-screen flex items-center justify-center">
            <RouterProvider router={router} />
            <Call />
        </div>
    );
}

function App() {
    return (
        <CallProvider>
            <AppContent />
        </CallProvider>
    );
}

export default App;