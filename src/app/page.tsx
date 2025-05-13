import Image from "next/image";
import styles from "./page.module.css";
import Spline from "@splinetool/react-spline/next";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Spline scene="https://prod.spline.design/3LlOHgSE0tqrM5e4/scene.splinecode" />
      </main>
    </div>
  );
}
