"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Clock.module.css";

type Zone = { label: string; tz: string };

const DEFAULT_ZONES: Zone[] = [
  { label: "New York", tz: "America/New_York" },
  { label: "Los Angeles", tz: "America/Los_Angeles" },
  { label: "London", tz: "Europe/London" },
  { label: "Paris", tz: "Europe/Paris" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
  { label: "Jakarta", tz: "Asia/Jakarta" },
  // add-ons you might like:
  // { label: "Mexico City", tz: "America/Mexico_City" },
  // { label: "São Paulo", tz: "America/Sao_Paulo" },
  // { label: "Seoul", tz: "Asia/Seoul" },
  // { label: "Hong Kong", tz: "Asia/Hong_Kong" },
  // { label: "Berlin", tz: "Europe/Berlin" },
  // { label: "Mumbai", tz: "Asia/Kolkata" },
];

export default function Clock({
  zones = DEFAULT_ZONES,
  cycleMs = 7000,
}: {
  zones?: Zone[];
  cycleMs?: number;
}) {
  const [now, setNow] = useState<Date>(new Date());
  const [i, setI] = useState(0);
  const iRef = useRef(0);

  console.log("Clock component rendering");

  // tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // change city every cycleMs
  useEffect(() => {
    const id = setInterval(() => {
      iRef.current = (iRef.current + 1) % zones.length;
      setI(iRef.current);
    }, cycleMs);
    return () => clearInterval(id);
  }, [zones.length, cycleMs]);

  const { label, tz } = zones[i];

  const timeStr = useMemo(() => {
    // HH:MM:SS in 24h
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    return parts; // already "HH:MM:SS"
  }, [now, tz]);

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tz}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={styles.card}
        >
          <div className={styles.city}>{label}</div>
          <div className={styles.time}>{timeStr}</div>
          <div className={styles.tz}>{tz}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
