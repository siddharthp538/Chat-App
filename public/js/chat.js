var socket = io();

function scrollToBottom(){
  //Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  //heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();
  if(clientHeight + scrollTop + lastMessageHeight + newMessageHeight>= scrollHeight){
    messages.scrollTop(scrollHeight);
  }

}

socket.on('connect' ,function(){
  console.log('Connected to the server');


});
socket.on('disconnect' , function(){
  console.log('Disconnected from the server');
});

socket.on('newMessage' , function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  //var li = jQuery('<li></li>');
  //li.text(`${message.from}: ${formattedTime} ${message.text}`);

  jQuery('#messages').append(html);
  scrollToBottom();
});



jQuery('#message-form').on('submit', function(e){
  e.preventDefault();
  var messageText = jQuery('[name=message]');
  socket.emit('createMessage' , {
    from : 'User',
    text : messageText.val()
  } , function(){
    messageText.val('');
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
  if(!navigator.geolocation){
    return alert('Geolocation not supported by your browser.');
  }
  locationButton.attr('disabled','disabled').text('Sending Location...');;
  navigator.geolocation.getCurrentPosition(function(pos){
    locationButton.removeAttr('disabled').text('Send Location');
    socket.emit('createLocationMessage' , {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });

  }, function(){
    locationButton.removeAttr('disabled').text('Send Location');
    alert('Unable to fetch location');
  });
});

socket.on('newLocationMessage' , function(message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt : formattedTime
  });

    jQuery('#messages').append(html);
    scrollToBottom();
  /*
  var li = jQuery('<li></li>');
  var a = jQuery('<a target="_blank">My Current Location</a>');
  li.text(`${message.from}: ${formattedTime} `);
  a.attr('href' , message.url);
  li.append(a);
  jQuery('#messages').append(li);
  */
});
