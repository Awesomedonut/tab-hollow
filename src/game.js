
export const WORLD = Object.freeze({ width: 40, height: 28 });
export const RULES = Object.freeze({ seedPackSize: 6, seedPackPrice: 30, turnipPrice: 25, cropDays: 3, questSold: 12, questEarnings: 300, minutesPerSecond: 4 });
const TOOLS = ['hoe', 'seeds', 'water', 'harvest'];
const FACING = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const STATIONS = [
  { kind: 'sleep', label: 'Sleep until tomorrow', x: 15.5, y: 11.5 },
  { kind: 'sell', label: 'Ship turnips · 25g each', x: 18.5, y: 12.3 },
  { kind: 'buy', label: 'Buy 6 seeds · 30g', x: 28.5, y: 11.5 },
];
const bounded = (value, fallback, min, max, integer = false) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const result = Math.min(max, Math.max(min, value));
  return integer ? Math.floor(result) : result;
};
const count = (value, fallback = 0) => bounded(value, fallback, 0, 1000000, true);


const STARTER_PLANTS = new Map([
  ["16,13", 2], ["17,13", 2], ["16,14", 2], ["17,14", 2],
  ["14,16", 1], ["15,16", 1], ["14,17", 1], ["15,17", 1],
  ["22,13", 0], ["23,13", 0], ["22,17", 2], ["23,17", 2],
]);
const makeTiles = (withStarters = false) => Array.from({ length: 70 }, (_, i) => {
  const x = 14 + i % 10, y = 12 + Math.floor(i / 10);
  const growth = withStarters ? STARTER_PLANTS.get(`${x},${y}`) : undefined;
  const prepared = withStarters && (
    (x >= 16 && x <= 19 && y >= 13 && y <= 14) ||
    (x >= 14 && x <= 16 && y >= 16 && y <= 17) ||
    (x >= 22 && x <= 23 && ((y >= 13 && y <= 14) || y >= 16))
  );
  return { x, y, tilled: prepared, watered: growth !== undefined, crop: growth !== undefined ? { growth } : null };
});

export function createGame(saved) {
  const game = {
    version: 1, player: { x: 19.5, y: 16.5, facing: 'down', walking: false },
    day: 1, time: 360, energy: 100, maxEnergy: 100, coins: 80, seeds: 6,
    harvest: 0, selected: 'hoe', tiles: makeTiles(true),
    message: 'Welcome! Twelve turnips are growing in staggered beds, watered today. Six seeds are yours to plant; twelve tilled plots and open earth leave room to grow.',
    stats: { harvested: 0, sold: 0, earned: 0 }, questComplete: false,
    elapsed: 0, effects: [], lastAction: null, actionId: 0,
  };
  if (!saved) return game;
  let data;
  try { data = typeof saved === 'string' ? JSON.parse(saved) : saved; }
  catch { return game; }
  if (!data || typeof data !== 'object' || Array.isArray(data) || (data.version != null && data.version !== 1)) return game;

  game.tiles = makeTiles();
  game.day = bounded(data.day, 1, 1, 99999, true);
  game.time = bounded(data.time, 360, 360, 1439);
  game.energy = bounded(data.energy, 100, 0, 100);
  game.coins = count(data.coins, 80);
  game.seeds = count(data.seeds, 12);
  game.harvest = count(data.harvest);
  if (TOOLS.includes(data.selected)) game.selected = data.selected;
  if (data.player && typeof data.player === 'object') {
    const x = bounded(data.player.x, 19.5, 1, WORLD.width - 1);
    const y = bounded(data.player.y, 16.5, 1, WORLD.height - 1);
    if (canStand(game, x, y)) { game.player.x = x; game.player.y = y; }
    if (Object.hasOwn(FACING, data.player.facing)) game.player.facing = data.player.facing;
  }
  if (Array.isArray(data.tiles)) {

    const lookup = new Map(data.tiles.filter(t => t && Number.isInteger(t.x) && Number.isInteger(t.y)).map(t => [`${t.x},${t.y}`, t]));
    for (const tile of game.tiles) {
      const source = lookup.get(`${tile.x},${tile.y}`);
      if (!source) continue;
      tile.tilled = source.tilled === true;
      tile.watered = tile.tilled && source.watered === true;
      if (tile.tilled && source.crop && typeof source.crop === 'object') tile.crop = { growth: bounded(source.crop.growth, 0, 0, RULES.cropDays, true) };
    }
  }
  if (data.stats && typeof data.stats === 'object') {
    game.stats.harvested = count(data.stats.harvested);
    game.stats.sold = count(data.stats.sold);
    game.stats.earned = count(data.stats.earned);
  }
  game.questComplete = questDone(game);
  game.message = `Welcome back! Day ${game.day} on your little farm.`;
  return game;
}

