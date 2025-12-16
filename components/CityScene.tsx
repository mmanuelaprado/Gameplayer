import React, { useMemo } from 'react';
import { Box, RoundedBox, Cylinder, Cone } from '@react-three/drei';
import { BUILDINGS, Obstacle } from '../utils/mapData';

// --- COMPONENTE: CASA ESTILIZADA ---
const House: React.FC<Obstacle> = ({ position, size, color, roofColor, rotation = 0 }) => {
  const width = size[0];
  const height = size[1];
  const depth = size[2];

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
      {/* Base da Casa (Paredes) */}
      <RoundedBox args={[width, height, depth]} radius={0.1} smoothness={4} position={[0, height / 2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>

      {/* Telhado (Estilo Pirâmide/Cônico 4 lados) */}
      <mesh position={[0, height + 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
         <coneGeometry args={[width * 0.85, 3.5, 4]} /> {/* 4 segmentos = pirâmide */}
         <meshStandardMaterial color={roofColor || '#ef4444'} roughness={0.6} />
      </mesh>

      {/* Porta (Frente) */}
      <mesh position={[0, 1, depth / 2 + 0.1]}>
        <boxGeometry args={[1.5, 2, 0.2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0.4, 1, depth / 2 + 0.2]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="gold" />
      </mesh>

      {/* Janela (Lateral) */}
      <group position={[width / 2 + 0.1, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
         <mesh>
            <circleGeometry args={[0.8, 32]} />
            <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.5} />
         </mesh>
         <mesh position={[0, 0, 0.05]}>
             <boxGeometry args={[1.6, 0.1, 0.1]} />
             <meshStandardMaterial color="white" />
         </mesh>
         <mesh position={[0, 0, 0.05]}>
             <boxGeometry args={[0.1, 1.6, 0.1]} />
             <meshStandardMaterial color="white" />
         </mesh>
      </group>

      {/* Base de Pedra (Alicerce) */}
      <mesh position={[0, 0.1, 0]}>
         <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
         <meshStandardMaterial color="#57534e" />
      </mesh>
    </group>
  );
};

// --- COMPONENTE: ÁRVORE ESTILIZADA ---
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    // Variação aleatória de tamanho para naturalidade
    const scale = useMemo(() => 0.8 + Math.random() * 0.4, []);

    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Tronco */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
            
            {/* Copa (2 camadas de esferas deformadas) */}
            <mesh position={[0, 2.2, 0]} castShadow>
                <dodecahedronGeometry args={[1.2]} />
                <meshStandardMaterial color="#22c55e" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.2, 0]} castShadow>
                <dodecahedronGeometry args={[0.9]} />
                <meshStandardMaterial color="#4ade80" roughness={0.8} />
            </mesh>
        </group>
    )
}

const JumpPad: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            <Box args={[2.5, 0.2, 2.5]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#333" />
            </Box>
            <Cylinder args={[1, 1, 0.1, 32]} position={[0, 0.25, 0]}>
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </Cylinder>
            <group position={[0, 0.5, 0]}>
                 <mesh position={[0, 0.5, 0]}><coneGeometry args={[0.3, 0.5, 4]} /><meshBasicMaterial color="#fbbf24" /></mesh>
                 <mesh position={[0, 1, 0]}><coneGeometry args={[0.3, 0.5, 4]} /><meshBasicMaterial color="#fbbf24" /></mesh>
            </group>
        </group>
    )
}

export const CityScene: React.FC = () => {
  return (
    <group>
      {/* CHÃO: Grama Estilizada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Caminhos de Terra (Visual) - Círculo central e caminhos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <ringGeometry args={[8, 45, 64]} />
          <meshStandardMaterial color="#fcd34d" opacity={0.3} transparent />
      </mesh>

      {/* Renderização dos Obstáculos (Casas e Árvores) */}
      {BUILDINGS.map((b, index) => {
          if (b.type === 'building') {
              return <House key={index} {...b} />;
          }
          if (b.type === 'tree') {
              return <Tree key={index} position={b.position} />;
          }
          return null;
      })}

      {/* PRAÇA CENTRAL: Fonte */}
      <group position={[0, 0, 0]}>
         {/* Base da Fonte */}
         <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
             <cylinderGeometry args={[6, 6.5, 0.6, 16]} />
             <meshStandardMaterial color="#cbd5e1" />
         </mesh>
         {/* Água */}
         <mesh position={[0, 0.65, 0]}>
             <cylinderGeometry args={[5, 5, 0.1, 16]} />
             <meshStandardMaterial color="#38bdf8" opacity={0.8} transparent />
         </mesh>
         {/* Pilar Central */}
         <mesh position={[0, 1.5, 0]} castShadow>
             <boxGeometry args={[1.5, 3, 1.5]} />
             <meshStandardMaterial color="#475569" />
         </mesh>
         {/* Cristal Topo */}
         <mesh position={[0, 3.5, 0]}>
             <octahedronGeometry args={[1.2]} />
             <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
         </mesh>
         <pointLight position={[0, 4, 0]} intensity={1} color="cyan" distance={10} />
      </group>

      {/* Jump Pad na frente de uma casa */}
      <JumpPad position={[15, 0, 15]} />

    </group>
  );
};