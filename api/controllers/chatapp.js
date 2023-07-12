const db = require ("../db");
require('dotenv').config()

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

function exibirEspecialidades(req, res){
    const requisicao = req.body;
    
    
      
      
      const q = `select DISTINCT  especialidade
      from vagas
      inner join medico
      inner join especialidade
      on vagas.fk_Medico_id_Medico = medico.id_Medico 
      and medico.fk_Especialidade_id_especialidade = especialidade.id_especialidade 
      and vagas.quantidade_vagas > 0
      order by dataVaga ASC, turno ="manhã" desc;`
      

      db.query(q, (err, data) => {
          if(err){
              requisicao['fulfillmentText'] = "Houve um problema de conexão, sentimos muito";
              return res.json(requisicao);
            }
            let info = Object.values(data);
            console.log(info)
            if (data.length >= 0) {
                let element = [];
                for (i in data) {
                        let info = Object.values(data[i]);
                        for (let j = 0; j < info.length; j++) {
                                element.push({value:`${info[j]}`});
                            }
                        }
                console.log(element);
                requisicao['fulfillmentMessages']= [
                    {
                        payload:{element}
                    }
                ];
                return res.status(200).json(requisicao);
            }
        });

        //reqs[0].text.text.push(array)
       
        
    }
    
//1) VERFICAR DISPONIBILIDADE DO MÉDICO
function getVagasbyEspecializacao(req, res){
    const requisicao = req.body;
    const especialidade = requisicao.queryResult.parameters.especializacao

    const q = `select DISTINCT dia
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico 
    and medico.fk_Especialidade_id_especialidade = especialidade.id_especialidade 
    and especialidade.especialidade = "${especialidade}"
    and vagas.quantidade_vagas != 0
    order by dataVaga ASC, turno ="manhã" desc;`
    
    db.query(q, (err, data) => {

      
        if (err) return res.send(err);
        let info = Object.values(data);
        console.log(info)
        if (data.length >= 0) {
            let element = [];
            for (i in data) {
                    let info = Object.values(data[i]);
                    for (let j = 0; j < info.length; j++) {
                            element.push({value:`${info[j]}`});
                        }
                    }
            console.log(element);
            requisicao['fulfillmentMessages']= [
                {
                    payload:{element}
                }
            ];
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

    const q = `select DISTINCT turno
    from vagas
    inner join medico
    inner join especialidade
    on vagas.fk_Medico_id_Medico = medico.id_Medico 
    and medico.fk_Especialidade_id_especialidade  = especialidade.id_especialidade 
    and vagas.dia = "${dia}" 
    and especialidade.especialidade = "${especialidade}"
    and vagas.quantidade_vagas != 0
    order by dataVaga ASC, turno ="manhã" desc;`
    
    db.query(q, (err, data) => {

        if (err) return res.send(err);

        if (data.length > 0) {
            let element = [];
                for (i in data) {
                        let info = Object.values(data[i]);
                        for (let j = 0; j < info.length; j++) {
                                element.push({value:`${info[j]}`});
                            }
                        }
                console.log(element);
                requisicao['fulfillmentMessages']= [
                    {
                        payload:{element}
                    },
                ];
                return res.status(200).json(requisicao);
        }
    });

}


function turnos(req, res){
    
    const requisicao = req.body;
    const medico = requisicao.queryResult.outputContexts[0].parameters.especializacao
    const dia = requisicao.queryResult.outputContexts[1].parameters.agenda
    const turno = requisicao.queryResult.outputContexts[1].parameters.turnos
    console.log(medico, dia, turno)
    requisicao['fulfillmentText'] = `Certo, podemos confirmar sua consulta com o ${medico} ${dia} no turno da ${turno}?`
    requisicao['fulfillmentMessages']= [
        {
            payload:{
                element:[
                    { value: 'Sim' },
                    { value: 'Não' }
                  ]
            }
        },
    ];
    return res.status(200).json(requisicao);
}





function turnosY(req, res){
    const date = new Date();
    const requisicao = req.body;

try {
    const especialidade =requisicao.queryResult.outputContexts[0].parameters.especializacao
    const dia =  requisicao.queryResult.outputContexts[0].parameters.agenda
    const turno = requisicao.queryResult.outputContexts[0].parameters.turnos

    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dataCompleta = `${year}-${month}-${day}`

    
    
} catch (error) {
    requisicao.fulfillmentText = `Houve algum problema com os dados selecionados.\nPode repetir o processo do começo, por favor?`
    return res.send(error)
}
    
}



function confirmar(req, res){
    const date = new Date();
    const requisicao = req.body;
    const especialidade =requisicao.queryResult.outputContexts[0].parameters.especializacao
    const dia =  requisicao.queryResult.outputContexts[0].parameters.agenda
    const turno = requisicao.queryResult.outputContexts[0].parameters.turnos
    const cpf = requisicao.queryResult.outputContexts[0].parameters.cpf
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dataCompleta = `${year}-${month}-${day}`

    const queryVerify = `select statusc from consulta
    join especialidade
    join medico
    on 
    fk_Paciente_CPF = "${cpf}"
    and medico.id_Medico = consulta.fk_Medico_id_Medico
    and medico.fk_Especialidade_id_especialidade = especialidade.id_especialidade
    and especialidade.especialidade = "${especialidade}"
    and statusc = 1;`

    
    
    db.query(queryVerify, (err, data) => {
        if (err) return res.send(err);
        console.log(data)
        try {
        if (data[0]['statusc']==1){
            requisicao['fulfillmentText'] = `Você já possui uma consulta para essa especialidade`
            return res.send(requisicao)
        }

    } catch{
        if((dia!= undefined) &&( especialidade!= undefined) && (turno != undefined)){
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
            
            
            db.query(querySelect, (err, dataSelect) => {
                if (err) {
                    console.log(err)
                    requisicao['fulfillmentText'] = `Há algum erro em relação aos dados inseridos, por favor tenha cuidado`
                    return res.send(requisicao)
                };
    
            console.log(dataSelect)
            const idMedico = Object.values(dataSelect[0])[1];
            const idVaga = Object.values(dataSelect[0])[0]
    
                const queryInsert = `insert into consulta(DataMarcacao, fk_Medico_id_Medico, fk_Paciente_CPF, fk_Vaga_id_vaga, statusc) values("${dataCompleta}", ${idMedico}, "${cpf}", ${idVaga}, 1);`
            
            db.query(queryInsert, (err, data) => {
                if (err) return res.send(err);
                
            });
            
                    const queryUpdate = `update vagas
                    set quantidade_vagas = quantidade_vagas -1
                    where id_vaga = ${idVaga};`
            
                    db.query(queryUpdate, (err, data) => {
                        if (err) return res.send(err);
                
                    });
    
            });  
            
        }
    }
    });     
        

    
        
}


async function pesquisarCPF(){
    const q = `SELECT * FROM sistema.paciente where cpf = "05422932269";`
    await db.query(q, (err, data)=> {
        if(err) return err;
        return data;
    })
}


module.exports = {getByCPF, getVagasbyEspecializacao,
getVagasbyDia, turnos, turnosY, exibirEspecialidades, confirmar}