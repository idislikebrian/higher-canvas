"use client";

import { useEffect, useState } from "react";

import Ticker from "@/components/Ticker";
import Flipboard from "@/components/Flipboard";
import Ribbon from "@/components/Ribbon";

interface TokenPair {
  pair: string;
}

export default function InfoSwitcher({ tokens }: { tokens: TokenPair[] }) {
  const [mode, setMode] = useState<"ticker" | "flipboard" | "ribbon">("ticker");

  // keyboard shortcuts: 1 = ticker, 2 = flipboard, 3 = ribbon
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "1") setMode("ticker");
      if (e.key === "2") setMode("flipboard");
      if (e.key === "3") setMode("ribbon");
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {mode === "ticker" && <Ticker tokens={tokens} />}
      {mode === "flipboard" && <Flipboard tokens={tokens} />}
      {mode === "ribbon" && <Ribbon tokens={tokens} />}
    </>
  );
}
