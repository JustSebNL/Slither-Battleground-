import { Observable } from '@nativescript/core';
import { SphericalPoint } from './spherical-point';
import { PlayerState } from '../services/network-service';

export class Snake extends Observable {
  private _position: SphericalPoint;
  private _segments: SphericalPoint[];
  private _size: number;
  private _speed: number;
  private _direction: number;
  private readonly EARTH_RADIUS = 6371; // km

  constructor() {
    super();
    this._position = new SphericalPoint(
      Math.random() * 180 - 90,  // Random latitude
      Math.random() * 360 - 180, // Random longitude
      this.EARTH_RADIUS
    );
    this._segments = [this._position];
    this._size = 1;
    this._speed = 0.1;
    this._direction = 0;
  }

  move(joystickX: number, joystickY: number) {
    // Update direction based on joystick input
    this._direction = Math.atan2(joystickY, joystickX);
    
    // Convert direction to degrees for great circle calculation
    const headingDegrees = (this._direction * 180) / Math.PI;
    
    // Move along great circle path
    this._position = this._position.moveAlongGreatCircle(
      headingDegrees,
      this._speed
    );

    // Update segments
    this._segments.unshift(this._position);
    while (this._segments.length > this._size) {
      this._segments.pop();
    }

    this.notifyPropertyChange('position', this._position);
    this.notifyPropertyChange('segments', this._segments);
  }

  updateFromState(state: PlayerState) {
    this._position = state.position;
    this._segments = state.segments;
    this._size = state.size;
    
    this.notifyPropertyChange('position', this._position);
    this.notifyPropertyChange('segments', this._segments);
    this.notifyPropertyChange('size', this._size);
  }

  get position(): SphericalPoint {
    return this._position;
  }

  get segments(): SphericalPoint[] {
    return this._segments;
  }

  get size(): number {
    return this._size;
  }

  set size(value: number) {
    if (this._size !== value) {
      this._size = value;
      this.notifyPropertyChange('size', value);
    }
  }
}