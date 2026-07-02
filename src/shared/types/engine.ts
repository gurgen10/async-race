export type EngineStatus = 'started' | 'stopped' | 'drive';

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export type DriveStatus = 'success' | 'broken';
