import { Vector3 } from 'three';

// Definição dos obstáculos do mundo para sistema de colisão simples
// Funciona como os "Colliders" estáticos do Unity

export interface Obstacle {
  position: [number, number, number];
  size: [number, number, number]; // Largura, Altura, Profundidade
  color: string; // Cor da parede
  roofColor?: string; // Cor do telhado (opcional)
  type: 'building' | 'tree' | 'decoration';
  rotation?: number; // Rotação Y em radianos
}

// PONTO DE SPAWN INICIAL (Ajustado para fora da fonte central)
// O script SafePlayerSpawn no Player irá validar isso dinamicamente
export const SPAWN_POINT: [number, number, number] = [0, 5, 10]; 

// --- GERADOR PROCEDURAL DA VILA ---
const generateVillage = (): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  const houseColors = ['#fca5a5', '#93c5fd', '#86efac', '#fde047', '#d8b4fe'];
  const roofColors = ['#ef4444', '#3b82f6', '#16a34a', '#eab308', '#9333ea'];

  // 1. Casas em Círculo (Vila)
  const villageRadius = 35;
  const numHouses = 10;

  for (let i = 0; i < numHouses; i++) {
    const angle = (i / numHouses) * Math.PI * 2;
    // Posição na borda do círculo
    const x = Math.cos(angle) * villageRadius;
    const z = Math.sin(angle) * villageRadius;
    
    // Rotação para a casa olhar para o centro (Praça)
    const rot = -angle; 

    // Cores aleatórias consistentes
    const colorIndex = i % houseColors.length;

    obstacles.push({
      position: [x, 2, z], // Y=2 é o centro vertical (casa tem 4 de altura)
      size: [5, 4, 5],
      color: houseColors[colorIndex],
      roofColor: roofColors[colorIndex],
      type: 'building',
      rotation: rot
    });
  }

  // 2. Árvores Espalhadas (Floresta ao redor)
  const numTrees = 30;
  for (let i = 0; i < numTrees; i++) {
    // Distância aleatória (entre 45 e 70 unidades do centro)
    const dist = 45 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    obstacles.push({
      position: [x, 0, z],
      size: [1, 5, 1], // Collider do tronco
      color: '#8B4513',
      type: 'tree'
    });
  }

  // 3. Decoração Central (Fonte)
  // Adicionamos colisor para a fonte não engolir o jogador
  obstacles.push({
      position: [0, 1, 0],
      size: [6, 2, 6],
      color: 'transparent',
      type: 'decoration'
  });

  return obstacles;
};

export const BUILDINGS: Obstacle[] = generateVillage();

// Função auxiliar para verificar colisão AABB (Axis-Aligned Bounding Box)
export const checkCircleRectCollision = (circlePos: {x: number, z: number}, radius: number, rectPos: [number, number, number], rectSize: [number, number, number]): boolean => {
    // Diferença entre o centro do círculo e o centro do retângulo
    const distX = Math.abs(circlePos.x - rectPos[0]);
    const distZ = Math.abs(circlePos.z - rectPos[2]);

    const halfWidth = rectSize[0] / 2;
    const halfDepth = rectSize[2] / 2;

    // Se a distância for maior que a metade do retângulo + raio, não há colisão
    if (distX > (halfWidth + radius)) { return false; }
    if (distZ > (halfDepth + radius)) { return false; }

    // Se a distância for menor que a metade do retângulo, há colisão
    if (distX <= (halfWidth)) { return true; } 
    if (distZ <= (halfDepth)) { return true; }

    // Colisão nos cantos
    const dx = distX - halfWidth;
    const dz = distZ - halfDepth;
    return (dx * dx + dz * dz <= (radius * radius));
}