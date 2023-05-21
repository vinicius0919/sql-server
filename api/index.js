import express from "express";
import cors from "cors";
import userRouters from "./routes/users.js";
import jwt from "jsonwebtoken"

const app = express();

app.use(express.json());
app.use(cors());

app.use("/Pacientes", userRouters)

app.post("/login", (req,res) =>{
    const em = req.body.email

    const user = { email: em}
    jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

});

app.listen(8080);