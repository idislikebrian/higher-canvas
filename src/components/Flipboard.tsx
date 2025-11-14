"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Flipboard.module.css";

interface TokenPair {
  pair: string;
}

interface PriceData {
  symbol: string;
  formattedPrice: string;
  percent: number;
}

export default function Flipboard({ tokens }: { tokens: TokenPair[] }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  const fetchAll = useCallback(async () => {
    for (const { pair } of tokens) {
      try {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();
        if (!data?.priceUsd || !data?.symbol) continue;

        const symbol = data.symbol;
        const formattedPrice = data.formattedPrice;
        const percent = Number(data.percentChange24h ?? 0);

        setPrices((prev) => ({
          ...prev,
          [pair]: { symbol, formattedPrice, percent },
        }));
      } catch {}
    }
  }, [tokens]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 60000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const items = Object.values(prices);
  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        {items.map(({ symbol, formattedPrice, percent }) => (
          <div key={symbol} className={styles.row}>
            <div className={styles.symbol}>{symbol}</div>

            <FlipCell dangerouslyHtml={`$${formattedPrice}`} />

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
  dangerouslyHtml,
  positive,
  negative,
}: {
  value?: string;
  dangerouslyHtml?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const contentKey = dangerouslyHtml ?? value ?? "";

  return (
    <div
      className={`${styles.cell} ${
        positive ? styles.up : negative ? styles.down : styles.neutral
      }`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={contentKey}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={styles.value}
        >
          {dangerouslyHtml ? (
            <span dangerouslySetInnerHTML={{ __html: dangerouslyHtml }} />
          ) : (
            value
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}