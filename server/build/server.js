"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require("path");
var PORT = 5000;
var io = require('socket.io')(http);
var CellType;
(function (CellType) {
    CellType["Yellow"] = "Yellow";
    CellType["Red"] = "Red";
    CellType["Empty"] = "Empty";
})(CellType || (CellType = {}));
var Turn;
(function (Turn) {
    Turn["Yellow"] = "Yellow";
    Turn["Red"] = "Red";
    Turn["GameOver"] = "GameOver";
})(Turn || (Turn = {}));
;
function oppositeCellType(input) {
    return input === CellType.Empty
        ? CellType.Empty
        : input === CellType.Red
            ? CellType.Yellow
            : CellType.Red;
}
http.listen(PORT, function () {
    console.log("listening on *:" + PORT);
});
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/../public", "index.html"));
});
app.use(express.static(path.join(__dirname, "/../public")));
// Returns reasonably unique 8 digit id
var generateRoomId = function () {
    return Array.from({ length: 8 })
        .map(function (_) { return Math.floor(Math.random() * 16).toString(16); })
        .join('');
};
var roomGameMapping = new Map();
var getRoomContaining = function (socketId, roomGameMap) {
    var roomId = null;
    roomGameMap.forEach(function (value, key) {
        if (value.sockets.some(function (socket) { return socket.id === socketId; })) {
            roomId = key;
        }
    });
    return roomId;
};
io.on('connection', function (socket) {
    var query = socket.handshake.query;
    var roomId = query['roomId'];
    // Create new room or use existing
    if (roomId && roomId.length) {
        if (roomGameMapping.has(roomId) && roomGameMapping.get(roomId).sockets.length < 2) {
            var p1Color = roomGameMapping.get(roomId).sockets[0].color;
            var p2Color = oppositeCellType(p1Color);
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
        var color = query['color'];
        var turn = query['turn'];
        var newRoomId = generateRoomId();
        socket.join(newRoomId);
        roomGameMapping.set(newRoomId, {
            sockets: [{
                    id: socket.id,
                    color: color,
                }],
            startTurn: turn,
        });
        socket.emit('room formed', newRoomId);
    }
    socket.on('play disc', function (color, column) {
        var room = getRoomContaining(socket.id, roomGameMapping);
        socket.to(room).emit('disc played', color, column);
    });
    socket.on('request rematch', function (turn) {
        var room = getRoomContaining(socket.id, roomGameMapping);
        roomGameMapping.get(room).startTurn = turn;
        socket.to(room).emit('receive rematch', turn);
    });
    socket.on('disconnect', function (reason) {
        var roomId = getRoomContaining(socket.id, roomGameMapping);
        if (roomId) {
            io.to(roomId).emit('room ended');
            roomGameMapping.delete(roomId);
        }
    });
});
