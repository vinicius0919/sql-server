const db = require ("../db");
const f = require('../functions/functions')
require('dotenv').config()
const jwt = require('jsonwebtoken')

let refreshTokens = []

const getUsers = (req, res) =>{
    const q = "SELECT CPF, pNome, sNome, Endereco, Email, DATE_FORMAT(dataNascimento,'%d/%m/%Y') as dataNascimento FROM sistema.paciente;"

    db.query(q, (err, data) => {
        if (err) return res.json(err);

        return res.status(200).json(data);
    });
};

const getUser = (req, res) =>{
    const cpf = req.body.CPF;
    const q = `SELECT CPF, pNome, sNome, Endereco, Email, DATE_FORMAT(dataNascimento,'%d/%m/%Y') as dataNascimento FROM sistema.paciente where CPF = '${cpf}';`

    db.query(q, (err, data) => {
        if (err) return res.json(err);

        return res.status(200).json(data);
    });
};

const login = async (req, res) => {
    
    console.log(req.body)
    //const dados = req.body.dados

    const q = `SELECT pnome, snome, image FROM sistema.funcionario where email = '${req.body.email}' and senha = '${req.body.senha}';`
    
    try {
        await db.query(q, (err, data) => {
            if (err) return res.send('Usuário ou senha inválidos' + err) ;
            const user = {user: req.body.email};
            const accessToken = f.generateAccessTokens(user)
            res.json({accessToken: accessToken, pnome: data[0]['pnome'], snome: data[0]['snome'], imageRef: data[0]['image']})
        });
    } catch{
        res.send("Deu erro!")
    }
};

const logout = (req, res) =>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
};

const refresh = (req, res) =>{
    const refreshToken = req.body.token
    if (refreshToken==null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
       if(err) return res.sendStatus(403)
       const accessToken = f.generateAccessTokens({user: user.user})
       console.log("/token: ", user.user)
       res.json({accessToken: accessToken})
    });
};
 const addUser = (req, res) =>{
    console.log(req.body)
    const q = "insert into Paciente(CPF, pNome, sNome, dataNascimento, Endereco, Email, Telefone) values (?)";

    const values =[
        req.body.CPF,
        req.body.pNome,
        req.body.sNome,
        req.body.dataNascimento,
        req.body.Endereco,
        req.body.Email,
        req.body.Telefone
    ]
    db.query(q, [values],(err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário cadastrado com sucesso");
    });
};

const updateUser = (req, res) =>{
    console.log(req.body)
    const pnome = req.body.pNome;
    const snome = req.body.sNome;
    const datan = req.body.dataNascimento;
    const end = req.body.Endereco;
    const email = req.body.Email;
    const tel =req.body.Telefone;
    const cpf = req.body.CPF;
    const q = `update sistema.paciente set pNome= '${pnome}', sNome = '${snome}', dataNascimento = '${datan}', Endereco = '${end}', Email = '${email}', Telefone = '${tel}' where cpf = '${cpf}'`;


    db.query(q,(err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário atualizado com sucesso");
    });
};

 const deleteUser = (req, res) =>{
    console.log(req.body)
    const cpf = req.body.CPF;
    const q = `delete from Paciente where cpf = '${cpf}'`;

    db.query(q,(err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário deletado com sucesso");
    });
};


module.exports = {getUser, getUsers, addUser, deleteUser, updateUser, login, logout, refresh}