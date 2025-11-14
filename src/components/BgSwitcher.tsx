"use client";

import { useState, useEffect } from "react";
import DvD from "@/components/DvD";
import dynamic from "next/dynamic";

const SplineClient = dynamic(() => import("@/components/Spline"), {
  ssr: false,
});

export default function BgSwitcher() {
  const [mode, setMode] = useState<"dvd" | "spline">("dvd");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "a") setMode("dvd");
      if (e.key === "s") setMode("spline");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {mode === "dvd" && <DvD />}
      {mode === "spline" && <SplineClient />}
    </>
  );
}
