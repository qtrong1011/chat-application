const generateMessage = (username,id,text) =>{
    return {
        username,
        id,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username,id, urlLocation) =>{
    return {
        username,
        id,
        urlLocation,
        createdAt: new Date().getTime()
    }

}
const generateAdminMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage,
    generateAdminMessage
}