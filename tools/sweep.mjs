// Engine sweep: builds every session type for every lesson/unit/exam and plays it
// to completion with random right/wrong answers, checking the flow always terminates.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => !/(ui|player|app|audio)\.js$/.test(s));
const sb = { console, Math, Date, JSON, Number, String, Array, Object, Set, Map, isFinite, parseFloat, parseInt, Error, setTimeout: () => 0, clearTimeout: () => 0, btoa: (s) => Buffer.from(s, 'binary').toString('base64'), atob: (s) => Buffer.from(s, 'base64').toString('binary'), unescape, escape, encodeURIComponent, decodeURIComponent };
sb.window = sb;
vm.createContext(sb);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), sb, { filename: s });
const CQ = sb.CQ, E = CQ.engine;
CQ.store.load();
let runs = 0, maxSteps = 0, rescues = 0, fast = 0;
const play = (mode, p, pRight) => {
  const S = E.build(mode, p);
  if (!S.items.length) return;
  let steps = 0;
  while (!E.isOver(S)) {
    const it = E.current(S);
    if (CQ.isExercise(it)) E.answer(S, Math.random() < pRight, {});
    E.advance(S);
    if (++steps > 400) throw new Error('runaway session ' + mode + ' ' + JSON.stringify(p));
  }
  rescues += S.rescued ? 1 : 0; fast += S.fast;
  E.finish(S);
  runs++; maxSteps = Math.max(maxSteps, steps);
};
for (const cid of CQ.courseOrder) {
  const c = CQ.courses[cid];
  for (const u of c.units) {
    for (const l of u.lessons) for (const [mode, pr] of [['learn', 0.5], ['learn', 0.95], ['levelup', 0.7], ['legend', 0.9]]) play(mode, { lesson: l.id }, pr);
    play('boss', { unit: u.id }, 0.8);
    if (u.n > 1) play('jump', { unit: u.id }, 0.85);
  }
  for (const ex of c.exams) play('exam', { course: cid, exam: ex.id }, 0.7);
  play('review', { course: cid }, 0.6);
  play('weak', { course: cid }, 0.6);
}
play('review', {}, 0.6);
const st = CQ.store.state;
console.log({ runs, maxSteps, rescues, fastSkips: fast, xp: st.xp, level: CQ.store.level(), srsItems: Object.keys(st.srs).length, ach: Object.keys(st.ach).length, readiness: CQ.courseOrder.map((c) => CQ.courses[c].exams.map((e) => CQ.store.readiness(e))) });
const code = CQ.store.exportCode();
CQ.store.importCode(code);
console.log('export/import round-trip ok, save size', (JSON.stringify(st).length / 1024).toFixed(1) + ' KB');
