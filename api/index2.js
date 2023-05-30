require('dotenv').config()
const express = require("express");
const jwt = require("jsonwebtoken");
const control = require('./routes/users');
const app = express();
app.use(express.json());


app.use("", control.refresh);

app.delete("/logout", (req, res) =>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.use("", control.login);

app.listen(3000);