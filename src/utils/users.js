const users = []

//adduser

const addUser = ({id, username, room})=>{
    //Clear the data
    username = username.trim().toLowerCase()
    room = room.toString().trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return{
            error:  'Username and Room are required!'
        }
    }
    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return{
            error: 'Username already in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (roomname)=>{
    roomname = roomname.toString().trim().toLowerCase() 
    return users.filter((user)=>user.room == roomname)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}