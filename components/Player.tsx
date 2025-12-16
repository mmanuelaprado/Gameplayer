import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, Quaternion, MathUtils } from 'three';
import { RoundedBox } from '@react-three/drei';
import { inputStore } from '../utils/inputStore';
import { gameStore } from '../utils/gameStore'; 
import { ChatBubble } from './ChatBubble';
import { BUILDINGS, checkCircleRectCollision, SPAWN_POINT } from '../utils/mapData';

// --- CONFIGURAÇÕES DE FÍSICA E JOGABILIDADE ---
const MOVE_SPEED = 8;
const JUMP_FORCE = 12;
const JUMP_PAD_FORCE = 25;
const GRAVITY = 30;
const PLAYER_RADIUS = 0.5; 
const MODEL_OFFSET_Y = 0.4; 

interface PlayerProps {
  color: string;
  chatMessage: string | null;
  onChatTimeout: () => void;
}

export const Player: React.FC<PlayerProps> = ({ color, chatMessage, onChatTimeout }) => {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  
  // --- Refs para Animação Procedural ---
  const bodyMeshRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);

  // --- Estado Físico ---
  const velocity = useRef(new Vector3(0, 0, 0));
  const isGrounded = useRef(false); // Começa false para cair do céu (Safe Spawn)
  const currentRotation = useRef(0);
  const animTime = useRef(0);

  // --- Estado da Câmera ---
  const camYaw = useRef(0);
  const camPitch = useRef(0.4); 
  const camDistance = 18;

  // --- SCRIPT: SAFE PLAYER SPAWN ---
  // Equivalente ao Void Start() do Unity
  useEffect(() => {
    if (!groupRef.current) return;

    // 1. Define posição inicial base
    let safePos = new Vector3(...SPAWN_POINT);
    
    // 2. Loop de verificação de colisão (SafeSpawn Logic)
    // Garante que não nasça dentro de caixas ou prédios
    let isSafe = false;
    let attempts = 0;
    
    while (!isSafe && attempts < 10) {
        let colliding = false;
        
        for (const building of BUILDINGS) {
            if (checkCircleRectCollision(
                { x: safePos.x, z: safePos.z }, 
                PLAYER_RADIUS + 0.5, // Margem extra de segurança
                building.position, 
                building.size
            )) {
                colliding = true;
                break;
            }
        }

        if (colliding) {
            // Se colidir, move um pouco para o lado
            safePos.z += 2;
            safePos.x += 1;
            attempts++;
        } else {
            isSafe = true;
        }
    }

    // 3. Aplica posição segura + Altura Extra (Cai do céu para achar o chão)
    groupRef.current.position.set(safePos.x, safePos.y, safePos.z);
    
    // Zera velocidade inicial
    velocity.current.set(0, 0, 0);

  }, []); // Executa apenas uma vez no Start

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Atualiza posição global
    gameStore.playerPosition.copy(groupRef.current.position);

    // ==========================================
    // 1. SISTEMA DE CÂMERA
    // ==========================================
    if (inputStore.look.x !== 0 || inputStore.look.y !== 0) {
      camYaw.current -= inputStore.look.x * 2;
      camPitch.current += inputStore.look.y * 2;
      camPitch.current = MathUtils.clamp(camPitch.current, 0.1, 1.4);
      inputStore.look.x = 0;
      inputStore.look.y = 0;
    }

    // ==========================================
    // 2. MOVIMENTO
    // ==========================================
    const { x: inputX, y: inputY } = inputStore.move;
    const isMoving = inputX !== 0 || inputY !== 0;

    const camForward = new Vector3(Math.sin(camYaw.current), 0, Math.cos(camYaw.current));
    const camRight = new Vector3(Math.cos(camYaw.current), 0, -Math.sin(camYaw.current));

    const moveDir = new Vector3()
      .addVectors(camForward.multiplyScalar(-inputY), camRight.multiplyScalar(inputX))
      .normalize();

    const targetSpeedX = isMoving ? moveDir.x * MOVE_SPEED : 0;
    const targetSpeedZ = isMoving ? moveDir.z * MOVE_SPEED : 0;

    velocity.current.x = MathUtils.lerp(velocity.current.x, targetSpeedX, 15 * delta);
    velocity.current.z = MathUtils.lerp(velocity.current.z, targetSpeedZ, 15 * delta);

    if (isMoving) {
      const targetRotation = Math.atan2(velocity.current.x, velocity.current.z);
      const q = new Quaternion();
      q.setFromAxisAngle(new Vector3(0, 1, 0), targetRotation);
      groupRef.current.quaternion.slerp(q, 10 * delta);
      currentRotation.current = targetRotation;
    }

    // ==========================================
    // 3. FÍSICA (PULO E GRAVIDADE)
    // ==========================================
    if (inputStore.jump && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
      inputStore.jump = false;
    }

    velocity.current.y -= GRAVITY * delta;

    // ==========================================
    // 4. COLISÃO (WALLS & GROUND)
    // ==========================================
    const nextX = groupRef.current.position.x + velocity.current.x * delta;
    const nextZ = groupRef.current.position.z + velocity.current.z * delta;
    
    let canMoveX = true;
    let canMoveZ = true;

    for (const building of BUILDINGS) {
        if (checkCircleRectCollision({ x: nextX, z: groupRef.current.position.z }, PLAYER_RADIUS, building.position, building.size)) canMoveX = false;
        if (checkCircleRectCollision({ x: groupRef.current.position.x, z: nextZ }, PLAYER_RADIUS, building.position, building.size)) canMoveZ = false;
    }

    if (canMoveX) groupRef.current.position.x += velocity.current.x * delta;
    else velocity.current.x = 0;

    if (canMoveZ) groupRef.current.position.z += velocity.current.z * delta;
    else velocity.current.z = 0;

    groupRef.current.position.y += velocity.current.y * delta;

    // Colisão Simples com Chão (Layer Chao)
    if (groupRef.current.position.y <= 0) {
      groupRef.current.position.y = 0;
      velocity.current.y = -2;
      isGrounded.current = true;
    } else {
       isGrounded.current = false;
    }

    // Jump Pad
    const distToJumpPad = groupRef.current.position.distanceTo(new Vector3(15, 0, 5));
    if (distToJumpPad < 1.5 && groupRef.current.position.y < 1) {
        velocity.current.y = JUMP_PAD_FORCE;
        isGrounded.current = false;
    }

    // ==========================================
    // 5. ANIMAÇÃO
    // ==========================================
    const speed = new Vector3(velocity.current.x, 0, velocity.current.z).length();
    const isWalking = speed > 0.1;

    if (isWalking && isGrounded.current) {
        animTime.current += delta * speed * 2;
        if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(animTime.current) * 0.5;
        if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(animTime.current + Math.PI) * 0.5;
        if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(animTime.current + Math.PI) * 0.5;
        if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(animTime.current) * 0.5;
        if(bodyMeshRef.current) {
            bodyMeshRef.current.position.y = MODEL_OFFSET_Y + Math.abs(Math.sin(animTime.current)) * 0.05;
            bodyMeshRef.current.rotation.z = Math.sin(animTime.current) * 0.02; 
        }
    } else if (!isGrounded.current) {
        if(leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, 0.2, delta * 10);
        if(rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, delta * 10); 
        if(leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, delta * 5); 
        if(rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, delta * 5);
        if(bodyMeshRef.current) bodyMeshRef.current.position.y = MathUtils.lerp(bodyMeshRef.current.position.y, MODEL_OFFSET_Y, delta * 10);
    } else {
        animTime.current += delta * 2;
        if(leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
        if(rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
        if(leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
        if(rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5);
        if(bodyMeshRef.current) {
            const targetY = MODEL_OFFSET_Y + Math.sin(animTime.current) * 0.02;
            bodyMeshRef.current.position.y = MathUtils.lerp(bodyMeshRef.current.position.y, targetY, delta * 5);
        }
    }

    // Update Camera
    const targetX = groupRef.current.position.x + camDistance * Math.sin(camYaw.current) * Math.cos(camPitch.current);
    const targetY = groupRef.current.position.y + camDistance * Math.sin(camPitch.current);
    const targetZ = groupRef.current.position.z + camDistance * Math.cos(camYaw.current) * Math.cos(camPitch.current);
    
    camera.position.lerp(new Vector3(targetX, targetY, targetZ), 8 * delta);
    const lookTarget = groupRef.current.position.clone().add(new Vector3(0, 1.5, 0));
    camera.lookAt(lookTarget);
  });

  return (
    // Posição inicial será sobrescrita pelo useEffect (Safe Spawn)
    <group ref={groupRef} position={[0, 10, 0]}>
      <ChatBubble message={chatMessage} onTimeout={onChatTimeout} />

      <group ref={bodyMeshRef} position={[0, MODEL_OFFSET_Y, 0]}>
        {/* Head */}
        <group position={[0, 1.35, 0]}>
             <RoundedBox args={[0.7, 0.75, 0.7]} radius={0.25} smoothness={4}><meshStandardMaterial color="#ffdecb" /></RoundedBox>
             <RoundedBox args={[0.75, 0.35, 0.75]} radius={0.25} smoothness={4} position={[0, 0.25, 0]}><meshStandardMaterial color={color} /></RoundedBox>
             <mesh position={[0, 0.05, 0.36]}><boxGeometry args={[0.45, 0.15, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        </group>
        {/* Torso */}
        <group position={[0, 0.65, 0]}>
             <RoundedBox args={[0.55, 0.7, 0.35]} radius={0.15} smoothness={4}><meshStandardMaterial color={color} /></RoundedBox>
             <mesh position={[0, 0.1, 0.18]}><boxGeometry args={[0.2, 0.2, 0.05]} /><meshStandardMaterial color="white" emissive={color} emissiveIntensity={0.5} /></mesh>
        </group>
        {/* Legs */}
        <group position={[-0.2, 0.3, 0]} ref={leftLegRef}>
            <group position={[0, -0.35, 0]}> 
                <mesh><capsuleGeometry args={[0.11, 0.7, 4, 8]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
                <mesh position={[0, -0.4, 0.05]}><boxGeometry args={[0.15, 0.15, 0.25]} /><meshStandardMaterial color={color} /></mesh>
            </group>
        </group>
        <group position={[0.2, 0.3, 0]} ref={rightLegRef}>
            <group position={[0, -0.35, 0]}>
                <mesh><capsuleGeometry args={[0.11, 0.7, 4, 8]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
                <mesh position={[0, -0.4, 0.05]}><boxGeometry args={[0.15, 0.15, 0.25]} /><meshStandardMaterial color={color} /></mesh>
            </group>
        </group>
        {/* Arms */}
        <group position={[-0.35, 0.9, 0]} rotation={[0, 0, 0.1]} ref={leftArmRef}>
             <group position={[0, -0.25, 0]}>
                <mesh><capsuleGeometry args={[0.1, 0.55, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
                <mesh position={[0, -0.3, 0]}><sphereGeometry args={[0.11]} /><meshStandardMaterial color="#ffdecb" /></mesh>
             </group>
        </group>
        <group position={[0.35, 0.9, 0]} rotation={[0, 0, -0.1]} ref={rightArmRef}>
             <group position={[0, -0.25, 0]}>
                <mesh><capsuleGeometry args={[0.1, 0.55, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
                <mesh position={[0, -0.3, 0]}><sphereGeometry args={[0.11]} /><meshStandardMaterial color="#ffdecb" /></mesh>
             </group>
        </group>
      </group>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
         <circleGeometry args={[0.6, 32]} />
         <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};