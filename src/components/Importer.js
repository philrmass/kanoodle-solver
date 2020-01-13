import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { calcAverage, calcHueDiff, hexToColor, rgbToColor } from '../utilities/color';
import pieces from '../data/pieces.json';
import Board from './Board';
import ColorsDisplay from './ColorsDisplay';
import styles from '../styles/Importer.module.css';

function Importer({ levels, saveLevel, close }) {
  const lightMin = 22;
  const maxSize = 500;
  const canvas = useRef(null);
  const keyCapture = useRef(null);
  const [image, setImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [pixels, setPixels] = useState([]);
  const [colorPieces] = useState(pieces.map((p) => ({ ...p, matchColor: hexToColor(p.matchColor) })));
  const [hasDrop, setHasDrop] = useState(false);
  const [corners, setCorners] = useState([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);
  const [cornerIndex, setCornerIndex] = useState(0);
  const [colors, setColors] = useState([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [board, setBoard] = useState(levels[levelIndex] ? levels[levelIndex].start : null);

  useEffect(() => {
    drawImage();

    const ctx = canvas.current.getContext('2d');
    ctx.fillStyle = '#00000080';
    ctx.lineWidth = 2;

    const size = 8;
    let count = 0;
    for (const corner of corners) {
      const x = (offsetX + scale * corner[0]) - size / 2;
      const y = (offsetY + scale * corner[1]) - size / 2;

      if (x >= 0 && y >= 0) {
        ctx.strokeStyle = count === 0 ? '#ff8000' : '#ffff00';
        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);
        count++;
      }
    }

    if (count === 4) {
      const centers = getCenters(corners, 11, 5);
      const dot = 2;

      for (const center of centers) {
        const x = (offsetX + scale * center[0]) - dot / 2;
        const y = (offsetY + scale * center[1]) - dot / 2;

        ctx.fillRect(x, y, dot, dot);
        ctx.strokeRect(x, y, dot, dot);
      }

      const aves = [];
      const indices = [];
      for (const center of centers) {
        const x = Math.round(center[0]);
        const y = Math.round(center[1]);
        const cols = getImageColors(x, y);
        const ave = calcAverage(cols.filter((col) => col.light >= lightMin));
        const piece = matchPiece(ave);

        if (ave) {
          aves.push(ave);
        }
        indices.push(piece ? piece.index : -1);
      }
      setColors(aves);
      setBoard(indices);
    }
  }, [corners, scale, offsetX, offsetY]);

  function drawImage() {
    if (image) {
      const ctx = canvas.current.getContext('2d');
      const dw = scale * imageWidth;
      const dh = scale * imageHeight;
      ctx.fillStyle = '#606060';
      ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
      ctx.drawImage(image, offsetX, offsetY, dw, dh);
    }
  }

  function getCenters(corners, across, up) {
    const blx = corners[0][0];
    const bly = corners[0][1];
    const brx = corners[1][0];
    const bry = corners[1][1];
    const tlx = corners[3][0];
    const tly = corners[3][1];
    const trx = corners[2][0];
    const trY = corners[2][1];

    const centers = [];
    for (let row = up - 1; row >= 0; row--) {
      const rowRatio = row / (up - 1);
      const sx = blx + rowRatio * (tlx - blx);
      const sy = bly + rowRatio * (tly - bly);
      const ex = brx + rowRatio * (trx - brx);
      const ey = bry + rowRatio * (trY - bry);

      for (let col = 0; col < across; col++) {
        const colRatio = col / (across - 1);
        const x = sx + colRatio * (ex - sx);
        const y = sy + colRatio * (ey - sy);
        centers.push([x, y]);
      }
    }

    return centers;
  }

  function handleKeyDown(e) {
    let handled = true;

    switch (e.keyCode) {
      case 32:
        setScale(canvas.current.width / imageWidth);
        setOffsetX(0);
        setOffsetY(0);
        if (keyCapture) {
          keyCapture.current.focus();
        }
        break;
      case 37:
        setOffsetX((offset) => offset - 10);
        break;
      case 38:
        setOffsetY((offset) => offset - 10);
        break;
      case 39:
        setOffsetX((offset) => offset + 10);
        break;
      case 40:
        setOffsetY((offset) => offset + 10);
        break;
      case 187:
        //??? make zoom function
        /*
        let dw0 = scale * imageWidth;
        let dh0 = scale * imageHeight;
        let value = 1.05 * scale;
        let dw1 = value * imageWidth;
        let dh1 = value * imageHeight;
        let dx = 0.5 * (dw1 - dw0);
        let dy = 0.5 * (dh1 - dh0);
        setScale(value);
        setOffsetX((offset) => offset - dx);
        setOffsetY((offset) => offset - dy);
        */
        break;
      case 189:
        //??? make zoom function
        /*
        dw0 = scale * imageWidth;
        dh0 = scale * imageHeight;
        value = 0.95 * scale;
        if (value * imageWidth < canvas.current.width) {
          value = canvas.current.width / imageWidth;
        }
        dw1 = value * imageWidth;
        dh1 = value * imageHeight;
        dx = 0.5 * (dw1 - dw0);
        dy = 0.5 * (dh1 - dh0);
        setScale(value);
        setOffsetX((offset) => offset - dx);
        setOffsetY((offset) => offset - dy);
        */
        break;
      default:
        handled = false;
        break;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  function doNothing(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function handleFileDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    setHasDrop(false);
    const file = e.dataTransfer.files[0];
    verifyImage(file);
  }

  function handleCanvasClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const x = Math.floor((canvasX - offsetX) / scale);
    const y = Math.floor((canvasY - offsetY) / scale);

    setCorners((c) => [...c.slice(0, cornerIndex), [x, y], ...c.slice(cornerIndex + 1)]);
    setCornerIndex((index) => (index < 3) ? index + 1 : 0);
  }

  function getImageColors(x, y) {
    const size = 10;
    const colors = [];

    for (let iy = y - size; iy <= y + size; iy++) {
      for (let ix = x - size; ix <= x + size; ix++) {
        colors.push(getImageColor(ix, iy));
      }
    }

    return colors;
  }

  function getImageColor(x, y) {
    const perColor = 4;
    const index = perColor * (y * imageWidth + x);
    let red = 0;
    let green = 0;
    let blue = 0;

    if (index + 3 < pixels.length) {
      red = pixels[index];
      green = pixels[index + 1];
      blue = pixels[index + 2];
    }
    return rgbToColor({ red, green, blue });
  }

  function matchPiece(color) {
    if ((color.light < 40) && (color.light + color.sat < 60)) {
      return null;
    }

    let diff = Infinity;
    let match = {};
    for (const piece of colorPieces) {
      const hueWeight = 2 * (color.sat / 100);
      const lightWeight = 2 * ((100 - color.sat) / 100);
      const hueDiff = hueWeight * Math.abs(calcHueDiff(color, piece.matchColor));
      const satDiff = Math.abs(color.sat - piece.matchColor.sat);
      const lightDiff = lightWeight * Math.abs(color.light - piece.matchColor.light);
      const total = hueDiff + satDiff + lightDiff;
      if (total < diff) {
        diff = total;
        match = piece;
      }
    }
    return match;
  }

  function handleLevelDec() {
    setLevelIndex((index) => {
      index--;
      if (index < 0) {
        index = 0;
      }
      return setBoardByIndex(index);
    });
  }

  function handleLevelInc() {
    setLevelIndex((index) => {
      index++;
      return setBoardByIndex(index);
    });
  }

  function handleLevel(e) {
    const index = e.target.value;
    setLevelIndex(index);
    setBoardByIndex(index);
  }

  function setBoardByIndex(index) {
    const levelBoard = levels[index] ? levels[index].start : null;
    setBoard(levelBoard);
    return index;
  }

  function setBoardSpot(index, value) {
    setBoard((board) => [...board.slice(0, index), value, ...board.slice(index + 1)]);
  }

  function handleLevelSave() {
    const start = [...board];
    saveLevel(levelIndex, { start });
  }

  function verifyImage(fileOrBlob) {
    if (isImage(fileOrBlob)) {
      loadImage(fileOrBlob);
    }
  }

  function isImage(fileOrBlob) {
    return ((typeof(fileOrBlob.type) === 'string') &&
      fileOrBlob.type.startsWith('image'));
  }

  function loadImage(fileOrBlob) {
    const loadedUrl = window.URL.createObjectURL(fileOrBlob);
    let image = new Image();
    image.onload = () => processImage(image);
    image.src = loadedUrl;
  }

  function processImage(img) {
    const [imageScale, width, height] = calculateImageScale(img, maxSize);
    setImage(img);
    setImageWidth(img.width);
    setImageHeight(img.height);
    setPixels(getImagePixels(img));
    setScale(imageScale);
    setCorners([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);

    const ctx = canvas.current.getContext('2d');
    canvas.current.width = width;
    canvas.current.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    if (keyCapture) {
      keyCapture.current.focus();
    }
  }

  function getImagePixels(img) {
    const imageCanvas = document.createElement('canvas');
    const imageCtx = imageCanvas.getContext('2d');
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imageCtx.drawImage(img, 0, 0);

    const imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    return imageData.data;
  }

  function calculateImageScale(img, maxSize) {
    let scale;
    if (img.width > img.height) {
      scale = maxSize / img.width;
    } else {
      scale = maxSize / img.height;
    }

    const width = Math.round(scale * img.width);
    const height = Math.round(scale * img.height);

    return [scale, width, height];
  }

  const dropClasses = `${styles.dropMessage} ${hasDrop ? 'active' : ''}`;

  return (
    <Fragment>
      <div
        tabIndex={0}
        ref={keyCapture}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.topButtons}>
          <button onClick={close}>Close</button>
          <div
            className={dropClasses}
          >
            Drag a Kanoodle image below to begin
          </div>
        </div>
        <div
          className={styles.canvasWrap}
          onClick={handleCanvasClick}
          onDragEnter={() => setHasDrop(true)}
          onDragLeave={() => setHasDrop(false)}
          onDragOver={doNothing}
          onDrop={handleFileDrop}
        >
          <canvas
            ref={canvas}
            className={styles.canvas}
            width={300}
            height={200}
          />
        </div>
        <div className={styles.bottomButtons}>
          <button onClick={handleLevelDec}>-</button>
          <input
            type='number'
            min='0'
            max='162'
            value={levelIndex}
            onChange={handleLevel}
          />
          <button onClick={handleLevelInc}>+</button>
          <button onClick={handleLevelSave}>Save</button>
        </div>
        <div>
          <Board
            board={board}
            setSpot={setBoardSpot}
          />
        </div>
        <div className={styles.displays}>
          <ColorsDisplay
            colors={colors}
            size={250}
            width={11}
          />
        </div>
      </div>
    </Fragment>
  );
}

Importer.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveLevel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default Importer;
