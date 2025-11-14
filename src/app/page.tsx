"use client";
import styles from "./page.module.css";
import InfoSwitcher from "@/components/InfoSwitcher";
import BackgroundSwitcher from "@/components/BgSwitcher";
import Clock from "@/components/Clock";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <BackgroundSwitcher />

        <Clock />

        <InfoSwitcher
          tokens={[
            { pair: "0xcc28456d4ff980cee3457ca809a257e52cd9cdb0" },
            { pair: "0x41b4439d518953b98ccce8fa97942a43feffa90b" },
            { pair: "0xef0491b56d7cc4983b09abee47e8eb2a4d6d3afb" },
          ]}
        />

      </main>
    </div>
  );
}
