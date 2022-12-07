//This is going to be our new server
const express = require('express');
const app = express();
const server = require('http').Server(app);
//This is how we are connecting to the server.
const io = require('socket.io')(server);

//This is a folder that we will set the server to
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public')); //This is a new folder that we will place the client side functions in "script.js"
app.use(express.urlencoded({extended: true})); //Allows use of url body instead of form.

//Initializing the rooms this will follow a JSON format. "name" is a key: {name: {}}
const rooms = {"Public 1" : {users: {}},
               "Public 2" : {users: {}},
               "Public 3" : {users: {}},
               "Public 4" : {users: {}},
               "Public 5" : {users: {}}};
const users = {};


app.get('/', (req, res) => {
    res.render('index', {rooms: rooms});//Adding a new room to the rooms
})

app.post('/room', (req, res) => {
    if(rooms[req.body.room] != null){
        return res.redirect('/'); //Return to the room with a name if it exists
    }
    rooms[req.body.room] = {users: {}}; //"room" is the name of the room
    res.redirect(req.body.room); //Sends us to the new room

    io.emit('roomCreated', req.body.room);
})


//The first parameter is a room name. This is a new chat room
app.get('/:room', (req, res) => {
    if(rooms[req.params.room] == null){ //Room does not exist, redirect them to home page
        return res.redirect('/'); // '/' is the home page
    }
    res.render('room', {roomName: req.params.room}); //This will get the room
})

server.listen(3000);

//This will contain all the users and their server ids and change it into their names

//This is essentially going to hold all of the functions that we want to use
io.on('connection', socket => {
    //When a new user has logged on with a name, we will load in their name into the users array then send this info to the client side to
    //make it appear on the page
    socket.on('newUser', (room, name) => {
        socket.join(room); //Send the user into a room
        rooms[room].users[socket.id] = name; //The name input is the name that we are given
        socket.broadcast.to(room).emit('userConnected', name); //Do "userConnected" function
    })
    socket.on('newUserLobby', name => {
        users[socket.id] = name; //The name input is the name that we are given
        socket.broadcast.emit('userConnectedLobby', name); //Do "userConnected" function
    })

    //This will send the an array of the message and of who sent what.
    socket.on('sendChatMessage', (room, message) => {
        //chatMessage will basically tell the client side to show the message
        socket.broadcast.to(room).emit("chatMessage", {message: message, name: rooms[room].users[socket.id]});
    })
    socket.on('sendLobbyChatMessage', (message) => {
        socket.broadcast.emit("lobbyChatMessage", {message: message, name: users[socket.id]});
    })
    //This does exactly what creating a new user does but checks to see if the user has left
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            //This will tell the other people that a person has left
            socket.broadcast.to(room).emit("userDisconnected", rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id]; //We have to delete the user from the users list.
        })
    })

    socket.on('disconnectLobby', () => {
        getUserRooms(socket).forEach(room => {
            socket.broadcast.emit("userDisconnectedLobby", users[socket.id]);
            delete users[socket.id]; //We have to delete the user from the users list.
        })
    })
});
function getUserRooms(socket){
    //Checks all names and users then returns where a user is
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if(room.users[socket.id] != null){
            names.push(name);
        }
        return names;
    }, []);
}
//adding npm i express ejs