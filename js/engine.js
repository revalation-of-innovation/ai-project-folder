/* Comet Quest — the session engine: builds lessons, bosses, reviews and exams,
   grades answers, and runs the adaptive flow (re-queue, Rescue, Fast track). */
(function () {
  const CQ = window.CQ;
  let uid = 0;

  const E = (CQ.engine = {});

  /* ---------- turning content cards into playable items ---------- */
  E.instantiate = function (card, R, extra) {
    let c;
    if (card.t === 'gen') {
      const fn = CQ.gens[card.g];
      if (!fn) throw new Error('Missing generator ' + card.g);
      const g = fn(R);
      c = Object.assign({}, g, { lvl: card.lvl || g.lvl || 3, key: card.key, lesson: card.lesson, src: card, gen: true });
      if (card.exam) c.exam = true;
    } else {
      c = Object.assign({}, card, { src: card });
    }
    if (c.t === 'mc') {
      const opts = c.opts.map((o, i) => (Array.isArray(o) ? { text: o[0], fb: o[1], ok: i === 0 } : { text: o, ok: i === 0 }));
      c.choices = c.fixed ? opts : R.shuffle(opts);
    } else if (c.t === 'multi') {
      c.choices = R.shuffle(c.opts.map((o) => ({ text: o[0], ok: !!o[1] })));
    } else if (c.t === 'tf') {
      c.choices = [{ text: 'True', ok: c.a === true }, { text: 'False', ok: c.a === false }];
    } else if (c.t === 'fill') {
      c.tiles = R.shuffle(c.a.concat(c.bank || []).map((w, i) => ({ w, id: i })));
    } else if (c.t === 'match') {
      c.left = R.shuffle(c.pairs.map((p, i) => ({ text: p[0], i })));
      c.right = R.shuffle(c.pairs.map((p, i) => ({ text: p[1], i })));
    } else if (c.t === 'order') {
      let pool = R.shuffle(c.items.map((t, i) => ({ text: t, i })));
      if (pool.every((p, i) => p.i === i) && pool.length > 1) pool = pool.slice(1).concat(pool[0]);
      c.pool = pool;
    }
    c.uid = ++uid;
    return Object.assign(c, extra || {});
  };

  /* ---------- grading ---------- */
  E.correctText = function (c) {
    switch (c.t) {
      case 'mc': case 'tf': return c.choices.find((x) => x.ok).text;
      case 'multi': return c.choices.filter((x) => x.ok).map((x) => x.text).join(' · ');
      case 'num': return (c.show || CQ.fmt(c.a, c.sig || 3)) + (c.unit ? ' ' + c.unit : '');
      case 'txt': return c.a[0];
      case 'fill': return c.a.join(' · ');
      case 'match': return '';
      case 'order': return c.items.map((t, i) => i + 1 + '. ' + t).join('<br>');
    }
    return '';
  };

  E.grade = function (c, resp) {
    switch (c.t) {
      case 'mc': case 'tf': return !!(c.choices[resp] && c.choices[resp].ok);
      case 'multi': return c.choices.every((x, i) => !!x.ok === resp.has(i));
      case 'num': return CQ.numMatch(CQ.parseNum(resp), c.a, c.tol != null ? c.tol : 0.02, c.abs);
      case 'txt': {
        const r = CQ.normText(resp, c.cs);
        return c.a.some((x) => CQ.normText(x, c.cs) === r);
      }
      case 'fill': return c.a.every((w, i) => CQ.normText(resp[i], true) === CQ.normText(w, true));
      case 'match': return resp <= 1; // resp = number of mismatched taps
      case 'order': return resp.every((v, i) => c.items[v] === c.items[i]);
    }
    return false;
  };

  /* ---------- picking questions ---------- */
  const exercisesOf = (lesson) => lesson.cards.filter(CQ.isExercise);
  // Round-robin across groups so every lesson/unit is represented.
  function balanced(R, groups, n) {
    const gs = R.shuffle(groups.map((g) => R.shuffle(g)).filter((g) => g.length));
    const out = [];
    let k = 0;
    while (out.length < n && gs.some((g) => g.length)) {
      const g = gs[k % gs.length];
      if (g.length) out.push(g.shift());
      k++;
    }
    return out;
  }
  const hard = (cards, min) => {
    const h = cards.filter((c) => (c.lvl || 1) >= 2);
    return h.length >= (min || 4) ? h : cards;
  };

  /* ---------- building sessions ---------- */
  // modes: learn | levelup | legend | boss | jump | review | weak | exam
  E.build = function (mode, p) {
    const R = CQ.rng();
    const st = CQ.store.state;
    const S = {
      mode, p, R, items: [], i: 0,
      combo: 0, maxCombo: 0, xp: 0, correct: 0, answered: 0, ftRight: 0, ftTotal: 0,
      wrongStreak: 0, hearts: null, mistakes: [], retries: {}, start: Date.now(), hints: 0,
      rescued: false, fast: 0, answers: [], course: null, lesson: null, unit: null, exam: null,
      noFeedback: mode === 'exam', allowHints: mode !== 'legend' && mode !== 'exam',
    };
    const inst = (card, extra) => E.instantiate(card, R, extra);

    if (mode === 'learn') {
      const l = (S.lesson = CQ.idx.lessons[p.lesson]);
      S.course = l.course; S.unit = CQ.idx.units[l.unit];
      S.items = l.cards.map((c) => inst(c));
      // spiral review: 1-2 due questions from earlier lessons in the same course
      const due = CQ.store.dueKeys(l.course).filter((k) => !k.startsWith(l.id + ':'));
      R.sample(due.slice(0, 8), Math.min(2, due.length)).forEach((k) => S.items.push(inst(CQ.idx.cards[k], { review: true })));
    } else if (mode === 'levelup' || mode === 'legend') {
      const l = (S.lesson = CQ.idx.lessons[p.lesson]);
      S.course = l.course; S.unit = CQ.idx.units[l.unit];
      let cards = hard(exercisesOf(l), 5);
      cards = cards.concat(cards.filter((c) => c.t === 'gen'));
      S.items = R.shuffle(cards).slice(0, mode === 'legend' ? 12 : 14).map((c) => inst(c));
      if (mode === 'legend') S.hearts = 3;
    } else if (mode === 'boss' || mode === 'jump') {
      const u = (S.unit = CQ.idx.units[p.unit]);
      S.course = u.course;
      const units = mode === 'boss' ? [u] : CQ.courses[u.course].units.slice(0, u.n - 1);
      const groups = [];
      units.forEach((uu) => uu.lessons.forEach((l) => groups.push(hard(exercisesOf(l), 3))));
      S.items = balanced(R, groups, 12).map((c) => inst(c));
      S.hearts = 3;
    } else if (mode === 'review' || mode === 'weak') {
      S.course = p.course || null;
      let keys = mode === 'review' ? CQ.store.dueKeys(p.course) : CQ.store.weakKeys(p.course);
      keys = keys.slice(0, mode === 'review' ? 15 : 12);
      if (mode === 'review' && keys.length < 8) {
        const extra = CQ.store.weakKeys(p.course).filter((k) => !keys.includes(k));
        keys = keys.concat(extra.slice(0, 8 - keys.length));
      }
      if (keys.length < 6) {
        const seen = Object.keys(st.srs).filter((k) => CQ.idx.cards[k] && !keys.includes(k) && (!p.course || CQ.idx.cards[k].lesson && CQ.idx.lessons[CQ.idx.cards[k].lesson].course === p.course));
        keys = keys.concat(R.sample(seen, 8 - keys.length));
      }
      S.items = R.shuffle(keys).map((k) => inst(CQ.idx.cards[k]));
    } else if (mode === 'exam') {
      const c = CQ.courses[p.course];
      const ex = (S.exam = c.exams.find((x) => x.id === p.exam));
      S.course = c.id;
      const groups = [];
      ex.units.forEach((uid) => {
        const u = CQ.idx.units[uid];
        if (u) u.lessons.forEach((l) => groups.push(hard(exercisesOf(l), 3)));
      });
      S.items = balanced(R, groups, ex.n || 20).map((c2) => inst(c2));
      S.timeLimit = (ex.mins || Math.round(S.items.length * 2.25)) * 60000;
    }
    S.total = S.items.filter(CQ.isExercise).length;
    return S;
  };

  E.current = (S) => S.items[S.i];
  E.progress = (S, plus = 0) => {
    const ex = S.items.filter(CQ.isExercise);
    const done = S.items.slice(0, S.i).filter(CQ.isExercise).length + plus;
    return ex.length ? done / ex.length : S.i / Math.max(1, S.items.length);
  };

  /* ---------- answering ---------- */
  const REQUEUE = { learn: 1, levelup: 1, review: 1, weak: 1 };
  E.answer = function (S, ok, opts = {}) {
    const st = CQ.store.state;
    const item = E.current(S);
    const first = !item.retry && !item.stepping;
    const out = { ok, gain: 0, mult: 1, retry: false, rescue: false };
    S.answered++;
    if (first) { S.ftTotal++; if (ok) S.ftRight++; }
    S.answers.push({ item, ok, resp: opts.respText });
    st.stats.answered++;
    if (ok) {
      S.correct++; S.combo++; S.wrongStreak = 0;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      st.stats.correct++;
      st.daily.correct++;
      st.daily.combo = Math.max(st.daily.combo, S.combo);
      st.stats.maxCombo = Math.max(st.stats.maxCombo, S.combo);
      if (!S.noFeedback) {
        let base = (item.lvl || 1) >= 3 ? 2 : 1;
        if (opts.hint) base = 1;
        out.mult = S.combo >= 10 ? 3 : S.combo >= 5 ? 2 : 1;
        out.gain = base * out.mult;
        S.xp += out.gain;
      }
    } else {
      S.combo = 0; S.wrongStreak++;
      if (first) S.mistakes.push(item);
      if (S.hearts != null) S.hearts = Math.max(0, S.hearts - 1);
      const sk = item.key || item.uid;
      if (REQUEUE[S.mode] && (S.retries[sk] || 0) < 2) {
        S.retries[sk] = (S.retries[sk] || 0) + 1;
        S.items.push(E.instantiate(item.src, S.R, { retry: true, review: item.review }));
        out.retry = true;
      }
      // Rescue: two misses in a row in a lesson → re-teach the key idea + an easier question
      if ((S.mode === 'learn' || S.mode === 'levelup') && S.wrongStreak >= 2 && S.lesson && S.lesson.key) {
        const easy = S.lesson.cards.filter((c) => CQ.isExercise(c) && (c.lvl || 1) <= 2 && c.key !== item.key);
        const ins = [{ t: 'rescue', title: 'Quick reset', md: S.lesson.key, lesson: S.lesson.id, uid: 'r' + S.i }];
        if (easy.length) ins.push(E.instantiate(S.R.pick(easy), S.R, { stepping: true }));
        S.items.splice(S.i + 1, 0, ...ins);
        S.wrongStreak = 0;
        S.rescued = true;
        out.rescue = true;
      }
    }
    if (opts.hint) { S.hints++; st.stats.hints++; }
    if (first && item.key) CQ.store.srsRecord(item.key, ok && !opts.hint);
    return out;
  };

  // Move to the next screen. Fast track skips warm-ups while you're on a streak.
  E.advance = function (S) {
    S.i++;
    S.fastNow = 0;
    if (S.mode === 'learn') {
      while (S.i < S.items.length) {
        const n = S.items[S.i];
        const left = S.items.slice(S.i + 1).filter((x) => CQ.isExercise(x)).length;
        if (S.combo >= 4 && CQ.isExercise(n) && (n.lvl || 1) === 1 && !n.retry && !n.review && !n.stepping && left >= 3) {
          S.i++; S.fast++; S.fastNow++;
        } else break;
      }
    }
    return E.isOver(S);
  };

  E.isOver = (S) => S.i >= S.items.length || S.hearts === 0 || (S.timeLimit && Date.now() - S.start > S.timeLimit);

  /* ---------- finishing: rewards & bookkeeping ---------- */
  E.finish = function (S) {
    const store = CQ.store;
    const st = store.state;
    const lvBefore = store.level().n;
    const acc = S.ftTotal ? S.ftRight / S.ftTotal : 1;
    const perfect = S.ftTotal > 0 && S.mistakes.length === 0;
    const passed = S.hearts == null ? true : S.hearts > 0;
    const R = { mode: S.mode, acc, perfect, passed, ms: Date.now() - S.start, xp: S.xp, gems: 0, combo: S.maxCombo, crown: null, items: S.answers };
    store.rollDay();

    const lessonRec = (id) => (st.lessons[id] = st.lessons[id] || { c: 0, best: 0, n: 0 });
    if (S.mode === 'learn' || S.mode === 'levelup' || S.mode === 'legend') {
      const rec = lessonRec(S.lesson.id);
      const want = S.mode === 'learn' ? 1 : S.mode === 'levelup' ? 2 : 3;
      const ok = S.mode !== 'legend' || (passed && acc >= 0.9);
      R.passed = ok;
      if (ok) {
        if (rec.c < want) { R.crown = want; rec.c = Math.max(rec.c, want); }
        if (S.mode === 'legend') st.stats.legends++;
        R.xp += S.mode === 'legend' ? 20 : 10;
        R.gems += S.mode === 'legend' ? 20 : 5;
        if (perfect) { R.xp += 5; R.gems += 5; st.stats.perfect++; st.daily.perfect++; }
        st.stats.lessons++;
        st.daily.lessons++;
        if (S.rescued) st.stats.rescues++;
      }
      rec.n++;
      rec.best = Math.max(rec.best, acc);
    } else if (S.mode === 'boss' || S.mode === 'jump') {
      if (passed) {
        const u = S.unit;
        if (S.mode === 'boss') {
          st.units[u.id] = Object.assign(st.units[u.id] || {}, { boss: true });
          st.stats.bosses++;
        } else {
          CQ.courses[u.course].units.slice(0, u.n - 1).forEach((uu) => {
            st.units[uu.id] = Object.assign(st.units[uu.id] || {}, { jumped: true });
            uu.lessons.forEach((l) => { const r = lessonRec(l.id); r.c = Math.max(r.c, 1); });
          });
          st.units[u.id] = Object.assign(st.units[u.id] || {}, { jumped: true });
          st.stats.jumps++;
        }
        st.daily.bosses++;
        R.xp += 25; R.gems += 20;
      }
    } else if (S.mode === 'review' || S.mode === 'weak') {
      R.xp += 5; R.gems += 5;
      st.stats.reviews++;
      st.daily.reviews++;
    } else if (S.mode === 'exam') {
      const score = Math.round((S.correct / Math.max(1, S.items.length)) * 100);
      R.score = score;
      R.total = S.items.length;
      R.right = S.correct;
      R.unanswered = S.items.length - S.answers.length;
      (st.exams[S.exam.id] = st.exams[S.exam.id] || []).push({ d: CQ.dayKey(), s: score });
      st.stats.exams++;
      R.xp = S.correct + 20; R.gems = 10;
    }
    if (S.course && !st.daily.courses.includes(S.course)) st.daily.courses.push(S.course);
    st.stats.ms += R.ms;
    store.addXP(R.xp);
    st.gems += R.gems;
    R.streakGrew = R.xp > 0 ? store.bumpStreak() : false;
    R.streak = st.streak.n;
    R.levelUp = store.level().n > lvBefore ? store.level() : null;
    R.ach = store.checkAch();
    store.save(true);
    return R;
  };
})();
