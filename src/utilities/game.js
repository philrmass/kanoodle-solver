export function verifyLevel(board, pieces) {
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
