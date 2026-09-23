const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const protocols = require('./protocols.js');
const uiMode = require('./ui-mode.js');

const elementIds = [
  'target', 'status', 'detail', 'protocol', 'diagnostics', 'build-version', 'test-identity',
  'quick', 'extended', 'fullscreen', 'stop', 'developer-constant-1hz-reference', 'developer-moderate',
  'developer-long', 'developer-timer-comparison', 'developer-raf-comparison',
  'developer-vertical-phase-diversity', 'developer-vertical-dense-sweep',
  'developer-temporal-cadence-sweep', 'developer-camera-session-phase',
  'developer-five-band-scanout'
];
const elements = Object.fromEntries(elementIds.map(id => [id, {
  id,
  textContent: '',
  disabled: false,
  hidden: false,
  onclick: null,
  replaceChildren() {}
}]));
const documentElement = { dataset: {} };
const document = {
  documentElement,
  getElementById: id => elements[id],
  querySelector: selector => elements[selector.slice(1)],
  querySelectorAll: selector => selector === '[data-developer-only]'
    ? [elements.extended, elements.protocol]
    : selector === '[data-volunteer-running-only]'
      ? [elements.stop]
      : []
};
const window = {
  location: { search: '' },
  V0WebProtocols: protocols,
  SyncItWebUiMode: uiMode,
  V0WebTargetRenderer: {
    createTargetRenderer: () => ({ snapshot: () => ({}) })
  },
  V0WebPulsePresentation: { presentPulse: () => Promise.resolve({}) }
};

vm.runInNewContext(fs.readFileSync('stimulus.js', 'utf8'), {
  window,
  document,
  console: { info() {}, error() {} },
  performance: { now: () => 0 },
  setTimeout,
  requestAnimationFrame: callback => callback(0),
  Blob,
  URL
});

assert.strictEqual(window.SyncItWebTestIdentity, protocols.WEB_TEST_IDENTITY);
assert.deepStrictEqual(documentElement.dataset, {
  syncItProtocolId: 'V0_WEB_QUICK_V1',
  syncItBuildId: 'v0-web-stimulus-20260923-constant-reference-1',
  syncItDeveloperMode: 'false'
});
assert.strictEqual(
  elements['test-identity'].textContent,
  'Protocol V0_WEB_QUICK_V1 · Build v0-web-stimulus-20260923-constant-reference-1'
);
assert.strictEqual(typeof elements.quick.onclick, 'function');

console.log('V0 web identity tests passed');
