import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, serialize, move, tick, act, sleep, buySeeds, sellHarvest, interact, getNearbyInteraction, getTile, canStand } from '../src/game.js';

function target(game, tile, tool) {
  game.player.x = tile.x + 0.5;
  game.player.y = tile.y + 0.5;
  game.selected = tool;
  return act(game, tile.x, tile.y);
}
function plant(game, tile) {
  assert.equal(target(game, tile, 'hoe'), true);
  assert.equal(target(game, tile, 'seeds'), true);
  assert.equal(target(game, tile, 'water'), true);
}

test('first release can be completed from a fresh save without cheats or extra purchases', () => {
  const game = createGame();
  const planted = game.tiles.slice(0, 6);
  for (const tile of planted) plant(game, tile);
  const plots = [...planted, ...game.tiles.filter(t => t.crop && !planted.includes(t)).slice(0, 6)];
  assert.equal(game.energy, 70);
  assert.equal(game.seeds, 0);
  sleep(game);
  for (let day = 0; day < 2; day++) {
    for (const tile of plots) if (tile.crop.growth < 3) assert.equal(target(game, tile, 'water'), true);
    sleep(game);
  }
  assert.equal(game.day, 4);
  assert.equal(plots.every(tile => tile.crop.growth === 3), true);
  for (const tile of plots) assert.equal(target(game, tile, 'harvest'), true);
  assert.equal(game.harvest, 12);
  game.player.x = 18.5; game.player.y = 12.3;
  assert.equal(getNearbyInteraction(game).kind, 'sell');
  assert.equal(interact(game), true);
  assert.equal(game.coins, 380);
  assert.equal(game.stats.sold, 12);
  assert.equal(game.stats.earned, 300);
  assert.equal(game.questComplete, true);
  assert.equal(game.harvest, 0);
  assert.equal(sellHarvest(game), false);
  assert.equal(game.coins, 380, 'a harvest cannot be sold twice');
});

test('dry crops pause growth, daily water resets, and mature crops survive more nights', () => {
  const game = createGame(), tile = game.tiles[0];
  plant(game, tile); sleep(game);
  assert.equal(tile.crop.growth, 1);
  assert.equal(tile.watered, false);
  sleep(game);
  assert.equal(tile.crop.growth, 1);
  for (let i = 0; i < 2; i++) { target(game, tile, 'water'); sleep(game); }
  sleep(game);
  assert.equal(tile.crop.growth, 3);
  assert.equal(target(game, tile, 'water'), false);
  assert.equal(target(game, tile, 'harvest'), true);
  assert.equal(tile.tilled, true);
  assert.equal(tile.crop, null);
});

test('invalid or repeat tool actions never consume resources', () => {
  const game = createGame(), tile = game.tiles[0];
  assert.equal(target(game, tile, 'seeds'), false);
  assert.equal(game.seeds, 6);
  assert.equal(game.energy, 100);
  plant(game, tile);
  const before = [game.energy, game.seeds];
  for (const tool of ['hoe', 'seeds', 'water', 'harvest']) assert.equal(target(game, tile, tool), false);
  assert.deepEqual([game.energy, game.seeds], before);
  assert.equal(act(game, NaN, 12), false);
  assert.equal(act(game, 20, 18), false, 'cannot act across the farm');
  assert.equal(getTile(game, 0, 0), undefined);
});

test('zero energy blocks work but does not trap the player or block harvesting', () => {
  const game = createGame(), tile = game.tiles[0];
  game.energy = 0;
  assert.equal(target(game, tile, 'hoe'), false);
  assert.equal(tile.tilled, false);
  assert.equal(move(game, 1, 0, 0.2), true);
  tile.tilled = true; tile.crop = { growth: 3 };
  assert.equal(target(game, tile, 'harvest'), true);
  sleep(game);
  assert.equal(game.energy, 100);
  assert.equal(game.time, 360);
  assert.equal(canStand(game, game.player.x, game.player.y), true);
});

test('seed shop exchanges exact pack price and rejects insufficient funds', () => {
  const game = createGame();
  game.player.x = 28.5; game.player.y = 11.5;
  assert.equal(getNearbyInteraction(game).kind, 'buy');
  assert.equal(interact(game), true);
  assert.equal(game.coins, 50); assert.equal(game.seeds, 12);
  assert.equal(buySeeds(game), true);
  assert.equal(game.coins, 20); assert.equal(game.seeds, 18);
  assert.equal(buySeeds(game), false);
  assert.equal(game.coins, 20); assert.equal(game.seeds, 18);
});

