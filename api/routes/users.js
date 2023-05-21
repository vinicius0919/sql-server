import express from "express";
import {addUser, deleteUser, getUser, getUsers, updateUser} from "../controllers/user.js"

const router = express.Router();

router.get("/getusers", getUsers);

router.get("/getuser", getUser);

router.post("/addusers", addUser);

router.put("/putusers", updateUser);

router.delete("/deleteusers", deleteUser);

export default router;