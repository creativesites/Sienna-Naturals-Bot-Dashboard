"use client";
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { OrbitControls, useGLTF } from "@react-three/drei";
import MasterLayout from "@/masterLayout/MasterLayout";

import Model from './Model'

const sampleUser = {
    hair_type: "Curly",
    hair_texture: "Coarse",
    hair_color_natural: "#8B5A2B", // Brownish Hair
    density: "Thick",
    curl_pattern: "3C",
  };

export default function App() {
    const userHairColor = '#fff';
  return (
    <MasterLayout>
        <div className="card h-440-px w-full flex flex-col items-center bg-gray-100 p-5">
      <h1 className="text-xl font-semibold mb-4">Hair Profile</h1>
      
      <div className='row gy-4'>
        {/* 3D Model */}
        <div className='col-md-6'>
        <Canvas camera={{ position: [0, 1.5, 3], fov: 35 }}> 
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 3]} intensity={1.5} />
        <Model hairProfile={sampleUser} />
        <OrbitControls enableZoom={true} />
      </Canvas>
        </div>

        {/* Hair Profile Details */}
        <div className='col-md-6'>
          <h2 className="text-lg font-bold mb-3">User's Hair Profile</h2>
          <ul className="space-y-2">
            {Object.entries(sampleUser).map(([key, value]) => (
              <li key={key} className="border-b pb-2">
                <strong className="capitalize">{key.replace(/_/g, " ")}:</strong> {value || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </MasterLayout>
  )
}
