"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./Ticker.module.css";

interface TokenPair {
  pair: string;
}

interface PriceData {
  symbol: string;
  priceUsd: number;
}

interface FlashState {
  [symbol: string]: "up" | "down" | "neutral";
}

export default function Ticker({ tokens }: { tokens: TokenPair[] }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [previous, setPrevious] = useState<Record<string, number>>({});
  const [flash, setFlash] = useState<FlashState>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    for (const { pair } of tokens) {
      try {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();

        if (!data?.priceUsd || !data?.symbol) continue;

        const price = Number(data.priceUsd);
        const symbol = data.symbol;

        setPrices((prev) => ({
          ...prev,
          [pair]: { symbol, priceUsd: price },
        }));

        if (previous[pair]) {
          if (price > previous[pair]) {
            setFlash((f) => ({ ...f, [symbol]: "up" }));
          } else if (price < previous[pair]) {
            setFlash((f) => ({ ...f, [symbol]: "down" }));
          } else {
            setFlash((f) => ({ ...f, [symbol]: "neutral" }));
          }
        }

        setPrevious((prev) => ({ ...prev, [pair]: price }));

        setTimeout(() => {
          setFlash((f) => ({ ...f, [symbol]: "neutral" }));
        }, 1200);
      } catch {
        // ignore errors silently
      }
    }
  }, [tokens, previous]);

  useEffect(() => {
    fetchAll();

    intervalRef.current = setInterval(fetchAll, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  const items = Object.values(prices);

  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.track}
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      >
        {items.map(({ symbol, priceUsd }) => (
          <span
            key={symbol}
            className={`${styles.item} ${
              flash[symbol] ? styles[flash[symbol]] : styles.neutral
            }`}
          >
            {symbol}: ${priceUsd.toFixed(6)}
          </span>
        ))}

        {items.map(({ symbol, priceUsd }) => (
          <span
            key={`${symbol}-dup`}
            className={`${styles.item} ${
              flash[symbol] ? styles[flash[symbol]] : styles.neutral
            }`}
          >
            {symbol}: ${priceUsd.toFixed(6)}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
