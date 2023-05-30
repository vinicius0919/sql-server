const f = require('../functions/functions')
const express = require ("express")
const control = require("../controllers/user");

const router = express.Router();

const getUser = router.get("/getuser", f.autenticarTokens, control.getUser);

const addUser = router.post("/add",  f.autenticarTokens, control.addUser)

const refresh = router.post("/token", control.refresh)

const getUsers = router.get("/getusers", f.autenticarTokens, control.getUsers);

const login = router.post("/login", control.login);

const updateUser =router.put("/putusers", control.updateUser);

const deleteUser = router.delete("/deleteusers", control.deleteUser);


const logout = router.delete("/logout", control.logout)



module.exports = {getUser, addUser, getUsers, updateUser, deleteUser, login, logout, refresh}