import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { gameStore } from '../utils/gameStore';

// Posições importantes da missão
const NPC_POSITION = new Vector3(5, 0, 5); // Onde o Guia está
const PLAZA_POINT = new Vector3(0, 0, 10); // Próximo à fonte

export const MissionManager: React.FC = () => {
    // Estado da Missão (0 = Start, 1 = Fale com NPC, 2 = Vá a Praça, 3 = Fim)
    const [missionStep, setMissionStep] = useState(0);
    const [missionText, setMissionText] = useState("Bem-vindo à Neon City! Vá até o Robô Guia.");
    const [showInteractBtn, setShowInteractBtn] = useState(false);

    // Ref para o marcador visual (Círculo no chão)
    const markerRef = useRef<any>(null);

    // Loop de lógica da missão (Executado a cada frame, como o Update() do Unity)
    useFrame((state) => {
        // Animação do marcador (girar e pulsar)
        if (markerRef.current) {
            markerRef.current.rotation.y += 0.02;
            markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
        }

        const playerPos = gameStore.playerPosition;

        if (missionStep === 0) {
            // Objetivo: Chegar perto do NPC
            if (playerPos.distanceTo(NPC_POSITION) < 3.0) {
                setMissionStep(1);
                setMissionText("Olá! Clique no botão para interagir.");
            }
        } 
        else if (missionStep === 1) {
            // Objetivo: Interagir
            // Mostra o botão se estiver perto
            const dist = playerPos.distanceTo(NPC_POSITION);
            if (dist < 3.5) {
                setShowInteractBtn(true);
            } else {
                setShowInteractBtn(false);
            }
        }
        else if (missionStep === 2) {
            // Objetivo: Ir até a praça
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

    // Define a posição do marcador visual baseado na etapa
    const getMarkerPosition = () => {
        if (missionStep === 0 || missionStep === 1) return NPC_POSITION;
        if (missionStep === 2) return PLAZA_POINT;
        return new Vector3(0, -100, 0); // Esconde no final
    };

    return (
        <group>
            {/* --- ELEMENTOS VISUAIS 3D (World Space) --- */}
            
            {/* Marcador de Objetivo (Círculo Brilhante) */}
            {missionStep < 3 && (
                <mesh ref={markerRef} position={getMarkerPosition()} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1, 1.2, 32]} />
                    <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={2} />
                </mesh>
            )}

            {/* Setas flutuantes sobre o objetivo */}
            {missionStep < 3 && (
                <group position={getMarkerPosition().clone().add(new Vector3(0, 2, 0))}>
                     <mesh position={[0, Math.sin(Date.now() / 200) * 0.2, 0]}>
                        <coneGeometry args={[0.3, 0.5, 4]} />
                        <meshBasicMaterial color="#fbbf24" />
                     </mesh>
                </group>
            )}

            {/* --- INTERFACE DE USUÁRIO (Screen Space) --- */}
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div className="absolute top-16 left-0 right-0 flex flex-col items-center">
                    {/* Faixa de Missão */}
                    <div className="bg-slate-900/80 backdrop-blur-md text-white px-6 py-3 rounded-full border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-in slide-in-from-top-10">
                        <span className="font-bold text-yellow-400 mr-2">MISSÃO:</span>
                        <span className="font-medium">{missionText}</span>
                    </div>

                    {/* Botão de Interação (Aparece quando perto do NPC) */}
                    {showInteractBtn && (
                        <div className="mt-4 pointer-events-auto">
                            <button 
                                onClick={handleInteract}
                                className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-8 rounded-xl shadow-lg transform transition-transform active:scale-95 border-b-4 border-yellow-600 animate-bounce"
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