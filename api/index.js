const rotas = require('./routes/users');
const f = require("./controllers/user")


const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

//----------------------------------------------------
app.post("/dg", async (req, res)=>{

        //Recebendo a requisição do Dialogflow
        let flag = ""
        let requisicao = req.body
        let fl = requisicao.queryResult.parameters

        let parameters = Object.keys(fl)
        //console.log(parameters, " ",fl)

        
        try{
            flag = Object.keys(requisicao['queryResult']['parameters'])[0]
        }
        catch{
            console.log(requisicao['queryResult']['action'])
            flag = requisicao['queryResult']['action']
        }
        console.log("FLAG: " +flag)
        
        if(flag == "cpf"){
            //const cpf = requisicao['queryResult']['parameters']["cpf"]
            await f.getByCPF(req, res)
            
        }
        else if (flag=="especializacao"){
            await f.getVagasbyEspecializacao(req, res)
            //console.log("Especialidade a seguir:" + req.body.queryResult.parameters.especializacao)
            //res.sendStatus(200)
        }
        else if (flag == "agenda"){
            await f.getVagasbyDia(req, res)
        }
        else if(flag== "turnos"){
            await f.turnos(req,res)
        }
        else {
            await f.turnosYes(req, res)
        }
        
});











//------------------------------------------------------------

app.use("", rotas.cpf)
app.use("", rotas.addUser);// getUser

app.use("", rotas.getUsers);// getUser

app.use("", rotas.logout)// logout

app.use("", rotas.login);// login

app.use("", rotas.autenticarTokens); 

app.use("", rotas.vagas);
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

const port = 8080
    
app.listen(port, ()=>{
    console.log("Rodando na porta " + port + "!!!")
});