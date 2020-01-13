import React, { Fragment, useState } from 'react';
import Board from './Board';
import Header from './Header';
import Importer from './Importer';
import Solver from './Solver';
import { saveData } from '../utilities/file';
import { useLocalStorage } from '../utilities/storage';
import levelsData from '../data/levels.json';
import styles from '../styles/App.module.css';

function App() {
  const [board] = useState(levelsData[0].start);
  const [display, setDisplay] = useState('solver');//null);
  const [levels, setLevels] = useLocalStorage('kanoodleLevels', levelsData);

  function doNothing(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function saveLevel(level, data) {
    const levelData = {
      level,
      ...levels[level],
      ...data,
    };
    setLevels([...levels.slice(0, level), levelData, ...levels.slice(level + 1)]);
  }

  function exportLevels() {
    saveData(levels, 'levels.json');
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
        { display === 'solver' &&
          <Solver
            levels={levels}
            saveLevel={saveLevel}
            close={() => setDisplay(null)}
          />
        }
        { display === null &&
          <Fragment>
            <div className={styles.buttons}>
              <button onClick={() => setDisplay('solver')}>Solve</button>
              <button onClick={() => setDisplay('importer')}>Import</button>
              <button onClick={() => exportLevels()}>Export</button>
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
