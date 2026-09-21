/* DOM/CSS renderer diagnostics are browser provenance only, never physical timing truth. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.V0WebTargetRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const RENDERER_VERSION = 'v0-web-target-renderer-20260912-five-band-ladder-1';
  const FIVE_BAND_CENTRES = [12, 31, 50, 69, 88];

  function createTargetRenderer(target, readComputedStyle) {
    if (!target) throw new Error('V0 web target element #target was not found');
    const readStyle = readComputedStyle || (element => getComputedStyle(element));
    const createBand = target.ownerDocument?.createElement?.bind(target.ownerDocument);
    const ladderBands = FIVE_BAND_CENTRES.map((centre, index) => {
      if (!createBand) return null;
      const band = createBand('div');
      band.className = 'five-band-scanout-landmark';
      band.dataset.bandIndex = String(index + 1);
      band.style.setProperty('--band-top', `${centre - 4}%`);
      target.appendChild(band);
      return band;
    }).filter(Boolean);

    const snapshot = phase => {
      const computed = readStyle(target);
      const rect = target.getBoundingClientRect();
      return {
        phase,
        rendererVersion: RENDERER_VERSION,
        targetFound: true,
        targetId: target.id,
        targetConnected: target.isConnected,
        targetClassList: [...target.classList],
        targetPulseRegion: target.dataset.pulseRegion || null,
        targetInlineBackgroundColor: target.style.backgroundColor || null,
        fiveBandElementCount: ladderBands.length,
        fiveBandActive: target.dataset.fiveBandActive === 'true',
        computedBackgroundColor: computed.backgroundColor,
        computedBackgroundImage: computed.backgroundImage,
        computedColor: computed.color,
        computedDisplay: computed.display,
        computedVisibility: computed.visibility,
        computedOpacity: computed.opacity,
        targetBounds: { width: rect.width, height: rect.height }
      };
    };

    return {
      rendererVersion: RENDERER_VERSION,
      snapshot,
      applyOn(region = 'FULL_TARGET') {
        target.dataset.pulseRegion = region;
        target.classList.add('flash');
        // Full-target pulses use an inline value so the visible state cannot
        // depend on an accidental competing stylesheet selector.
        if (region === 'FULL_TARGET') target.style.setProperty('background-color', '#ffffff', 'important');
        else target.style.removeProperty('background-color');
        if (region === 'FIVE_BAND_LADDER') target.dataset.fiveBandActive = 'true';
        else delete target.dataset.fiveBandActive;
        return snapshot('on-state-applied');
      },
      applyOff() {
        target.classList.remove('flash');
        target.style.removeProperty('background-color');
        delete target.dataset.pulseRegion;
        delete target.dataset.fiveBandActive;
        return snapshot('off-state-applied');
      }
    };
  }

  return { RENDERER_VERSION, createTargetRenderer };
});
