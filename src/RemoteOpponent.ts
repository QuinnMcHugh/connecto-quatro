import { Opponent, Move, OpponentOptions } from './Opponent';
import { io, Socket } from 'socket.io-client';
import { CellType } from './GridModel';
import { Player } from './Player';
import { GameModel, Turn, oppositeCellType } from './GameModel';

const ENDPOINT = "http://localhost:3000";

const convertObjectToQueryString = (obj: { [key: string]: any }): string => {
  let str = '';
  Object.keys(obj).forEach((key: string) => {
    const val = obj[key] ?? '';
    str += `${key}=${val}&`;
  });
  return str.substr(0, str.length - 1);
};

const createGameLink = (roomId: string): string => {
  return `${window.location.href}${roomId}`;
}

export class RemoteOpponent implements Opponent {
  private _socket: Socket;
  private _self: Player;
  private _game: GameModel;

  constructor (options: OpponentOptions) {
    this._self = options.player;
    this._game = options.game;

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
    console.log(`query params: ${convertObjectToQueryString(queryParams)}`);
    console.log(`sending connection with ${roomId || null} from ${this._socket.id}`);
    
    this._socket.on('room formed', (roomId: string) => {
      console.log(`room fomred with id ${roomId}`);
      this._game.setGameJoinLink(createGameLink(roomId));
    });
    this._socket.on('second player joined', () => {
      console.log(`let's get ready to rumble!`);
      // todo: disable game play until each player is present
    });

    this._socket.on('gameSetup', (color: CellType, turn: Turn) => {
      console.log(`gameSetup: start turn: ${turn} my color: ${color}`);
      this._game.receiveStartParams(color, turn);
    });

    this._socket.on('disc played', (color: CellType, column: number) => {
      console.log(`received opponent play at column ${column} of color ${color}`);
      this._makeMove({
        column,
        color,
      });
    });
  }

  private _makeMove(move: Move) {
    this._game.receiveOpponentMove(move);
  }

//   public getMove(): Promise<Move> {
//     let move: Move;
//     this._socket.on('play disc', () => {
//       move.color = this._self.color;
//       move.column = 0;
//     });
//     this._socket.once
//   }

  public notifyMove(move: Move): void {
    // send message to server
    this._socket.emit('play disc', move.color, move.column);
    console.log(`player placing disc of ${move.color} in column ${move.column}`);
  }
}