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

const autenticar = async (req, res) =>{
    
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    
    await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        const q = `SELECT pnome, snome, image FROM sistema.funcionario where email = '${user.user}';`

        try {
                db.query(q, (err, data) => {
                if (err) return res.send('Usuário ou senha inválidos' + err) ;
                res.json({pnome: data[0]['pnome'], snome: data[0]['snome'], imageRef: data[0]['image']})
            });
        } catch{
            res.send("Deu erro!")
        }

    })

    
};


const showAllVacancies = async (req, res) =>{

    const s = saidaQ(req);

    const q =`select pnome, especialidade, dia, turno, quantidade_vagas
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico and medico.id_Medico = especialidade.id_especialidade;`

    const q2 = `select pnome, especialidade, dia, turno, quantidade_vagas
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico and medico.id_Medico = especialidade.id_especialidade 
    and especialidade.especialidade = "${req.body.especialidade}"
    and medico.pnome = "${req.body.nome}";`

    try{
        await db.query(s, (err, data) =>{
            if (err) return res.send(err)
            res.json(data)
        });
    } catch{
        res.send("Deu erro!")
    }
};


function saidaQ(req){
    
    q = `select pnome, especialidade, dia, turno, quantidade_vagas
        from vagas
        inner join medico
        inner join especialidade
        on vagas.fk_Medico_id_Medico = medico.id_Medico and medico.id_Medico = especialidade.id_especialidade
        and vagas.quantidade_vagas != 0`;
    
    if (req.body.especialidade!=null){
        q += ` and especialidade.especialidade = "${req.body.especialidade}"`
    }
    if(req.body.nome!=null){
        q += ` and medico.pnome = "${req.body.nome}"`
    }
    if(req.body.dia!= null){
        q += ` and vagas.dia = "${req.body.dia}"`
    }
    if(req.body.turno!= null){
        q += ` and vagas.turno = "${req.body.turno}"`
    }

    q+= ";"

    console.log(q)
    return q
    };
    


module.exports = {getUser, getUsers, addUser, deleteUser, updateUser, login, logout, refresh, autenticar, showAllVacancies}