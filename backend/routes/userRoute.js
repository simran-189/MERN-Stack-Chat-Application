import express from "express";
import {register} from "../controllers/userController.js";
import { login } from "../controllers/userController.js";
import { logout , getOtherUsers} from "../controllers/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/getOtherUsers").get(isAuthenticated ,getOtherUsers); //ye phle isAuthenticated vala dunction call krega

export default router;

