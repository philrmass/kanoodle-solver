import React, { useState } from 'react';
import Board from './Board';
import Header from './Header';
import styles from '../styles/App.module.css';
import levels from '../data/levels.json';

function App() {
  const [board, setBoard] = useState(levels[0].start);

  return (
    <div className={styles.page}>
      <Header/>
      <main className={styles.main}>
        <Board
          board={board}
        />
      </main>
    </div>
  );
}

export default App;
