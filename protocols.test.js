const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DEFAULT_PROTOCOL_ID, WEB_STIMULUS_BUILD, WEB_TEST_IDENTITY, PROTOCOLS, protocolDurationMs } = require('./protocols.js');

assert.equal(DEFAULT_PROTOCOL_ID, 'V0_WEB_QUICK_V1');
assert.equal(WEB_STIMULUS_BUILD, 'v0-web-stimulus-20260921-ui-modes-1');
assert.deepStrictEqual(WEB_TEST_IDENTITY, {
  protocolId: 'V0_WEB_QUICK_V1',
  buildId: 'v0-web-stimulus-20260921-ui-modes-1'
});
assert.ok(Object.isFrozen(WEB_TEST_IDENTITY));

// Existing public protocols are deliberate contracts and must not change when
// the developer-only mechanism experiment is added.
assert.deepStrictEqual(PROTOCOLS.V0_WEB_QUICK_V1, [
  ['EPOCH', [250, 250], 0, 1, 40, ['FULL_TARGET']],
  ['LOCK', [250, 350], 5, 1000, 40, ['FULL_TARGET']],
  ['QUICK_SWEEP', [350, 250], 18, 997, 40, ['FULL_TARGET']],
  ['CONFIRM', [350, 350], 3, 1000, 40, ['FULL_TARGET']]
]);
assert.strictEqual(protocolDurationMs('V0_WEB_QUICK_V1'), 29946);

const vertical = PROTOCOLS.V0_WEB_VERTICAL_PHASE_DIVERSITY_V1;
assert.deepStrictEqual(vertical.map(([block]) => block), [
  'VERTICAL_TOP', 'VERTICAL_25_PERCENT', 'VERTICAL_CENTRE',
  'VERTICAL_75_PERCENT', 'VERTICAL_BOTTOM'
]);
assert.ok(vertical.every(([, , count, cadence, hold, regions]) =>
  count === 5 && cadence === 997 && hold === 40 && regions.length === 1 && regions[0].startsWith('VERTICAL_')));
assert.strictEqual(protocolDurationMs('V0_WEB_VERTICAL_PHASE_DIVERSITY_V1'), 29925);

const dense = PROTOCOLS.V0_WEB_VERTICAL_DENSE_SWEEP_V1;
assert.deepStrictEqual(dense.map(([block]) => block), [
  'VERTICAL_10', 'VERTICAL_20', 'VERTICAL_30', 'VERTICAL_40', 'VERTICAL_50',
  'VERTICAL_60', 'VERTICAL_70', 'VERTICAL_80', 'VERTICAL_90'
]);
assert.ok(dense.every(([, , count, cadence, hold, regions]) =>
  count === 4 && cadence === 997 && hold === 40 && regions.length === 1 && regions[0].startsWith('VERTICAL_')));
assert.strictEqual(new Set(dense.map(([, gaps]) => gaps.join('/'))).size, 9);
assert.strictEqual(dense.find(([block]) => block === 'VERTICAL_90')[6], 1350);
assert.strictEqual(dense.find(([block]) => block === 'VERTICAL_90')[6] - 450 - 450, 450);
assert.strictEqual(protocolDurationMs('V0_WEB_VERTICAL_DENSE_SWEEP_V1'), 45242);

const temporal = PROTOCOLS.V0_WEB_TEMPORAL_CADENCE_SWEEP_V1;
assert.deepStrictEqual(temporal.map(([block]) => block), [
  'TEMPORAL_1000', 'TEMPORAL_980', 'TEMPORAL_970', 'TEMPORAL_990', 'TEMPORAL_960'
]);
assert.deepStrictEqual(temporal.map(([, gaps]) => gaps), [
  [250, 250], [250, 350], [350, 250], [350, 350], [450, 250]
]);
assert.deepStrictEqual(temporal.map(([, , count, cadence]) => [count, cadence]), [
  [8, 1000], [8, 980], [8, 970], [8, 990], [8, 960]
]);
assert.ok(temporal.every(([, , , , hold, regions]) => hold === 40 && regions.length === 1 && regions[0] === 'CENTRAL_TARGET'), 'temporal pulses use only the fixed central target');
assert.ok(!temporal.some(([, , , , , regions]) => regions.includes('FULL_TARGET')), 'temporal pulses never flash the surrounding stage');
const styles = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
assert.match(styles, /#target\.flash\[data-pulse-region="CENTRAL_TARGET"\]\s*\{\s*position:relative;\s*background-color:#000;\s*background-image:none;/, 'the temporal central pulse keeps its surrounding stage black');
const page = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert.match(page, /id="build-version"/, 'the developer page exposes the loaded stimulus build');
assert.match(page, /id="test-identity"/, 'the page exposes unobtrusive protocol and build identity');
assert.match(page, /styles\.css\?v=20260921-ui-modes-1/, 'the current stylesheet has a dedicated cache version');
assert.match(page, /protocols\.js\?v=20260921-ui-modes-1/, 'the protocol script has the current build cache version');
assert.match(page, /ui-mode\.js\?v=20260921-ui-modes-1/, 'the UI-mode script has the current build cache version');
assert.match(page, /stimulus\.js\?v=20260921-ui-modes-1/, 'the stimulus script has the current build cache version');
const stimulus = fs.readFileSync(path.join(__dirname, 'stimulus.js'), 'utf8');
assert.match(stimulus, /window\.SyncItWebTestIdentity=WEB_TEST_IDENTITY/, 'identity is exposed as frozen global state');
assert.match(stimulus, /dataset\.syncItProtocolId=WEB_TEST_IDENTITY\.protocolId/, 'protocol identity is exposed in the DOM');
assert.match(stimulus, /dataset\.syncItBuildId=WEB_TEST_IDENTITY\.buildId/, 'build identity is exposed in the DOM');
assert.match(stimulus, /querySelector\('#quick'\)\.onclick=\(\)=>run\('V0_WEB_QUICK_V1'\)/, 'normal Start web test path remains Quick V1');
assert.strictEqual(protocolDurationMs('V0_WEB_TEMPORAL_CADENCE_SWEEP_V1'), 44200);

const cameraSession = PROTOCOLS.V0_WEB_CAMERA_SESSION_PHASE_V1;
assert.deepStrictEqual(cameraSession, [
  ['CAMERA_SESSION_PHASE', [450, 350], 4, 997, 40, ['CENTRAL_TARGET'], 1250]
]);
assert.strictEqual(cameraSession[0][6] - 450 - 350, 450);
assert.strictEqual(protocolDurationMs('V0_WEB_CAMERA_SESSION_PHASE_V1'), 5238);

const fiveBand = PROTOCOLS.V0_WEB_FIVE_BAND_SCANOUT_LADDER_V1;
assert.deepStrictEqual(fiveBand, [
  ['FIVE_BAND_SCANOUT_LADDER', [450, 350], 4, 997, 40, ['FIVE_BAND_LADDER'], 1250]
]);
assert.strictEqual(fiveBand[0][6] - 450 - 350, 450);
assert.strictEqual(protocolDurationMs('V0_WEB_FIVE_BAND_SCANOUT_LADDER_V1'), 5238);
assert.match(styles, /five-band-scanout-landmark/, 'five bands are explicit landmark elements');
assert.match(styles, /data-five-band-active="true"/, 'one parent state activates all five bands');
assert.match(styles, /FIVE_BAND_LADDER[\s\S]*background-color:#000 !important/, 'the stage remains black during the ladder pulse');

console.log('V0 web protocol contracts passed');
