(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SyncItWebUiMode = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const isDeveloper = search => new URLSearchParams(search).get('developer') === '1';

  const apply = (document, search) => {
    const developer = isDeveloper(search);
    document.documentElement.dataset.syncItDeveloperMode = developer ? 'true' : 'false';
    document.querySelectorAll('[data-developer-only]').forEach(element => {
      element.hidden = !developer;
    });
    document.querySelectorAll('[data-volunteer-running-only]').forEach(element => {
      element.hidden = !developer;
    });
    document.getElementById('quick').textContent = developer
      ? 'Current temporal protocol'
      : 'Start Sync-it web test';
    document.getElementById('detail').textContent = developer
      ? 'Choose the short test unless you were asked to run the extended test.'
      : 'On your phone, follow the Sync-it app instructions, then press Start.';
    return Object.freeze({ developer });
  };

  const setRunning = (document, mode, running) => {
    if (mode.developer) return;
    document.getElementById('quick').hidden = running;
    document.getElementById('stop').hidden = !running;
  };

  return { isDeveloper, apply, setRunning };
});
