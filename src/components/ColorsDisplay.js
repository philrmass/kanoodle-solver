import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { rgbToHex } from '../utilities/color';
import styles from '../styles/ColorsDisplay.module.css';

function ColorsDisplay({ colors }) {
  const colorGrid = useRef(null);

  useEffect(() => {
    if (colors.length > 0) {
      const size = 70;
      const across = Math.ceil(Math.sqrt(colors.length));
      const down = Math.ceil(colors.length / across);
      colorGrid.current.style.setProperty('grid-template-columns', '1fr '.repeat(across));
      colorGrid.current.style.setProperty('width', `${across * size}px`);
      colorGrid.current.style.setProperty('height', `${down * size}px`);

      //??? compute color values
    }
  }, [colors]);

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
          <div>{color.hue}</div>
          <div>{color.sat}</div>
          <div>{color.light}</div>
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
};

export default ColorsDisplay;
