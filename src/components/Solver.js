import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import pieces from '../data/pieces.json';
import Board from './Board';
import {
  pieceMax,
  oriMax,
  getBlankBoard,
  verifyBoard,
  isBoardSolved,
  getBoardUnused,
  pickFirstBlankSpot,
  canPlacePiece,
  placePiece,
  verifyPiece,
  verifyOri,
  getSpotXY,
} from '../utilities/game';
import styles from '../styles/Solver.module.css';

function Solver({ levels, saveLevel, close }) {
  const levelMax = levels.length - 1;
  const keyCapture = useRef(null);
  const firstUnsolved = levels.findIndex((level) => !level.end);

  const [level, setLevel] = useState(firstUnsolved);
  const [piece, setPiece] = useState(0);
  const [ori, setOri] = useState(0);
  const [spot, setSpot] = useState(null);
  const [board, setBoard] = useState(levels[level].start);
  const [steps, setSteps] = useState([]);
  const [possibles, setPossibles] = useState([]);
  const [deadEnds, setDeadEnds] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [logged, setLogged] = useState('');

  const isSolving = (steps.length > 0);

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

  function reset() {
    setBoard(levels[level].start);
    setSteps([]);
    setPossibles([]);
    setDeadEnds([]);
    setSolutions([]);
    setLogged('');
  }

  function addFirstStep() {
    if (verifyBoard(board)) {
      const unused = getBoardUnused(board);
      const step = {
        board: [...board],
        state: {
          unused,
          unusedIndex: 0,
          usedSpots: [],
        },
        last: null,
      };
      addStep(step);
      setPossibles([step]);
      setDeadEnds([]);
      setSolutions([]);
    }
  }

  function addStep(step) {
    setSteps((steps) => [...steps, step]);
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

  function log(...args) {
    setLogged((log) => {
      for (const arg of args) {
        log += `${arg} `;
      }
      log += '\n';
      return log;
    });
  }

  function showOnBoard(piece, ori, spot, steps) {
    if (spot && steps.length > 0) {
      const brd = steps[steps.length - 1].board;
      if (canPlacePiece(piece, ori, spot, brd)) {
        setBoard(placePiece(piece, ori, spot, brd));
      }
    }
  }

  function saveSolution() {
    //??? change to get solution from solutions
    const isSolved = isBoardSolved(board);
    if (isSolved) {
      const end = [...board];
      saveLevel(level, { end });
    }
  }

  function stepA() {
    if (steps.length === 0) {
      addFirstStep();
      return;
    }

    const possible = possibles.shift();
    if (!possible) {
      log('DONE'); // eslint-disable-line no-console
      return;
    }

    const state = possible.state;
    let spot = pickFirstBlankSpot(board, state.usedSpots);
    log(`NEXT ${spot} => ${getSpotXY(spot)}`, state); // eslint-disable-line no-console
    let placed = false;

    while (spot >= 0 && !placed) {
      const piece = state.unused.shift();
      const oris = pieces[piece].orientations;

      for (let i = 0; i < oris.length && !placed; i++) {
        const ori = oris[i];
        if (canPlacePiece(piece, ori, spot, board)) {
          log('can place', piece, ori, 'at', spot); // eslint-disable-line no-console
          setBoard(placePiece(piece, ori, spot, board));
          placed = true;
        } else {
          log('  try', piece, ori, 'at', spot); // eslint-disable-line no-console
        }
      }

      if (placed) {
        log('PLACED', piece, 'at', spot); // eslint-disable-line no-console
        //setPossibles([]);
        //setDeadEnds([]);
        //setSolutions([]);
        //??? create a step with last, etc.
        //??? add step to steps
        //??? add to possibles or solutions
      } else {
        log('NOT-PLACED', piece, 'at', spot); // eslint-disable-line no-console
        state.usedSpots.push(spot);
        spot = pickFirstBlankSpot(board, state.usedSpots);
        log(' NEXT-SPOT', getSpotXY(spot), state.usedSpots); // eslint-disable-line no-console

        //??? if no spots, get next piece
        //??? if no next piece, add to deadEnds
      }
    }

    /*
    {
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
        <div className={styles.buttonRow}>
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
          <div>{levels[level].end ? 'Solved' : 'Unsolved'}</div>
        </div>
        <div className={styles.buttonRow}>
          <span>Piece</span>
          <input
            type='number'
            min='0'
            max={pieceMax}
            value={piece}
            onChange={(e) => setPiece(verifyPiece(parseInt(e.target.value)))}
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
        <Board
          board={board}
          pickSpot={setSpot}
        />
        <div className={styles.buttonRow}>
          <span>{`${possibles.length} Possibles`}</span>
          <span>{`${deadEnds.length} Dead Ends`}</span>
          <span>{`${solutions.length} Solutions`}</span>
          <button onClick={saveSolution}>Save</button>
          <button onClick={reset}>Reset</button>
        </div>
        <div className={styles.buttonRow}>
          <button onClick={stepA}>Step A</button>
        </div>
        <div className={styles.log} onDoubleClick={() => setLogged('')}>
          {logged}
        </div>
      </section>
    </Fragment>
  );
}

Solver.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveLevel: PropTypes.func,
  close: PropTypes.func.isRequired,
};

export default Solver;
