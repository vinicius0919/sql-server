require('dotenv').config()
const jwt = require('jsonwebtoken')

function generateAccessTokens(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'})
}

function autenticarTokens(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
};

module.exports= {generateAccessTokens, autenticarTokens}