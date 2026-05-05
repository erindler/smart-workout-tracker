const fs = require('fs');
const { PNG } = require('pngjs');

fs.mkdirSync('public/icons', { recursive: true });

/**
 * Creates a solid-color PNG with "SW" text drawn pixel-by-pixel
 * using a simple 5×7 pixel font bitmap.
 * Primary green (#68a848) background, dark (#020401) text.
 */
function createIcon(size, outputPath) {
  const png = new PNG({ width: size, height: size, filterType: -1 });

  // Background: #68a848  (r=104, g=168, b=72)
  const bgR = 104, bgG = 168, bgB = 72;
  // Text:       #020401  (r=2,   g=4,   b=1)
  const fgR = 2,   fgG = 4,   fgB = 1;

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4;
      png.data[idx]     = bgR;
      png.data[idx + 1] = bgG;
      png.data[idx + 2] = bgB;
      png.data[idx + 3] = 255;
    }
  }

  // Simple 5×7 pixel bitmaps for 'S' and 'W'
  const S = [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ];
  const W = [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ];

  const scale = Math.max(1, Math.floor(size / 20));
  const charW = 5 * scale;
  const charH = 7 * scale;
  const gap = scale;
  const totalW = charW * 2 + gap;
  const startX = Math.floor((size - totalW) / 2);
  const startY = Math.floor((size - charH) / 2);

  function drawChar(bitmap, offsetX) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (bitmap[row][col]) {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = offsetX + col * scale + sx;
              const py = startY + row * scale + sy;
              if (px >= 0 && px < size && py >= 0 && py < size) {
                const idx = (size * py + px) * 4;
                png.data[idx]     = fgR;
                png.data[idx + 1] = fgG;
                png.data[idx + 2] = fgB;
                png.data[idx + 3] = 255;
              }
            }
          }
        }
      }
    }
  }

  drawChar(S, startX);
  drawChar(W, startX + charW + gap);

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath} (${size}×${size})`);
}

createIcon(192, 'public/icons/icon-192.png');
createIcon(512, 'public/icons/icon-512.png');
createIcon(180, 'public/icons/apple-touch-icon.png');
console.log('Done.');
