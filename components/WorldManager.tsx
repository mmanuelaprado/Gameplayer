import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Configuração "Golden Hour" para a Vila Aurora
export const WorldManager: React.FC = () => {
  const { scene, gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Névoa "Pêssego" (Fim de tarde)
    scene.fog = new THREE.FogExp2('#fed7aa', 0.012);
    
    // Fundo compatível com a névoa
    scene.background = new THREE.Color('#fed7aa');

  }, [scene, gl]);

  return (
    <group name="WorldEnvironment">
      {/* Luz Ambiente Quente (Amarelo/Laranja suave) */}
      <ambientLight intensity={0.6} color="#fed7aa" />
      
      {/* Sol de Fim de Tarde (Mais baixo no horizonte e alaranjado) */}
      <directionalLight 
        position={[-30, 25, -20]} 
        intensity={1.5} 
        color="#fff7ed"
        castShadow 
        shadow-bias={-0.0005}
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40]} />
      </directionalLight>

      {/* Céu Configurado para entardecer */}
      <Sky 
        sunPosition={[-30, 10, -20]} // Sol baixo
        turbidity={8} 
        rayleigh={6} // Espalhamento maior para cores quentes
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      {/* Reflexos mais quentes */}
      <Environment preset="sunset" />
    </group>
  );
};