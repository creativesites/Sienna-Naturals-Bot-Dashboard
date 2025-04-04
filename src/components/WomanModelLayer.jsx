"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function WomanModel() {
  const { scene } = useGLTF("/assets/models/gess.glb"); 

  return <primitive object={scene} scale={1.5} />;
}

export default function HairProfilePage() {
  return (
    <div className="h-screen w-full flex justify-center items-center bg-gray-100">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          <WomanModel />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}