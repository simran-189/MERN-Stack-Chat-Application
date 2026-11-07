import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { setOtherUsers } from '../components/redux/userSlice';

const useGetOtherUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchOtherUsers = async () => {
            try {
                axios.defaults.withCredentials = true;

                const BACKEND_URL =
                    process.env.REACT_APP_API_URL || "http://localhost:8080";

                const res = await axios.get(
                    `${BACKEND_URL}/api/v1/user/getOtherUsers`
                );

                console.log(res);

                // store
                dispatch(setOtherUsers(res.data));
            } catch (error) {
                console.log(error);
            }
        }
        fetchOtherUsers();
    }, [])

}
export default useGetOtherUsers;