test('movement respects buildings, pond and border even on a slow frame', () => {
  const game = createGame();
  game.player.x = 15.5; game.player.y = 11.8;
  for (let i = 0; i < 5; i++) move(game, 0, -1, 1);
  assert.ok(game.player.y >= 11.23);
  game.player.x = 27.5; game.player.y = 20;
  move(game, 1, 0, 1);
  assert.ok(game.player.x < 28);
  game.player.x = 2; game.player.y = 15;
  move(game, -1, 0, 1);
  assert.ok(game.player.x >= 1.23);
  assert.equal(canStand(game, 31, 8), false);
  assert.equal(canStand(game, Infinity, 8), false);
});

test('diagonal movement is normalized and wall sliding remains possible', () => {
  const a = createGame(), b = createGame();
  move(a, 1, 0, 0.25); move(b, 1, 1, 0.25);
  assert.ok(Math.abs(Math.hypot(a.player.x - 19.5, a.player.y - 16.5) - Math.hypot(b.player.x - 19.5, b.player.y - 16.5)) < 1e-8);
  a.player.x = 15.5; a.player.y = 11.24;
  move(a, 1, -1, 0.25);
  assert.ok(a.player.x > 10);
  assert.ok(a.player.y >= 11.23);
  assert.equal(move(a, 0, 0, 0.25), false);
  assert.equal(a.player.walking, false);
});

test('clock sleeps once at midnight and ignores invalid or excessive background deltas', () => {
  const game = createGame(), tile = game.tiles[0];
  plant(game, tile);
  game.time = 1439;
  tick(game, 0.5);
  assert.equal(game.day, 2); assert.equal(game.time, 360);
  assert.equal(tile.crop.growth, 1);
  tick(game, NaN); tick(game, -2);
  assert.equal(game.time, 360);
  tick(game, 3600);
  assert.equal(game.time, 364);
  assert.equal(game.day, 2);
});

test('save roundtrip preserves farm, inventory and mission progress without transient effects', () => {
  const game = createGame();
  plant(game, game.tiles[0]);
  game.stats.sold = 12; game.stats.earned = 300;
  const restored = createGame(serialize(game));
  assert.deepEqual(restored.tiles, game.tiles);
  assert.equal(restored.coins, game.coins);
  assert.equal(restored.seeds, game.seeds);
  assert.equal(restored.energy, game.energy);
  assert.equal(restored.questComplete, true);
  assert.deepEqual(restored.effects, []);
  assert.equal(restored.lastAction, null);
});

test('corrupt or untrusted saves cannot inject malformed terrain, position or inventory', () => {
  for (const bad of ['{', 'null', '[]', { version: 999 }]) assert.equal(createGame(bad).coins, 80);
  const game = createGame({ coins: -50, seeds: '999', energy: Infinity, selected: '__proto__', player: { x: 14, y: 8, facing: '__proto__' }, tiles: [null, { x: 14, y: 12, tilled: true, watered: true, crop: { growth: 99 } }, { x: 0, y: 0, tilled: true }], stats: { sold: -2, earned: NaN }, questComplete: true });
  assert.equal(game.coins, 0); assert.equal(game.seeds, 12); assert.equal(game.energy, 100);
  assert.equal(game.selected, 'hoe'); assert.equal(game.player.facing, 'down');
  assert.equal(game.player.x, 19.5); assert.equal(game.player.y, 16.5);
  assert.equal(game.tiles.length, 70); assert.equal(game.tiles[0].crop.growth, 3);
  assert.equal(game.questComplete, false);
});

test('context uses closest station, and space targets the tile the farmer faces', () => {
  const game = createGame();
  game.player.x = 15.5; game.player.y = 11.8;
  assert.equal(getNearbyInteraction(game).kind, 'sleep');
  assert.equal(interact(game), true); assert.equal(game.day, 2);
  game.player.x = 19.5; game.player.y = 16.5; game.player.facing = 'down';
  assert.equal(getNearbyInteraction(game), null);
  assert.equal(interact(game), false);
  assert.equal(act(game), true);
  assert.equal(getTile(game, 19, 17).tilled, true);
});


test('shop roof is solid and the visible pond pier is walkable up to its edge', () => {
  const game = createGame();
  assert.equal(canStand(game, 30, 5.5), false, 'shop matches its drawn northern edge');
  assert.equal(canStand(game, 28.5, 20.6), true, 'wooden deck supports the farmer');
  assert.equal(canStand(game, 28.5, 21.6), false, 'water below the deck stays solid');
  game.player.x = 27.5; game.player.y = 20.6;
  move(game, 1, 0, 1);
  assert.ok(game.player.x > 29.5 && game.player.x < 30, 'can walk along the pier, not off its end');
  move(game, 0, -1, 1);
  assert.ok(game.player.y >= 20.355, 'cannot step off the side into water');
});


