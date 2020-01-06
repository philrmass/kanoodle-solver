import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import pieces from '../data/pieces.json';
import Board from './Board';
import { getBlankBoard, placePiece, verifyBoard } from '../utilities/game';
import styles from '../styles/Solver.module.css';

function Solver({ levels, close }) {
  const levelMax = 162;
  const keyCapture = useRef(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [board, setBoard] = useState(levels[levelIndex].start);

  function handleLevelDec() {
    setLevelIndex((index) => {
      index = verifyIndex(index - 1);
      setBoard(levels[index].start);
      return index;
    });
  }

  function handleLevelInc() {
    setLevelIndex((index) => {
      index = verifyIndex(index + 1);
      setBoard(levels[index].start);
      return index;
    });
  }

  function handleLevel(e) {
    const index = verifyIndex(e.target.value);
    setBoard(levels[index].start);
    setLevelIndex(index);
  }

  function verifyIndex(index) {
    if (index < 0) {
      return 0;
    }
    if (index > levelMax) {
      return levelMax;
    }
    return index;
  }

  function clearBoard() {
    setBoard(getBlankBoard());
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

  function showOnBoard(index) {
    console.log('SHOW', index);
  }

  function placeOnBoard() {
    console.log('PLACE');
    //setBoard((board) => placePiece(piece, orientation, board));
  }

  function solveBoard() {
    console.log('SOLVE');
    for (let i = 0; i < 162; i++) {
      const ok = verifyBoard(levels[i].start);
      if (!ok) {
        console.log(`${i} ERROR`);
      }
    }
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
          <button onClick={handleLevelDec}>-</button>
          <input 
            type='number'
            min='0'
            max={levelMax}
            value={levelIndex}
            onChange={handleLevel}
          />
          <button onClick={handleLevelInc}>+</button>
          <button onClick={clearBoard}>Clear</button>
        </div>
        <Board 
          board={board}
          pickSpot={showOnBoard}
        />
        <div className={styles.bottomButtons}>
          <span>Piece</span>
          <input 
            type='number'
            min='0'
            max={levelMax}
            value={levelIndex}
            onChange={handleLevel}
          />
          <span>Orientation</span>
          <input 
            type='number'
            min='0'
            max={levelMax}
            value={levelIndex}
            onChange={handleLevel}
          />
          <button onClick={placeOnBoard}>Place</button>
        </div>
        <div className={styles.bottomButtons}>
          <button onClick={solveBoard}>Solve</button>
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
