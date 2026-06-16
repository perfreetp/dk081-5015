const PAD0 = 0xEC;
const PAD1 = 0x11;

// const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;
// const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;
// const G20 = (1 << 16) | (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 6) | (1 << 5) | (1 << 4) | (1 << 3) | 1;

const GLUT: Record<number, number> = {};
const FLUT: Record<number, number> = {};

(function initLUT() {
  let e = 1;
  for (let i = 0; i < 255; i++) {
    GLUT[i] = e;
    FLUT[e] = i;
    e = (e << 1) ^ (e & 0x80 ? 0x11d : 0);
  }
})();

function glog(n: number): number {
  if (n < 1) throw new Error('glog(' + n + ')');
  return FLUT[n];
}

function gexp(n: number): number {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return GLUT[n];
}

function generateErrorCorrection(data: number[], eccLen: number): number[] {
  const gen: number[] = [];
  gen.unshift(1);
  for (let i = 0; i < eccLen; i++) {
    gen.unshift(0);
    for (let j = 0; j < gen.length - 1; j++) {
      gen[j] = gen[j + 1] ^ gexp(glog(gen[j]) + i);
    }
  }

  const res = data.slice();
  for (let i = 0; i < eccLen; i++) res.push(0);

  for (let i = 0; i < data.length; i++) {
    const coff = res[i];
    if (coff !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gexp(glog(gen[j]) + glog(coff));
      }
    }
  }

  return res.slice(data.length);
}

// const ECC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 };
const ECC_BLOCKS: Record<string, number[][]> = {
  '1-L': [[1, 26, 19]],
  '1-M': [[1, 26, 16]],
  '1-Q': [[1, 26, 13]],
  '1-H': [[1, 26, 9]],
  '2-L': [[1, 44, 34]],
  '2-M': [[1, 44, 28]],
  '3-L': [[1, 70, 55]],
  '3-M': [[1, 70, 44]],
  '4-L': [[1, 100, 80]],
  '4-M': [[2, 50, 32]],
  '5-L': [[1, 134, 108]],
  '5-M': [[2, 67, 43]],
  '6-L': [[2, 86, 68]],
  '6-M': [[4, 43, 27]],
  '7-L': [[2, 98, 78]],
  '7-M': [[4, 49, 31]],
  '8-L': [[2, 121, 97]],
  '8-M': [[4, 60, 38]],
  '9-L': [[2, 146, 116]],
  '9-M': [[4, 73, 47]],
  '10-L': [[2, 86, 68], [2, 87, 69]]
};

const ALIGNMENT_PATTERN = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];

const FORMAT_INFO_GL = {
  L: [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976],
  M: [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0],
  Q: [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed],
  H: [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b]
};

function setupFinderPattern(modules: boolean[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    if (row + r <= -1 || modules.length <= row + r) continue;
    for (let c = -1; c <= 7; c++) {
      if (col + c <= -1 || modules.length <= col + c) continue;
      if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
        modules[row + r][col + c] = true;
      } else {
        modules[row + r][col + c] = false;
      }
    }
  }
}

function setupAlignmentPattern(modules: boolean[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
        modules[row + r][col + c] = true;
      } else {
        modules[row + r][col + c] = false;
      }
    }
  }
}

function setupTimingPattern(modules: boolean[][], size: number) {
  for (let r = 8; r < size - 8; r++) {
    if (modules[r][6] !== null) continue;
    modules[r][6] = (r % 2 === 0);
  }
  for (let c = 8; c < size - 8; c++) {
    if (modules[6][c] !== null) continue;
    modules[6][c] = (c % 2 === 0);
  }
}

function setupFormatInfo(modules: boolean[][], size: number, eccLevel: string, maskPattern: number) {
  const format = FORMAT_INFO_GL[eccLevel as keyof typeof FORMAT_INFO_GL][maskPattern];

  for (let i = 0; i < 15; i++) {
    const mod = ((format >> i) & 1) === 1;
    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[size - 15 + i][8] = mod;
    }
  }
  for (let i = 0; i < 15; i++) {
    const mod = ((format >> i) & 1) === 1;
    if (i < 8) {
      modules[8][size - i - 1] = mod;
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod;
    } else {
      modules[8][15 - i - 1] = mod;
    }
  }
  modules[size - 8][8] = true;
}

function placeModules(modules: boolean[][], data: number[], size: number, maskPattern: number) {
  let inc = -1;
  let row = size - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let mod = false;
          if (byteIndex < data.length) {
            mod = (((data[byteIndex] >>> bitIndex) & 1) === 1);
          }
          let mask = false;
          switch (maskPattern) {
            case 0: mask = (row + col) % 2 === 0; break;
            case 1: mask = row % 2 === 0; break;
            case 2: mask = col % 3 === 0; break;
            case 3: mask = (row + col) % 3 === 0; break;
            case 4: mask = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0; break;
            case 5: mask = (row * col) % 2 + (row * col) % 3 === 0; break;
            case 6: mask = ((row * col) % 2 + (row * col) % 3) % 2 === 0; break;
            case 7: mask = ((row * col) % 3 + (row + col) % 2) % 2 === 0; break;
          }
          if (mask) mod = !mod;
          modules[row][col - c] = mod;
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || size <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}

