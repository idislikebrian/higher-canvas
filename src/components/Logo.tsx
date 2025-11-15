"use client";

import { useState } from "react";
import styles from "./Logo.module.css";

const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];

export default function Logo() {
  const [index, setIndex] = useState(0);

  const handleClick = () => {
    setIndex((i) => (i + 1) % positions.length);
  };

  return (
    <div
      className={`${styles.logoWrapper} ${styles[positions[index]]}`}
      onClick={handleClick}
    >
      <img
        src="/hz--lower-thirds.gif"
        alt="Logo"
        className={styles.logo}
        draggable={false}
      />
    </div>
  );
}
