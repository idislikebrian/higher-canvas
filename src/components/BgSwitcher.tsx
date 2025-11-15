"use client";

import { useState, useEffect } from "react";
import DvD from "@/components/DvD";
import dynamic from "next/dynamic";

/* const SplineClient = dynamic(() => import("@/components/Spline"), {
  ssr: false,
}); */

const TerrainText = dynamic(() => import("@/components/TerrainText"), {
  ssr: false,
});

export default function BgSwitcher() {
  const [mode, setMode] = useState<"dvd" | "spline" | "terrain" | "green">("dvd");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "a") setMode("dvd");
      // if (e.key === "s") setMode("spline");
      if (e.key === "d") setMode("terrain");
      if (e.key === "f") setMode("green");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {mode === "dvd" && <DvD />}
      {/* {mode === "spline" && <SplineClient />} */}
      {mode === "terrain" && <TerrainText />}
      {mode === "green" && <GreenScreen />}
    </>
  );
}

function GreenScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgb(0,255,0)", // pure chroma green
      }}
    />
  );
}