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


// FUNÇÕES PARA O DIALOGFLOW
//1) VERFICAR CADASTRO DO USUÁRIO
function getByCPF(req, res){
    const requisicao = req.body;

    const cpf = req.body.queryResult.parameters.cpf
    const q = `SELECT pNome FROM sistema.paciente where CPF = '${cpf}';`
    
    db.query(q, (err, data) => {
        try {
            const dados = Object.values(data[0])
            requisicao['fulfillmentText'] = "Certo, "+ dados[0] + ", qual procedimento gostaria de realizar conosco?";
            return res.status(200).json(requisicao)
            
        } catch (error) {
            requisicao['fulfillmentText'] = "Usuário não encontrado, caso o erro persista procure unidade de saúde mais próxima";
            return res.json(requisicao)
        }
    });

}
//1) VERFICAR DISPONIBILIDADE DO MÉDICO
function getVagasbyEspecializacao(req, res){
    const requisicao = req.body;
    console.log("Entrou aqui", requisicao.queryResult.parameters.especializacao)
    const especialidade = requisicao.queryResult.parameters.especializacao

    const q = `select dia, turno, date_format(dataVaga,'%d/%m/%y')
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico 
    and medico.fk_Especialidade_id_especialidade = especialidade.id_especialidade 
    and especialidade.especialidade = "${especialidade}"
    and vagas.quantidade_vagas != 0
    order by dataVaga ASC, turno ="manhã" desc;`
    
    db.query(q, (err, data) => {

        const texts = [
            "Dia: ",
            "Turno: ",
            "Data: "
        ];
        if (err) return res.send(err);
console.log(data)
        if (data.length >= 0) {

            let element = "Para essa especialidade temos a seguinte disponibilidade:\n---------------------------\n";
            for (i in data) {
                let info = Object.values(data[i]);
                for (let j = 0; j < info.length; j++) {
                    element = `${element} ${texts[j]} ${info[j]}\n`;
                    console.log(element);
                }
                element += "---------------------------\n"
            }
            requisicao['fulfillmentText'] = element + "\nSelecione o dia da semana desejado";
            return res.status(200).json(requisicao);
        }
    });

}




function getVagasbyDia(req, res){
    const requisicao = req.body;
    const dia = requisicao.queryResult.parameters.agenda
    const especialidade = requisicao.queryResult.outputContexts[0].parameters.especializacao
    console.log(requisicao)
    console.log(dia, especialidade)
    const q = `select turno, pnome, date_format(dataVaga,'%d/%m/%y')
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico 
    and medico.fk_Especialidade_id_especialidade  = especialidade.id_especialidade 
    and vagas.dia = "${dia}" 
    and especialidade.especialidade = "${especialidade}"
    and vagas.quantidade_vagas != 0
    order by dataVaga ASC, turno ="manhã" desc;`
    

    const texts = [
        "Turno: ",
        "com o Dr(a) ",
        " na data: "
    ];

    db.query(q, (err, data) => {

        if (err) return res.send(err);

        if (data.length > 0) {
            let count = 1
            let element = "Agora me diga, qual do(s) turno(s) que você deseja ser consultado?\n ________________________________\n";
            for (i in data) {
                let info = Object.values(data[i]);
                element += `\n${count})`;
                for (let j = 0; j < info.length; j++) {
                    element = `${element} ${texts[j]} ${info[j]} `;
                    console.log(element);
                }
                element += `\n`;
                count += 1
            }
            requisicao['fulfillmentText'] = element;
            return res.status(200).json(requisicao);
        }
    });

}


function turnos(req, res){
    const requisicao = req.body;

    const medico = requisicao.queryResult.outputContexts[1].parameters.especializacao
    const dia = requisicao.queryResult.outputContexts[1].parameters.agenda
    const turno = requisicao.queryResult.outputContexts[1].parameters.turnos
    console.log(medico, dia, turno)
    requisicao['fulfillmentText'] = `Certo, podemos confirmar sua consulta com o ${medico} ${dia} no turno da ${turno}, *Sim ou Não*?`
    res.send(requisicao)
}
//getByCPF("054.229.322-69")

