import React, { Fragment, useState } from 'react';
import Board from './Board';
import Header from './Header';
import Importer from './Importer';
import { useLocalStorage } from '../utilities/storage';
import levelsData from '../data/levels.json';
import styles from '../styles/App.module.css';

function App() {
  const [board, setBoard] = useState(levelsData[0].start);
  const [display, setDisplay] = useState('importer');//null); //??? restore
  const [levels, setLevels] = useLocalStorage('kanoodleLevels', levelsData);

  function doNothing(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function saveLevel(index, data) {
    const level = {
      level: index,
      start: data,
    };
    const lvls = [...levels];
    lvls[index] = level;
    setLevels(lvls);
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
