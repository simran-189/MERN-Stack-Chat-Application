import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../components/redux/messageSlice";


const useGetMessages = () => {
    const { selectedUser } = useSelector(store => store.user);
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                axios.defaults.withCredentials = true;

                const BACKEND_URL =
                    process.env.REACT_APP_API_URL || "http://localhost:8080";

                const res = await axios.get(
                    `${BACKEND_URL}/api/v1/message/${selectedUser?._id}`
                );

                console.log(res);

                dispatch(setMessages(res.data));
            } catch (error) {
                console.log(error);
            }
        }
        fetchMessages();
    }, [selectedUser, dispatch])

}
export default useGetMessages;