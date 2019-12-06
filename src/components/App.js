import React, { Fragment, useState } from 'react';
import Board from './Board';
import Header from './Header';
import Importer from './Importer';
import styles from '../styles/App.module.css';
import levels from '../data/levels.json';

function App() {
  const [board, setBoard] = useState(levels[0].start);
  const [display, setDisplay] = useState('importer');//null);

  function doNothing(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function saveLevel(index, data) {
    console.log('SAVE', index, data);
  }

  return (
    <div 
      className={styles.page}
      onDragEnter={doNothing}
      onDragOver={doNothing}
      onDrop={doNothing}
    >
      <Header/>
      <main className={styles.main}>
        { display === 'importer' &&
          <Importer
            levels={levels}
            saveLevel={saveLevel}
            close={() => setDisplay(null)}
          />
        }
        { display === null &&
          <Fragment>
            <div className={styles.buttons}>
              <button onClick={() => setDisplay('importer')}>Import Level</button>
            </div>
            <Board
              board={board}
            />
          </Fragment>
        }
      </main>
    </div>
  );
}

export default App;
