import { Vector3 } from 'three';

// Tipo de sons disponíveis
export type SoundType = 'click' | 'step' | 'success' | 'jump';

// Armazena dados globais do jogo
export const gameStore = {
  playerPosition: new Vector3(0, 0, 0),
  isInteracting: false,
  
  // Função auxiliar para disparar sons (O AudioManager vai escutar isso)
  triggerSound: (type: SoundType) => {
    const event = new CustomEvent('play-sound', { detail: type });
    window.dispatchEvent(event);
  }
};