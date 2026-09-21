# V0 web stimulus

Serve this local, dependency-free page on the second display:

```sh
cd sync-it-web-test
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser, frame the central target with the
phone, then choose **Start web test**. The default is `V0_WEB_QUICK_V1` (29.946
s); `V0_WEB_EXTENDED_V1` is a separate 52.865 s development follow-up.

After Start, the selected protocol repeats until **Stop**. This lets the phone
join an already-running page and recover a block marker during its own fixed
capture window; the Android capture duration remains 30 or 53 seconds.

The page uses 2720 Hz Web Audio and an absolute AudioContext timeline. Its
downloadable JSON records scheduling diagnostics only: browser and rAF times
are never physical timing truth. Each event is a sharp black-to-white leading
transition followed by an intended white hold and a sharp return to black. The
leading optical transition is the feature for phone analysis; the trailing
transition is not scored.

## Protocol and build identity

The page always shows a quiet identity line below the controls. For the normal
volunteer path its protocol ID is `V0_WEB_QUICK_V1`; the build ID is the
immutable `WEB_STIMULUS_BUILD` string exported by `protocols.js`. The same
values are available to automation as `window.SyncItWebTestIdentity` and as
`data-sync-it-protocol-id` / `data-sync-it-build-id` attributes on the root
`html` element.

The build ID is the Git-hash-equivalent release stamp for this dependency-free
static deployment. Its format is
`v0-web-stimulus-YYYYMMDD-<change>-<revision>`. Before deploying changed page
source, advance `WEB_STIMULUS_BUILD` to a new value and update its assertion in
`protocols.test.js` in the same commit. The public deployment serves the
checked-in files unchanged, so the Git commit and unique build string together
identify the exact page source. Run `node protocols.test.js` and
`node identity.test.js` before deployment; the tests also freeze the Quick
protocol structure and 29,946 ms duration and check that the displayed, DOM,
and global identities agree.

Quick uses a 40 ms intended browser-time white hold for every LOCK,
QUICK_SWEEP, and CONFIRM event. It remains a browser scheduling intent, not a
claim about monitor light duration. Extended compares the same 40 ms moderate
hold with a 200 ms long hold; it no longer compares rAF callback counts.

## Presentation diagnostics

Each visual event records `visualRequestedAt`, ON/OFF state-application times,
the first rAF after ON, every requested ON rAF opportunity, the first rAF after
OFF, and the intended browser-time hold. These fields are explicitly
**NON-PHYSICAL** browser diagnostics: they demonstrate the DOM/rAF scheduling
sequence, not the time that a display emitted light.

The renderer records its target element ID, connection state, class list,
inline background colour, computed background colour/image, visibility,
opacity, and bounds at click, ON, each ON rAF, OFF, and first OFF rAF. This is
temporary troubleshooting provenance, also explicitly **NON-PHYSICAL**. The
HTML script URLs are versioned so a browser cannot combine a fresh page with a
cached older pulse scheduler.

An rAF callback is only a browser scheduling/render opportunity. It does not
prove that a display physically presented a frame. The target remains ON until
the intended browser-time hold has elapsed and changes OFF only from a later
rAF callback, avoiding a coalesced ON/OFF DOM update.

To compare the holds without running a protocol, expand **Developer visual
checks** and use **Show 40 ms pulse** and **Show 200 ms pulse**. Run at least
30 40 ms pulses: every one must be plainly visible. The browser
console and page show non-physical diagnostics. Run the lightweight scheduler
test with:

```sh
node stimulus.test.js
```

## Developer render-alignment comparison

The developer panel also offers two 30-event, visual-only comparison runs. They
do not alter Quick or Extended, do not generate a browser audio reference, and
use a nominal 997 ms cadence with a 40 ms intended hold.

- **TIMER_DRIVEN:** after the cadence timer says the event is due, the DOM ON
  state is applied immediately through the normal renderer.
- **RAF_ALIGNED:** after the cadence timer says the event is due, the event is
  armed and the DOM ON state is applied inside the next rAF callback.

Each downloaded comparison JSON includes the mode, sequence number, scheduled
due time, requested/armed time, rAF alignment callback where applicable, ON/OFF
application times, render-opportunity diagnostics, computed renderer states,
and scheduling lateness. Every browser timestamp is **NON-PHYSICAL**: rAF does
not identify panel scanout start or a photon timestamp.

### Rigol checklist

1. Keep the display, browser window/fullscreen mode, photodiode position,
   brightness, and scope setup unchanged between modes.
2. Capture **Run 30 timer-driven pulses**; archive the JSON alongside the scope
   waveform/screenshot.
3. Capture **Run 30 rAF-aligned pulses** under the same conditions.
4. From the optical channel, compare leading-edge interval distribution and
   jitter, white-pulse width distribution, missing pulses, refresh-grid
   quantisation, and edge morphology. The black-to-white edge is the primary
   comparison feature.
5. Treat a smaller or cleaner optical leading-edge spread as evidence about this
   browser/display combination only. It is not an assertion that rAF is physical
   display timing.

A video flash authored on a source-frame boundary is presentation-frame aligned
in the source stream, but its emitted light still depends on playback scheduling
and display scanout. Keep the target's vertical position as an explicit
convention when comparing video or browser optical evidence.

## Developer vertical phase-diversity experiment

**Developer-only; it does not change Quick or Extended.** The **Run vertical
phase-diversity experiment** control runs
`V0_WEB_VERTICAL_PHASE_DIVERSITY_V1`: five sequential 5-cycle blocks at a
997 ms nominal cadence, each using the existing 40 ms intended hold. The white
target rectangle keeps its size and centred horizontal position while moving
through TOP, 25%, CENTRE, 75%, and BOTTOM locations. Each block has an existing
three-tone marker signature, so Android records its declared block and cycle
through the normal Web identity path.

The complete browser sequence is 29.925 s; the Android capture request is 36
s so an arbitrary join contains a complete directly identified block. Keep the phone, display, brightness, orientation, and framing fixed. Frame
the display so every rectangle remains comfortably visible before starting the
browser run, then start the Pixel Web test. Do not move the phone between
blocks.

On the Android debug flow, select **Developer: vertical phase-diversity test**.
Its framing screen intentionally shows a tall rectangular guide rather than the
normal circle and says to frame the whole Web test area. That guide is derived
from the same full-height target travel convention as the five reductions; it
does not imply that the centre is the analysis region.

The position labels are screen-space stimulus labels only. They are **not**
display-scanout timing references and must not be converted into calibration,
source-offset subtraction, or row normalisation. The resulting phone evidence
adds `v0-web-position-phase-summary.csv` and
`v0-web-position-phase-summary.properties`, plus the compact per-frame
`v0-web-position-luminance.csv`, beside the ordinary Web sidecars.
They summarize observed and interior-usable interpolation fractions, robust
spread, and 1/16 phase buckets per position plus their union. Interpret a wider
union as a candidate phase-diversity mechanism only; it neither proves a
physical display timing model nor changes compatibility classification.

## Developer dense vertical phase sweep

**Developer-only; it does not change Quick, Extended, Hardware, or the
five-position experiment.** **Run dense vertical phase sweep** runs
`V0_WEB_VERTICAL_DENSE_SWEEP_V1`: nine sequential blocks at declared target
centres 10%, 20%, …, 90%. Each block has four 997 ms ordinary events using the
same 40 ms intended browser hold and ordinary 2720 Hz timing tone. The nine
marker triples use nine unique direct gap codes; marker tones remain protocol
identity only and never measurement events.

Eight blocks are 4,988 ms (`1,000 + 4 × 997`). `VERTICAL_90` uses a 1,350 ms
marker window: its final `450/450` marker tone is then 450 ms before cycle 1,
which keeps it separate from the unchanged measurement-tone selector. The
45,242 ms loop plus one complete-block arbitrary-join margin is 50,580 ms, so
Android requests a rounded 51-second capture. Keep the phone and display fixed,
with the whole dark stage visible and reasonably large. The same dynamic 64-band
event-local analysis and spatial-consistency diagnostics are retained for every
block.

The output remains mechanism characterisation only. It reports direct block
identity, raw/localised optical evidence, legacy and spatial-consistent 1/16
phase-bucket unions, and missing buckets. It does not fit or install a
position-to-phase calibration, assert display timing, or classify compatibility.

## Developer dense temporal cadence sweep

**Developer-only; it does not change Quick, Extended, Hardware, or either
vertical experiment.** **Run dense temporal cadence sweep** runs
`V0_WEB_TEMPORAL_CADENCE_SWEEP_V1` with one unchanged central target. It uses,
in order, `TEMPORAL_1000`, `TEMPORAL_980`, `TEMPORAL_970`, `TEMPORAL_990`, and
`TEMPORAL_960`. Each has a one-second marker window, eight ordinary 2720 Hz
tone/visual events, and a 40 ms intended browser-time white hold. Their marker
gap codes are respectively `250/250`, `250/350`, `350/250`, `350/350`, and
`450/250` ms.

The requested cadences are experiment inputs, not physical display timing
claims. The loop is 44,200 ms; its longest block is 9,000 ms. The full-loop plus
complete-block arbitrary-join bound is 53,200 ms, so Android requests 54
seconds. Android retains the existing dynamic 64-band localisation, direct
marker identity, Stage11B interpolation, Stage11B4 pairing, spatial-consistency
diagnostic, and no-drop transport telemetry. It scores only camera-observed
optical fractions and must not correct timestamps from requested cadence or a
display-refresh model.

## Developer camera-session phase diversity

`V0_WEB_CAMERA_SESSION_PHASE_V1` is a fixed central-target developer source for
testing complete Android CameraDevice reopen boundaries. Its single looping
block has a direct `450/350` marker, a 1,250 ms marker window, four ordinary
997 ms flash/tone events, and a 40 ms intended browser-time hold (`5,238 ms`
total). The final marker tone is nominally 450 ms before cycle 1, preserving
the frozen ordinary-tone selection path. The browser stays
running while Android collects six fresh fixed120 CameraDevice sessions of 11
seconds, fully releases each owner, then waits one developer-only second before
opening the next. Browser time and the wait are provenance only, never timing
evidence. The Android aggregate retains session UUIDs, lifecycle/release
boundaries, direct spatial-consistent interior observations, and cumulative
observed phase buckets; it makes no compatibility or calibration claim.
