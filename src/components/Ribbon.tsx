"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Ribbon.module.css";

interface TokenPair {
  pair: string;
}

interface PriceData {
  symbol: string;
  formattedPrice: string;
  percentChange24h: number;
}

export default function Ribbon({ tokens }: { tokens: TokenPair[] }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  // FETCH PRICES -------------------------------------------- //
  const fetchAll = useCallback(async () => {
    for (const { pair } of tokens) {
      try {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();
        if (!data?.formattedPrice || !data?.symbol) continue;

        const symbol = data.symbol;
        const formattedPrice = data.formattedPrice;
        const percentChange24h = Number(data.percentChange24h ?? 0);

        setPrices((prev) => ({
          ...prev,
          [pair]: { symbol, formattedPrice, percentChange24h },
        }));
      } catch {
        // silently fail
      }
    }
  }, [tokens]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ROTATION TIMER ------------------------------------------ //
  useEffect(() => {
    const rotate = setInterval(() => {
      setActiveIndex((i) => (i + 1) % tokens.length);
    }, 3500);
    return () => clearInterval(rotate);
  }, [tokens.length]);

  const items = Object.values(prices);
  const active = items[activeIndex];

  if (!active) return null;

  const { symbol, formattedPrice, percentChange24h } = active;

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={symbol}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={styles.row}
        >
          <span className={styles.symbol}>{symbol}</span>

          <span
            className={styles.price}
            dangerouslySetInnerHTML={{ __html: `$${formattedPrice}` }}
          />

          <span
            className={
              percentChange24h > 0
                ? styles.up
                : percentChange24h < 0
                ? styles.down
                : styles.neutral
            }
          >
            {percentChange24h > 0 && "▲ "}
            {percentChange24h < 0 && "▼ "}
            {percentChange24h.toFixed(2)}%
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
