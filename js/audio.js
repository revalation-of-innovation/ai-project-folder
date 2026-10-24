/* Comet Quest — synthesized sound effects (no audio files). */
(function () {
  const CQ = window.CQ;
  let ctx = null;
  const ac = () => {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function tone(freq, t0, dur, type = 'sine', vol = 0.18, slide) {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t0);
    o.stop(c.currentTime + t0 + dur + 0.02);
  }
  const SFX = {
    tap: () => tone(660, 0, 0.05, 'triangle', 0.06),
    correct: () => { tone(880, 0, 0.12, 'triangle', 0.16); tone(1318.5, 0.08, 0.2, 'triangle', 0.14); },
    wrong: () => { tone(220, 0, 0.18, 'sawtooth', 0.07, 150); tone(165, 0.1, 0.22, 'square', 0.04, 110); },
    combo: () => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, i * 0.05, 0.12, 'triangle', 0.1)),
    reveal: () => tone(520, 0, 0.08, 'sine', 0.08, 780),
    complete: () => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.14)),
    level: () => [392, 523.25, 659.25, 783.99, 1046.5, 1568].forEach((f, i) => tone(f, i * 0.07, 0.35, 'square', 0.05)),
    chest: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, i * 0.06, 0.16, 'sine', 0.09)),
    heart: () => tone(300, 0, 0.25, 'sine', 0.12, 120),
    fail: () => [392, 349.23, 311.13, 261.63].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.1)),
  };
  CQ.sfx = function (name) {
    if (!CQ.store.state.settings.sound) return;
    try { SFX[name] && SFX[name](); } catch (e) { /* audio unavailable */ }
  };
  CQ.buzz = function (ms) {
    if (!CQ.store.state.settings.haptics) return;
    try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* no haptics */ }
  };
})();
