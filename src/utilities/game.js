import pieces from '../data/pieces.json';

export const blank = -1;
export const boardRows = 5;
export const boardColumns = 11;
export const boardSize = (boardRows * boardColumns);

export function getBlankBoard() {
  return new Array(boardSize).fill(blank);
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
  const flipY = (ori % 2) === 1;
  const rotation = Math.floor(ori / 2);

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
    return (x >= 0 && x < boardColumns && y >= 0 && y < boardRows);
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

export function verifyBoard(board) {
  const counts = board.reduce((counts, spot) => {
    if (spot > -1 && spot < counts.length) {
      counts[spot] = counts[spot] + 1;
    }
    return counts;
  }, new Array(12).fill(0));

  return counts.every((count, index) => {
    const pieceCount = pieces[index].spots.length;
    return count === pieceCount || count === 0;
  });
}
