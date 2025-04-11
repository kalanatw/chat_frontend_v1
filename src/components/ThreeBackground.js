import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
  const mountRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return; // Ensure the ref is not null before proceeding

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Create some floating particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 1000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(20), // x
        THREE.MathUtils.randFloatSpread(20), // y
        THREE.MathUtils.randFloatSpread(20) // z
      );
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0x007aff,
      size: 0.05
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (mountRef.current) { // Check if mountRef.current is not null
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (mountRef.current) { // Ensure mountRef.current is not null before removing
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return <div className="three-background" ref={mountRef}></div>;
};

export default ThreeBackground;
