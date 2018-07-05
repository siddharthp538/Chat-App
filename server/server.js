const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {generateMessage} = require('./utils/message');

const app= express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname , '../public')));

var server = http.createServer(app);
var io=socketIO(server);

io.on('connection',function(socket) {
  console.log('New User connected');
  socket.emit('newMessage' , generateMessage('Admin' , 'Welcome to the chat app'));
  socket.broadcast.emit('newMessage' ,generateMessage('Admin' , 'New User Joined'));
  socket.on('disconnect' , function(){
    console.log('User was disconnected');
  });
  socket.on('createMessage' , function(message,callback){
     //console.log('createMessage' , message);
     io.emit('newMessage' , generateMessage(message.from,message.text));
     callback('This is from server');
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
