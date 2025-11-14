"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Flipboard.module.css";

interface TokenPair { pair: string }
interface PriceData { symbol: string; priceUsd: number; percent: number }

export default function Flipboard({ tokens }: { tokens: TokenPair[] }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [previous, setPrevious] = useState<Record<string, number>>({});

  const fetchAll = useCallback(async () => {
    for (const { pair } of tokens) {
      try {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();
        if (!data?.priceUsd || !data?.symbol) continue;

        const price = Number(data.priceUsd);
        const symbol = data.symbol;

        const percent = Number(data.percentChange24h ?? 0);

        setPrices((prev) => ({ ...prev, [pair]: { symbol, priceUsd: price, percent } }));
        setPrevious((prev) => ({ ...prev, [pair]: price }));
      } catch {}
    }
  }, [tokens, previous]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 60000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const items = Object.values(prices);
  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      {/* Grid “table” – 3 columns: symbol | price | percent */}
      <div className={styles.table}>
        {items.map(({ symbol, priceUsd, percent }) => (
          <div key={symbol} className={styles.row}>
            <div className={styles.symbol}>{symbol}</div>

            <FlipCell value={`$${priceUsd >= 1 ? priceUsd.toFixed(2) : priceUsd >= 0.01 ? priceUsd.toFixed(4) : priceUsd.toFixed(6)}`} />

            <FlipCell
              value={`${percent > 0 ? "▲ " : percent < 0 ? "▼ " : ""}${percent.toFixed(2)}%`}
              positive={percent > 0}
              negative={percent < 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ========= Flip Cell Component ========= //
function FlipCell({
  value,
  positive,
  negative,
}: {
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`${styles.cell} ${
        positive ? styles.up : negative ? styles.down : styles.neutral
      }`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={styles.value}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
