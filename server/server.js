const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {generateMessage,generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const app= express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname , '../public')));

var server = http.createServer(app);
var io=socketIO(server);
var users = new Users();

io.on('connection',function(socket) {
  console.log('New User connected');

  socket.on('join' , function(params, callback){
    if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and Room name are required');
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id , params.name, params.room);
    io.to(params.room).emit('updateUserList' , users.getUserList(params.room));

    socket.emit('newMessage' , generateMessage('Admin' , 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage' ,generateMessage('Admin' , `${params.name} has just joined!`));
    callback();
  });
  socket.on('disconnect' , function(){
    var user = users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUserList' , users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin' , `${user.name} has left the Chat room`));
    }
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
  socket.on('createLocationMessage' , function(coords){
    io.emit('newLocationMessage' , generateLocationMessage('Admin', `${coords.latitude} , ${coords.longitude}`));
  });


});

server.listen(port, function(){
  console.log('Server has started....');
});
