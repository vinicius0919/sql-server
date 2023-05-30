const rotas = require('./routes/users');


const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());


app.use("", rotas.addUser);// getUser

app.use("", rotas.getUsers);// getUser

app.use("", rotas.logout)// logout

app.use("", rotas.login);// login

/*app.post("/token", (req, res)=>{
    const refreshToken = req.body.token
    if (refreshToken==null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessTokens({user: user.user})
        console.log("/token: ", user.user)
        res.json({accessToken: accessToken})
    });
});*/


    
app.listen(8080);