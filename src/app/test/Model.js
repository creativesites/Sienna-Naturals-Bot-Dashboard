"use client";
import React, { useRef, useMemo, useEffect  } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'



export default function Model({ hairProfile}) {
    const { scene } = useGLTF("/assets/models/gess.glb");
    useEffect(() => {
        console.log('scene:',scene); // Check available meshes and materials
      }, [scene]);
      useMemo(() => {
        if (scene) {
          scene.traverse((child) => {
            if (child.isMesh && child.name.includes("Hair")) {
              child.material.color.set(hairProfile.hair_color_natural || "#000"); // Default to black
            }
          });
        }
    }, [scene, hairProfile]);
    
      return <primitive object={scene} scale={2.5} position={[0, -3.2, 0]} />;
}

useGLTF.preload('/assets/models/gess.glb')