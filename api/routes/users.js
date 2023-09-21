const f = require('../functions/functions')
const express = require ("express")
const control = require("../controllers/user");

const router = express.Router();


const cpf = router.get("/cpf", control.getByCPF);

const getUser = router.get("/getuser", control.getUser);

const addUser = router.post("/add",  f.autenticarTokens, control.addUser)

const refresh = router.post("/token", control.refresh)

const getUsers = router.post("/getusers", control.getUsers);

const login = router.post("/login", control.login);

const updateUser =router.post("/putusers", control.updateUser);

const deleteUser = router.post("/deleteuser", control.deleteUser);

const autenticarTokens = router.get("/autenticar", control.autenticar)

const logout = router.delete("/logout", control.logout)

const vagas = router.get("/vagas", control.showAllVacancies)

module.exports = {getUser, addUser, getUsers, updateUser, deleteUser, login, logout, refresh, autenticarTokens, vagas, cpf}