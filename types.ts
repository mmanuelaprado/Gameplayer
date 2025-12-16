export interface GameSettings {
  quality: 'low' | 'high';
  audioEnabled: boolean;
  dayCycle: number; // 0 to 1
}

export interface PlayerState {
  position: [number, number, number];
  isMoving: boolean;
}

// Equivalent to RenderSettings in Unity
export interface WorldConfig {
  fogColor: string;
  fogDensity: number;
  ambientColor: string;
  ambientIntensity: number;
}