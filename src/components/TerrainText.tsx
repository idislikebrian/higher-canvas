"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import styles from "./TerrainText.module.css";

interface TerrainTextProps {
  text?: string;
  textSize?: number;
  metalness?: number;
  roughness?: number;
  noiseScale?: number;
}

export default function TerrainText({
  text = "HIGHER.ZIP",
  textSize = 20,
  metalness = 0.5,
  roughness = 0,
  noiseScale = 20,
}: TerrainTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 200);
    camera.lookAt(scene.position);

    // Lights
    const ambientLight = new THREE.AmbientLight("linen", 1);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 4);
    light.position.set(1, 1, 1);
    scene.add(light);

    // Background plane w/ noise
    const geometry = new THREE.PlaneGeometry(600, 300, 200, 100);
    const pos = geometry.getAttribute("position");
    const simplex = new SimplexNoise();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = 10 * simplex.noise(x / noiseScale, y / noiseScale);
      pos.setZ(i, z);
    }

    geometry.computeVertexNormals();

    const backgroundPanel = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: "blue",
        metalness,
        roughness,
      })
    );

    backgroundPanel.position.z = -100;
    scene.add(backgroundPanel);

    // Text mesh (async load)
    let textMesh: THREE.Mesh | null = null;

    new FontLoader().load(
      "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textGeometry = new TextGeometry(text, {
          font,
          size: textSize,
          depth: 25,
          curveSegments: 12,
          bevelEnabled: true,
          bevelSize: 1,
        });

        // 1. Compute bounding box
        textGeometry.computeBoundingBox();

        const bbox = textGeometry.boundingBox;
        if (!bbox) return;

        // 2. Shift geometry so center of text is at (0,0)
        const xOffset = (bbox.max.x - bbox.min.x) / 2;
        const yOffset = (bbox.max.y - bbox.min.y) / 2;

        textGeometry.translate(-xOffset, -yOffset, -25);

        // 3. Mesh as usual
        textMesh = new THREE.Mesh(textGeometry, [
          new THREE.MeshBasicMaterial({
            color: "white",
            blending: THREE.MultiplyBlending,
          }),
          new THREE.MeshBasicMaterial({ color: "black" }),
        ]);

        scene.add(textMesh);
      }
    );

    // Animation
    const animate = (t: number) => {
      light.position.set(Math.sin(t / 1000), Math.cos(t / 1000), 1);

      if (textMesh) {
        textMesh.rotation.set(Math.sin(t / 1000) / 3, t / 2000, 0);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount (important for BgSwitcher)
    return () => {
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [text, textSize, metalness, roughness, noiseScale]);

  return <div ref={containerRef} className={styles.wrapper} />;
}
