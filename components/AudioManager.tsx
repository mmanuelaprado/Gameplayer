import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { inputStore } from '../utils/inputStore';
import { gameStore, SoundType } from '../utils/gameStore';

// Som curto de "Pop" (Base64 corrigido e otimizado para não quebrar o editor)
const SFX_CLICK = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAACAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAP//AAABAAAA//8AAA==";

export const AudioManager: React.FC = () => {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializa o AudioContext com interação do usuário (necessário para browsers modernos)
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  useEffect(() => {
    const handlePlaySound = (e: Event) => {
      const customEvent = e as CustomEvent<SoundType>;
      if (!audioContext.current) return;

      const type = customEvent.detail;
      
      // Sistema simples de oscilador para sons procedurais (mais leve que carregar mp3)
      const osc = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.current.destination);

      const now = audioContext.current.currentTime;

      if (type === 'step') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } 
      else if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
      else if (type === 'click') {
        // Toca o sample base64 se for clique
        const audio = new Audio(SFX_CLICK);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('play-sound', handlePlaySound);
    return () => {
      window.removeEventListener('play-sound', handlePlaySound);
    };
  }, []);

  return null;
};