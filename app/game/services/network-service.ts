import { WebSocket } from '@nativescript/websockets';
import { Observable, Subject } from 'rxjs';
import { SphericalPoint } from '../models/spherical-point';

export interface PlayerState {
  id: string;
  position: SphericalPoint;
  segments: SphericalPoint[];
  size: number;
  score: number;
}

export interface GameState {
  players: PlayerState[];
  orbs: SphericalPoint[];
}

export class NetworkService {
  private socket: WebSocket;
  private gameState$ = new Subject<GameState>();
  private playerId: string;

  constructor() {
    this.socket = new WebSocket('wss://your-game-server.com', {
      protocols: ['snake-protocol'],
      timeout: 5000,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('open', () => {
      console.log('Connected to game server');
    });

    this.socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'gameState') {
          this.gameState$.next(data.state);
        } else if (data.type === 'playerId') {
          this.playerId = data.id;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.socket.on('close', () => {
      console.log('Disconnected from game server');
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(), 5000);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  connect() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.socket.open();
    }
  }

  disconnect() {
    this.socket.close();
  }

  updatePlayerState(state: Partial<PlayerState>) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'playerUpdate',
        id: this.playerId,
        state
      }));
    }
  }

  getGameState(): Observable<GameState> {
    return this.gameState$.asObservable();
  }

  get currentPlayerId(): string {
    return this.playerId;
  }
}