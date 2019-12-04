import React, { useState } from 'react';
import Board from './Board';
import Header from './Header';
import Importer from './Importer';
import styles from '../styles/App.module.css';
import levels from '../data/levels.json';

function App() {
  const [board, setBoard] = useState(levels[0].start);
  const [display, setDisplay] = useState(null);

  function saveLevel(index, data) {
    console.log('SAVE', index, data);
  }

  return (
    <div className={styles.page}>
      <Header/>
      { display === 'importer' &&
        <Importer
          levels={levels}
          saveLevel={saveLevel}
        />
      }
      { display === null &&
        <main className={styles.main}>
          <div className={styles.buttons}>
            <button
              onClick={() => setDisplay('importer')}
            >
              Import Level
            </button>
          </div>
          <Board
            board={board}
          />
        </main>
      }
    </div>
  );
}

export default App;
