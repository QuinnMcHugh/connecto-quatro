import { Socket } from 'socket.io';

var app = require('express')();
var http = require('http').createServer(app);
var PORT = 8080;
var io = require('socket.io')(http);

enum CellType {
  Yellow = 'Yellow',
  Red = 'Red',
  Empty = 'Empty',
}

enum Turn {
  Yellow = 'Yellow',
  Red = 'Red',
  GameOver = 'GameOver',
};

function oppositeCellType(input: CellType) {
  return input === CellType.Empty
    ? CellType.Empty
    : input === CellType.Red
      ? CellType.Yellow
      : CellType.Red;
}

http.listen(PORT, function () {
  console.log("listening on *:" + PORT);
});

// Returns reasonably unique 8 digit id
const generateRoomId = () => {
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

const roomGameMapping = new Map<string, Game>();

const getRoomContaining = (socketId: string, roomGameMap: Map<string, Game>): string => {
  let roomId = null;
  roomGameMap.forEach((value: Game, key: string) => {
    if (value.sockets.some(socket => socket.id === socketId)) {
      roomId = key;
    }
  });
  return roomId;
};

io.on('connection', (socket: Socket) => {
  const query = socket.handshake.query;
  const roomId = query['roomId'];

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
    }
  }
  else {
    const color = query['color'] as CellType;
    const turn = query['turn'] as Turn;
    const newRoomId = generateRoomId();

    socket.join(newRoomId);
    roomGameMapping.set(newRoomId, {
      sockets: [{
        id: socket.id,
        color,
      }],
      startTurn: turn,
    });

    socket.emit('room formed', newRoomId);
  }

  socket.on('play disc', (color: CellType, column: number) => {
    const room = getRoomContaining(socket.id, roomGameMapping);
    socket.to(room).emit('disc played', color, column);
  });

  socket.on('request rematch', (turn: Turn) => {
    const room = getRoomContaining(socket.id, roomGameMapping);
    roomGameMapping.get(room).startTurn = turn;
    socket.to(room).emit('receive rematch', turn);
  });

  socket.on('disconnect', (reason) => {
    const roomId = getRoomContaining(socket.id, roomGameMapping);
    if (roomId) {
      io.to(roomId).emit('room ended');
      roomGameMapping.delete(roomId);
    }
  });
});
