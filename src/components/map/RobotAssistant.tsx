"use client";

import type React from "react";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";

interface RobotModelProps {
  onClick: () => void;
}

const RobotModel: React.FC<RobotModelProps> = ({ onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/assets/robot.glb");

  // Idle animation - gentle bobbing
  useFrame(state => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 1) * 0.03;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={onClick}
      scale={[0.5, 0.5, 0.5]}
      position={[0, 0, -1]}
    >
      <primitive object={scene.clone()} />
    </group>
  );
};

interface RobotAssistantProps {
  onToggle: () => void;
  isDark: boolean;
  isActive: boolean;
}

const RobotAssistant: React.FC<RobotAssistantProps> = ({
  onToggle,
  isDark,
  isActive,
}) => {
  return (
    <div className="absolute -bottom-24 -left-4 z-20">
      <div
        className={`w-64 h-64 rounded-full overflow-hidden cursor-pointer transition-all hover:scale-110`}
        onClick={onToggle}
      >
        <Canvas
          camera={{ position: [0, 0, 0], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          <RobotModel onClick={() => {}} />
        </Canvas>
      </div>
    </div>
  );
};

export default RobotAssistant;
