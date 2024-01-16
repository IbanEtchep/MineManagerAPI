const io = require('socket.io-client');

const url = 'http://localhost:3333'; // Notice it's http, not ws
const socket = io(url);

socket.on('connect', () => {
  console.log('Connection successfully opened');
});

socket.on('error', (error) => {
  console.error('WebSocket Error:', error);
});

socket.on('log', (data) => {
  console.log('Server:', data);
});

socket.on('disconnect', () => {
  console.log('Connection closed');
});

//subscribe to
