const assert = require('node:assert/strict');
const { presentPulse } = require('./pulse-presentation.js');

async function exercise(intendedOnHoldMs) {
  let clock = 0;
  const calls = [];
  const diagnostic = await presentPulse(intendedOnHoldMs, {
    now: () => clock,
    applyOn: () => calls.push('on'),
    applyOff: () => calls.push('off'),
    nextFrame: async () => {
      clock += 20;
      const frame = `raf-${clock}`;
      calls.push(frame);
      return frame;
    }
  });
  return { calls, diagnostic };
}

async function exerciseRafAligned(intendedOnHoldMs) {
  let clock = 0;
  const calls = [];
  const diagnostic = await presentPulse(intendedOnHoldMs, {
    mode: 'RAF_ALIGNED',
    now: () => clock,
    applyOn: () => calls.push('unexpected-timer-on'),
    applyOnAtNextFrame: async () => {
      clock += 20;
      calls.push(`alignment-raf-${clock}`, 'on');
      return { rafCallbackTime: `alignment-raf-${clock}`, onStateAppliedAt: clock };
    },
    applyOff: () => calls.push('off'),
    nextFrame: async () => {
      clock += 20;
      const frame = `raf-${clock}`;
      calls.push(frame);
      return frame;
    }
  });
  return { calls, diagnostic };
}

(async () => {
  const short = await exercise(40);
  assert.deepEqual(short.calls, ['on', 'raf-20', 'raf-40', 'raf-60', 'off', 'raf-80']);
  assert.equal(short.diagnostic.firstRafAfterOn, 'raf-20');
  assert.deepEqual(short.diagnostic.onRafTimestamps, ['raf-20', 'raf-40']);
  assert.equal(short.diagnostic.onRafRenderOpportunityCount, 2);
  assert.equal(short.diagnostic.intendedOnHoldMs, 40);
  assert.equal(short.diagnostic.offSchedulingRaf, 'raf-60');
  assert.equal(short.diagnostic.firstRafAfterOff, 'raf-80');
  assert.match(short.diagnostic.diagnosticTimebase, /NOT_MONITOR_PRESENTATIONS/);
  assert.equal(short.diagnostic.mode, 'TIMER_DRIVEN');
  assert.equal(short.diagnostic.onAlignmentRafCallbackTime, null);

  const long = await exercise(200);
  assert.equal(long.diagnostic.onRafRenderOpportunityCount, 10);
  assert.equal(long.diagnostic.onRafTimestamps.at(-1), 'raf-200');
  assert.equal(long.diagnostic.offSchedulingRaf, 'raf-220');
  assert.equal(long.diagnostic.firstRafAfterOff, 'raf-240');

  const aligned = await exerciseRafAligned(40);
  assert.deepEqual(aligned.calls, ['alignment-raf-20', 'on', 'raf-40', 'raf-60', 'raf-80', 'off', 'raf-100']);
  assert.equal(aligned.diagnostic.mode, 'RAF_ALIGNED');
  assert.equal(aligned.diagnostic.armedAt, 0);
  assert.equal(aligned.diagnostic.onAlignmentRafCallbackTime, 'alignment-raf-20');
  assert.equal(aligned.diagnostic.onStateAppliedAt, 20);
  assert.deepEqual(aligned.diagnostic.onRafTimestamps, ['raf-40', 'raf-60']);
  assert.equal(aligned.diagnostic.offSchedulingRaf, 'raf-80');

  await assert.rejects(
    presentPulse(0, { now: () => 0, applyOn() {}, applyOff() {}, nextFrame: async () => 0 }),
    /must be positive/
  );
  console.log('pulse-presentation tests passed');
})();
