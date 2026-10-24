// Content validator: loads every script the page loads into a sandbox and
// instantiates every card (generators 60x) to catch broken content.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => !/(store|audio|engine|ui|player|app)\.js$/.test(s));
const store = { state: { srs: {}, settings: {} } };
const sandbox = { window: {}, console, Math, Date, JSON, Number, String, Array, Object, Set, Map, isFinite, parseFloat, parseInt, Error };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), sandbox, { filename: s });
vm.runInContext(fs.readFileSync(path.join(root, 'js/engine.js'), 'utf8'), sandbox, { filename: 'engine.js' });
const CQ = sandbox.CQ;
CQ.store = store;

const errors = [], warns = [];
const err = (where, msg) => errors.push(where + ': ' + msg);
const warn = (where, msg) => warns.push(where + ': ' + msg);
const leftover = (html) => /\[\[|\]\]|√\{|vec\{|\$|\^\{|_\{|\*\*/.test(html.replace(/<[^>]+>/g, ''));
const checkText = (where, s) => { if (s && leftover(CQ.md(String(s)))) warn(where, 'unrendered markup in: ' + String(s).slice(0, 90)); };

let nCards = 0, nGen = 0, nLessons = 0;
const stats = {};
for (const cid of CQ.courseOrder) {
  const c = CQ.courses[cid];
  stats[cid] = { units: c.units.length, lessons: 0, ex: 0, teach: 0, gens: 0 };
  for (const u of c.units) {
    if (!u.lessons.length) err(u.id, 'unit has no lessons');
    for (const l of u.lessons) {
      nLessons++;
      stats[cid].lessons++;
      if (!l.goal) warn(l.id, 'no goal');
      if (!l.key) err(l.id, 'no key idea');
      checkText(l.id + ' key', l.key);
      const ex = l.cards.filter(CQ.isExercise);
      if (ex.length < 5) warn(l.id, 'only ' + ex.length + ' exercises');
      if (!ex.some((x) => (x.lvl || 1) <= 2)) warn(l.id, 'no easy (lvl<=2) exercise for Rescue');
      for (const card of l.cards) {
        nCards++;
        const where = card.key;
        if (card.t === 'teach') { stats[cid].teach++; checkText(where, card.md); continue; }
        if (card.t === 'example') { checkText(where, card.q); card.steps.forEach((s) => checkText(where, s)); continue; }
        stats[cid].ex++;
        const reps = card.t === 'gen' ? 60 : 1;
        if (card.t === 'gen') { nGen++; stats[cid].gens++; if (!CQ.gens[card.g]) { err(where, 'missing generator ' + card.g); continue; } }
        for (let r = 0; r < reps; r++) {
          let it;
          try { it = CQ.engine.instantiate(card, CQ.rng(r * 7919 + 13)); } catch (e) { err(where, 'instantiate failed: ' + e.message); break; }
          checkText(where, it.q); checkText(where, it.why); (it.steps || []).forEach((s) => checkText(where, s));
          if (!it.q) err(where, 'no question text');
          if (it.t === 'num') {
            if (typeof it.a !== 'number' || !isFinite(it.a)) { err(where, 'bad numeric answer ' + it.a + ' for ' + it.q); break; }
            const shown = CQ.parseNum(CQ.fmt(it.a, 4).replace('−', '-').replace(' × 10', 'e').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/, (m) => m));
            if (!CQ.engine.grade(it, CQ.fmt(it.a, 4))) err(where, 'own answer ' + CQ.fmt(it.a, 4) + ' does not grade as correct');
          } else if (it.t === 'mc') {
            if (it.choices.length < 2) err(where, 'mc needs 2+ options');
            const texts = it.choices.map((c) => c.text);
            if (new Set(texts).size !== texts.length) { err(where, 'duplicate mc options: ' + texts.join(' | ')); break; }
            if (it.choices.filter((c) => c.ok).length !== 1) err(where, 'mc must have exactly one correct');
          } else if (it.t === 'multi') {
            if (!it.choices.some((c) => c.ok)) err(where, 'multi has no correct option');
          } else if (it.t === 'tf') {
            if (typeof it.a !== 'boolean') err(where, 'tf answer must be boolean');
          } else if (it.t === 'fill') {
            const blanks = it.q.split('___').length - 1;
            if (blanks !== it.a.length) err(where, 'fill has ' + blanks + ' blanks but ' + it.a.length + ' answers');
            const all = it.a.concat(it.bank || []);
            if (new Set(all).size !== all.length && new Set(it.a).size === it.a.length) warn(where, 'fill bank repeats a word');
          } else if (it.t === 'match') {
            if (it.pairs.length < 3) warn(where, 'match with < 3 pairs');
            const L = it.pairs.map((p) => p[0]), Rr = it.pairs.map((p) => p[1]);
            if (new Set(L).size !== L.length || new Set(Rr).size !== Rr.length) err(where, 'match has duplicate sides');
          } else if (it.t === 'order') {
            if (it.items.length < 3) warn(where, 'order with < 3 items');
          } else if (it.t === 'txt') {
            if (!it.a.length) err(where, 'txt has no accepted answers');
          } else err(where, 'unknown type ' + it.t);
        }
      }
    }
  }
}
for (const c of CQ.courseOrder) for (const e of CQ.courses[c].exams) for (const u of e.units) if (!CQ.idx.units[u]) warn(e.id, 'exam references missing unit ' + u);
console.log('Lessons:', nLessons, ' cards:', nCards, ' generator cards:', nGen);
console.table(stats);
if (warns.length) { console.log('\nWARNINGS (' + warns.length + ')'); warns.slice(0, 60).forEach((w) => console.log('  ⚠ ' + w)); }
if (errors.length) { console.log('\nERRORS (' + errors.length + ')'); errors.slice(0, 80).forEach((e) => console.log('  ✗ ' + e)); process.exit(1); }
console.log('\nAll content checks passed.');
