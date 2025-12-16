import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Quaternion, MathUtils } from 'three';
import { RoundedBox, Html } from '@react-three/drei';
import { ChatBubble } from './ChatBubble';

// Configurações equivalentes ao NavMeshAgent
const AGENT_SPEED = 2.5;
const AGENT_STOPPING_DISTANCE = 0.5;
const AGENT_ANGULAR_SPEED = 5.0; // Velocidade de rotação suave

// Diálogos em Português (PT-BR)
const FRASES_PT = [
  "Olá! Bem-vindo à Vila Aurora.",
  "Que dia bonito para passear!",
  "Você já visitou a praça central?",
  "As luzes de neon ficam lindas à noite.",
  "Estou apenas curtindo a paisagem.",
  "Fique à vontade para explorar as casas.",
  "Dizem que há segredos nesta cidade..."
];

interface NPCProps {
  position: [number, number, number];
  color: string;
  isStationary?: boolean; 
  questIcon?: string;
}

export const NPC: React.FC<NPCProps> = ({ position: initialPos, color, isStationary = false, questIcon }) => {
  const groupRef = useRef<Group>(null);
  
  // Refs para "Animator" (partes do corpo)
  const bodyRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  
  // Estado do "NavMeshAgent" Simulado
  const [destination, setDestination] = useState<Vector3 | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  
  // Estado de Diálogo
  const [message, setMessage] = useState<string | null>(null);

  // Inicialização (Start)
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...initialPos);
    }
  }, []);

  // Cérebro do NPC (Lógica de Decisão)
  useEffect(() => {
    if (isStationary) return;

    const interval = setInterval(() => {
      // 30% de chance de falar algo
      if (Math.random() < 0.3) {
        setMessage(FRASES_PT[Math.floor(Math.random() * FRASES_PT.length)]);
      }

      // Sistema de Waypoints Aleatórios (Simulando pontosDeDestino)
      if (Math.random() < 0.6) {
        const r = 15; // Raio de patrulha
        const x = initialPos[0] + (Math.random() - 0.5) * 2 * r;
        const z = initialPos[2] + (Math.random() - 0.5) * 2 * r;
        setDestination(new Vector3(x, 0, z));
      } else {
        // Pausa (Idle)
        setDestination(null);
      }
    }, 5000); // Decide a cada 5 segundos

    return () => clearInterval(interval);
  }, [isStationary, initialPos]);

  // Loop de Física e Animação (Update)
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const currentPos = groupRef.current.position;
    
    // --- LÓGICA DO NAVMESH AGENT ---
    let moving = false;

    if (destination && !isStationary) {
      const direction = new Vector3().subVectors(destination, currentPos);
      direction.y = 0; // Ignora altura para calcular distância no plano
      const distance = direction.length();

      if (distance > AGENT_STOPPING_DISTANCE) {
        moving = true;
        direction.normalize();

        // Mover (Move)
        currentPos.add(direction.multiplyScalar(AGENT_SPEED * delta));

        // Rotacionar suavemente (Angular Speed)
        const targetRotation = Math.atan2(direction.x, direction.z);
        const q = new Quaternion();
        q.setFromAxisAngle(new Vector3(0, 1, 0), targetRotation);
        groupRef.current.quaternion.slerp(q, AGENT_ANGULAR_SPEED * delta);
      } else {
        // Chegou ao destino
        setDestination(null);
      }
    }

    // Atualiza estado do Animator
    setIsWalking(moving);

    // Garante que o NPC esteja sempre no chão (Y=0)
    currentPos.y = 0;

    // --- LÓGICA DO ANIMATOR (Procedural) ---
    const time = state.clock.elapsedTime * 10; // Velocidade da animação

    if (bodyRef.current && leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
        if (isWalking) {
            // Animação WALK (Andar)
            // Pernas alternadas
            leftLegRef.current.rotation.x = Math.sin(time) * 0.5;
            rightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.5;
            
            // Braços opostos às pernas
            leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.5;
            rightArmRef.current.rotation.x = Math.sin(time) * 0.5;

            // Corpo balança levemente (Bobbing)
            bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(time)) * 0.05;
        } else {
            // Animação IDLE (Parado)
            // Retorna membros à posição neutra suavemente
            leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
            rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
            leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
            rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5);

            // Respiração suave
            bodyRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
    }
  });

  return (
    <group ref={groupRef}>
      <ChatBubble message={message} onTimeout={() => setMessage(null)} />

      {/* Ícone de Missão (Se houver) */}
      {questIcon && (
        <group position={[0, 2.4, 0]}>
           <Html center distanceFactor={15}>
             <div className="animate-bounce">
                <span className="text-4xl drop-shadow-lg font-bold text-yellow-400" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {questIcon}
                </span>
             </div>
           </Html>
        </group>
      )}

      {/* --- MESH DO NPC (Rigging Manual) --- */}
      {/* O corpo inteiro foi subido para Y=0.9 (Centro do Capsule Collider) para os pés tocarem Y=0 */}
      <group ref={bodyRef} position={[0, 0.9, 0]}>
        
        {/* Cabeça */}
        <group position={[0, 0.55, 0]}>
             <RoundedBox args={[0.7, 0.75, 0.7]} radius={0.25} smoothness={4}>
                <meshStandardMaterial color="#ffdecb" />
             </RoundedBox>
             <RoundedBox args={[0.75, 0.35, 0.75]} radius={0.25} smoothness={4} position={[0, 0.25, 0]}>
                <meshStandardMaterial color={color} />
             </RoundedBox>
             <mesh position={[0, 0.05, 0.36]}>
                 <boxGeometry args={[0.45, 0.15, 0.05]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
        </group>

        {/* Tronco */}
        <group position={[0, -0.15, 0]}>
             <RoundedBox args={[0.55, 0.7, 0.35]} radius={0.15} smoothness={4}>
                <meshStandardMaterial color={color} />
             </RoundedBox>
             <mesh position={[0, 0.1, 0.18]}>
                 <boxGeometry args={[0.2, 0.2, 0.05]} />
                 <meshStandardMaterial color="white" emissive={color} emissiveIntensity={0.5} />
             </mesh>
        </group>

        {/* Pernas (Pivot no topo da perna para rotação correta) */}
        <group position={[-0.2, -0.5, 0]} ref={leftLegRef}>
             <group position={[0, -0.3, 0]}> {/* Offset visual da geometria */}
                <mesh castShadow>
                    <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
                    <meshStandardMaterial color="#2d2d2d" />
                </mesh>
                <mesh position={[0, -0.35, 0.05]}>
                    <boxGeometry args={[0.15, 0.15, 0.25]} />
                    <meshStandardMaterial color={color} />
                </mesh>
             </group>
        </group>

        <group position={[0.2, -0.5, 0]} ref={rightLegRef}>
             <group position={[0, -0.3, 0]}>
                <mesh castShadow>
                    <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
                    <meshStandardMaterial color="#2d2d2d" />
                </mesh>
                <mesh position={[0, -0.35, 0.05]}>
                    <boxGeometry args={[0.15, 0.15, 0.25]} />
                    <meshStandardMaterial color={color} />
                </mesh>
             </group>
        </group>

        {/* Braços (Pivot no ombro) */}
        <group position={[-0.35, 0.15, 0]} ref={leftArmRef}>
             <group position={[0, -0.25, 0]} rotation={[0, 0, 0.1]}>
                 <mesh castShadow>
                     <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
                     <meshStandardMaterial color={color} />
                 </mesh>
                 <mesh position={[0, -0.3, 0]}>
                    <sphereGeometry args={[0.11]} />
                    <meshStandardMaterial color="#ffdecb" />
                 </mesh>
             </group>
        </group>

        <group position={[0.35, 0.15, 0]} ref={rightArmRef}>
             <group position={[0, -0.25, 0]} rotation={[0, 0, -0.1]}>
                 <mesh castShadow>
                     <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
                     <meshStandardMaterial color={color} />
                 </mesh>
                 <mesh position={[0, -0.3, 0]}>
                    <sphereGeometry args={[0.11]} />
                    <meshStandardMaterial color="#ffdecb" />
                 </mesh>
             </group>
        </group>

      </group>
      
      {/* Sombra no Chão (Fake Shadow) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
         <circleGeometry args={[0.45, 32]} />
         <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};