function turnosYes(req, res){
    const date = new Date();


    const requisicao = req.body;
    const medico = requisicao.queryResult.outputContexts[1].parameters.especializacao
    const dia = requisicao.queryResult.outputContexts[1].parameters.agenda
    const turno = requisicao.queryResult.outputContexts[1].parameters.turnos
    const cpf = "05422932264"//requisicao["queryResult"]["outputContexts"][3]['parameters']['cpf.original']
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dataCompleta = `${year}-${month}-${day}`
    

    
    //const numero = requisicao['queryResult']['outputContexts'][1]['name'].split("/")[4].replace('whatsapp:', '')
    const q = `select fk_Medico_id_Medico
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico and medico.id_Medico = especialidade.id_especialidade and vagas.dia = "${dia}" and vagas.turno = "${turno}" and especialidade.especialidade = "${especialidade}"
    and vagas.quantidade_vagas != 0
    order by medico.id_Medico;`
    
    
    db.query(q, (err, data) => {
        
        if (err) {
            requisicao['fulfillmentText'] = `Não conseguimos agendar sua consulta. Pode tentar de novo? Se o problema persistir, procure a unidade de saúde mais próxima, tá bom?`
            return res.send(requisicao)
        };
        console.log(Object.values(data))
        const idMedico = Object.values(data[0])[0];

        
        
        const q2 = `select id_vaga
        from vagas
        inner join medico
        inner join especialidade
        on vagas.fk_Medico_id_Medico = medico.id_Medico and medico.id_Medico = especialidade.id_especialidade and vagas.dia = "${dia}" and vagas.turno = "${turno}" and especialidade.especialidade = "${especialidade}"
        and vagas.quantidade_vagas != 0
        order by medico.id_Medico;`
        
        db.query(q2, (err, data) => {
            if (err) return res.send(err);
            
            const id_vaga = Object.values(data[0])[0];
            
            console.log(dia, especialidade, turno, dataCompleta, idMedico, id_vaga);

            const q3 = `insert into consulta(DataMarcacao, fk_Medico_id_Medico, fk_Paciente_CPF, fk_Vaga_id_vaga) values("${dataCompleta}", ${idMedico}, "${cpf}", ${id_vaga});`
            
            db.query(q3, (err, data) => {
                if (err) return res.send(err);
        
            });


            const q4 = `update vagas
            set quantidade_vagas = quantidade_vagas -1
            where id_vaga = ${id_vaga};`
    
            db.query(q4, (err, data) => {
        
                if (err) return res.send(err);
        
                requisicao['fulfillmentText'] = `Perfeito, sua consulta foi agendada com sucesso!\nObrigado por usar nossos serviços!\nNão esqueça de chegar com antecedência, para não perder sua vaga!`
                res.send(requisicao)
            });
        });

        });

}

function turnosY(req, res){
    const date = new Date();
    const requisicao = req.body;

    let especialidade = ""
    let dia = ""
    let turno = ""
    let cpf = ""
try {
    especialidade =requisicao.queryResult.outputContexts[1].parameters.especializacao
    dia =  requisicao.queryResult.outputContexts[1].parameters.agenda
    turno = requisicao.queryResult.outputContexts[1].parameters.turnos
    cpf = "05422932264"
    
} catch (error) {
    requisicao.fulfillmentText = `Houve algum problema com os dados selecionados.\nPode repetir o processo do começo, por favor?`
    res.send(requisicao)
}
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dataCompleta = `${year}-${month}-${day}`
    requisicao.queryResult.outputContexts[1].parameters = {}
    console.log("REQUISIÇAO:");

    if((dia && especialidade && turno && dataCompleta)!= ""){

        
        res.send(dia+ especialidade+ turno+ dataCompleta);
        //const numero = requisicao['queryResult']['outputContexts'][1]['name'].split("/")[4].replace('whatsapp:', '')
        const querySelect = `
        select id_vaga, fk_Medico_id_Medico
        from vagas
        inner join medico
        inner join especialidade
        on vagas.fk_Medico_id_Medico = medico.id_Medico 
        and medico.fk_Especialidade_id_especialidade = especialidade.id_especialidade 
        and vagas.dia = "${dia}" 
        and vagas.turno = "${turno}" 
        and especialidade.especialidade = "${especialidade}"
        and vagas.quantidade_vagas != 0
        order by vagas.dataVaga;`
        
        
        db.query(querySelect, (err, data) => {
            
            if (err) {
                requisicao['fulfillmentText'] = `Não conseguimos agendar sua consulta.\nVocê pode tentar de novo?\nSe o problema persistir, procure a unidade de saúde mais próxima, tá bom?`
                return res.send(requisicao)
            };
            console.log(Object.values(data))
            const idMedico = Object.values(data[0])[1];
            const idVaga = Object.values(data[0])[0]
            
            console.log(idMedico, idVaga)
            
            const queryVerify = `select * from consulta
            where 
            fk_Paciente_CPF = ${cpf}
            and fk_Medico_id_Medico = ${idMedico}
            and fk_Vaga_id_vaga = ${idVaga}
            and DataMarcacao = ${dataCompleta};`
                
            db.query(queryVerify, (err, data) => {
                if (err) return res.send(err);
                
            });

            if(true){
                console.log(dia, especialidade, turno, dataCompleta, idMedico, idVaga);
                
                const queryInsert = `insert into consulta(DataMarcacao, fk_Medico_id_Medico, fk_Paciente_CPF, fk_Vaga_id_vaga) values("${dataCompleta}", ${idMedico}, "${cpf}", ${idVaga});`
                
                db.query(queryInsert, (err, data) => {
                    if (err) return res.send(err);
                    
                });
                
                
                        const queryUpdate = `update vagas
                        set quantidade_vagas = quantidade_vagas -1
                        where id_vaga = ${idVaga};`
                
                        db.query(queryUpdate, (err, data) => {
                    
                            if (err) return res.send(err);
                    
                            requisicao['fulfillmentText'] = `Perfeito, sua consulta foi agendada com sucesso!\nObrigado por usar nossos serviços!\nNão esqueça de chegar com antecedência, para não perder sua vaga!`
                            res.send(requisicao)
                        });

            }
            
        });  
        
    }
}

module.exports = {getUser, getUsers, addUser, deleteUser,
    updateUser, login, logout, refresh, autenticar,
    showAllVacancies, getByCPF, getVagasbyEspecializacao,
getVagasbyDia, turnos, turnosY}