const io = require('socket.io')(8080);

const users = {};


io.on('connection', socket => {
    //console.log("new user")
    //socket.emit('chatMessage', "Hello World");
    socket.on('newUser', name => {
        users[socket.id] = name;
        socket.broadcast.emit('userConnected', name);
    })
    socket.on('sendChatMessage', message => {
        //console.log(message);
        socket.broadcast.emit("chatMessage", {message: message, name: users[socket.id]});
    })
    socket.on('disconnect', () => {
        socket.broadcast.emit("userDisconnected", users[socket.id]);
        delete users[socket.id];
    })
});