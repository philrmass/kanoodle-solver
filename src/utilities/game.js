import pieces from '../data/pieces.json';

export const blank = -1;
export const boardRows = 5;
export const boardColumns = 11;
export const boardSize = (boardRows * boardColumns);
export const pieceMax = pieces.length - 1;
export const oriMax = 7;

export function getBlankBoard() {
  return new Array(boardSize).fill(blank);
}

export function verifyBoard(board) {
  const counts = getBoardPieceCounts(board);
  const pieceCounts = pieces.map((piece) => piece.dots.length);

  return counts.every((count, index) => count === 0 || count === pieceCounts[index]);
}

export function isBoardSolved(board) {
  const counts = getBoardPieceCounts(board);
  const pieceCounts = pieces.map((piece) => piece.dots.length);

  return counts.every((count, index) => count === pieceCounts[index]);
}

export function boardsMatch(board0, board1) {
  if (board0.length !== board1.length) {
    return false;
  }
  for (let i = 0; i < board0.length; i++) {
    if (board0[i] !== board1[i]) {
      return false;
    }
  }
  return true;
}

export function boardsMatch0(board0, board1) {
  return board0.every((item, i) => item === board1[i]);
}

export function getBoardUnused(board) {
  const counts = getBoardPieceCounts(board);
  return counts.reduce((unused, count, index) => {
    if (count === 0) {
      return [...unused, index];
    }
    return unused;
  }, []);
}

function getBoardPieceCounts(board) {
  return board.reduce((counts, spot) => {
    if (spot > -1 && spot < counts.length) {
      counts[spot] = counts[spot] + 1;
    }
    return counts;
  }, new Array(12).fill(0));
}

export function pickFirstBlankSpot(board, excludedSpots = []) {
  for (let x = 0; x < boardColumns; x++) {
    for (let y = boardRows - 1; y >= 0; y--) {
      const spot = getSpot(x, y);
      if (board[spot] < 0 && !excludedSpots.includes(spot)) {
        return spot;
      }
    }
  }
  return -1;
}

export function canPlacePiece(piece, ori, spot, board) {
  const pieceData = pieces[piece];
  const dots = rotateDots(pieceData.dots, ori);
  return canPlaceDots(dots, spot, board);
}

export function placePiece(piece, ori, spot, board) {
  const pieceData = pieces[piece];
  const dots = rotateDots(pieceData.dots, ori);
  return placeDots(dots, piece, spot, board);
}

function rotateDots(dots, ori) {
  //??? add flipX?
  //const flipX = Math.floor(ori / 8) % 2 === 1;
  const flipY = Math.floor(ori / 4) % 2 === 1;
  const rotation = ori % 4;

  const flipped = flipY ? dots.map((dot) => [dot[0], -dot[1]]) : dots;
  return flipped.map((dot) => {
    const x = dot[0];
    const y = dot[1];

    switch (rotation) {
      case 1:
        return [y, -x];
      case 2:
        return [-x, -y];
      case 3:
        return [-y, x];
      default:
        return [x, y];
    }
  });
}

function canPlaceDots(dots, spot, board) {
  const [spotX, spotY] = getSpotXY(spot);
  return dots.every((dot) => {
    const x = spotX + dot[0];
    const y = spotY + dot[1];
    const inBounds = (x >= 0 && x < boardColumns && y >= 0 && y < boardRows);
    const dotSpot = getSpot(x, y);
    return inBounds && (board[dotSpot] === -1);
  });
}

function placeDots(dots, piece, spot, board) {
  const placed = [...board];
  const [spotX, spotY] = getSpotXY(spot);
  for (const dot of dots) {
    const x = spotX + dot[0];
    const y = spotY + dot[1];
    const spot = getSpot(x, y);
    placed[spot] = piece;
  }
  return placed;
}

function getSpot(x, y) {
  return (y * boardColumns) + x;
}

export function getSpotXY(spot) {
  if (spot < 0) {
    return [-1, -1];
  }
  const spotY = Math.floor(spot / boardColumns);
  const spotX = spot - (spotY * boardColumns);
  return [spotX, spotY];
}

export function verifyPiece(piece) {
  if (piece < 0) {
    return 0;
  }
  if (piece > pieceMax) {
    return pieceMax;
  }
  return piece;
}

export function verifyOri(ori) {
  if (ori < 0) {
    return 0;
  }
  if (ori > oriMax) {
    return oriMax;
  }
  return ori;
}

