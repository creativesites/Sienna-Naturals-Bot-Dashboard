"use client"
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HairModel = ({ hairProfile }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialiasing for smoother edges
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2); // Adjust size as needed
    mountRef.current.appendChild(renderer.domElement);
    camera.position.z = 5; // Adjust camera position

      // --- Hair Generation ---
      const hairGroup = new THREE.Group();
      scene.add(hairGroup);

      // Helper functions for different hair types (as defined above)
      function createHairStrand(length, thickness, color) { /* ... (straight hair code) ... */ }
      function createWavyHairStrand(length, thickness, color, amplitude, frequency) { /* ... (wavy hair code) ... */}
      function createCurlyHairStrand(length, thickness, color, radius, turns) { /* ... (curly hair code) ... */ }

    // --- Determine Hair Properties based on hairProfile ---
    let hairType = hairProfile.hair_type || 'Straight'; // Default to straight
    const hairColor = new THREE.Color(hairProfile.hair_color_natural || 0x000000); // Default: Black
    const hairThickness = hairProfile.hair_texture === 'Fine' ? 0.005 : (hairProfile.hair_texture === 'Medium' ? 0.01 : 0.02);
    const hairLength = 2; // You might want to make this a prop or get it from somewhere
    const numStrands = hairProfile.density === 'Thin' ? 50 : (hairProfile.density === 'Medium' ? 100 : 200); // Example density mapping

    // Example of porosity (using a normal map - you'll need a texture)
    const textureLoader = new THREE.TextureLoader();
    let normalMap = null;
    if (hairProfile.porosity === "High") {
        normalMap = textureLoader.load('path/to/rough-texture.jpg'); // Replace with your texture
    } else {
        normalMap = textureLoader.load('path/to/smooth-texture.jpg');  // Replace with your texture
    }


    // --- Generate Hair Strands based on hairType ---
    if (hairType === 'Straight') {
      for (let i = 0; i < numStrands; i++) {
        const strand = createHairStrand(hairLength, hairThickness, hairColor);
        strand.position.x = (Math.random() - 0.5) * 1;
        strand.position.z = (Math.random() - 0.5) * 1;
        hairGroup.add(strand);
      }
    } else if (hairType === 'Wavy') {
      const amplitude = 0.2;
      const frequency = 2;
      for (let i = 0; i < numStrands; i++) {
        const strand = createWavyHairStrand(hairLength, hairThickness, hairColor, amplitude, frequency);
        strand.position.x = (Math.random() - 0.5) * 1;
        strand.position.z = (Math.random() - 0.5) * 1;
        hairGroup.add(strand);
      }
    } else if (hairType === 'Curly' || hairType === 'Coily') { // Treat curly/coily similarly for now
      const radius = 0.1;
      const turns = 10;
      for (let i = 0; i < numStrands; i++) {
        const strand = createCurlyHairStrand(hairLength, hairThickness, hairColor, radius, turns);
        strand.position.x = (Math.random() - 0.5) * 0.5;
        strand.position.z = (Math.random() - 0.5) * 0.5;
        hairGroup.add(strand);
      }
    }

    // --- Lighting (Essential for MeshStandardMaterial) ---
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Add animation/interaction logic here (e.g., rotation, user interaction)
      hairGroup.rotation.y += 0.005; // Example: Rotate the hair group
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

        // Dispose of resources
        hairGroup.traverse(child => {
            if (child.isMesh || child.isLine) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        scene.remove(hairGroup);

      if(normalMap) normalMap.dispose();
      renderer.dispose();
    };
  }, [hairProfile]); // Re-render when hairProfile changes

  return <div ref={mountRef} />;
};

export default HairModel;