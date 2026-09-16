
export async function loadSpriteAtlas(url, frames) {
  const image = new Image();
  image.src = url;
  try { await image.decode(); }
  catch (cause) { throw new Error(`Could not load sprite atlas: ${url}`, { cause }); }
  const sprites = Object.create(null);
  for (const [name, frame] of Object.entries(frames)) {
    const [x, y, width, height] = frame.rect;
    if (![x, y, width, height].every(Number.isInteger) || x < 0 || y < 0 ||
        width < 1 || height < 1 || x + width > image.naturalWidth || y + height > image.naturalHeight) {
      throw new RangeError(`Sprite ${name} is outside ${url} (${image.naturalWidth}×${image.naturalHeight})`);
    }
    const [anchorX, anchorY] = frame.anchor ?? [Math.floor(width / 2), height];
    if (![anchorX, anchorY].every(Number.isFinite)) throw new TypeError(`Invalid anchor for sprite ${name}`);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(image, x, y, width, height, 0, 0, width, height);
    sprites[name] = Object.freeze({ image: canvas, width, height, anchorX, anchorY });
  }
  return Object.freeze({ image, sprites: Object.freeze(sprites) });
}


export function drawSourcedSprite(context, sprite, x, y, scale = 1) {
  if (!Number.isInteger(scale) || scale < 1) throw new RangeError('Sprite scale must be a positive integer');
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(sprite.image,
    Math.round(x - sprite.anchorX * scale), Math.round(y - sprite.anchorY * scale),
    sprite.width * scale, sprite.height * scale);
  context.restore();
}


export function createAtlasPreview(atlas, { scale = 3, columns = 4 } = {}) {
  if (!Number.isInteger(scale) || scale < 1 || !Number.isInteger(columns) || columns < 1) {
    throw new RangeError('Preview scale and columns must be positive integers');
  }
  const entries = Object.entries(atlas.sprites);
  if (!entries.length) throw new RangeError('Atlas preview needs at least one sprite');
  const cellWidth = Math.max(...entries.map(([, s]) => s.width * scale), 130) + 16;
  const cellHeight = Math.max(...entries.map(([, s]) => s.height * scale)) + 38;
  const canvas = document.createElement('canvas');
  canvas.width = cellWidth * Math.min(columns, entries.length);
  canvas.height = cellHeight * Math.ceil(entries.length / columns);
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.font = '12px monospace';
  entries.forEach(([name, sprite], index) => {
    const left = (index % columns) * cellWidth, top = Math.floor(index / columns) * cellHeight;
    for (let y = 0; y < cellHeight; y += 8) for (let x = 0; x < cellWidth; x += 8) {
      context.fillStyle = ((x / 8 + y / 8) % 2) ? '#ddd2ba' : '#cec2a7';
      context.fillRect(left + x, top + y, Math.min(8, cellWidth - x), Math.min(8, cellHeight - y));
    }
    context.drawImage(sprite.image, left + 8, top + 8, sprite.width * scale, sprite.height * scale);
    context.fillStyle = '#292523';
    context.fillText(name, left + 8, top + cellHeight - 19, cellWidth - 16);
    context.fillText(`${sprite.width}×${sprite.height} @ ${sprite.anchorX},${sprite.anchorY}`, left + 8, top + cellHeight - 5, cellWidth - 16);
  });
  return canvas;
}
