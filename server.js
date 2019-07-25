// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 8080);

app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(8080, function() {
  console.log('Starting server on port 8080');
});

// WebSocket handlers

/**
 *
  GAMESTATE {
    READY,
    ROLLING,
    FIGHTING,
    ENDTURN,
    ENDGAME
  }

  PLAYERSTATE {
    CONNECTED,
    READY,
    ROLLING,
    DONE_ROLLING,
    FIGHTING,
    END_TURN,
    END_GAME
  }

  PLAYER {
    name: string;
    state: GAMESTATE;
    turn: number;
    dice: Die[];
  }
 */

const players = {};

io.on('connect', function(socket) {
  let thisPlayer;
  console.log('User connected. id: ' + socket.id);
  players[socket.id] = {
    id: socket.id,
    name: null,
    state: 'CONNECTED',
    turn: 1,
    dice: [],
  };

  thisPlayer = players[socket.id];

  socket.on('join', function(playerName) {
    console.log('Player ' + playerName + ' has joined the game');
    socket.emit('joined', 'You have joined the game!');

    thisPlayer.name = playerName;
    thisPlayer.state = 'READY';

    if (players.length === 2) {
      // start game
      socket.emit('ready');
    }
  });

  socket.on('advance', function(playerName) {

  });

});