export function generateQRCode(text: string, eccLevel: string = 'M'): boolean[][] {
  let data: number[] = [];
  const utf8 = new TextEncoder().encode(text);

  data.push(0b0100 << 4);
  let len = utf8.length;
  if (len < 256) {
    data.push(len >>> 4);
    data.push((len & 0xf) << 4);
  }

  let bit = 0;
  for (let i = 0; i < utf8.length; i++) {
    for (let j = 7; j >= 0; j--) {
      if (bit === 0) data.push(0);
      if ((utf8[i] >>> j) & 1) {
        data[data.length - 1] |= 1 << (7 - bit);
      }
      bit = (bit + 1) % 8;
    }
  }

  let version = 1;
  while (version <= 10) {
    const blocks = ECC_BLOCKS[`${version}-${eccLevel}`];
    if (blocks) {
      let totalData = 0;
      for (const b of blocks) {
        totalData += b[0] * (b[2]);
      }
      if (data.length <= totalData) break;
    }
    version++;
  }

  if (version > 10) {
    throw new Error('内容过长，无法生成二维码');
  }

  const size = version * 4 + 17;

  const blocks = ECC_BLOCKS[`${version}-${eccLevel}`] || ECC_BLOCKS[`${version}-M`];

  let totalData = 0;
  let totalEcc = 0;
  for (const b of blocks) {
    totalData += b[0] * b[2];
    totalEcc += b[0] * (b[1] - b[2]);
  }

  while (data.length < totalData) {
    data.push(data.length % 2 === 0 ? PAD0 : PAD1);
  }

  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];

  let offset = 0;
  for (const block of blocks) {
    const [numBlocks, blockLen, dataLen] = block;
    for (let i = 0; i < numBlocks; i++) {
      const d = data.slice(offset, offset + dataLen);
      offset += dataLen;
      dataBlocks.push(d);
      eccBlocks.push(generateErrorCorrection(d, blockLen - dataLen));
    }
  }

  const finalData: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  const maxEccLen = Math.max(...eccBlocks.map(b => b.length));

  for (let i = 0; i < maxDataLen; i++) {
    for (const b of dataBlocks) {
      if (i < b.length) finalData.push(b[i]);
    }
  }
  for (let i = 0; i < maxEccLen; i++) {
    for (const b of eccBlocks) {
      if (i < b.length) finalData.push(b[i]);
    }
  }

  const modules: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    modules.push(new Array(size).fill(null));
  }

  setupFinderPattern(modules, 0, 0);
  setupFinderPattern(modules, 0, size - 7);
  setupFinderPattern(modules, size - 7, 0);

  const align = ALIGNMENT_PATTERN[version] || [];
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) ||
          (i === align.length - 1 && j === 0)) continue;
      setupAlignmentPattern(modules, align[i], align[j]);
    }
  }

  setupTimingPattern(modules, size);
  setupFormatInfo(modules, size, eccLevel, 0);
  placeModules(modules, finalData, size, 0);

  return modules;
}

export function renderQRCodeToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  margin: number = 4
) {
  const modules = generateQRCode(text, 'M');
  const moduleSize = (size - margin * 2) / modules.length;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#1D2129';
  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        ctx.fillRect(
          margin + col * moduleSize,
          margin + row * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }
}

export function generateQRCodeDataURL(text: string, size: number = 300): string {
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      renderQRCodeToCanvas(ctx, text, size);
      return canvas.toDataURL('image/png');
    }
  } catch (e) {
    console.warn('[qrcode] Canvas not available, fallback to SVG');
  }

  return generateQRCodeSVGDataURL(text, size);
}

export function generateQRCodeSVGDataURL(text: string, size: number = 300): string {
  const modules = generateQRCode(text, 'M');
  const moduleSize = size / modules.length;
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svgContent += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;
  
  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize;
        const y = row * moduleSize;
        svgContent += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#1D2129"/>`;
      }
    }
  }
  
  svgContent += '</svg>';
  
  const svgBase64 = typeof btoa !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent).toString('base64');
    
  return `data:image/svg+xml;base64,${svgBase64}`;
}

export function generateQRCodeSimpleText(text: string): string {
  const modules = generateQRCode(text, 'L');
  let result = '';
  for (let row = 0; row < modules.length; row++) {
    for (let col = 0; col < modules[row].length; col++) {
      result += modules[row][col] ? '█' : ' ';
    }
    result += '\n';
  }
  return result;
}
