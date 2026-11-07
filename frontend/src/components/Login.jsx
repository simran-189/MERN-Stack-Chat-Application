
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuthUser } from './redux/userSlice';
const Login = () => {
    const [user, setUser] = useState({
        userName: "",
        password: "",
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:8080/api/v1/user/login`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log("LOGIN RESPONSE:", res.data);

            if (res.data.success) {
                dispatch(setAuthUser(res.data));
                navigate("/");
            }
        } catch (error) {
        console.log(error.response?.data);
        toast.error(
            error.response?.data?.message || "Login failed"
        );
    }
    console.log(user);
    setUser({
        userName: "",
        password: "",
    })
}
return (
    <div className='min-w-96 mx-auto'>
        <div className='max-w-full p-6 rounded-lg shadow-md bg-pink-500 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>
            <div>
                <h1 className='text-3xl font-bold text-center text-pink-500 '>Login</h1>
                <form onSubmit={onSubmitHandler} action="">
                    <div>
                        <label className='label p-2'>
                            <span className='text-base label-text'>User Name</span>
                        </label>
                        <input
                            value={user.userName}
                            onChange={(e) => setUser({ ...user, userName: e.target.value })}
                            className='w-full input input-bordered h-10 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100'

                            type='text' placeholder='  username' />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='text-base label-text'>Password</span>
                        </label>
                        <input
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className='w-full input input-bordered h-10 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100'

                            type='password' placeholder='  password' />
                    </div>
                    <p className='text-center'>Don't have an account?
                        <Link to="/register"> Signup
                        </Link>
                    </p>
                    <div>
                        <button type='submit' className="w-full my-2 rounded-lg border border-gray-100 active:bg-blue-400 bg-pink-400  backdrop-blur-md px-4 py-2 text-gray-50"> Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
)
}
export default Login;