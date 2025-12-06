import styles from "./page.module.css";
import GameController from "@/components/GameController";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Spell Chess</h1>
        <GameController />
      </main>
    </div>
  );
}
