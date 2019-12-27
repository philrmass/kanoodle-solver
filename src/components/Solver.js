import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import pieces from '../data/pieces.json';
import Board from './Board';
import styles from '../styles/Solver.module.css';

function Solver({ levels, close }) {
  const levelMax = 162;
  const keyCapture = useRef(null);
  const [levelIndex, setLevelIndex] = useState(0);

  function handleLevelDec() {
    setLevelIndex((index) => {
      index--;
      if (index < 0) {
        index = 0;
      }
      return index;
    });
  }

  function handleLevelInc() {
    setLevelIndex((index) => {
      index++;
      if (index > levelMax) {
        index = levelMax;
      }
      return index;
    });
  }

  function handleLevel(e) {
    let index = e.target.value;
    //??? functionalize
    if (index < 0) {
      index = 0;
    }
    if (index > levelMax) {
      index = levelMax;
    }
    setLevelIndex(index);
  }

  function handleKeyDown(e) {
    let handled = true;

    switch (e.keyCode) {
      case 32:
        console.log('YO');
        break;
      default:
        handled = false;
        break;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  function solve() {
    const counts = levels[1].start.reduce((counts, spot) => {
      counts[spot] = counts[spot] + 1;
      return counts;
    }, new Array(12).fill(0));
    console.log('SOLVE', pieces.length, levels.length, '\ncounts', counts.map((c, i) => `${pieces[i].name} = ${c}`));
  }

  return (
    <Fragment>
      <section
        tabIndex={0}
        ref={keyCapture}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.topButtons}>
          <button onClick={close}>Close</button>
        </div>
        <Board 
          board={levels[levelIndex].start}
        />
        <div className={styles.bottomButtons}>
          <button onClick={handleLevelDec}>-</button>
          <input 
            type='number'
            min='0'
            max={levelMax}
            value={levelIndex}
            onChange={handleLevel}
          />
          <button onClick={handleLevelInc}>+</button>
          <button onClick={solve}>Solve</button>
        </div>
      </section>
    </Fragment>
  );
}

Solver.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  close: PropTypes.func.isRequired,
};

export default Solver;
