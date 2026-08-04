"use client";

import { Line, OrbitControls, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

const points = [
  [12.97, 77.59],
  [26.14, 91.74],
  [26.91, 75.79],
  [19.07, 72.88],
  [17.38, 78.49],
  [28.61, 77.21],
  [23.02, 72.57],
];

function toVector(lat: number, lng: number, radius = 2.03): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
}

function GlobeMesh() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.055;
  });

  return (
    <group ref={group} rotation={[0.08, -1.55, -0.05]}>
      <Sphere args={[2, 64, 64]}>
        <meshPhysicalMaterial color="#0d5f52" roughness={0.74} metalness={0.08} transparent opacity={0.78} clearcoat={0.25} />
      </Sphere>
      <Sphere args={[2.015, 28, 28]}>
        <meshBasicMaterial color="#70d5b3" wireframe transparent opacity={0.14} />
      </Sphere>
      {points.map(([lat, lng], index) => {
        const position = toVector(lat, lng);
        return (
          <group key={`${lat}-${lng}`} position={position}>
            <mesh>
              <sphereGeometry args={[index === 1 ? 0.065 : 0.045, 18, 18]} />
              <meshStandardMaterial color={index === 1 ? "#f3bd67" : "#8ce1c5"} emissive={index === 1 ? "#f3bd67" : "#54c7a0"} emissiveIntensity={1.8} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.08, 0.11, 24]} />
              <meshBasicMaterial color="#f3bd67" transparent opacity={0.45} side={2} />
            </mesh>
          </group>
        );
      })}
      <Line points={[toVector(12.97, 77.59, 2.05), [0.3, 2.55, 0.45], toVector(26.14, 91.74, 2.05)]} color="#f3bd67" lineWidth={1} transparent opacity={0.5} />
    </group>
  );
}

export default function ImpactGlobe() {
  return (
    <div className="h-[420px] w-full sm:h-[520px]" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.4], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 4, 5]} intensity={2.6} color="#d7fff1" />
        <pointLight position={[-4, -2, 3]} intensity={1.7} color="#f3bd67" />
        <GlobeMesh />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.22} />
      </Canvas>
    </div>
  );
}
