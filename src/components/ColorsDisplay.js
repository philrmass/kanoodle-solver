import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { rgbToHex } from '../utilities/color';
import styles from '../styles/ColorsDisplay.module.css';

function ColorsDisplay({ colors, size, width }) {
  const colorGrid = useRef(null);

  useEffect(() => {
    if (colors.length > 0) {
      const across = width ? width : Math.ceil(Math.sqrt(colors.length));
      const down = Math.ceil(colors.length / across);
      const box = size / down;
      colorGrid.current.style.setProperty('grid-template-columns', '1fr '.repeat(across));
      colorGrid.current.style.setProperty('width', `${across * box}px`);
      colorGrid.current.style.setProperty('height', `${down * box}px`);
    }
  }, [colors, size]);

  function buildColors() {
    return colors.map((color, index) => {
      const background = `#${rgbToHex(color)}`;
      const colorStyle = { background };
      return (
        <div 
          key={index}
          id={`yo${index}`}
          className={styles.color}
          style={colorStyle}
        >
          <div>{background}</div>
          {/*
          */}
          <div>{color.hue.toFixed(1)}</div>
          <div>{color.sat.toFixed(1)}</div>
          <div>{color.light.toFixed(1)}</div>
        </div>
      );
    });
  }

  return (
    <div
      id='colorGrid'
      ref={colorGrid}
      className={styles.colorGrid}
    >
      {buildColors()}
    </div>
  );
}

ColorsDisplay.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object).isRequired,
  size: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export default ColorsDisplay;
