"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Ribbon.module.css";

interface TokenPair {
  pair: string;
}

interface PriceData {
  symbol: string;
  priceUsd: number;
  percent: number;
}

export default function Ribbon({ tokens }: { tokens: TokenPair[] }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [previous, setPrevious] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  // FETCH PRICES -------------------------------------------- //
  const fetchAll = useCallback(async () => {
    for (const { pair } of tokens) {
      try {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();
        if (!data?.priceUsd || !data?.symbol) continue;

        const price = Number(data.priceUsd);
        const symbol = data.symbol;

        let percent = 0;
        if (previous[pair]) {
          percent = ((price - previous[pair]) / previous[pair]) * 100;
        }

        setPrices((prev) => ({
          ...prev,
          [pair]: { symbol, priceUsd: price, percent },
        }));

        setPrevious((prev) => ({ ...prev, [pair]: price }));
      } catch {
        // ignore
      }
    }
  }, [tokens, previous]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ROTATION TIMER ------------------------------------------ //
  useEffect(() => {
    const rotate = setInterval(() => {
      setActiveIndex((i) => (i + 1) % tokens.length);
    }, 3500); // duration each token stays visible

    return () => clearInterval(rotate);
  }, [tokens.length]);

  const items = Object.values(prices);
  const active = items[activeIndex];

  if (!active) return null;

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.symbol}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={styles.row}
        >
          <span className={styles.symbol}>{active.symbol}</span>

          <span className={styles.price}>
            ${active.priceUsd.toFixed(6)}
          </span>

          <span
            className={
              active.percent > 0
                ? styles.up
                : active.percent < 0
                ? styles.down
                : styles.neutral
            }
          >
            {active.percent > 0 && "▲ "}
            {active.percent < 0 && "▼ "}
            {active.percent.toFixed(2)}%
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
