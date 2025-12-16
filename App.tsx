import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, BakeShadows, Preload, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { WorldManager } from './components/WorldManager';
import { CityScene } from './components/CityScene';
import { UIOverlay } from './components/UIOverlay';
import { Player } from './components/Player';
import { NPC } from './components/NPC';
import { MissionManager } from './components/MissionManager';
import { AudioManager } from './components/AudioManager';
import { OrientationGuard } from './components/OrientationGuard';

// Loader Component usando hooks do Drei
const LoadingScreen = () => {
  const { progress, active } = useProgress();
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-sky-100 z-[9999] transition-opacity duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-sky-600 mb-2 font-sans">Neon City</h2>
        <div className="w-64 h-4 bg-sky-200 rounded-full overflow-hidden border border-sky-300">
           <div 
             className="h-full bg-sky-500 transition-all duration-300 ease-out" 
             style={{ width: `${progress}%` }}
           ></div>
        </div>
        <p className="mt-2 text-sky-500 font-bold">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [playerColor, setPlayerColor] = useState('#06b6d4');
  const [playerChat, setPlayerChat] = useState<string | null>(null);

  const handleChat = (msg: string) => {
    setPlayerChat(msg);
  };

  return (
    <OrientationGuard>
        <div className="relative w-full h-full bg-sky-200">
          
          <LoadingScreen />
          <AudioManager />

          <UIOverlay 
            onChatSend={handleChat} 
            onColorChange={setPlayerColor}
            currentColor={playerColor}
          />

          <Canvas 
            shadows 
            dpr={[1, 2]}
            gl={{
              // Configuração padrão moderna para cores vibrantes
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
            
            <Suspense fallback={null}>
                <WorldManager />
                <CityScene />
                
                <MissionManager />

                <Player 
                  color={playerColor} 
                  chatMessage={playerChat} 
                  onChatTimeout={() => setPlayerChat(null)} 
                />

                <NPC 
                  position={[5, 0, 5]} 
                  color="#ffd700" 
                  isStationary={true} 
                  questIcon="!"
                />

                <NPC position={[-5, 0, 5]} color="#ef4444" />
                <NPC position={[-8, 0, -10]} color="#a855f7" />
                
                <BakeShadows />
                <Preload all />
            </Suspense>
          </Canvas>
        </div>
    </OrientationGuard>
  );
};

export default App;