import { User } from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const register = async (req, res) => {
    try {
        const { fullName, userName, password, confirmPassword, gender } = req.body;
        if (!fullName || !userName || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
        const user = await User.findOne({ userName });
        if (user) {
            return res.status(400).json({ message: "Username already Exist" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        //profilephoto
        const malePhoto = `https://avatarapi.runflare.run/public/boy?username=${userName}`;
        const femalePhoto = `https://avatarapi.runflare.run/public/girl?username=${userName}`;
        await User.create({
            fullName,
            userName,
            password: hashedPassword,
            profilePhoto: gender === "male" ? malePhoto : femalePhoto,
            gender,
        });
        return res.status(201).json({
            message: "account created successfully.",
            success: true
        })
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
export const login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect usename or password.",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect usename or password.",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            success: true,
            _id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            //as a response client side m return horhi h   
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", " ", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    }
    catch (error) {
        console.log(error);
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUsers = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUsers } }).select("-password");
        return res.status(200).json(otherUsers);

    }
    catch (error) {
        console.log(error);
    }
}