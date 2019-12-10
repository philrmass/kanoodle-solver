import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { hexToColor, rgbToColor } from '../utilities/color';
import pieces from '../data/pieces.json';
import styles from '../styles/Importer.module.css';

//??? detect 9+ pixels around the corners to determine color, reject outliers
//??? look up color at other 51 locations, create board and display it
//??? add level number, show that level before clicks, ask to save
//??? add instructions

function Importer({ close }) {
  const maxSize = 500;
  const canvas = useRef(null);
  const [image, setImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [pixels, setPixels] = useState([]);
  const [colorPieces] = useState(pieces.map((p) => ({ ...p, color: hexToColor(p.color) })));
  const [hasDrop, setHasDrop] = useState(false);
  const [corners, setCorners] = useState([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);
  const [cornerIndex, setCornerIndex] = useState(0);

  useEffect(() => {
    drawImage();

    const ctx = canvas.current.getContext('2d');
    ctx.strokeStyle = '#ffff00';
    ctx.fillStyle = '#00000080';
    ctx.lineWidth = 2;

    const size = 8;
    let count = 0;
    for (const corner of corners) {
      const x = offsetX + scale * corner[0];
      const y = offsetY + scale * corner[1];

      if (x >= 0 && y >= 0) {
        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);
        count++;
      }
    }

    if (count === 4) {
      console.log('FILL the board');
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

  function handleKeyDown(e) {
    switch (e.keyCode) {
      case 32:
        setScale(canvas.current.width / imageWidth);
        setOffsetX(0);
        setOffsetY(0);
        break;
      case 37:
        const dw = scale * imageWidth;
        const diff = 
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
        break;
      case 189:
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
        break;
      default:
        break;
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

    //??? color lookup
    //const color = getImageColor([x, y]);
    //const piece = matchPiece(color);
  }

  function getImageColor(offsets) {
    const perColor = 4;
    const x = offsets[0];
    const y = offsets[1];
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
    let diff = Infinity;
    let match = {};
    console.log('hue', color.hue, 'sat', color.sat, 'light', color.light);
    for (const piece of colorPieces) {
      //??? fix hue wrap-around
      const hueDiff = Math.abs(color.hue - piece.color.hue);
      const satDiff = Math.abs(color.sat - piece.color.sat);
      const lightDiff = Math.abs(color.light - piece.color.light);
      const total = hueDiff + satDiff + lightDiff;
      if (total < diff) {
        diff = total;
        match = piece;
      }
      console.log(` ${piece.index}_${piece.code} (${total.toFixed(1)}) ${hueDiff.toFixed(1)} ${satDiff.toFixed(1)} ${lightDiff.toFixed(1)}`);
    }
    console.log('MATCH ', match.code, match.index);
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
        onKeyDown={handleKeyDown}
        tabIndex={0}
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
          <button onClick={close}>Close</button>
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
