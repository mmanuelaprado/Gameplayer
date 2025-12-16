import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, BakeShadows, Preload } from '@react-three/drei';
import { WorldManager } from './components/WorldManager';
import { CityScene } from './components/CityScene';
import { UIOverlay } from './components/UIOverlay';
import { Player } from './components/Player';
import { NPC } from './components/NPC';
import { MissionManager } from './components/MissionManager';
import { AudioManager } from './components/AudioManager';
import { OrientationGuard } from './components/OrientationGuard'; // Importando o Guard

// Loading Screen
const Loader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-sky-100 z-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-sky-600 mb-2">Loading Neon City...</h2>
        <div className="w-48 h-2 bg-sky-200 rounded-full overflow-hidden">
           <div className="h-full bg-sky-500 animate-[pulse_1s_ease-in-out_infinite]" style={{width: '60%'}}></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Game State
  const [playerColor, setPlayerColor] = useState('#06b6d4');
  const [playerChat, setPlayerChat] = useState<string | null>(null);

  const handleChat = (msg: string) => {
    setPlayerChat(msg);
  };

  return (
    <OrientationGuard>
        <div className="relative w-full h-full bg-sky-200">
          
          {/* Gerenciador de Áudio (Global) */}
          <AudioManager />

          {/* 2D UI Layer */}
          <UIOverlay 
            onChatSend={handleChat} 
            onColorChange={setPlayerColor}
            currentColor={playerColor}
          />

          {/* 3D Scene Layer */}
          <Canvas shadows dpr={[1, 2]}>
            
            <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
            
            <Suspense fallback={null}>
                <WorldManager />
                <CityScene />
                
                {/* Gerenciador da Missão Tutorial */}
                <MissionManager />

                {/* The Player */}
                <Player 
                  color={playerColor} 
                  chatMessage={playerChat} 
                  onChatTimeout={() => setPlayerChat(null)} 
                />

                {/* NPC Guia (Dourado) - Agora Estacionário e com Ícone! */}
                <NPC 
                  position={[5, 0, 5]} 
                  color="#ffd700" 
                  isStationary={true} 
                  questIcon="!"
                />

                {/* Outros NPCs ambientais (continuam andando) */}
                <NPC position={[-5, 0, 5]} color="#ef4444" />
                <NPC position={[-8, 0, -10]} color="#a855f7" />
                
                <BakeShadows />
                <Preload all />
            </Suspense>
          </Canvas>

          <Suspense fallback={<Loader />}>
          </Suspense>
        </div>
    </OrientationGuard>
  );
};

export default App;