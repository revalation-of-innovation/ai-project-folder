/* Comet Quest — content registry and the small DSL the course files use.

   Card types
     T(title, md)                       teach card (markup, optional fig)
     EX(title, problem, steps[])        worked example, revealed step by step
     MC(q, [correct, ...wrong], why)    multiple choice; an option may be [text, feedbackIfPicked]
     MULTI(q, [[text, isRight]...], why) select all that apply
     TF(q, true|false, why)             true / false
     NUM(q, answer, unit, why)          numeric entry (tol: relative tolerance, default 2%)
     TXT(q, accepted|[accepted], why)   short text (cs: true for case-sensitive formulas)
     FILL(q with ___, [answers], [distractors], why)   word-bank fill-in
     MATCH(q, [[left, right]...], why)  tap-to-match pairs
     ORDER(q, [items in order], why)    put steps in order
     G(generatorId)                     a generated problem (fresh numbers every time)
   Extra options (last argument): lvl 1-4, hint, steps, fig, tol, abs, exam, fixed */
(function () {
  const CQ = window.CQ;
  CQ.courses = {};
  CQ.courseOrder = [];
  CQ.gens = {};
  CQ.idx = { lessons: {}, units: {}, cards: {} };

  CQ.defineCourse = function (def) {
    def.units = [];
    CQ.courses[def.id] = def;
    CQ.courseOrder.push(def.id);
    return def;
  };

  CQ.addUnits = function (courseId, units) {
    const c = CQ.courses[courseId];
    units.forEach((unit) => {
      unit.course = courseId;
      unit.n = c.units.length + 1;
      c.units.push(unit);
      CQ.idx.units[unit.id] = unit;
      unit.lessons.forEach((l, i) => {
        l.unit = unit.id;
        l.course = courseId;
        l.n = i + 1;
        const seen = {};
        l.cards.forEach((card) => {
          card.lesson = l.id;
          let k = l.id + ':' + CQ.hash((card.t || '') + '|' + (card.q || card.g || card.title || ''));
          if (seen[k]) { seen[k]++; k += '-' + seen[k]; } else seen[k] = 1;
          card.key = k;
          CQ.idx.cards[k] = card;
        });
        CQ.idx.lessons[l.id] = l;
      });
    });
  };

  CQ.gen = function (id, fn) { CQ.gens[id] = fn; };

  // Build multiple-choice options from numbers: correct first, unique, formatted.
  CQ.numOpts = function (correct, wrongs, sig = 3, unit = '') {
    const f = (x) => CQ.fmt(x, sig) + (unit ? ' ' + unit : '');
    const c = f(correct);
    const out = [c];
    for (const w of wrongs) {
      if (!isFinite(w)) continue;
      const s = f(w);
      if (!out.includes(s)) out.push(s);
      if (out.length >= 4) break;
    }
    // pad with scaled distractors if needed
    let k = 2;
    while (out.length < 4) {
      const s = f(correct * (k % 2 ? k : 1 / k));
      if (!out.includes(s)) out.push(s);
      k++;
    }
    return out;
  };

  const X = (o, x) => Object.assign(o, x || {});
  CQ.dsl = {
    L: (id, title, meta, cards) => X({ id, title, cards }, meta),
    U: (id, title, meta, lessons) => X({ id, title, lessons }, meta),
    T: (title, md, x) => X({ t: 'teach', title, md }, x),
    EX: (title, q, steps, x) => X({ t: 'example', title, q, steps }, x),
    MC: (q, opts, why, x) => X({ t: 'mc', q, opts, why, lvl: 1 }, x),
    MULTI: (q, opts, why, x) => X({ t: 'multi', q, opts, why, lvl: 2 }, x),
    TF: (q, a, why, x) => X({ t: 'tf', q, a, why, lvl: 1 }, x),
    NUM: (q, a, unit, why, x) => X({ t: 'num', q, a, unit, why, lvl: 3 }, x),
    TXT: (q, a, why, x) => X({ t: 'txt', q, a: [].concat(a), why, lvl: 2 }, x),
    FILL: (q, a, bank, why, x) => X({ t: 'fill', q, a, bank, why, lvl: 2 }, x),
    MATCH: (q, pairs, why, x) => X({ t: 'match', q, pairs, why, lvl: 2 }, x),
    ORDER: (q, items, why, x) => X({ t: 'order', q, items, why, lvl: 2 }, x),
    G: (g, x) => X({ t: 'gen', g, lvl: 3 }, x),
  };

  CQ.isExercise = (c) => c && c.t !== 'teach' && c.t !== 'example' && c.t !== 'rescue';

  CQ.lessonsOf = (courseId) => {
    const out = [];
    CQ.courses[courseId].units.forEach((u) => u.lessons.forEach((l) => out.push(l)));
    return out;
  };
})();
