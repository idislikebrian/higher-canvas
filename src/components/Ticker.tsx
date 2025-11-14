"use client";

import { useState, useEffect, useCallback, useRef, ReactElement } from "react";
import { motion, useAnimation } from "framer-motion";
import styles from "./Ticker.module.css";

type Token = { pair: string };

type TokenState = {
  symbol: string;
  price: number;
  formattedPrice: string;
  prevPrice: number | null;
  changePct: number;
  direction: "up" | "down" | "neutral";
};

export default function Ticker({ tokens }: { tokens: Token[] }) {
  const [prices, setPrices] = useState<Record<string, TokenState>>({});
  const [flash, setFlash] = useState<Record<string, "up" | "down" | "neutral">>(
    {}
  );
  const controls = useAnimation();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const results: Record<
        string,
        {
          symbol: string;
          priceUsd: number;
          formattedPrice: string;
          percentChange24h: number;
        }
      > = {};

      for (const { pair } of tokens) {
        const res = await fetch(`/api/price/${pair}`);
        const data = await res.json();
        if (!data?.priceUsd || !data?.symbol) continue;

        results[pair] = {
          symbol: data.symbol,
          priceUsd: Number(data.priceUsd),
          formattedPrice: data.formattedPrice,
          percentChange24h: Number(data.percentChange24h ?? 0),
        };
      }

      setPrices((prev) => {
        const next: Record<string, TokenState> = {};
        const newFlash: Record<string, "up" | "down" | "neutral"> = {};

        for (const { pair } of tokens) {
          const r = results[pair];
          if (!r) continue;

          const prevToken = prev[pair];
          const prevPrice = prevToken?.price ?? null;
          const price = r.priceUsd;

          let direction: "up" | "down" | "neutral" = "neutral";
          if (prevPrice !== null && prevPrice > 0) {
            direction =
              price > prevPrice ? "up" : price < prevPrice ? "down" : "neutral";
          }

          next[pair] = {
            symbol: r.symbol,
            price: r.priceUsd,
            formattedPrice: r.formattedPrice,
            prevPrice,
            changePct: r.percentChange24h,
            direction,
          };

          newFlash[pair] = direction;
        }

        setFlash(newFlash);
        return next;
      });
    } catch (err) {
      console.error("Ticker API error", err);
    }
  }, [tokens]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 45000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    if (Object.keys(flash).length === 0) return;
    const timeout = setTimeout(() => setFlash({}), 1200);
    return () => clearTimeout(timeout);
  }, [flash]);

  const items = tokens
    .map(({ pair }) => {
      const t = prices[pair];
      if (!t) return null;

      const dir = flash[pair] ?? "neutral";
      const arrow = t.changePct > 0 ? "▲" : t.changePct < 0 ? "▼" : "•";

      return (
        <div key={pair} className={`${styles.item} ${styles[dir]}`}>
          <span className={styles.symbol}>{t.symbol}</span>

          <span
            className={styles.price}
            dangerouslySetInnerHTML={{
              __html: `$${t.formattedPrice}`,
            }}
          />

          <span className={styles.change}>
            ({arrow} {t.changePct.toFixed(2)}%)
          </span>
        </div>
      );
    })
    .filter((el): el is ReactElement => el !== null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const node = contentRef.current;
      if (!node) return;

      const width = node.offsetWidth;
      if (width === 0) return;

      await controls.set({ x: window.innerWidth });
      while (!cancelled) {
        await controls.start({
            x: -width,
            transition: {
              duration: (window.innerWidth + width) / 150,
              ease: "linear",
            },
        });
        await controls.set({ x: window.innerWidth });
      }
    };

    controls.stop();
    start();

    const onResize = () => {
      controls.stop();
      start();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      controls.stop();
    };
  }, [controls, items.length]);

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.scroller}
        animate={controls}
        ref={contentRef}
      >
        {items}
      </motion.div>
    </div>
  );
}
