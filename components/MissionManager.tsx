import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Html } from '@react-three/drei';
import { gameStore } from '../utils/gameStore';

// Posições importantes da missão
const NPC_POSITION = new Vector3(5, 0, 5); // Onde o Guia está
const PLAZA_POINT = new Vector3(0, 0, 10); // Próximo à fonte

export const MissionManager: React.FC = () => {
    const [missionStep, setMissionStep] = useState(0);
    const [missionText, setMissionText] = useState("Bem-vindo à Neon City! Vá até o Robô Guia.");
    const [showInteractBtn, setShowInteractBtn] = useState(false);

    // Refs para animação
    const markerRef = useRef<any>(null);
    const arrowRef = useRef<Group>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Animação do Marcador de Chão
        if (markerRef.current) {
            markerRef.current.rotation.y += 0.02;
            markerRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
        }

        // Animação da Seta Flutuante (Correção do Date.now)
        if (arrowRef.current) {
            // Flutuar para cima e para baixo
            arrowRef.current.position.y = 2 + Math.sin(time * 4) * 0.2;
            // Girar
            arrowRef.current.rotation.y += 0.01;
        }

        // Lógica de Distância
        const playerPos = gameStore.playerPosition;

        if (missionStep === 0) {
            if (playerPos.distanceTo(NPC_POSITION) < 3.0) {
                setMissionStep(1);
                setMissionText("Olá! Clique no botão para interagir.");
            }
        } 
        else if (missionStep === 1) {
            const dist = playerPos.distanceTo(NPC_POSITION);
            setShowInteractBtn(dist < 3.5);
        }
        else if (missionStep === 2) {
            if (playerPos.distanceTo(PLAZA_POINT) < 3.0) {
                setMissionStep(3);
                setMissionText("Missão Concluída! Divirta-se!");
            }
        }
    });

    const handleInteract = () => {
        if (missionStep === 1) {
            setMissionStep(2);
            setMissionText("Ótimo! Agora vá até o ponto marcado na praça.");
            setShowInteractBtn(false);
        }
    };

    const getMarkerPosition = () => {
        if (missionStep === 0 || missionStep === 1) return NPC_POSITION;
        if (missionStep === 2) return PLAZA_POINT;
        return new Vector3(0, -100, 0);
    };

    return (
        <group>
            {/* Visual 3D */}
            {missionStep < 3 && (
                <>
                    {/* Anel no chão */}
                    <mesh ref={markerRef} position={getMarkerPosition()} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[1, 1.2, 32]} />
                        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={2} />
                    </mesh>

                    {/* Seta Flutuante (Agora usando Ref para animar) */}
                    <group position={getMarkerPosition()} ref={arrowRef}>
                         <mesh rotation={[Math.PI, 0, 0]}>
                            <coneGeometry args={[0.3, 0.6, 4]} />
                            <meshBasicMaterial color="#fbbf24" />
                         </mesh>
                    </group>
                </>
            )}

            {/* Interface 2D */}
            <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                <div className="absolute top-20 left-0 right-0 flex flex-col items-center pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] transform transition-all duration-300">
                        <span className="font-bold text-yellow-400 mr-2">MISSÃO:</span>
                        <span className="font-medium">{missionText}</span>
                    </div>

                    {showInteractBtn && (
                        <div className="mt-4 pointer-events-auto">
                            <button 
                                onClick={handleInteract}
                                className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-8 rounded-xl shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all animate-bounce"
                            >
                                👋 INTERAGIR
                            </button>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
};