test('staggered starter groups preserve the crop budget and grow through real watering', () => {
  const game = createGame(), starters = game.tiles.filter(t => t.crop);
  assert.equal(starters.length, 12);
  assert.equal(starters.length + game.seeds, 18, 'same total potential harvest as six plants plus twelve seeds');
  assert.deepEqual([...new Set(starters.map(t => t.crop.growth))].sort(), [0,1,2]);
  assert.equal(starters.every(t => t.tilled && t.watered), true);
  assert.equal(game.coins, 80); assert.equal(game.energy, 100);
  assert.equal(target(game, starters[0], 'harvest'), false, 'no free ripe harvest on arrival');
  for (let day = 0; day < 3; day++) {
    if (day) for (const tile of starters) if (tile.crop.growth < 3) assert.equal(target(game, tile, 'water'), true);
    sleep(game);
  }
  for (const tile of starters) assert.equal(target(game, tile, 'harvest'), true);
  assert.equal(game.harvest, 12);
  const restored = createGame(serialize(game));
  assert.equal(restored.tiles.filter(t => t.crop).length, 0, 'harvested starters never respawn');
  assert.equal(restored.harvest, 12);
  const oldSave = { version: 1, seeds: 12, tiles: [] };
  assert.equal(createGame(oldSave).tiles.some(t => t.crop || t.tilled), false);
  assert.equal(createGame(oldSave).seeds, 12, 'legacy inventory is never charged for new starters');
});

test('shipping chest blocks overlap while the garden row and south interaction stay usable', () => {
  const game = createGame();
  game.player.x = 18.5; game.player.y = 13;
  move(game, 0, -1, 1);
  assert.ok(game.player.y >= 12.03 && game.player.y < 12.2);
  assert.equal(canStand(game, 18.5, 11.5), false);
  assert.equal(canStand(game, 18.5, 12.5), true);
  assert.equal(getNearbyInteraction(game).kind, 'sell');
  game.harvest = 1;
  assert.equal(interact(game), true);
  assert.equal(game.coins, 105);
  game.player.y = 12.5;
  assert.equal(act(game, 18, 12), true);
});


test("stone well blocks its basin while the garden and shop approach remain open", () => {
  const game = createGame();
  game.player.x = 25.7; game.player.y = 15;
  move(game, 0, -1, 1);
  assert.ok(game.player.y >= 14.53 && game.player.y < 14.7, "stops at stone basin");
  game.player.x = 23.5; game.player.y = 12.5;
  move(game, 1, 0, 1);
  move(game, 1, 0, 0.25);
  assert.ok(Math.abs(game.player.x - 28.5) < 0.001, "north path reaches the shop");
  move(game, 0, -1, 0.25);
  assert.equal(getNearbyInteraction(game).kind, "buy");
  assert.equal(interact(game), true);
  assert.equal(game.coins, 50);
  assert.equal(canStand(game, 23.5, 13.5), true, "eastern garden stays walkable");
});

test('native farmhouse walls block the west wing and old saves recover without losing farm resources', () => {
  const game = createGame();
  game.player.x = 6; game.player.y = 8;
  move(game, 1, 0, 1);
  assert.ok(game.player.x < 7 && game.player.x > 6.5);
  assert.equal(canStand(game, 8.5, 8.5), false);
  assert.equal(canStand(game, 15.5, 11.5), true);
  assert.equal(canStand(game, 31.5, 8.5), true, 'path east of narrower shop stays open');
  game.player.x = 8.5; game.player.y = 8.5; game.coins = 177; game.seeds = 4;
  game.tiles[0].tilled = true; game.tiles[0].crop = { growth: 2 };
  const restored = createGame(serialize(game));
  assert.deepEqual([restored.player.x, restored.player.y], [19.5, 16.5]);
  assert.equal(restored.coins, 177); assert.equal(restored.seeds, 4);
  assert.equal(restored.tiles[0].crop.growth, 2);
});
test('new farms retain empty prepared cells across four beds while loaded farms retain their soil state', () => {
  const game = createGame();
  const prepared = game.tiles.filter(tile => tile.tilled && !tile.crop);
  assert.deepEqual(prepared.map(tile => [tile.x,tile.y]), [[18,13],[19,13],[18,14],[19,14],[22,14],[23,14],[16,16],[22,16],[23,16],[16,17],[22,18],[23,18]]);
  assert.equal(prepared.some(tile => tile.watered), false);
  assert.equal(game.coins, 80); assert.equal(game.seeds, 6); assert.equal(game.energy, 100);
  const restored = createGame({version:1,tiles:[]});
  assert.equal(restored.tiles.some(tile => tile.tilled), false);
  const legacy = createGame(serialize(game));
  for (const tile of legacy.tiles) if ((tile.x <= 16 && tile.y >= 16) || (tile.x >= 22 && tile.y <= 14)) { tile.tilled = false; tile.watered = false; tile.crop = null; }
  const loadedLegacy = createGame(serialize(legacy));
  assert.equal(loadedLegacy.tiles.filter(t => t.tilled).length, 14, 'existing fourteen-cell farms gain no new soil');
  assert.deepEqual(loadedLegacy.tiles, legacy.tiles);
});


