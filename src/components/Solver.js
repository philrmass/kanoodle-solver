import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Board from './Board';
import {
  pieceMax,
  oriMax,
  getBlankBoard,
  //isBoardSolved,
  //pickFirstBlankSpot,
  canPlacePiece,
  placePiece,
  verifyBoard,
  verifyPiece,
  verifyOri,
} from '../utilities/game';
import styles from '../styles/Solver.module.css';

function Solver({ levels, close }) {
  const levelMax = levels.length - 1;
  const keyCapture = useRef(null);
  const firstUnsolved = levels.findIndex((level) => !level.end);
  const [level, setLevel] = useState(firstUnsolved);
  const [piece, setPiece] = useState(0);
  const [ori, setOri] = useState(0);
  const [spot, setSpot] = useState(null);
  const [board, setBoard] = useState(levels[level].start);
  const [isSolving, setIsSolving] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    showOnBoard(piece, ori, spot, steps);
  }, [piece, ori, spot, steps]);

  function handleLevel(level) {
    level = verifyLevel(level);
    setBoard(levels[level].start);
    setLevel(level);
  }

  function verifyLevel(level) {
    if (level < 0) {
      return 0;
    }
    if (level > levelMax) {
      return levelMax;
    }
    return level;
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
    };
    setSteps([step]);
  }

  function stop() {
    setIsSolving(false);
  }

  function handleKeyDown(e) {
    const left = 37;
    const up = 38;
    const right = 39;
    const down = 40;
    let handled = true;

    switch (e.keyCode) {
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
      }
    }
  }

  function solveBoard() {
    const ok = verifyBoard(board);
    console.log('SOLVE', ok); // eslint-disable-line no-console
  }

  function solveNext() {
    console.log('NEXT'); // eslint-disable-line no-console
    // find empty spot not already picked
    // check all orientations of next piece until a piece fits
    // if fits, add step and add to back of possibles
    //   if solved, add to solutions
    // if all possibilities are used, add to back of deadEnds
    // ??? add solutions, deadEnds, possibles
    /*
    {
      setIsSolving(true);
      const step = {
        board: [...board],
        state: {},
        last: null,
      };
      setSteps([step]);
    }
    */
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
          <button disabled={isSolving} onClick={() => handleLevel(level - 1)}>-</button>
          <input
            type='number'
            disabled={isSolving}
            min='0'
            max={levelMax}
            value={level}
            onChange={(e) => handleLevel(e.target.value)}
          />
          <button disabled={isSolving} onClick={() => handleLevel(level + 1)}>+</button>
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
            onChange={(e) => setPiece(verifyPiece(e.target.value))}
          />
          <span>Orientation</span>
          <input
            type='number'
            min='0'
            max={oriMax}
            value={ori}
            onChange={(e) => setOri(verifyOri(e.target.value))}
          />
        </div>
        <div className={styles.bottomButtons}>
          <button onClick={solveBoard}>Solve</button>
          <button onClick={solveNext}>Next</button>
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
