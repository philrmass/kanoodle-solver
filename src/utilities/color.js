export function hexToColor(hex) {
  const rgb = hexToRgb(hex);
  return {
    hex: hex,
    ...rgb,
    ...rgbToHsl(rgb),
  };
}

export function rgbToColor(rgb) {
  return {
    hex: rgbToHex(rgb),
    ...rgb,
    ...rgbToHsl(rgb),
  };
}

export function hslToColor(hsl) {
  const rgb = hslToRgb(hsl);
  return {
    hex: rgbToHex(rgb),
    ...rgb,
    ...hsl,
  };
}

function hexToRgb(hex) {
  return {
    red: parseInt(hex.slice(0, 2), 16),
    green: parseInt(hex.slice(2, 4), 16),
    blue: parseInt(hex.slice(4), 16),
  };
}

export function rgbToHex(rgb) {
  const r = ('0' + Math.round(rgb.red).toString(16)).slice(-2);
  const g = ('0' + Math.round(rgb.green).toString(16)).slice(-2);
  const b = ('0' + Math.round(rgb.blue).toString(16)).slice(-2);
  return r + g + b;
}

function rgbToHsl(rgb) {
  const r = rgb.red / 255;
  const g = rgb.green / 255;
  const b = rgb.blue / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const range = max - min;

  let hue = 0;
  if (r === max) {
    hue = ((g - b) / range);
  } else if (g === max) {
    hue = 2 + ((b - r) / range);
  } else {
    hue = 4 + ((r - g) / range);
  }
  hue = isNaN(hue) ? 0 : toDegrees(hue);
  if (hue < 0) {
    hue += 360;
  }
  const light = toPercent((min + max) / 2);
  let sat = 0;
  if (max > min) {
    if (light < 50) {
      sat = toPercent(range / (max + min));
    } else {
      sat = toPercent(range / (2 - max - min));
    }
  }

  return {
    hue,
    sat,
    light,
  };
}

function toDegrees(value) {
  return Math.round(600 * value) / 10;
}

function toPercent(value) {
  return Math.round(1000 * value) / 10;
}

function hslToRgb(hsl) {
  const h = hsl.hue / 60;
  const l = hsl.light / 100;
  const s = hsl.sat / 100;
  let d1 = 0;
  if (l <= 0.5) {
    d1 = l * (s + 1);
  } else {
    d1 = l + s - (l * s);
  }
  let d0 = l * 2 - d1;

  const red = Math.round(255 * hueToComponent(d0, d1, h + 2));
  const green = Math.round(255 * hueToComponent(d0, d1, h));
  const blue = Math.round(255 * hueToComponent(d0, d1, h - 2));

  return {
    red,
    green,
    blue,
  };
}

function hueToComponent(d0, d1, h) {
  h = (h < 0 ? h + 6 : h);
  h = (h >= 6 ? h - 6 : h);
  if (h < 1) {
    return (((d1 - d0) * h) + d0);
  } else if (h < 3) {
    return d1;
  } else if (h < 4) {
    return ((d1 - d0) * (4 - h) + d0);
  }
  return d0;
}

export function calcHueDiff(color0, color1) {
  const hueMax = 360;
  let diff = color0.hue - color1.hue;
  while (diff > (hueMax / 2)) {
    diff -= hueMax;
  }
  while (diff < -(hueMax / 2)) {
    diff += hueMax;
  }
  return diff;
}

export function calcAverage(colors) {
  if (colors.length === 0) {
    return rgbToColor({ red: 0, green: 0, blue: 0});
  }

  let red = 0;
  let green = 0;
  let blue = 0;

  for (const color of colors) {
    red += color.red;
    green += color.green;
    blue += color.blue;
  }
  red /= colors.length;
  green /= colors.length;
  blue /= colors.length;

  return rgbToColor({ red, green, blue});
}

export function parseColorData0(pixels) {
  return combineColors0(pixelsToColors0(pixels));
}

function pixelsToColors0(pixels) {
  return pixels.reduce((colors, component) => {
    let count = 4;
    let last = {};
    if (colors.length > 0) {
      last = colors[colors.length - 1];
      count = Object.keys(last).length;
    }
    if (count === 4) {
      colors.push({ red: component });
    } else if (count === 1) {
      last.green = component;
    } else if (count === 2) {
      last.blue = component;
    } else {
      last.hex = rgbToHex(last);
    }
    return colors;
  }, []);
}

function combineColors0(colors) {
  return colors.reduce((combined, rgbh) => {
    let color = combined[rgbh.hex];
    if (color) {
      color.count += 1;
    } else {
      color = {
        ...rgbToHsl(rgbh),
        ...rgbh,
        count: 1,
      };
    }
    combined[color.hex] = color;
    return combined;
  }, {});
}

export function pixelsToColors(pixels) {
  const bytesPerColor = 4;
  const chunkColors = 500000;
  const chunkBytes = bytesPerColor * chunkColors;

  const byteLength = pixels.length;
  const chunkCount = Math.ceil(byteLength / chunkBytes);
  //??? clean up times and logs
  //console.log(` CHUNKS  ${chunkCount} = ${byteLength}/${chunkBytes}`);

  //??? make this threaded
  const hexChunks = [];
  for (let iChunk = 0; iChunk < chunkCount; iChunk++) {
    //const t = Date.now();
    const start = iChunk * chunkBytes;
    const end = (iChunk === chunkCount - 1) ? byteLength : start + chunkBytes;
    const length = end - start;
    hexChunks.push(pixelsToHex(pixels, start, length));
    //console.log(`  CHUNK[${iChunk}](${Date.now() - t})  ${start}, ${length}`);
  }

  let colors = {};
  for (let iChunk = 0; iChunk < hexChunks.length; iChunk++) {
    //const t = Date.now();
    colors = hexChunks[iChunk].reduce((cols, hex) => {
      if (cols[hex]) {
        cols[hex].count = (cols[hex].count + 1);
      } else {
        cols[hex] = { hex: hex, count: 1 };
      }
      return cols;
    }, colors);
    //console.log(`   COLORS[${iChunk}](${Date.now() - t})  ${Object.keys(colors).length}`);
  }

  //const t = Date.now();
  colors = Object.keys(colors).reduce((colors, hex) => {
    colors[hex] = {
      ...colors[hex],
      ...hexToColor(hex),
    };
    return colors;
  }, colors);
  //console.log(` HSL(${Date.now() - t})  ${Object.keys(colors).length}`);

  return colors;
}

export function pixelsToHex(pixels, offset, length) {
  const bytesPerColor = 4;
  const view = new DataView(pixels.buffer, offset, length);
  const hexes = [];
  for (let index = 0; index < view.byteLength; index += bytesPerColor) {
    const hexString = Math.floor(view.getUint32(index) / 256).toString(16);
    hexes.push(('00000' + hexString).slice(-6));
  }
  return hexes;
}
