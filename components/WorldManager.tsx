import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Configuração "Golden Hour" para a Vila Aurora
export const WorldManager: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Ajuste de pixel ratio para performance (máximo 1.5 para mobile não travar)
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Cor de fundo de segurança
    scene.background = new THREE.Color('#fed7aa');
  }, [gl, scene]);

  return (
    <group name="WorldEnvironment">
      {/* Névoa "Pêssego" (Fim de tarde) - Método Declarativo */}
      <fogExp2 attach="fog" args={['#fed7aa', 0.012]} />

      {/* Luz Ambiente Quente (Amarelo/Laranja suave) */}
      <ambientLight intensity={0.6} color="#fed7aa" />
      
      {/* Sol de Fim de Tarde */}
      <directionalLight 
        position={[-30, 25, -20]} 
        intensity={1.5} 
        color="#fff7ed"
        castShadow 
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40]} />
      </directionalLight>

      {/* Céu Configurado para entardecer */}
      <Sky 
        sunPosition={[-30, 10, -20]} 
        turbidity={8} 
        rayleigh={6} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      {/* Reflexos */}
      <Environment preset="sunset" />
    </group>
  );
};