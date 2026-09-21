const assert = require('node:assert/strict');
const { createTargetRenderer } = require('./target-renderer.js');

function fakeTarget() {
  const classes = new Set();
  const properties = new Map();
  const children = [];
  const createElement = () => ({ className: '', dataset: {}, style: { setProperty(name, value) { this[name] = value; } } });
  return {
    id: 'target',
    isConnected: true,
    dataset: {},
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      [Symbol.iterator]: () => classes.values()
    },
    style: {
      get backgroundColor() { return properties.get('background-color') || ''; },
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: name => properties.delete(name)
    },
    ownerDocument: { createElement },
    appendChild: child => children.push(child),
    children,
    getBoundingClientRect: () => ({ width: 1280, height: 720 })
  };
}

const target = fakeTarget();
const renderer = createTargetRenderer(target, element => ({
  backgroundColor: element.style.backgroundColor || (element.classList[Symbol.iterator]().next().done ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'),
  backgroundImage: 'none', color: 'rgb(255, 255, 255)', display: 'block', visibility: 'visible', opacity: '1'
}));

const on = renderer.applyOn('FULL_TARGET');
assert.deepEqual(on.targetClassList, ['flash']);
assert.equal(on.targetPulseRegion, 'FULL_TARGET');
assert.equal(on.targetInlineBackgroundColor, '#ffffff');
assert.equal(on.computedBackgroundColor, '#ffffff');
assert.equal(on.targetBounds.width, 1280);

const off = renderer.applyOff();
assert.deepEqual(off.targetClassList, []);
assert.equal(off.targetPulseRegion, null);
assert.equal(off.targetInlineBackgroundColor, null);

const spatial = renderer.applyOn('TOP_THIRD');
assert.equal(spatial.targetPulseRegion, 'TOP_THIRD');
assert.equal(spatial.targetInlineBackgroundColor, null);
renderer.applyOff();

const central = renderer.applyOn('CENTRAL_TARGET');
assert.equal(central.targetPulseRegion, 'CENTRAL_TARGET');
assert.equal(central.targetInlineBackgroundColor, null);
assert.notEqual(central.targetPulseRegion, 'FULL_TARGET');
renderer.applyOff();
const ladder = renderer.applyOn('FIVE_BAND_LADDER');
assert.equal(ladder.targetPulseRegion, 'FIVE_BAND_LADDER');
assert.notEqual(ladder.targetPulseRegion, 'FULL_TARGET');
assert.notEqual(ladder.targetPulseRegion, 'CENTRAL_TARGET');
assert.equal(ladder.fiveBandElementCount, 5);
assert.equal(ladder.fiveBandActive, true);
assert.deepEqual(target.children.map(child => child.dataset.bandIndex), ['1', '2', '3', '4', '5']);
assert.deepEqual(target.children.map(child => child.style['--band-top']), ['8%', '27%', '46%', '65%', '84%']);
const ladderOff = renderer.applyOff();
assert.equal(ladderOff.fiveBandActive, false);
assert.throws(() => createTargetRenderer(null), /#target was not found/);
console.log('target-renderer tests passed');
