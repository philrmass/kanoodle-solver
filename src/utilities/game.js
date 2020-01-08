import pieces from '../data/pieces.json';

export const blank = -1;
export const boardRows = 5;
export const boardColumns = 11;
export const boardSize = (boardRows * boardColumns);

export function getBlankBoard() {
  return new Array(boardSize).fill(blank);
}

export function canPlacePiece(piece, ori, spot, board) {
  return false;
}

export function placePiece(index, piece, orientation, board) {
  const placed = [...board];
  return placed;
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
