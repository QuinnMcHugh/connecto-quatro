import { Opponent, Move, OpponentOptions } from './Opponent';
import { io, Socket } from 'socket.io-client';
import { CellType } from './GridModel';
import { Player } from './Player';
import { GameModel, Turn, oppositeCellType } from './GameModel';
import { makeObservable, observable } from 'mobx';

const ENDPOINT = "http://localhost:3000"; // todo: can this be assumed to be the same url+portit was served from

const convertObjectToQueryString = (obj: { [key: string]: any }): string => {
  let str = '';
  Object.keys(obj).forEach((key: string) => {
    const val = obj[key] ?? '';
    str += `${key}=${val}&`;
  });
  return str.substr(0, str.length - 1);
};

const createGameLink = (roomId: string): string => {
  return `${window.location.origin}/${roomId}`;
}

export class RemoteOpponent implements Opponent {
  private _socket: Socket;
  private _self: Player;
  private _game: GameModel;
  private _roomFull: boolean;
  private _connectionEnded: boolean;

  constructor (options: OpponentOptions) {
    makeObservable<RemoteOpponent | "_roomFull" | "_connectionEnded">(this, {
      _roomFull: observable,
      _connectionEnded: observable,
    });

    this._self = options.player;
    this._game = options.game;
    this._roomFull = false;
    this._connectionEnded = false;

    // Determine handshake query based on the state of the game being joined/created
    const roomId = window.location.pathname.substr(1);
    const queryParams = roomId && roomId.length
      ? {
        roomId: roomId,
      }
      : {
        roomId: roomId || null,
        color: oppositeCellType(this._self.color),
        turn: this._game.turn,
      };

    // instantiate socket, set up communication
    this._socket = io(ENDPOINT, {
      query: convertObjectToQueryString(queryParams),
    });
    
    this._socket.on('room formed', (roomId: string) => {
      this._game.setGameJoinLink(createGameLink(roomId));
    });
    this._socket.on('second player joined', () => {
      this._roomFull = true;
    });

    this._socket.on('gameSetup', (color: CellType, turn: Turn) => {
      this._game.receiveStartParams(color, turn);
      this._roomFull = true;
    });

    this._socket.on('disc played', (color: CellType, column: number) => {
      this._makeMove({
        column,
        color,
      });
    });

    this._socket.on('receive rematch', (turn: Turn) => {
      this._game.receiveRematchParams(turn);
    });

    this._socket.on('disconnect', () => {
      this.disconnect();
    });
    this._socket.on('room ended', () => {
      this.disconnect();
    });
  }

  public disconnect() {
    this._roomFull = false;
    this._connectionEnded = true;
    this._socket.disconnect();
  }

  private _makeMove(move: Move) {
    this._game.receiveOpponentMove(move);
  }

  public notifyMove(move: Move): void {
    this._socket.emit('play disc', move.color, move.column);
  }

  public notifyOfRematch(turn: Turn) {
    this._socket.emit('request rematch', turn);
  }

  get hasJoined(): boolean {
    return this._roomFull || this._connectionEnded;
  }

  get hasDisconnected(): boolean {
    return this._connectionEnded;
  }
}