import { db } from "../db.js"

export const getUsers = (_, res) =>{
    const q = "SELECT CPF, pNome, sNome, Endereco, Email, DATE_FORMAT(dataNascimento,'%d/%m/%Y') as dataNascimento FROM sistema.paciente;"

    db.query(q, (err, data) => {
        if (err) return res.json(err);

        return res.status(200).json(data);
    });
};

export const getUser = (req, res) =>{
    const cpf = req.body.CPF;
    const q = `SELECT CPF, pNome, sNome, Endereco, Email, DATE_FORMAT(dataNascimento,'%d/%m/%Y') as dataNascimento FROM sistema.paciente where CPF = '${cpf}';`

    db.query(q, (err, data) => {
        if (err) return res.json(err);

        return res.status(200).json(data);
    });
};

export const addUser = (req, res) =>{
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

export const updateUser = (req, res) =>{
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

export const deleteUser = (req, res) =>{
    console.log(req.body)
    const cpf = req.body.CPF;
    const q = `delete from Paciente where cpf = '${cpf}'`;

    db.query(q,(err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário deletado com sucesso");
    });
};