import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import pieces from '../data/pieces.json';
import Board from './Board';
import { 
  getBlankBoard, 
  canPlacePiece,
  placePiece, 
  verifyBoard,
} from '../utilities/game';
import styles from '../styles/Solver.module.css';

function Solver({ levels, close }) {
  const levelMax = 162;
  const pieceMax = 11;
  const oriMax = 7;
  const keyCapture = useRef(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [piece, setPiece] = useState(0);
  const [ori, setOri] = useState(0);
  const [spot, setSpot] = useState(null);
  const [board, setBoard] = useState(getBlankBoard());//levels[levelIndex].start);
  const [isSolving, setIsSolving] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    showOnBoard(piece, ori, spot, steps);
  }, [piece, ori, spot, steps]);

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

  function handlePiece(e) {
    const p = verifyPiece(e.target.value);
    setPiece(p);
  }

  function verifyPiece(piece) {
    if (piece < 0) {
      return 0;
    }
    if (piece > pieceMax) {
      return pieceMax;
    }
    return piece;
  }

  function handleOri(e) {
    const p = verifyOri(e.target.value);
    setOri(p);
  }

  function verifyOri(ori) {
    if (ori < 0) {
      return 0;
    }
    if (ori > oriMax) {
      return oriMax;
    }
    return ori;
  }

  function clearBoard() {
    setBoard(getBlankBoard());
  }

  function start() {
    setIsSolving(true);
    const step = {
      board: [...board],
      state: {},
      last: null,
      next: [],
    };
    setSteps([step]);
  }

  function stop() {
    setIsSolving(false);
  }

  function handleKeyDown(e) {
    const space = 32;
    const left = 37;
    const up = 38;
    const right = 39;
    const down = 40;
    let handled = true;

    switch (e.keyCode) {
      case space:
        console.log('YO');
        break;
      case up:
        setPiece(verifyPiece(piece + 1));
        break;
      case down:
        setPiece(verifyPiece(piece - 1));
        break;
      case right:
        setOri(verifyOri(ori + 1));
        break;
      case left:
        setOri(verifyOri(ori - 1));
        break;
      default:
        handled = false;
        break;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  function showOnBoard(piece, ori, spot, steps) {
    if (spot && steps.length > 0) {
      const brd = steps[steps.length - 1].board;
      if (canPlacePiece(piece, ori, spot, brd)) {
        setBoard(placePiece(piece, ori, spot, brd));
      } else {
        //??? flash board red
        console.log('CANT-PLACE', piece, ori, spot);
      }
    }
  }

  function placeOnBoard() {
    console.log('PLACE');
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
          <button disabled={isSolving} onClick={handleLevelDec}>-</button>
          <input 
            type='number'
            disabled={isSolving}
            min='0'
            max={levelMax}
            value={levelIndex}
            onChange={handleLevel}
          />
          <button disabled={isSolving} onClick={handleLevelInc}>+</button>
          <button disabled={isSolving} onClick={clearBoard}>Clear</button>
          <button disabled={isSolving} onClick={start}>Start</button>
          <button disabled={!isSolving} onClick={stop}>Stop</button>
        </div>
        <Board 
          board={board}
          pickSpot={setSpot}
        />
        <div className={styles.bottomButtons}>
          <span>Piece</span>
          <input 
            type='number'
            min='0'
            max={pieceMax}
            value={piece}
            onChange={handlePiece}
          />
          <span>Orientation</span>
          <input 
            type='number'
            min='0'
            max={oriMax}
            value={ori}
            onChange={handleOri}
          />
          <button onClick={placeOnBoard}>Next</button>
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
