const rotas = require('./routes/users');
const f = require("./controllers/chatapp")

const api = require('./df')

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

//ROTA PRINCIPAL QUE FAZ A COMUNICAÇÃO DO CHATBOT COM O BANCO DE DADOS
app.post("/dg", async (req, res)=>{

        let requisicao = req.body
        
        console.log("FLAG: " + requisicao.queryResult.intent.displayName)
        



        if(requisicao.queryResult.intent.displayName == "confirmar"){
            //const cpf = requisicao['queryResult']['parameters']["cpf"]
            await f.confirmar(req, res)
            
        }
        if (requisicao.queryResult.intent.displayName == "especialidade"){
            await f.getVagasbyEspecializacao(req, res)
            //console.log("Especialidade a seguir:" + req.body.queryResult.parameters.especializacao)
            //res.sendStatus(200)
        }
        else if (requisicao.queryResult.intent.displayName == "Dia"){
            await f.getVagasbyDia(req, res)
        }
        else if(requisicao.queryResult.intent.displayName == "turno"){
            await f.turnos(req,res)
        }
        else if(requisicao.queryResult.intent.displayName == "Agendar"){
            await f.exibirEspecialidades(req,res)
        }
        else if (requisicao['queryResult']['action'] == "turno.turno-yes"){
            await f.turnosY(req, res)
        }
        
});


app.all("/wpp", async (req, res)=>{
    //let queryText = "Oi";
    //let num = "5555996176555";
    try {
        const resposta = await api.detectIntent(req, res);
        
    } catch (error) {
        console.log(error)
    }
    
    
});



//------------------------------------------------------------
/*
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