const assert = require('assert');
const fs = require('fs');
const uiMode = require('./ui-mode.js');

const createPage = () => {
  const elements = {
    quick: { hidden: false, textContent: 'Start Sync-it web test' },
    extended: { hidden: true },
    fullscreen: { hidden: false },
    stop: { hidden: true },
    constantReference: { hidden: true },
    detail: { hidden: false, textContent: '' },
    developerControls: { hidden: true },
    protocol: { hidden: true },
    target: { hidden: false },
    status: { hidden: false },
    identity: { hidden: false }
  };
  return {
    elements,
    document: {
      documentElement: { dataset: {} },
      getElementById: id => elements[id],
      querySelectorAll: selector => selector === '[data-developer-only]'
        ? [elements.extended, elements.constantReference, elements.developerControls, elements.protocol]
        : selector === '[data-volunteer-running-only]'
          ? [elements.stop]
          : []
    }
  };
};

assert.strictEqual(uiMode.isDeveloper(''), false);
assert.strictEqual(uiMode.isDeveloper('?developer=0'), false);
assert.strictEqual(uiMode.isDeveloper('?developer=1'), true);
assert.strictEqual(uiMode.isDeveloper('?other=1&developer=1'), true);

const volunteer = createPage();
const volunteerMode = uiMode.apply(volunteer.document, '');
assert.deepStrictEqual(volunteerMode, { developer: false });
assert.strictEqual(volunteer.document.documentElement.dataset.syncItDeveloperMode, 'false');
assert.strictEqual(volunteer.elements.quick.textContent, 'Start Sync-it web test');
assert.strictEqual(volunteer.elements.extended.hidden, true);
assert.strictEqual(volunteer.elements.constantReference.hidden, true);
assert.strictEqual(volunteer.elements.developerControls.hidden, true);
assert.strictEqual(volunteer.elements.protocol.hidden, true);
assert.strictEqual(volunteer.elements.stop.hidden, true);
assert.strictEqual(volunteer.elements.fullscreen.hidden, false);
assert.strictEqual(volunteer.elements.target.hidden, false);
assert.strictEqual(volunteer.elements.status.hidden, false);
assert.strictEqual(volunteer.elements.identity.hidden, false);
assert.strictEqual(
  volunteer.elements.detail.textContent,
  'On your phone, follow the Sync-it app instructions, then press Start.'
);
uiMode.setRunning(volunteer.document, volunteerMode, true);
assert.strictEqual(volunteer.elements.quick.hidden, true);
assert.strictEqual(volunteer.elements.stop.hidden, false);
uiMode.setRunning(volunteer.document, volunteerMode, false);
assert.strictEqual(volunteer.elements.quick.hidden, false);
assert.strictEqual(volunteer.elements.stop.hidden, true);

const developer = createPage();
const developerMode = uiMode.apply(developer.document, '?developer=1');
assert.deepStrictEqual(developerMode, { developer: true });
assert.strictEqual(developer.document.documentElement.dataset.syncItDeveloperMode, 'true');
assert.strictEqual(developer.elements.quick.textContent, 'Current temporal protocol');
assert.strictEqual(developer.elements.extended.hidden, false);
assert.strictEqual(developer.elements.constantReference.hidden, false);
assert.strictEqual(developer.elements.developerControls.hidden, false);
assert.strictEqual(developer.elements.protocol.hidden, false);
assert.strictEqual(developer.elements.stop.hidden, false);
assert.strictEqual(
  developer.elements.detail.textContent,
  'Choose the short test unless you were asked to run the extended test.'
);
uiMode.setRunning(developer.document, developerMode, true);
assert.strictEqual(developer.elements.quick.hidden, false);
assert.strictEqual(developer.elements.stop.hidden, false);

const stimulus = fs.readFileSync('stimulus.js', 'utf8');
assert.match(stimulus, /if\(!WEB_TEST_UI_MODE\.developer\)status\.textContent='Running'/);
assert.match(stimulus, /WEB_TEST_UI_MODE\.developer\?'Stopped':'Complete'/);

console.log('V0 web UI mode tests passed');
