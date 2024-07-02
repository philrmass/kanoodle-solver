import { useEffect, useRef, useState } from 'preact/hooks';
import PropTypes from 'prop-types';
import pieces from '../data/pieces.json';
import Board from './Board';
import StepsModal from './StepsModal';
import {
  pieceMax,
  oriMax,
  getBlankBoard,
  isBoardSolved,
  boardsMatch,
  getBoardUnused,
  pickFirstBlankSpot,
  canPlacePiece,
  placePiece,
  verifyPiece,
  verifyOri,
} from '../utilities/game';
import styles from '../styles/Solver.module.css';

function Solver({ levels, saveLevel, close }) {
  const levelMax = levels.length - 1;
  const keyCapture = useRef(null);
  const solvedCount = levels.reduce((cnt, l) => l.end ? cnt + 1 : cnt, 0);
  const unsolvedCount = levels.reduce((cnt, l) => l.end ? cnt : cnt + 1, 0);

  const [level, setLevel] = useState(0);
  const [piece, setPiece] = useState(0);
  const [ori, setOri] = useState(0);
  const [spot, setSpot] = useState(null);
  const [board, setBoard] = useState(levels[level].start);
  const [steps, setSteps] = useState([]);
  const [possibles, setPossibles] = useState([]);
  const [deadEnds, setDeadEnds] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [uniqueSolutions, setUniqueSolutions] = useState(0);
  const [uniqueDeadEnds, setUniqueDeadEnds] = useState(0);
  const [modalSteps, setModalSteps] = useState([]);
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

  function next() {
    const firstUnsolved = levels.findIndex((level) => !level.end) || 0;
    setLevel(firstUnsolved);
    reset(firstUnsolved);
  }

  function reset(index) {
    setBoard(levels[index].start);
    setSteps([]);
    setPossibles([]);
    setDeadEnds([]);
    setSolutions([]);
    setUniqueSolutions(0);
    setUniqueDeadEnds(0);
    setLogged('');
  }

  function createStep(board, last) {
    return {
      board: [...board],
      state: {},
      last,
    };
  }

  /*
  function addValidStep(step) {
    setSteps((steps) => [...steps, step]);
    if (isBoardSolved(step.board)) {
      setSolutions((steps) => {
        const found = steps.find((s) => boardsMatch(s.board, step.board));
        if (!found) {
          log('  SOLVED');
          return [...steps, step];
        }
        setUniqueSolutions((d) => d + 1);
        return steps;
      });
    } else {
      setPossibles((steps) => [...steps, step]);
    }
  }

  function addInvalidStep(step) {
    setDeadEnds((steps) => {
      const found = steps.find((s) => boardsMatch(s.board, step.board));
      if (!found) {
        return [...steps, step];
      }
      setUniqueDeadEnds((d) => d + 1);
      return steps;
    });
  }
  */

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
    const text = args.reduce((text, arg) => {
      text += typeof arg === 'object' ? `${JSON.stringify(arg)} ` : `${arg} `;
      return text;
    }, '');
    setLogged((logged) => logged + text + '\n');
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
    const solved = solutions[0].board;
    const isSolved = isBoardSolved(solved);
    if (isSolved) {
      const end = [...solved];
      saveLevel(level, { end });
    }
  }

  function solveA() {
  }

  function stepA() {
    const starts = [...possibles];
    if (steps.length === 0) {
      starts.push(createStep(board, null));
      log('START', getBoardUnused(board));
    }

    if (starts.length > 0) {
      log('  STEP', starts.length);
      let valids = [];
      const invalids = [];

      for (const start of starts) {
        const nexts = algorithmA(start);
        if (nexts.length > 0) {
          valids = [...valids, ...nexts];
        } else {
          invalids.push(start);
        }
      }

      const bs = valids.length > 0 ? valids[0] : invalids[0];
      setBoard(bs.board);

      const s = valids.filter((v) => isBoardSolved(v.board));
      const p = valids.filter((v) => !isBoardSolved(v.board));
      const de = [...deadEnds, ...invalids];
      setSolutions((sols) => [...sols, ...s]);
      setDeadEnds(de);
      const su = getUniqueSteps(s);
      const deu = getUniqueSteps(de);
      const pu = getUniqueSteps(p);
      setPossibles(pu);
      setUniqueSolutions(su.length);
      setUniqueDeadEnds(deu.length);

      if (s.length) {
        log('    SOL:', s.length, ' uni:', su.length);
        log('    DE:', de.length, ' uni:', deu.length);
      } else {
        log('    P:', p.length, ' uni:', pu.length);
        log('    DE:', de.length, ' uni:', deu.length);
      }
      setSteps([1]);
    }
  }

  function getUniqueSteps(steps) {
    return steps.reduce((uniques, step) => {
      const match = uniques.some((unique) => boardsMatch(unique.board, step.board));
      if (match) {
        return uniques;
      }
      return [...uniques, step];
    }, []);
  }

  function algorithmA(possible) {
    const piece = getBoardUnused(possible.board).shift();
    const usedSpots = [];
    let spot = pickFirstBlankSpot(possible.board, usedSpots);
    const valids = [];

    while (spot >= 0) {
      const oris = pieces[piece].orientations;
      for (const ori of oris) {
        if (canPlacePiece(piece, ori, spot, possible.board)) {
          const newBoard = placePiece(piece, ori, spot, possible.board);
          valids.push(createStep(newBoard, possible));
        }
      }

      usedSpots.push(spot);
      spot = pickFirstBlankSpot(possible.board, usedSpots);
    }

    return valids;
  }

  function buildStepsLink(steps, label) {
    const text = `${steps.length} ${label}`;
    if (steps.length === 0) {
      return (<span>{text}</span>);
    }
    return (<button className={styles.link} onClick={() => setModalSteps(steps)}>{text}</button>);
  }

  function buildStepsModal() {
    if (modalSteps.length === 0) {
      return null;
    }
    return (
      <StepsModal
        steps={modalSteps}
        close={() => setModalSteps([])}
      />
    );
  }

  return (
    <>
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
          <div>{`${levels[level].end ? 'Solved' : 'Unsolved'} (${solvedCount}, ${unsolvedCount})`}</div>
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
          {buildStepsLink(possibles, 'Possibles')}
          {buildStepsLink(deadEnds, 'Dead Ends')}
          {buildStepsLink(solutions, 'Solutions')}
          <button onClick={saveSolution} disabled={solutions.length === 0}>Save</button>
          <button onClick={() => reset(level)}>Reset</button>
          <button onClick={next}>Next</button>
        </div>
        <div>
          <span>{`${uniqueDeadEnds} Unique DEs`}</span>
          <span>{` ${uniqueSolutions} Unique Sol`}</span>
          {/*<span>{` ${steps.length} Steps`}</span>*/}
        </div>
        <div className={styles.buttonRow}>
          <button onClick={stepA}>Step A</button>
          <button onClick={solveA}>Solve A</button>
        </div>
        <div className={styles.log} onDoubleClick={() => setLogged('')}>
          {logged}
        </div>
      </section>
      {buildStepsModal()}
    </>
  );
}

Solver.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveLevel: PropTypes.func,
  close: PropTypes.func.isRequired,
};

export default Solver;
