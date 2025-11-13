"use client";
import styles from "./page.module.css";
import Ticker from "@/components/Ticker";
import DvD from "@/components/DvD";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Ticker
          tokens={[
            { pair: "0xcc28456d4ff980cee3457ca809a257e52cd9cdb0" }, // $HIGHER Base pair
            { pair: "0x41b4439d518953b98ccce8fa97942a43feffa90b" }, // $OPSYS x WETH
            { pair: "0xef0491b56d7cc4983b09abee47e8eb2a4d6d3afb" }, // $BETR
          ]}
        />

        <DvD />
      </main>
    </div>
  );
}