export function serialize(game) {
  const { version, player, day, time, energy, coins, seeds, harvest, selected, tiles, stats } = game;
  return JSON.stringify({ version, player: { x: player.x, y: player.y, facing: player.facing }, day, time, energy, coins, seeds, harvest, selected, tiles, stats });
}

function solid(x, y) {
  if (x < 1 || y < 1 || x >= WORLD.width - 1 || y >= WORLD.height - 1) return true;
  if (x >= 7 && x < 19 && y >= 5 && y < 11) return true;
  if (x >= 26 && x < 31 && y >= 5 && y < 11) return true;

  if (x >= 17.8 && x < 19.3 && y >= 10.8 && y < 11.8) return true;

  if (x >= 24.2 && x < 27.2 && y >= 12.8 && y < 14.3) return true;
  if (x >= 28 && x < 36 && y >= 18 && y < 24) {

    return !(x < 30 && y >= 20.125 && y < 21.1875);
  }
  return false;
}
export function canStand(game, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  const radius = 0.23;
  return !solid(x - radius, y - radius) && !solid(x + radius, y - radius) && !solid(x - radius, y + radius) && !solid(x + radius, y + radius);
}
export function move(game, dx, dy, dtSeconds) {
  game.player.walking = false;
  if (![dx, dy, dtSeconds].every(Number.isFinite) || dtSeconds <= 0) return false;
  const length = Math.hypot(dx, dy);
  if (!length) return false;
  if (Math.abs(dx) > Math.abs(dy)) game.player.facing = dx > 0 ? 'right' : 'left';
  else game.player.facing = dy > 0 ? 'down' : 'up';
  const distance = 4 * Math.min(dtSeconds, 1) * Math.min(length, 1);
  const steps = Math.max(1, Math.ceil(distance / 0.15));
  const stepX = dx / length * distance / steps;
  const stepY = dy / length * distance / steps;
  const beforeX = game.player.x, beforeY = game.player.y;
  for (let i = 0; i < steps; i++) {
    if (canStand(game, game.player.x + stepX, game.player.y)) game.player.x += stepX;
    if (canStand(game, game.player.x, game.player.y + stepY)) game.player.y += stepY;
  }
  game.player.walking = Math.hypot(game.player.x - beforeX, game.player.y - beforeY) > 0.001;
  return game.player.walking;
}

export function tick(game, dtSeconds) {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;

  const dt = Math.min(dtSeconds, 1);
  game.elapsed += dt;
  game.time += dt * RULES.minutesPerSecond;
  for (const effect of game.effects) effect.life -= dt;
  game.effects = game.effects.filter(effect => effect.life > 0);
  if (game.time >= 1440) sleep(game, true);
}

export function getTile(game, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  const tx = Math.floor(x), ty = Math.floor(y);
  if (tx < 14 || tx > 23 || ty < 12 || ty > 18) return undefined;
  return game.tiles[(ty - 12) * 10 + tx - 14];
}
function fail(game, message) { game.message = message; return false; }
function action(game, type, x = game.player.x, y = game.player.y, text = '') {
  game.lastAction = { type, x, y, id: ++game.actionId };
  if (text) game.effects.push({ x, y, text, life: 1.25, maxLife: 1.25, type });
  return true;
}
function spend(game, amount) {
  if (game.energy < amount) return fail(game, 'You need a rest. Visit the cottage and press E to sleep.');
  game.energy -= amount;
  return true;
}

