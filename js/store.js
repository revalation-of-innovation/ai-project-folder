/* Comet Quest — player state: persistence, XP & levels, streaks, spaced repetition,
   unlocks, readiness, daily quests and achievements. */
(function () {
  const CQ = window.CQ;
  const KEY = 'cometquest.v1';
  const INTERVALS = [0, 1, 3, 7, 16, 35]; // Leitner boxes 0..5 (days until due)

  const defaults = () => ({
    v: 1,
    updatedAt: 0,
    created: Date.now(),
    name: '',
    xp: 0,
    gems: 50,
    streak: { n: 0, best: 0, last: null, freezes: 1, frozen: [] },
    daily: null,
    history: {},
    settings: { sound: true, goal: 50, theme: 'system', freeRoam: false, motion: true, timer: true, haptics: true },
    course: 'phys',
    lessons: {}, // lessonId -> { c: crowns 0-3, best: accuracy, n: plays }
    units: {}, // unitId -> { boss: bool, jumped: bool, chest: bool }
    srs: {}, // cardKey -> [box, dueDay, wrong, seen]
    stats: { answered: 0, correct: 0, lessons: 0, perfect: 0, bosses: 0, exams: 0, maxCombo: 0, reviews: 0, rescues: 0, legends: 0, ms: 0, hints: 0, chests: 0, jumps: 0 },
    ach: {},
    exams: {}, // examId -> [{ d: dayKey, s: score 0-100 }]
    skin: 'classic',
    owned: ['classic'],
    onboarded: false,
  });

  const S = (CQ.store = {
    state: defaults(),
    listeners: [],
    onChange(fn) { this.listeners.push(fn); },
  });

  function deepMerge(base, over) {
    for (const k in over) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) deepMerge(base[k], over[k]);
      else base[k] = over[k];
    }
    return base;
  }

  S.load = function () {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try { S.state = deepMerge(defaults(), JSON.parse(raw)); } catch (e) { S.state = defaults(); }
    }
    S.rollDay();
  };

  let saveT = null;
  S.save = function (immediate) {
    S.state.updatedAt = Date.now();
    clearTimeout(saveT);
    const doSave = () => {
      try { localStorage.setItem(KEY, JSON.stringify(S.state)); } catch (e) { /* storage unavailable */ }
      S.cloud.push();
    };
    if (immediate) doSave(); else saveT = setTimeout(doSave, 300);
  };

  S.replace = function (obj) {
    S.state = deepMerge(defaults(), obj);
    S.rollDay();
    S.save(true);
    S.listeners.forEach((f) => f());
  };
  S.reset = function () { S.replace(defaults()); };

  S.exportCode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S.state))));
  S.importCode = function (code) {
    const obj = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
    if (!obj || typeof obj !== 'object' || obj.v !== 1) throw new Error('That code is not a Comet Quest save.');
    S.replace(obj);
  };

  /* ---------- cloud sync (only when running as a claude.ai artifact) ---------- */
  S.cloud = {
    ref: null,
    busy: false,
    dirty: false,
    status: 'local',
    async init() {
      try {
        if (!window.claude || !window.claude.use) return;
        const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
        if (!db || !user) return;
        const id = await user.id();
        if (!id) return;
        this.ref = db.doc('data/users/' + id + '/progress');
        const snap = await this.ref.get();
        if (snap.exists) {
          const d = snap.data();
          const remote = d && d.s ? JSON.parse(d.s) : null;
          if (remote && (remote.updatedAt || 0) > (S.state.updatedAt || 0)) {
            S.state = deepMerge(defaults(), remote);
            S.rollDay();
            try { localStorage.setItem(KEY, JSON.stringify(S.state)); } catch (e) { /* ignore */ }
            S.listeners.forEach((f) => f());
          } else if ((S.state.updatedAt || 0) > (remote ? remote.updatedAt || 0 : 0)) {
            this.push();
          }
        } else if (S.state.updatedAt) {
          this.push();
        }
        this.status = 'synced';
      } catch (e) {
        this.ref = null;
        this.status = 'local';
      }
    },
    push() {
      if (!this.ref) return;
      this.dirty = true;
      clearTimeout(this.t);
      this.t = setTimeout(() => this.flush(), 2500);
    },
    async flush() {
      if (!this.ref || this.busy || !this.dirty) return;
      this.busy = true;
      this.dirty = false;
      try {
        await this.ref.set({ s: JSON.stringify(S.state), t: S.state.updatedAt });
        this.status = 'synced';
      } catch (e) {
        if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) this.ref = null;
        this.status = 'local';
      }
      this.busy = false;
      if (this.dirty) this.push();
    },
  };

  /* ---------- days, streaks, daily counters ---------- */
  const freshDaily = (date) => ({ date, xp: 0, correct: 0, perfect: 0, combo: 0, reviews: 0, courses: [], bosses: 0, lessons: 0, claimed: [] });

  S.rollDay = function () {
    const st = S.state;
    const today = CQ.dayKey();
    if (!st.daily || st.daily.date !== today) st.daily = freshDaily(today);
    // streak maintenance: spend freezes on missed days, otherwise reset
    if (st.streak.last) {
      const gap = CQ.dayNum() - CQ.keyToNum(st.streak.last);
      if (gap > 1) {
        const missed = gap - 1;
        if (st.streak.n > 0 && st.streak.freezes >= missed) {
          st.streak.freezes -= missed;
          for (let i = 1; i <= missed; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            st.streak.frozen.push(CQ.dayKey(d));
          }
          const y = new Date(); y.setDate(y.getDate() - 1);
          st.streak.last = CQ.dayKey(y);
          S.flash = { type: 'freeze', n: missed };
        } else if (st.streak.n > 0) {
          S.flash = { type: 'lost', n: st.streak.n };
          st.streak.n = 0;
        }
      }
    }
  };

  // Called whenever a session finishes. Returns true if the streak grew today.
  S.bumpStreak = function () {
    const st = S.state;
    const today = CQ.dayKey();
    if (st.streak.last === today) return false;
    const gap = st.streak.last ? CQ.dayNum() - CQ.keyToNum(st.streak.last) : 99;
    st.streak.n = gap === 1 ? st.streak.n + 1 : 1;
    st.streak.last = today;
    st.streak.best = Math.max(st.streak.best, st.streak.n);
    return true;
  };

  S.addXP = function (n) {
    const st = S.state;
    S.rollDay();
    st.xp += n;
    st.daily.xp += n;
    const k = CQ.dayKey();
    st.history[k] = (st.history[k] || 0) + n;
  };

  /* ---------- levels ---------- */
  const TITLES = [[1, 'Stardust'], [3, 'Meteor'], [6, 'Comet'], [10, 'Nova'], [15, 'Pulsar'], [20, 'Quasar'], [25, 'Supernova'], [32, 'Galaxy Brain']];
  const need = (n) => 40 * (n - 1) + 10 * (n - 1) * (n - 1); // total XP to reach level n
  S.level = function (xp = S.state.xp) {
    let n = 1;
    while (xp >= need(n + 1)) n++;
    let title = TITLES[0][1];
    for (const [lv, t] of TITLES) if (n >= lv) title = t;
    return { n, title, cur: xp - need(n), span: need(n + 1) - need(n) };
  };

  /* ---------- spaced repetition ---------- */
  S.srsRecord = function (key, ok) {
    if (!key) return;
    const today = CQ.dayNum();
    const r = S.state.srs[key] || [0, today, 0, 0];
    r[3]++;
    if (ok) { r[0] = Math.min(5, r[0] + 1); r[1] = today + INTERVALS[r[0]]; }
    else { r[0] = 0; r[1] = today; r[2]++; }
    S.state.srs[key] = r;
  };
  const courseOfKey = (key) => { const l = CQ.idx.lessons[key.split(':')[0]]; return l ? l.course : null; };
  S.dueKeys = function (courseId) {
    const today = CQ.dayNum();
    return Object.keys(S.state.srs)
      .filter((k) => CQ.idx.cards[k] && S.state.srs[k][1] <= today && (!courseId || courseOfKey(k) === courseId))
      .sort((a, b) => S.state.srs[a][0] - S.state.srs[b][0] || S.state.srs[a][1] - S.state.srs[b][1]);
  };
  S.weakKeys = function (courseId) {
    return Object.keys(S.state.srs)
      .filter((k) => CQ.idx.cards[k] && S.state.srs[k][2] > 0 && (!courseId || courseOfKey(k) === courseId))
      .sort((a, b) => {
        const ra = S.state.srs[a], rb = S.state.srs[b];
        return rb[2] / rb[3] - ra[2] / ra[3] || ra[0] - rb[0];
      });
  };

  /* ---------- progress & unlocks ---------- */
  S.crowns = (lid) => (S.state.lessons[lid] ? S.state.lessons[lid].c : 0);
  S.unitDone = (u) => u.lessons.every((l) => S.crowns(l.id) >= 1);
  S.unitBeaten = (u) => !!(S.state.units[u.id] && (S.state.units[u.id].boss || S.state.units[u.id].jumped));
  S.unitOpen = function (u) {
    if (S.state.settings.freeRoam || u.n === 1) return true;
    const c = CQ.courses[u.course];
    const prev = c.units[u.n - 2];
    return S.unitBeaten(prev) || !!(S.state.units[u.id] && S.state.units[u.id].jumped);
  };
  S.lessonOpen = function (l) {
    const u = CQ.idx.units[l.unit];
    if (!S.unitOpen(u)) return false;
    if (S.state.settings.freeRoam || l.n === 1 || S.unitBeaten(u)) return true;
    return S.crowns(u.lessons[l.n - 2].id) >= 1;
  };
  S.bossOpen = (u) => S.unitOpen(u) && (S.state.settings.freeRoam || S.unitDone(u) || S.unitBeaten(u));
  S.chestAfter = (u) => (u.lessons.length >= 3 ? 2 : 0); // chest sits after lesson #2
  S.chestOpen = (u) => S.unitOpen(u) && S.crowns(u.lessons[S.chestAfter(u) - 1].id) >= 1;

  // The lesson you'd naturally do next in a course.
  S.nextLesson = function (courseId) {
    const c = CQ.courses[courseId];
    for (const u of c.units) {
      if (!S.unitOpen(u)) return null;
      for (const l of u.lessons) if (S.crowns(l.id) < 1 && S.lessonOpen(l)) return { lesson: l };
      if (!S.unitBeaten(u) && S.bossOpen(u)) return { boss: u };
    }
    return null;
  };

  S.courseProgress = function (courseId) {
    const ls = CQ.lessonsOf(courseId);
    if (!ls.length) return 0;
    return ls.reduce((a, l) => a + Math.min(3, S.crowns(l.id)), 0) / (ls.length * 3);
  };

  // 0..1 estimate of how well a lesson is retained
  S.lessonMastery = function (l) {
    const c = S.crowns(l.id);
    if (!c) return 0;
    const keys = l.cards.filter(CQ.isExercise).map((x) => x.key).filter((k) => S.state.srs[k]);
    const box = keys.length ? keys.reduce((a, k) => a + S.state.srs[k][0], 0) / (keys.length * 5) : 0;
    return Math.min(1, 0.35 + 0.15 * c + 0.35 * box);
  };

  S.readiness = function (exam) {
    const ls = [];
    exam.units.forEach((uid) => { const u = CQ.idx.units[uid]; if (u) u.lessons.forEach((l) => ls.push(l)); });
    if (!ls.length) return 0;
    let m = ls.reduce((a, l) => a + S.lessonMastery(l), 0) / ls.length;
    const runs = S.state.exams[exam.id] || [];
    if (runs.length) {
      const recent = runs.slice(-2).reduce((a, r) => a + r.s, 0) / Math.min(2, runs.length) / 100;
      m = 0.45 * m + 0.55 * recent;
    }
    return Math.round(m * 100);
  };

  /* ---------- daily quests ---------- */
  const QUESTS = [
    { id: 'xp', label: (g) => 'Earn ' + g + ' XP', target: (st) => st.settings.goal, val: (d) => d.xp, gems: 15 },
    { id: 'correct', label: () => 'Answer 25 questions right', target: () => 25, val: (d) => d.correct, gems: 10 },
    { id: 'combo', label: () => 'Hit a 10-answer combo', target: () => 10, val: (d) => d.combo, gems: 15 },
    { id: 'perfect', label: () => 'Finish a lesson with no mistakes', target: () => 1, val: (d) => d.perfect, gems: 15 },
    { id: 'review', label: () => 'Complete a review session', target: () => 1, val: (d) => d.reviews, gems: 10 },
    { id: 'courses', label: () => 'Study 2 different courses', target: () => 2, val: (d) => d.courses.length, gems: 15 },
    { id: 'lessons', label: () => 'Complete 3 lessons', target: () => 3, val: (d) => d.lessons, gems: 15 },
    { id: 'boss', label: () => 'Beat a boss or pass a test', target: () => 1, val: (d) => d.bosses, gems: 20 },
  ];
  S.quests = function () {
    const st = S.state;
    S.rollDay();
    const seed = parseInt(CQ.hash(st.daily.date), 36);
    const R = CQ.rng(seed);
    const pool = QUESTS.filter((q) => q.id !== 'xp');
    const picks = [QUESTS[0]].concat(R.sample(pool, 2));
    return picks.map((q) => {
      const target = q.target(st);
      const val = Math.min(target, q.val(st.daily));
      return { id: q.id, label: q.label(target), target, val, done: val >= target, claimed: st.daily.claimed.includes(q.id), gems: q.gems };
    });
  };
  S.claimQuest = function (id) {
    const q = S.quests().find((x) => x.id === id);
    if (!q || !q.done || q.claimed) return 0;
    S.state.daily.claimed.push(id);
    S.state.gems += q.gems;
    S.save();
    return q.gems;
  };

  /* ---------- achievements ---------- */
  const s = () => S.state.stats;
  S.ACH = [
    { id: 'first', name: 'Liftoff', desc: 'Finish your first lesson', test: () => s().lessons >= 1 },
    { id: 'ten', name: 'Orbit Achieved', desc: 'Finish 10 lessons', test: () => s().lessons >= 10 },
    { id: 'fifty', name: 'Deep Space', desc: 'Finish 50 lessons', test: () => s().lessons >= 50 },
    { id: 'perfect', name: 'Flawless', desc: 'Finish a lesson with zero mistakes', test: () => s().perfect >= 1 },
    { id: 'perfect10', name: 'Precision Engineer', desc: '10 flawless lessons', test: () => s().perfect >= 10 },
    { id: 'combo10', name: 'On Fire', desc: 'Reach a 10-answer combo', test: () => s().maxCombo >= 10 },
    { id: 'combo25', name: 'Unstoppable', desc: 'Reach a 25-answer combo', test: () => s().maxCombo >= 25 },
    { id: 'boss', name: 'Boss Slayer', desc: 'Beat your first unit boss', test: () => s().bosses >= 1 },
    { id: 'boss10', name: 'Dragon Tamer', desc: 'Beat 10 bosses', test: () => s().bosses >= 10 },
    { id: 'streak3', name: 'Warming Up', desc: '3-day streak', test: () => S.state.streak.best >= 3 },
    { id: 'streak7', name: 'Week Warrior', desc: '7-day streak', test: () => S.state.streak.best >= 7 },
    { id: 'streak30', name: 'Unbreakable', desc: '30-day streak', test: () => S.state.streak.best >= 30 },
    { id: 'xp1k', name: 'Kilo-Learner', desc: 'Earn 1,000 XP', test: () => S.state.xp >= 1000 },
    { id: 'xp5k', name: 'Mega-Learner', desc: 'Earn 5,000 XP', test: () => S.state.xp >= 5000 },
    { id: 'legend', name: 'Legendary', desc: 'Earn a Legendary crown', test: () => s().legends >= 1 },
    { id: 'review5', name: 'Memory Palace', desc: 'Finish 5 review sessions', test: () => s().reviews >= 5 },
    { id: 'exam', name: 'Dress Rehearsal', desc: 'Take an exam simulator', test: () => s().exams >= 1 },
    { id: 'exam90', name: 'Exam Ready', desc: 'Score 90%+ on an exam simulator', test: () => Object.values(S.state.exams).some((r) => r.some((x) => x.s >= 90)) },
    { id: 'triple', name: 'Triple Threat', desc: 'Study all 3 courses in one day', test: () => S.state.daily && S.state.daily.courses.length >= 3 },
    { id: 'comeback', name: 'Comeback Kid', desc: 'Finish a lesson after a Rescue', test: () => s().rescues >= 1 },
    { id: 'owl', name: 'Night Owl', desc: 'Finish a lesson after 11 pm', test: () => S._owl },
    { id: 'lark', name: 'Early Bird', desc: 'Finish a lesson before 7 am', test: () => S._lark },
    { id: 'hundred', name: 'Sharpshooter', desc: 'Answer 500 questions right', test: () => s().correct >= 500 },
    { id: 'chest', name: 'Treasure Hunter', desc: 'Open 5 chests', test: () => s().chests >= 5 },
  ];
  S.checkAch = function () {
    const h = new Date().getHours();
    S._owl = h >= 23; S._lark = h < 7;
    const got = [];
    for (const a of S.ACH) {
      if (!S.state.ach[a.id] && a.test()) { S.state.ach[a.id] = CQ.dayKey(); got.push(a); }
    }
    return got;
  };

  S.SKINS = [
    { id: 'classic', name: 'Classic Comet', cost: 0, a: '#FF8A3D', b: '#FFD25A' },
    { id: 'ice', name: 'Ice Comet', cost: 120, a: '#4CC9F0', b: '#C8F3FF' },
    { id: 'plasma', name: 'Plasma', cost: 200, a: '#B14CFF', b: '#FF8DEB' },
    { id: 'aurora', name: 'Aurora', cost: 300, a: '#19C37D', b: '#B8FF6A' },
    { id: 'gold', name: 'Solid Gold', cost: 500, a: '#E0A100', b: '#FFF1A8' },
  ];
})();
