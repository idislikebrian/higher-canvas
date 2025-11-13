"use client";

import { useEffect, useRef } from "react";

export default function DvD() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sizes for logo
    const baseLogoWidth = 600;
    const baseLogoHeight = Math.round(baseLogoWidth / 9.28);

    // Position + speed
    let x = 0;
    let y = 0;
    let xSpeed = 4;
    let ySpeed = 3;

    const img = new Image();
    img.src = "/logo-full.png";
    imgRef.current = img;

    // Resize canvas to full screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reset start position within new bounds
      x = Math.random() * (canvas.width - baseLogoWidth);
      y = Math.random() * (canvas.height - baseLogoHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.fillStyle = "rgb(0,255,0)"; // green background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(imgRef.current!, x, y, baseLogoWidth, baseLogoHeight);

      // Move
      x += xSpeed;
      y += ySpeed;

      // Bounce edges
      if (x <= 0 || x + baseLogoWidth >= canvas.width) xSpeed *= -1;
      if (y <= 0 || y + baseLogoHeight >= canvas.height) ySpeed *= -1;

      requestAnimationFrame(animate);
    };

    img.onload = () => animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
      }}
    />
  );
}
