const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app= express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname , '../public')));

var server = http.createServer(app);
var io=socketIO(server);

io.on('connection',function(socket) {
  console.log('New User connected');
  socket.emit('newMessage' , {
    from: 'Admin',
    text: 'Welcome to the chat app',
    createdAt: new Date().getTime()
  });
  socket.broadcast.emit('newMessage' , {
    from: 'Admin',
    text: 'New User Joined',
    createdAt: new Date().getTime()
  });
  socket.on('disconnect' , function(){
    console.log('User was disconnected');
  });
  socket.on('createMessage' , function(message){
     io.emit('newMessage' , {
      from: message.from,
      text: message.text,
      createdAt : new Date().getTime()
    });
    /*
    socket.broadcast.emit('newMessage' , {
      from: message.from,
      text: message.text,
      createdAt : new Date().getTime()
    });
    */
  });

});

server.listen(port, function(){
  console.log('Server has started....');
});
