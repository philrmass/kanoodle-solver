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
  const counts = board.reduce((counts, spot) => {
    if (spot > -1 && spot < counts.length) {
      counts[spot] = counts[spot] + 1;
    }
    return counts;
  }, new Array(12).fill(0));

  return counts.every((count, index) => {
    const pieceCount = pieces[index].dots.length;
    return count === pieceCount || count === 0;
  });
}

export function isBoardSolved(board) {
  console.error('isBoardSolved', board); // eslint-disable-line no-console
  return false;
}

export function pickFirstBlankSpot(board, excludedSpots = []) {
  console.error('pickFirstBlankSpot', board, excludedSpots); // eslint-disable-line no-console
  return 0;
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
    const dotSpot = (y * boardColumns) + x;
    return inBounds && (board[dotSpot] === -1);
  });
}

function placeDots(dots, piece, spot, board) {
  const placed = [...board];
  const [spotX, spotY] = getSpotXY(spot);
  for (const dot of dots) {
    const x = spotX + dot[0];
    const y = spotY + dot[1];
    const spot = (y * boardColumns) + x;
    placed[spot] = piece;
  }
  return placed;
}

function getSpotXY(spot) {
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

