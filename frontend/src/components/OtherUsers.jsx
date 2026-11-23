import React from "react";
import OtherUser from "./OtherUser";
import useGetOtherUsers from "../hooks/useGetOtherUsers";
import { useSelector } from "react-redux";


const OtherUsers = () => {
    //my custom hook
    useGetOtherUsers();
    const {otherUsers}=useSelector(store=>store.user)
    //early return in react
    if(!otherUsers) return;
    return (
        <div className="h-96 overflow-y-auto"
            style={{
                scrollbarColor: "#f9a8d4",
                scrollbarWidth: "thin",
            }}>{
                otherUsers?.map((user)=>{
                    return(
                        <OtherUser key={user._id} user={user}/>
                    )
                })
            }
        </div>
    )
}
export default OtherUsers;