test('additional prepared beds can grow and sell real crops while routes remain clear', () => {
  const game = createGame();
  const added = game.tiles.filter(t => t.tilled && !t.crop && ((t.x <= 16 && t.y >= 16) || (t.x >= 22 && t.y <= 14)));
  for (const tile of added) {
    assert.equal(canStand(game, tile.x + .5, tile.y + .5), true);
    assert.equal(target(game, tile, 'seeds'), true);
    assert.equal(target(game, tile, 'water'), true);
  }
  for (let day = 0; day < 3; day++) {
    if (day) for (const tile of added) assert.equal(target(game, tile, 'water'), true);
    sleep(game);
  }
  for (const tile of added) assert.equal(target(game, tile, 'harvest'), true);
  const restored = createGame(serialize(game));
  assert.equal(restored.harvest, added.length);
  restored.player.x = 18.5; restored.player.y = 12.3;
  assert.equal(interact(restored), true);
  assert.equal(restored.coins, 80 + added.length * 25);
  for (const [x,y] of [[20.5,13.5],[20.5,15.5],[17.5,16.5],[21.5,17.5],[24.5,15.5]])
    assert.equal(canStand(game,x,y),true,'bed lanes and well approach stay walkable');
});

test('spawn tutorial and station routes work without relocating the farmer', () => {
  const game = createGame();
  const tutorial = getTile(game, 19, 17);
  assert.equal(tutorial.tilled, false);
  for (const tool of ['hoe', 'seeds', 'water']) {
    game.selected = tool;
    assert.equal(act(game), true, `${tool} reaches the empty tutorial cell from spawn`);
  }
  assert.equal(game.seeds, 5);
  assert.equal(game.energy, 95);
  const walk = (x, y) => {


    for (let step = 0; step < 200; step++) {
      const dx = x - game.player.x, dy = y - game.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance < .001) return;
      assert.equal(move(game, dx / distance, dy / distance, Math.min(.05, distance / 4)), true);
    }
    assert.fail(`Station route blocked at ${game.player.x},${game.player.y}`);
  };
  walk(20.5, 16.5); walk(20.5, 12.5); walk(18.5, 12.5);
  assert.equal(getNearbyInteraction(game).kind, 'sell');
  walk(15.5, 12.5); walk(15.5, 11.8);
  assert.equal(getNearbyInteraction(game).kind, 'sleep');
  assert.equal(interact(game), true);
  assert.equal(tutorial.crop.growth, 1);
  walk(15.5, 12.5); walk(28.5, 12.5); walk(28.5, 11.5);
  assert.equal(getNearbyInteraction(game).kind, 'buy');
  assert.equal(interact(game), true);
  assert.equal(game.seeds, 11);
  assert.equal(game.coins, 50);
});

test('original six-plant browser saves retain exact stages, watering and inventory', () => {


  const tiles = Array.from({length: 6}, (_, i) => ({
    x: 22 + i % 2, y: 16 + Math.floor(i / 2),
    tilled: true, watered: i % 2 === 0, crop: {growth: i % 4},
  }));
  const saved = {version: 1, day: 8, seeds: 12, coins: 137, tiles};
  const game = createGame(JSON.stringify(saved));
  assert.deepEqual(game.tiles.filter(t => t.crop), tiles);
  assert.equal(game.tiles.filter(t => t.tilled).length, 6);
  assert.deepEqual([game.day, game.seeds, game.coins], [8, 12, 137]);
  assert.deepEqual(createGame(serialize(game)).tiles, game.tiles);
  sleep(game);
  assert.deepEqual(game.tiles.filter(t => t.crop).map(t => t.crop.growth), [1, 1, 3, 3, 1, 1]);
});
