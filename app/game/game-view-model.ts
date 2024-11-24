import { Observable } from '@nativescript/core';
import { Snake } from './models/snake';
import { NetworkService, GameState } from './services/network-service';
import { SphericalPoint } from './models/spherical-point';

export class GameViewModel extends Observable {
  private _snake: Snake;
  private _score: number;
  private _isPlaying: boolean;
  private _networkService: NetworkService;
  private _otherPlayers: Map<string, Snake> = new Map();

  constructor() {
    super();
    this._snake = new Snake();
    this._score = 0;
    this._isPlaying = false;
    this._networkService = new NetworkService();

    // Subscribe to game state updates
    this._networkService.getGameState().subscribe((state: GameState) => {
      this.updateGameState(state);
    });
  }

  private updateGameState(state: GameState) {
    // Update other players
    state.players.forEach(playerState => {
      if (playerState.id !== this._networkService.currentPlayerId) {
        let otherSnake = this._otherPlayers.get(playerState.id);
        if (!otherSnake) {
          otherSnake = new Snake();
          this._otherPlayers.set(playerState.id, otherSnake);
        }
        // Update other snake's state
        otherSnake.updateFromState(playerState);
      }
    });

    this.notifyPropertyChange('otherPlayers', Array.from(this._otherPlayers.values()));
  }

  startGame() {
    this._isPlaying = true;
    this._networkService.connect();
    this.notifyPropertyChange('isPlaying', true);
  }

  endGame() {
    this._isPlaying = false;
    this._networkService.disconnect();
    this.notifyPropertyChange('isPlaying', false);
  }

  updateJoystick(x: number, y: number) {
    if (this._isPlaying) {
      this._snake.move(x, y);
      
      // Send updated state to server
      this._networkService.updatePlayerState({
        position: this._snake.position,
        segments: this._snake.segments,
        size: this._snake.size,
        score: this._score
      });

      this.notifyPropertyChange('snake', this._snake);
    }
  }

  get snake(): Snake {
    return this._snake;
  }

  get score(): number {
    return this._score;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get otherPlayers(): Snake[] {
    return Array.from(this._otherPlayers.values());
  }
}