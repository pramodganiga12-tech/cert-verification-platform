import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BlockchainScene3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.0015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // 1. Instanced Background Particle Starfield
    const particleCount = Math.min(Math.floor(window.innerWidth / 3), 400);
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x06b6d4);
    const violetColor = new THREE.Color(0x8b5cf6);
    const blueColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 120;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const mixColor = i % 3 === 0 ? cyanColor : i % 3 === 1 ? violetColor : blueColor;
      particleColors[i * 3] = mixColor.r;
      particleColors[i * 3 + 1] = mixColor.g;
      particleColors[i * 3 + 2] = mixColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 2. Interlinked 3D Rotating Blockchain Blocks Container
    const chainGroup = new THREE.Group();
    scene.add(chainGroup);

    const cubeCount = 6;
    const cubes: THREE.Mesh[] = [];
    const cubeGeometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);

    for (let i = 0; i < cubeCount; i++) {
      const angle = (i / cubeCount) * Math.PI * 2;
      const radius = 9;

      const cubeMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.4, (i - 3) * 2);
      cubes.push(cube);
      chainGroup.add(cube);
    }

    // 3. Glowing Light Trails Connecting Blocks
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const linePositions: number[] = [];
    for (let i = 0; i < cubes.length - 1; i++) {
      const p1 = cubes[i].position;
      const p2 = cubes[i + 1].position;
      linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const connectingLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    chainGroup.add(connectingLines);

    // Mouse Parallax Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop (60FPS)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Mouse Parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      chainGroup.rotation.y += 0.005;
      chainGroup.rotation.x = currentMouseY * 0.2;
      chainGroup.rotation.z = currentMouseX * 0.15;

      particles.rotation.y -= 0.001;
      particles.rotation.x += 0.0005;

      cubes.forEach((cube, idx) => {
        cube.rotation.x += 0.01 * (idx % 2 === 0 ? 1 : -1);
        cube.rotation.y += 0.012;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70 overflow-hidden"
    />
  );
};
