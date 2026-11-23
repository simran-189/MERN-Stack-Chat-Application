import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import toast from 'react-hot-toast';
const Signup = () => {
    const [user, setUser] = useState({
        fullName: "",
        userName: "",
        password: "",
        confirmPassword: "",
        gender: '',
    });
    const navigate = useNavigate();
    const handleCheckbox = (gender) => {
        setUser({ ...user, gender })
    }
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const BACKEND_URL =
                process.env.REACT_APP_API_URL || "http://localhost:8080";

            const res = await axios.post(
                `${BACKEND_URL}/api/v1/user/register`,
                user,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error)
        }
        console.log(user);
        setUser({
            fullName: "",
            userName: "",
            password: "",
            confirmPassword: "",
            gender: '',
        })
    }
    return (
        <div className='min-w-96 mx-auto'>
            <div className='max-w-full p-6 rounded-lg shadow-md bg-pink-500 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>
                <div>
                    <h1 className='text-3xl font-bold text-center text-pink-500 '>Signup</h1>
                    <form onSubmit={onSubmitHandler} action="">
                        <div>
                            <label className='label p-2'>
                                <span className='text-base label-text'>Full Name</span>
                            </label>
                            <input
                                value={user.fullName}
                                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                                className='w-full input input-bordered h-10 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100'

                                type='text' placeholder='  full name' />
                        </div>
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
                        <div>
                            <label className='label p-2'>
                                <span className='text-base label-text'>Confirm Password</span>
                            </label>
                            <input
                                value={user.confirmPassword}
                                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                                className='w-full input input-bordered h-10 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100'

                                type='password' placeholder='  password' />
                        </div>
                        <div className='flex items-center my-4'>
                            <div className='flex items-center'>
                                <p>Male</p>
                                <input type="checkbox"
                                    checked={user.gender === "male"}
                                    onChange={() => handleCheckbox("male")}
                                    defaultChecked
                                    className="checkbox checkbox-neutral mx-3" />
                            </div>
                            <div className='flex items-center'>
                                <p>Female</p>
                                <input type="checkbox"
                                    checked={user.gender === "female"}
                                    onChange={() => handleCheckbox("female")}
                                    defaultChecked
                                    className="checkbox checkbox-neutral mx-3" />
                            </div>
                        </div>
                        <p className='text-center'>Already have an account?
                            <Link to="/login"> Login
                            </Link>
                        </p>
                        <div>
                            <button type='submit' className="w-full my-2 rounded-lg border border-gray-100 active:bg-blue-400 bg-pink-400  backdrop-blur-md px-4 py-2 text-gray-50"> Signup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default Signup;