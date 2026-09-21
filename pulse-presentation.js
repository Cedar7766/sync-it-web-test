/* Browser rAF render opportunities are scheduling diagnostics, never physical timing truth. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.V0WebPulsePresentation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  /**
   * Holds ON until the requested browser-time deadline has passed, then changes
   * OFF from the following rAF callback. rAF callbacks are browser render
   * opportunities, not evidence that a monitor physically presented a frame.
   */
  async function presentPulse(intendedOnHoldMs, adapter) {
    if (!Number.isFinite(intendedOnHoldMs) || intendedOnHoldMs <= 0) {
      throw new Error('intendedOnHoldMs must be positive');
    }

    const visualRequestedAt = adapter.now();
    const armedAt = adapter.now();
    let onAlignmentRafCallbackTime = null;
    let onStateAppliedAt;
    if (adapter.applyOnAtNextFrame) {
      const aligned = await adapter.applyOnAtNextFrame();
      onAlignmentRafCallbackTime = aligned.rafCallbackTime;
      onStateAppliedAt = aligned.onStateAppliedAt;
    } else {
      adapter.applyOn();
      onStateAppliedAt = adapter.now();
    }
    const intendedOffDeadlineAt = onStateAppliedAt + intendedOnHoldMs;
    const onState = adapter.snapshot ? adapter.snapshot('on-state-applied') : null;
    const onRafTimestamps = [];
    const onRafStates = [];
    do {
      onRafTimestamps.push(await adapter.nextFrame());
      onRafStates.push(adapter.snapshot ? adapter.snapshot(`on-raf-${onRafTimestamps.length}`) : null);
    } while (adapter.now() < intendedOffDeadlineAt);

    // Deliberately subsequent to the final ON rAF so it receives an ON render opportunity.
    const offSchedulingRaf = await adapter.nextFrame();
    adapter.applyOff();
    const offStateAppliedAt = adapter.now();
    const offState = adapter.snapshot ? adapter.snapshot('off-state-applied') : null;
    const firstRafAfterOff = await adapter.nextFrame();
    const firstRafAfterOffState = adapter.snapshot ? adapter.snapshot('first-raf-after-off') : null;

    return {
      visualRequestedAt,
      armedAt,
      mode: adapter.mode || 'TIMER_DRIVEN',
      onAlignmentRafCallbackTime,
      onStateAppliedAt,
      onState,
      firstRafAfterOn: onRafTimestamps[0],
      onRafTimestamps,
      onRafStates,
      onRafRenderOpportunityCount: onRafTimestamps.length,
      intendedOnHoldMs,
      intendedOffDeadlineAt,
      offSchedulingRaf,
      offStateAppliedAt,
      offState,
      firstRafAfterOff,
      firstRafAfterOffState,
      diagnosticTimebase: 'performance.now/requestAnimationFrame; NON_PHYSICAL_BROWSER_RENDER_OPPORTUNITIES_NOT_MONITOR_PRESENTATIONS'
    };
  }

  return { presentPulse };
});
