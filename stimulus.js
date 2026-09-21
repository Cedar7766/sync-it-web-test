/* Scheduling diagnostics are provenance only: they are never physical light/audio timestamps. */
const { PROTOCOLS, WEB_STIMULUS_BUILD, WEB_TEST_IDENTITY } = window.V0WebProtocols;
const WEB_TEST_UI_MODE=window.SyncItWebUiMode.apply(document,window.location.search);
const target=document.getElementById('target'), status=document.querySelector('#status'), protocolText=document.querySelector('#protocol'), diagnosticsText=document.querySelector('#diagnostics'), buildText=document.querySelector('#build-version'), identityText=document.querySelector('#test-identity');
window.SyncItWebTestIdentity=WEB_TEST_IDENTITY;
document.documentElement.dataset.syncItProtocolId=WEB_TEST_IDENTITY.protocolId;
document.documentElement.dataset.syncItBuildId=WEB_TEST_IDENTITY.buildId;
identityText.textContent=`Protocol ${WEB_TEST_IDENTITY.protocolId} · Build ${WEB_TEST_IDENTITY.buildId}`;
buildText.textContent=`Loaded stimulus build: ${WEB_STIMULUS_BUILD}`;
const controls=['quick','extended','developer-vertical-phase-diversity','developer-vertical-dense-sweep','developer-temporal-cadence-sweep','developer-camera-session-phase','developer-five-band-scanout','stop'].map(id=>document.getElementById(id)); let state;
const protocolButtons=['quick','extended','developer-vertical-phase-diversity','developer-vertical-dense-sweep','developer-temporal-cadence-sweep','developer-camera-session-phase','developer-five-band-scanout'].map(id=>document.getElementById(id));
const developerComparisonButtons=['developer-timer-comparison','developer-raf-comparison'].map(id=>document.getElementById(id));
const tone = (ctx, when) => { const o=ctx.createOscillator(), g=ctx.createGain(); o.frequency.value=2720; g.gain.setValueAtTime(.5,when); o.connect(g).connect(ctx.destination); o.start(when); o.stop(when+.04); };
const renderer=window.V0WebTargetRenderer.createTargetRenderer(target);
console.info('V0 web target renderer ready (NON-PHYSICAL)',renderer.snapshot('renderer-ready'));
const flash = (intendedOnHoldMs, region='FULL_TARGET', mode='TIMER_DRIVEN') => window.V0WebPulsePresentation.presentPulse(intendedOnHoldMs, {
  mode,
  now: () => performance.now(),
  applyOn: () => renderer.applyOn(region),
  applyOnAtNextFrame: mode === 'RAF_ALIGNED' ? () => new Promise(resolve => requestAnimationFrame(rafCallbackTime => {
    renderer.applyOn(region);
    resolve({rafCallbackTime,onStateAppliedAt:performance.now()});
  })) : null,
  applyOff: () => renderer.applyOff(),
  snapshot: phase => renderer.snapshot(phase),
  nextFrame: () => new Promise(resolve => requestAnimationFrame(resolve))
});
const showDiagnostics = diagnostic => {
  diagnosticsText.textContent = `Browser render-opportunity diagnostic only (not physical timing or monitor presentation): ${JSON.stringify(diagnostic)}`;
  console.info('V0 web render-opportunity diagnostic (NON-PHYSICAL)', diagnostic);
};
async function developerPulse(intendedOnHoldMs) {
  const buttonClickReceivedAt=performance.now();
  console.info('V0 web developer pulse button click received (NON-PHYSICAL)',{intendedOnHoldMs,buttonClickReceivedAt,target:renderer.snapshot('developer-button-click')});
  if (state && !state.cancelled) {
    diagnosticsText.textContent='Developer pulse request received, but a protocol is still running. Stop it before using this check.';
    return;
  }
  const diagnostic = await flash(intendedOnHoldMs);
  diagnostic.requestedBy=`developer-${intendedOnHoldMs}ms-intended-hold-button`;
  diagnostic.buttonClickReceivedAt=buttonClickReceivedAt;
  status.textContent = `Developer ${intendedOnHoldMs} ms intended hold complete`;
  showDiagnostics(diagnostic);
}
const waitUntil=(deadline)=>new Promise(resolve=>setTimeout(resolve,Math.max(0,deadline-performance.now())));
async function developerComparison(mode) {
  const requestedAt=performance.now();
  console.info('V0 web comparison requested (NON-PHYSICAL)',{mode,requestedAt,target:renderer.snapshot('comparison-button-click')});
  if (state && !state.cancelled) { diagnosticsText.textContent='Comparison request received, but another test is running. Stop it first.'; return; }
  const events=[]; state={cancelled:false,events,developerComparison:mode};
  protocolButtons.forEach(button=>button.disabled=true);
  developerComparisonButtons.forEach(button=>button.disabled=true); document.querySelector('#stop').disabled=false;
  const firstDueAt=performance.now()+250; let dueAt=firstDueAt;
  try {
    status.textContent=`Developer ${mode}: armed for 30 pulses`;
    for(let sequence=1;sequence<=30 && !state.cancelled;sequence+=1,dueAt+=997) {
      await waitUntil(dueAt); if(state.cancelled) break;
      const visual=await flash(40,'FULL_TARGET',mode);
      visual.eventSequence=sequence; visual.scheduledDueAt=dueAt; visual.scheduleLatenessMs=visual.visualRequestedAt-dueAt;
      events.push(visual); showDiagnostics(visual); status.textContent=`Developer ${mode}: ${sequence}/30`;
    }
    const cancelled=state.cancelled;
    status.textContent=cancelled?`Developer ${mode}: stopped`:`Developer ${mode}: complete (30/30)`;
    const blob=new Blob([JSON.stringify({schema:'v0-web-render-alignment-comparison-v1',mode,intendedOnHoldMs:40,nominalCadenceMs:997,requestedAt,firstDueAt,events,diagnosticsClassification:'NON_PHYSICAL_BROWSER_PROVENANCE'},null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${mode.toLowerCase()}-40ms-30pulse-browser-diagnostics.json`; a.textContent=`Download ${mode} browser diagnostics`; protocolText.replaceChildren(a);
  } finally {
    state={cancelled:true,events,developerComparison:mode}; document.querySelector('#stop').disabled=true;
    protocolButtons.forEach(button=>button.disabled=false);
    developerComparisonButtons.forEach(button=>button.disabled=false);
  }
}
async function run(id) { const ctx=new AudioContext(); await ctx.resume(); const events=[]; state={cancelled:false,ctx,events}; controls.forEach(b=>b.disabled=true); document.querySelector('#stop').disabled=false; window.SyncItWebUiMode.setRunning(document,WEB_TEST_UI_MODE,true); if(!WEB_TEST_UI_MODE.developer)status.textContent='Running';
  let t=ctx.currentTime+.25, cycle=0;
  while (!state.cancelled) for (const [block,gaps,count,cadence,intendedOnHoldMs,spatial,markerDurationMs=1000] of PROTOCOLS[id]) { if(state.cancelled) break; protocolText.textContent=`${id} · ${block} · ${WEB_STIMULUS_BUILD}`;
    // Marker triple is deliberately non-measurement. Its two gaps identify the block.
    tone(ctx,t); tone(ctx,t+gaps[0]/1000); tone(ctx,t+(gaps[0]+gaps[1])/1000); t+=markerDurationMs/1000;
    for(let i=0;i<count && !state.cancelled;i++,cycle++,t+=cadence/1000){ tone(ctx,t); const wait=Math.max(0,(t-ctx.currentTime)*1000); await new Promise(r=>setTimeout(r,wait)); const region=spatial[i%spatial.length]; const visual=await flash(intendedOnHoldMs,region); visual.requestedBy=`${id}:${block}`; events.push({block,cycle,intendedOnHoldMs,spatial:region,audioTargetTime:t,visualRequestedAt:visual.visualRequestedAt,onStateAppliedAt:visual.onStateAppliedAt,firstRafAfterOn:visual.firstRafAfterOn,onRafRenderOpportunityCount:visual.onRafRenderOpportunityCount,onRafTimestamps:visual.onRafTimestamps,offStateAppliedAt:visual.offStateAppliedAt,firstRafAfterOff:visual.firstRafAfterOff,visualPresentationDiagnostic:visual}); showDiagnostics(visual); status.textContent=`Running · ${cycle}`; }
  }
  status.textContent=WEB_TEST_UI_MODE.developer?'Stopped':'Complete'; document.querySelector('#stop').disabled=true; protocolButtons.forEach(button=>button.disabled=false); window.SyncItWebUiMode.setRunning(document,WEB_TEST_UI_MODE,false);
  const blob=new Blob([JSON.stringify({protocol:id,events},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${id}-scheduling-diagnostics.json`; a.textContent='Download scheduling diagnostics'; protocolText.replaceChildren(a);
}
const reportError=(source,error)=>{console.error(`V0 web ${source} failed`,error);status.textContent='Web test error — check browser console';diagnosticsText.textContent=`Browser error (${source}): ${error.stack||error}`;};
document.querySelector('#quick').onclick=()=>run('V0_WEB_QUICK_V1').catch(error=>reportError('quick protocol',error)); document.querySelector('#extended').onclick=()=>run('V0_WEB_EXTENDED_V1').catch(error=>reportError('extended protocol',error)); document.querySelector('#developer-vertical-phase-diversity').onclick=()=>run('V0_WEB_VERTICAL_PHASE_DIVERSITY_V1').catch(error=>reportError('vertical phase-diversity protocol',error)); document.querySelector('#developer-vertical-dense-sweep').onclick=()=>run('V0_WEB_VERTICAL_DENSE_SWEEP_V1').catch(error=>reportError('vertical dense-sweep protocol',error)); document.querySelector('#developer-temporal-cadence-sweep').onclick=()=>run('V0_WEB_TEMPORAL_CADENCE_SWEEP_V1').catch(error=>reportError('temporal cadence-sweep protocol',error)); document.querySelector('#developer-camera-session-phase').onclick=()=>run('V0_WEB_CAMERA_SESSION_PHASE_V1').catch(error=>reportError('camera-session phase protocol',error)); document.querySelector('#developer-five-band-scanout').onclick=()=>run('V0_WEB_FIVE_BAND_SCANOUT_LADDER_V1').catch(error=>reportError('five-band scanout ladder protocol',error)); document.querySelector('#stop').onclick=()=>{if(state)state.cancelled=true}; document.querySelector('#fullscreen').onclick=()=>document.documentElement.requestFullscreen?.(); document.querySelector('#developer-moderate').onclick=()=>developerPulse(40).catch(error=>reportError('40 ms developer pulse',error)); document.querySelector('#developer-long').onclick=()=>developerPulse(200).catch(error=>reportError('200 ms developer pulse',error)); document.querySelector('#developer-timer-comparison').onclick=()=>developerComparison('TIMER_DRIVEN').catch(error=>reportError('timer-driven comparison',error)); document.querySelector('#developer-raf-comparison').onclick=()=>developerComparison('RAF_ALIGNED').catch(error=>reportError('rAF-aligned comparison',error));
