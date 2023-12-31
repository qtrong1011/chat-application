const users = [

]
//Add User
const addUser = ({id, username, room}) =>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }
    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    //Validate username
    if (existingUser){
        return {
            error: 'Username has already taken!'
        }
    }
    //Store user
    const user = {id,username, room}
    users.push(user)
    return {user}
}

//Remove User
const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if (index !== -1){
        return users.splice(index,1)[0]
    }
}


//Get User
const getUser = (id) =>{
    return users.find((user)=>{
        return user.id === id
    })
}

//Get Users in Room
const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>{
        return user.room === room
    })
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}