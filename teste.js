
function inverterData(data) {
    let newData = data.slice(0,10).split("-")

    let element = ""

    for (let i = (newData.length)-1; i >= 0; i--) {  
        (i==0)? element += newData[i]:element += newData[i] + "/"
    }

    console.log(element)
    return element
}

inverterData("2002-09-25T03:00:00.000Z")