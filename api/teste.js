
function inverterData(data) {
    let newData = data.slice(0,10).split("/")

    let element = ""

    for (let i = (newData.length)-1; i >= 0; i--) {  
        (i==0)? element += newData[i]:element += newData[i] + "/"
    }

    console.log(element)
    return element
}

function dados(dd){

    const p = Object.values(dd)
    console.log(p[1]);
    
}

function saidaQ(req){
let q =""

if (!req.body.especialidade==null){
    console.log(especialidade)
}

return q
};

dados({ email: 'email', senha: '0000' })
//inverterData("25/09/2002")