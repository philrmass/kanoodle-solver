import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Board.module.css';
import pieces from '../data/pieces.json';

function Board({ board }) {
  function getColor(piece) {
    if (piece < 0 || piece >= pieces.length) {
      return 'transparent';
    }
    const color = pieces[piece].color;
    return `#${color}`;
  }

  function buildSpots() {
    const rows = 5;
    const cols = 11;
    const spaceWidth = 100 / 11;
    const spaceHeight = 100 / 5;
    const spotRatio = .9;
    const spotWidth = spotRatio * spaceWidth;
    const spotHeight = spotRatio * spaceHeight;
    const spotOffsetX = 0.5 * (spaceWidth - spotWidth);
    const spotOffsetY = 0.5 * (spaceHeight - spotHeight);
    const spots = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `spot${row}-${col}`;
        const index = row * cols + col;
        const piece = board[index];
        const color = getColor(piece);
        const left = col * spaceWidth + spotOffsetX;
        const top = row * spaceHeight + spotOffsetY;
        const spotStyle = {
          background: `${color}`,
          left: `${left}%`,
          top: `${top}%`,
          width: `${spotWidth}%`,
          height: `${spotHeight}%`,
        };

        spots.push(<div key={key} className={styles.spot} style={spotStyle}></div>);
      }
    }

    return spots;
  }

  return (
    <div className={styles.board}>
      {buildSpots()}
    </div>
  );
}

Board.propTypes = {
  board: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default Board;
