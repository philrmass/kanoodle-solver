import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { hexToColor, rgbToColor } from '../utilities/color';
import pieces from '../data/pieces.json';
import styles from '../styles/Importer.module.css';

//??? add offset and scale commands using the arrow keys
//??? detect 9+ pixels around the click to determine color, reject outliers
//??? look up color at other 51 locations, create board and display it
//??? add level number, show that level before clicks, ask to save
//??? add instructions

function Importer({ close }) {
  const maxSize = 500;
  const canvas = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [pixels, setPixels] = useState([]);
  const [colorPieces] = useState(pieces.map((p) => ({ ...p, color: hexToColor(p.color) })));
  const [hasDrop, setHasDrop] = useState(false);
  const [corners, setCorners] = useState([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);
  const [cornerIndex, setCornerIndex] = useState(0);
  const [img, setImg] = useState(null);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.fillStyle = '#00000080';
    ctx.strokeStyle = '#ffff00';
    if (img) {
      const w = scale * width;
      const h = scale * height;
      ctx.drawImage(img, 0, 0, w, h);
    }

    const size = 6;
    let count = 0;
    for (const corner of corners) {
      const x = scale * corner[0];
      const y = scale * corner[1];

      if (x >= 0 && y >= 0) {
        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);
        count++;
      }
    }

    if (count === 4) {
      console.log('FILL the board');
    }
  }, [corners]);

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
    const x = Math.floor(canvasX / scale);
    const y = Math.floor(canvasY / scale);

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
    const index = perColor * (y * width + x);
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

  function processImage(image) {
    const [imageScale, width, height] = calculateImageScale(image, maxSize);
    setScale(imageScale);

    const ctx = canvas.current.getContext('2d');
    canvas.current.width = width;
    canvas.current.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = image.width;
    fullCanvas.height = image.height;

    const fullCtx = fullCanvas.getContext('2d');
    fullCtx.drawImage(image, 0, 0);
    const imageData = fullCtx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
    setPixels(imageData.data);
    setWidth(fullCanvas.width);
    setHeight(fullCanvas.height);
    setImg(image);
    setCorners([[-1, -1], [-1, -1], [-1, -1], [-1, -1]]);
  }

  function calculateImageScale(image, maxSize) {
    let scale;
    if (image.width > image.height) {
      scale = maxSize / image.width;
    } else {
      scale = maxSize / image.height;
    }

    const width = Math.round(scale * image.width);
    const height = Math.round(scale * image.height);

    return [scale, width, height];
  }

  const dropClasses = `${styles.dropZone} ${hasDrop ? 'active' : ''}`;

  return (
    <Fragment>
      <div className={styles.topButtons}>
        <button onClick={close}>Close</button>
        <div
          className={dropClasses}
          onDragEnter={() => setHasDrop(true)}
          onDragLeave={() => setHasDrop(false)}
          onDragOver={doNothing}
          onDrop={handleFileDrop}
        >
          Drag a Kanoodle image here to begin
        </div>
      </div>
      <div
        className={styles.canvasWrap}
        onClick={handleCanvasClick}
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
    </Fragment>
  );
}

Importer.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveLevel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default Importer;
