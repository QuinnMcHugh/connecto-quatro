import { Socket } from 'socket.io';
// todo: make the server/ a separate project with package.json, node_modules/, tsconfig.json, etc. 
//  -have build/ output files too so .js aren't visible

var app = require('express')();
var http = require('http').createServer(app);
var PORT = 8080;
var io = require('socket.io')(http);

// todo: move these to a shared/ between client and server
enum CellType {
  Yellow = 'Yellow',
  Red = 'Red',
  Empty = 'Empty',
}

export enum Turn {
  Yellow = 'Yellow',
  Red = 'Red',
  GameOver = 'GameOver',
};

export function oppositeCellType(input: CellType) {
  return input === CellType.Empty
    ? CellType.Empty
    : input === CellType.Red
      ? CellType.Yellow
      : CellType.Red;
}

// for printing ES6 Map's, can be deleted post-debugging
function replacer(key, value) {
  const originalObject = this[key];
  if(originalObject instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
    };
  } else {
    return value;
  }
}

// export interface Move {
//   column: number;
//   color: CellType;
// }

http.listen(PORT, function () {
    console.log("listening on *:" + PORT);
});

// Returns reasonably unique 8 digit id
var generateRoomId = function () {
    return Array.from({ length: 8 })
        .map(function (_) { return Math.floor(Math.random() * 16).toString(16); })
        .join('');
};

interface GameSocket {
  id: string;
  color: CellType;
}

interface Game {
  sockets: GameSocket[];
  startTurn: Turn;
}

// todo: to scale, clean up games after they finish or have been live for 15min
const roomGameMapping = new Map<string, Game>();

var getRoomContaining = (socketId: string, roomGameMap: Map<string, Game>): string => {
    let roomId = null;
    roomGameMap.forEach((value: Game, key: string) => {
      if (value.sockets.some(socket => socket.id === socketId)) {
        roomId = key;
      }
    });
    return roomId;
};

// todo: facilitate game rematches
io.on('connection', (socket: Socket) => {
    var query = socket.handshake.query;
    var roomId = query['roomId'];
    console.log("received a connection: " + roomId + " from " + socket.id);

    // Create new room or use existing
    if (roomId && roomId.length) {
        if (roomGameMapping.has(roomId) && roomGameMapping.get(roomId).sockets.length < 2) {
            const p1Color = roomGameMapping.get(roomId).sockets[0].color;
            const p2Color = oppositeCellType(p1Color);
            roomGameMapping.get(roomId).sockets.push({
              id: socket.id,
              color: p2Color,
            });

            socket.join(roomId);
            socket.to(roomId).emit('second player joined');
            socket.emit('gameSetup', p2Color, roomGameMapping.get(roomId).startTurn);
            console.log("second player joined from " + socket.id);
        }
        else {
            // send message about invalid roomId
            console.log("invalid roomId sent from " + socket.id);
        }
        console.log(`roomId ${JSON.stringify(roomGameMapping, replacer)} from ${socket.id}`);
    }
    else {
        var color = query['color'] as CellType;
        var turn = query['turn'] as Turn;
        var newRoomId = generateRoomId();

        socket.join(newRoomId);
        roomGameMapping.set(newRoomId, {
          sockets: [{
            id: socket.id,
            color,
          }],
          startTurn: turn,
        });

        socket.emit('room formed', newRoomId);
        console.log("room formed: " + newRoomId + " from " + socket.id);
        console.log(`new roomGameMapping: ${JSON.stringify(roomGameMapping, replacer)}`);
    }

    socket.on('play disc', (color: CellType, column: number) => {
        console.log(`playing ${color} in column ${column} from ${socket.id}`);
        console.log(`current roomGameMapping: ${JSON.stringify(roomGameMapping, replacer)}`);
        const room = getRoomContaining(socket.id, roomGameMapping);
        console.log(`room: ${room}`);
        socket.to(room).emit('disc played', color, column);
    });

    socket.on('disconnect', function (reason) {
        // show message that other player left
    });
});

// user shares link with 'room'
// the first two sockets entering that 'room' will become players in the game
// in uri, support noticing room id and automatically syncing to specified game
