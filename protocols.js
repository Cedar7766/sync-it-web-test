/* Browser source contracts. Browser timestamps remain NON-PHYSICAL provenance. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.V0WebProtocols = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  // Immutable public-deployment identity. Advance the build string whenever
  // the deployed source changes; protocol definitions remain independent.
  const DEFAULT_PROTOCOL_ID = 'V0_WEB_QUICK_V1';
  const WEB_STIMULUS_BUILD = 'v0-web-stimulus-20260921-ui-modes-1';
  const PROTOCOLS = {
    V0_WEB_QUICK_V1: [
      ['EPOCH',[250,250],0,1,40,['FULL_TARGET']], ['LOCK',[250,350],5,1000,40,['FULL_TARGET']],
      ['QUICK_SWEEP',[350,250],18,997,40,['FULL_TARGET']], ['CONFIRM',[350,350],3,1000,40,['FULL_TARGET']]
    ],
    V0_WEB_EXTENDED_V1: [
      ['EPOCH',[450,250],0,1,40,['FULL_TARGET']], ['EXTENDED_SWEEP',[250,450],18,997,40,['FULL_TARGET']],
      ['LONG_SWEEP',[450,350],18,997,200,['FULL_TARGET']], ['SPATIAL',[350,450],9,997,200,['TOP_THIRD','MIDDLE_THIRD','BOTTOM_THIRD']],
      ['CONFIRM',[450,450],3,1000,40,['FULL_TARGET']]
    ],
    // Developer-only mechanism characterisation. Position labels are geometry,
    // not absolute display timing references.
    V0_WEB_VERTICAL_PHASE_DIVERSITY_V1: [
      ['VERTICAL_TOP',[250,250],5,997,40,['VERTICAL_TOP']],
      ['VERTICAL_25_PERCENT',[250,350],5,997,40,['VERTICAL_25_PERCENT']],
      ['VERTICAL_CENTRE',[350,250],5,997,40,['VERTICAL_CENTRE']],
      ['VERTICAL_75_PERCENT',[350,350],5,997,40,['VERTICAL_75_PERCENT']],
      ['VERTICAL_BOTTOM',[450,250],5,997,40,['VERTICAL_BOTTOM']]
    ],
    // Developer-only dense scanout mechanism characterisation. Every
    // position has a unique, direct marker code; position is not timing truth.
    V0_WEB_VERTICAL_DENSE_SWEEP_V1: [
      ['VERTICAL_10',[250,250],4,997,40,['VERTICAL_10']],
      ['VERTICAL_20',[250,350],4,997,40,['VERTICAL_20']],
      ['VERTICAL_30',[250,450],4,997,40,['VERTICAL_30']],
      ['VERTICAL_40',[350,250],4,997,40,['VERTICAL_40']],
      ['VERTICAL_50',[350,350],4,997,40,['VERTICAL_50']],
      ['VERTICAL_60',[350,450],4,997,40,['VERTICAL_60']],
      ['VERTICAL_70',[450,250],4,997,40,['VERTICAL_70']],
      ['VERTICAL_80',[450,350],4,997,40,['VERTICAL_80']],
      // Keep the final 450/450 marker tone 450 ms ahead of cycle 1 so the
      // unchanged measurement-tone selector can retain both events.
      ['VERTICAL_90',[450,450],4,997,40,['VERTICAL_90'],1350]
    ],
    // Developer-only temporal mechanism characterisation. Requested cadence is
    // browser scheduling intent, never physical display-light timing truth.
    // A target-sized centre rectangle, not the full dark stage, remains fixed
    // in every block. Browser time remains scheduling intent only.
    V0_WEB_TEMPORAL_CADENCE_SWEEP_V1: [
      ['TEMPORAL_1000',[250,250],8,1000,40,['CENTRAL_TARGET']],
      ['TEMPORAL_980',[250,350],8,980,40,['CENTRAL_TARGET']],
      ['TEMPORAL_970',[350,250],8,970,40,['CENTRAL_TARGET']],
      ['TEMPORAL_990',[350,350],8,990,40,['CENTRAL_TARGET']],
      ['TEMPORAL_960',[450,250],8,960,40,['CENTRAL_TARGET']]
    ],
    // Developer-only CameraDevice reopen experiment. This one short block
    // repeats while six independent Android camera sessions observe it.
    V0_WEB_CAMERA_SESSION_PHASE_V1: [
      // Final marker tone is nominally at 800 ms; cycle 1 starts at 1,250 ms.
      ['CAMERA_SESSION_PHASE',[450,350],4,997,40,['CENTRAL_TARGET'],1250]
    ],
    // One state application switches all five white bands. Their image
    // structure is diagnostic only; this remains one ordinary A/V event.
    V0_WEB_FIVE_BAND_SCANOUT_LADDER_V1: [
      ['FIVE_BAND_SCANOUT_LADDER',[450,350],4,997,40,['FIVE_BAND_LADDER'],1250]
    ]
  };
  const protocolDurationMs = protocol => PROTOCOLS[protocol].reduce((total, [, , count, cadence, , , markerDurationMs = 1000]) => total + markerDurationMs + count * cadence, 0);
  const WEB_TEST_IDENTITY = Object.freeze({
    protocolId: DEFAULT_PROTOCOL_ID,
    buildId: WEB_STIMULUS_BUILD
  });
  return { DEFAULT_PROTOCOL_ID, WEB_STIMULUS_BUILD, WEB_TEST_IDENTITY, PROTOCOLS, protocolDurationMs };
});
