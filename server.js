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
  let thisPlayer, enemyPlayer;
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

    //console.log(players);

    thisPlayer.name = playerName;
    thisPlayer.state = 'READY';

    if (Object.keys(players).length === 2) {
      for(let aPlayer in players) {
        if (players[aPlayer].id !== socket.id) {
          enemyPlayer = players[aPlayer];
        }
      }
      // start game
      socket.emit('ready');
    }
  });

  /**
   * {
   *  state: GAMESTATE,
   *  payload?: Die[]
   * }
   */
  socket.on('advance', function({state, payload}) {
    console.log('advance received. current state: ' + state);

    // set the current state on the player object
    players[socket.id].state = state;
    // assign the dice to the player object if they're done rolling
    if (state === 'WAITING_TO_FIGHT') {
      players[socket.id].dice = payload;

      //console.log(players);
      console.log(thisPlayer);
      console.log('------------------')
      console.log(enemyPlayer);
      // check to see if the other player is already ready
      if (enemyPlayer && enemyPlayer.state === 'WAITING_TO_FIGHT') {
        // advance and pass the enemy dice as payload
        socket.emit('fight', enemyPlayer.dice);
        socket.broadcast.emit('fight', thisPlayer.dice);
      }
    }
  });

});