export function act(game, tileX, tileY) {
  if (tileX == null && tileY == null) {
    const [dx, dy] = FACING[game.player.facing] || FACING.down;
    tileX = Math.floor(game.player.x + dx * 0.85);
    tileY = Math.floor(game.player.y + dy * 0.85);
  }
  if (!Number.isFinite(tileX) || !Number.isFinite(tileY)) return false;
  tileX = Math.floor(tileX); tileY = Math.floor(tileY);
  if (Math.hypot(tileX + 0.5 - game.player.x, tileY + 0.5 - game.player.y) > 2.15) return fail(game, 'Walk closer to reach that spot.');
  const tile = getTile(game, tileX, tileY);
  if (!tile) return fail(game, 'Use your tools in the garden plots south of the cottage.');
  const x = tile.x + 0.5, y = tile.y + 0.5;
  if (game.selected === 'hoe') {
    if (tile.crop) return fail(game, 'A turnip is growing here. Keep it watered!');
    if (tile.tilled) return fail(game, 'This soil is ready. Select seeds with 2 to plant.');
    if (!spend(game, 2)) return false;
    tile.tilled = true;
    game.message = 'Fresh soil! Select seeds with 2, then plant.';
    return action(game, 'hoe', x, y);
  }
  if (game.selected === 'seeds') {
    if (!tile.tilled) return fail(game, 'Till this soil with your hoe first (1).');
    if (tile.crop) return fail(game, 'There is already a turnip growing here.');
    if (game.seeds < 1) return fail(game, 'Out of seeds. Visit Moss at the shop: 6 seeds cost 30g.');
    if (!spend(game, 1)) return false;
    game.seeds--; tile.crop = { growth: 0 };
    game.message = 'Turnip planted! Water it today, then sleep to help it grow.';
    return action(game, 'plant', x, y, '♥');
  }
  if (game.selected === 'water') {
    if (!tile.tilled) return fail(game, 'Till and plant this plot before watering.');
    if (tile.watered) return fail(game, 'Already watered today. A good night’s sleep will help it grow.');
    if (tile.crop?.growth >= RULES.cropDays) return fail(game, 'This turnip is ready! Select harvest with 4.');
    if (!spend(game, 2)) return false;
    tile.watered = true;
    game.message = tile.crop ? 'Watered! Turnips ripen after three watered nights.' : 'Soil watered. You can plant a seed here today.';
    return action(game, 'water', x, y);
  }
  if (game.selected === 'harvest') {
    if (!tile.crop) return fail(game, 'No turnip here yet. Try planting a seed (2).');
    if (tile.crop.growth < RULES.cropDays) return fail(game, `Still growing: ${tile.crop.growth}/${RULES.cropDays} watered nights. Water it and sleep.`);
    tile.crop = null; tile.watered = false;
    game.harvest++; game.stats.harvested++;
    game.message = 'A perfect turnip! Bring your harvest to the shipping box beside the cottage.';
    return action(game, 'harvest', x, y, '+1 turnip');
  }
  return false;
}

export function getNearbyInteraction(game) {
  let closest = null, distance = 2.2;
  for (const station of STATIONS) {
    const current = Math.hypot(station.x - game.player.x, station.y - game.player.y);
    if (current < distance) { closest = station; distance = current; }
  }
  return closest ? { ...closest } : null;
}
export function interact(game) {
  const station = getNearbyInteraction(game);
  if (!station) return fail(game, 'Visit the cottage to sleep, the shipping box to sell, or the shop to buy seeds.');
  if (station.kind === 'sleep') return sleep(game);
  if (station.kind === 'buy') return buySeeds(game);
  return sellHarvest(game);
}

export function sleep(game, automatic = false) {
  let grown = 0, ripe = 0;
  for (const tile of game.tiles) {
    if (tile.crop && tile.watered && tile.crop.growth < RULES.cropDays) { tile.crop.growth++; grown++; }
    if (tile.crop?.growth >= RULES.cropDays) ripe++;
    tile.watered = false;
  }
  game.day++; game.time = 360; game.energy = game.maxEnergy;
  game.player.x = 15.5; game.player.y = 11.8; game.player.facing = 'down'; game.player.walking = false;
  game.effects = [];
  const lead = automatic ? 'Midnight! You made it home for a good rest.' : 'A fresh morning in Tab Hollow.';
  game.message = `${lead} Day ${game.day}: ${ripe ? `${ripe} turnip${ripe === 1 ? ' is' : 's are'} ready to harvest!` : grown ? `${grown} turnip${grown === 1 ? '' : 's'} grew overnight. Water them again today.` : 'Energy restored. Remember to water your turnips each day.'}`;
  return action(game, 'sleep');
}
export function buySeeds(game) {
  if (game.coins < RULES.seedPackPrice) return fail(game, 'Moss: Six seeds cost 30g. Ship a few turnips and come back!');
  game.coins -= RULES.seedPackPrice; game.seeds += RULES.seedPackSize;
  game.message = 'Moss: Six turnip seeds, just for you. Happy planting!';
  return action(game, 'buy', game.player.x, game.player.y, '+6 seeds');
}
function questDone(game) { return game.stats.sold >= RULES.questSold && game.stats.earned >= RULES.questEarnings; }
export function sellHarvest(game) {
  if (game.harvest < 1) return fail(game, 'Your shipping box is empty. Harvest ripe turnips with 4, then bring them here.');
  const amount = game.harvest, earnings = amount * RULES.turnipPrice;
  game.harvest = 0; game.coins += earnings; game.stats.sold += amount; game.stats.earned += earnings;
  const completedNow = !game.questComplete && questDone(game);
  game.questComplete = questDone(game);
  game.message = completedNow ? 'First Harvest complete! You shipped 12 turnips and earned 300g. Tab Hollow is thriving — keep growing!' : `Shipped ${amount} turnip${amount === 1 ? '' : 's'} for ${earnings}g. First Harvest: ${Math.min(game.stats.sold, 12)}/12 shipped.`;
  return action(game, completedNow ? 'quest' : 'sell', game.player.x, game.player.y, `+${earnings}g`);
}
