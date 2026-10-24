/* Comet Quest — app shell: skill path, review hub, cheat sheet, profile, modals. */
(function () {
  const CQ = window.CQ;
  const st = () => CQ.store.state;
  const store = () => CQ.store;
  const $ = (s, r = document) => r.querySelector(s);
  const ic = (n, c) => CQ.ic(n, c);
  const esc = CQ.esc;
  const UI = (CQ.ui = { tab: 'learn', sheetCourse: null, reviewCourse: null, peek: false, sheetQuery: '' });

  /* ---------- mascot ---------- */
  let novaId = 0;
  UI.nova = function (mood = 'happy', size = 96, skinId) {
    const skin = store().SKINS.find((s) => s.id === (skinId || st().skin)) || store().SKINS[0];
    const id = 'nv' + ++novaId;
    const ink = '#1E1B3A';
    const mouths = {
      happy: '<path d="M64 64 Q72 72.5 80 64" fill="none" stroke="' + ink + '" stroke-width="3.2" stroke-linecap="round"/>',
      cheer: '<path d="M62.5 62.5 Q72 78 81.5 62.5 Z" fill="' + ink + '"/><path d="M67 69 Q72 73.5 77 69 Q72 66.5 67 69Z" fill="#FF6B8B"/>',
      wow: '<ellipse cx="72" cy="67" rx="4.2" ry="5.2" fill="' + ink + '"/>',
      sad: '<path d="M64.5 69.5 Q72 62.5 79.5 69.5" fill="none" stroke="' + ink + '" stroke-width="3.2" stroke-linecap="round"/>',
      think: '<path d="M65 67.5 Q72 65 79 66.5" fill="none" stroke="' + ink + '" stroke-width="3.2" stroke-linecap="round"/><path d="M76 42 Q82 38.5 87 42" fill="none" stroke="' + ink + '" stroke-width="2.6" stroke-linecap="round"/>',
    };
    const sparkle = mood === 'cheer' ? '<path d="M104 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="' + skin.b + '"/><path d="M98 86l1.4 4 4 1.4-4 1.4-1.4 4-1.4-4-4-1.4 4-1.4z" fill="' + skin.a + '"/>' : '';
    return (
      '<svg class="nova nova-' + mood + '" width="' + size + '" height="' + size * 0.84 + '" viewBox="0 0 120 100" aria-hidden="true">' +
      '<defs><radialGradient id="' + id + 'b" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="' + skin.b + '"/><stop offset="1" stop-color="' + skin.a + '"/></radialGradient>' +
      '<linearGradient id="' + id + 't" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + skin.a + '"/><stop offset="1" stop-color="' + skin.b + '" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="nova-tail"><path d="M50 42 Q22 30 3 8 Q28 42 46 68 Z" fill="url(#' + id + 't)"/>' +
      '<path d="M55 33 Q40 18 30 2 Q42 26 60 31 Z" fill="url(#' + id + 't)" opacity=".8"/>' +
      '<path d="M47 66 Q26 74 9 90 Q30 68 52 74 Z" fill="url(#' + id + 't)" opacity=".7"/></g>' +
      '<circle cx="72" cy="56" r="30" fill="url(#' + id + 'b)"/>' +
      '<circle cx="72" cy="56" r="30" fill="none" stroke="' + skin.a + '" stroke-opacity=".5" stroke-width="2"/>' +
      '<ellipse cx="63" cy="52" rx="6" ry="7" fill="#fff"/><ellipse cx="81" cy="52" rx="6" ry="7" fill="#fff"/>' +
      '<circle class="nova-eye" cx="64.6" cy="53" r="3.4" fill="' + ink + '"/><circle class="nova-eye" cx="82.6" cy="53" r="3.4" fill="' + ink + '"/>' +
      '<circle cx="65.8" cy="51.6" r="1.1" fill="#fff"/><circle cx="83.8" cy="51.6" r="1.1" fill="#fff"/>' +
      '<ellipse cx="57" cy="64" rx="4" ry="2.6" fill="#FF6B8B" opacity=".45"/><ellipse cx="87" cy="64" rx="4" ry="2.6" fill="#FF6B8B" opacity=".45"/>' +
      (mouths[mood] || mouths.happy) + sparkle + '</svg>'
    );
  };

  /* ---------- toasts, modals, confetti ---------- */
  UI.toast = function (html, kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
  };

  UI.modal = function (html, opts = {}) {
    const o = $('#overlay');
    o.innerHTML = '<div class="modal ' + (opts.cls || '') + '" role="dialog" aria-modal="true">' + (opts.noClose ? '' : '<button class="modal-x" data-act="close-modal" aria-label="Close">' + ic('x') + '</button>') + html + '</div>';
    o.hidden = false;
    o.onclick = (e) => { if (e.target === o && !opts.noClose) UI.closeModal(); };
    requestAnimationFrame(() => o.classList.add('show'));
    const f = o.querySelector('[autofocus]') || o.querySelector('.btn');
    if (f) setTimeout(() => f.focus(), 50);
  };
  UI.closeModal = function () {
    const o = $('#overlay');
    o.classList.remove('show');
    o.hidden = true;
    o.innerHTML = '';
  };

  UI.confetti = function (n = 140) {
    if (!st().settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const W = (cv.width = innerWidth * devicePixelRatio);
    const H = (cv.height = innerHeight * devicePixelRatio);
    const cols = ['#FF6B3D', '#FFC531', '#3FC1FF', '#2BD46B', '#B14CFF', '#FF6B8B'];
    const ps = Array.from({ length: n }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
      vx: (Math.random() - 0.5) * 26 * devicePixelRatio, vy: (-Math.random() * 22 - 6) * devicePixelRatio,
      s: (5 + Math.random() * 7) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: cols[Math.floor(Math.random() * cols.length)],
    }));
    let f = 0;
    cv.hidden = false;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.9 * devicePixelRatio; p.vx *= 0.985; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (++f < 120) requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); cv.hidden = true; }
    })();
  };

  /* ---------- shared bits ---------- */
  const course = () => CQ.courses[st().course] || CQ.courses[CQ.courseOrder[0]];
  const courseIcon = (c) => ic(c.icon || 'star');
  UI.ring = function (pct, size = 56, stroke = 7, label) {
    const r = (size - stroke) / 2, C = 2 * Math.PI * r;
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-bg" stroke-width="' + stroke + '"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-fg" stroke-width="' + stroke + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C * (1 - Math.min(1, pct)) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' + (label != null ? '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle">' + label + '</text>' : '') + '</svg>';
  };
  UI.statPills = function () {
    const s = st();
    const lv = store().level();
    const today = s.streak.last === CQ.dayKey();
    return '<div class="pills">' +
      '<button class="pill streak ' + (today ? 'lit' : '') + '" data-act="streak-info" aria-label="Streak">' + ic('flame') + '<span>' + s.streak.n + '</span></button>' +
      '<button class="pill gems" data-act="tab" data-tab="profile" data-scroll="shop" aria-label="Gems">' + ic('gem') + '<span>' + s.gems + '</span></button>' +
      '<button class="pill lvl" data-act="tab" data-tab="profile" aria-label="Level">' + ic('star') + '<span>' + lv.n + '</span></button></div>';
  };
  UI.courseSwitch = function () {
    const c = course();
    return '<button class="course-switch" data-act="course-menu" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '">' +
      '<span class="cs-ic">' + courseIcon(c) + '</span><span class="cs-txt"><b>' + c.code + '</b><small>' + c.name + '</small></span>' + ic('back', 'rot') + '</button>';
  };

  /* ---------- LEARN: skill path ---------- */
  const OFFS = [0, -54, -82, -54, 0, 54, 82, 54];
  UI.renderLearn = function () {
    const c = course();
    const nxt = store().nextLesson(c.id);
    let h = '<header class="topbar">' + UI.courseSwitch() + UI.statPills() + '</header>';
    h += '<section class="today-strip">' + UI.goalCard(true) + '</section>';
    h += '<section class="course-head" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '"><div><div class="eyebrow">' + esc(c.code) + ' · ' + esc(c.school || 'UT Dallas') + '</div><h1>' + esc(c.name) + '</h1><p>' + esc(c.book) + '</p></div>' +
      '<div class="ch-prog">' + UI.ring(store().courseProgress(c.id), 64, 8, Math.round(store().courseProgress(c.id) * 100) + '%') + '</div></section>';
    c.units.forEach((u) => {
      const open = store().unitOpen(u);
      const beaten = store().unitBeaten(u);
      h += '<section class="unit ' + (open ? '' : 'locked') + '" id="u-' + u.id + '" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '">';
      h += '<div class="unit-banner"><div class="ub-txt"><div class="eyebrow">Unit ' + u.n + (u.ch ? ' · ' + esc(u.ch) : '') + '</div><h2>' + esc(u.title) + '</h2><p>' + esc(u.sub || '') + '</p></div>' +
        '<div class="ub-btns"><button class="btn-ghost sm" data-act="guide" data-unit="' + u.id + '">' + ic('book') + '<span>Guidebook</span></button>' +
        (!open ? '<button class="btn-ghost sm" data-act="jump" data-unit="' + u.id + '">' + ic('bolt') + '<span>Jump here</span></button>' : '') + '</div></div>';
      h += '<div class="path">';
      let k = 0;
      const node = (inner) => { const x = OFFS[k % OFFS.length]; k++; return '<div class="node-wrap" style="--x:' + x + 'px">' + inner + '</div>'; };
      u.lessons.forEach((l, i) => {
        const cr = store().crowns(l.id);
        const lopen = store().lessonOpen(l);
        const cur = nxt && nxt.lesson === l;
        const x = OFFS[k % OFFS.length];
        const cls = !lopen ? 'locked' : cr >= 3 ? 'legend' : cr >= 1 ? 'done' : 'open';
        let inner = '<button class="node ' + cls + (cur ? ' current' : '') + '" data-act="node" data-lesson="' + l.id + '" aria-label="' + esc(l.title) + '">' +
          (cr >= 1 ? ic(cr >= 3 ? 'crown' : 'check') : !lopen ? ic('lock') : ic('star')) +
          (cr >= 1 ? '<span class="crowns">' + '<i></i>'.repeat(cr) + '<s></s>'.repeat(3 - cr) + '</span>' : '') + '</button>' +
          '<span class="node-label">' + esc(l.title) + '</span>';
        if (cur) inner = '<div class="start-bubble">' + (store().crowns(l.id) ? 'NEXT' : 'START') + '</div>' + inner + '<div class="path-nova ' + (x > 0 ? 'l' : 'r') + '">' + UI.nova('happy', 64) + '</div>';
        h += cur ? node(inner).replace('class="node-wrap"', 'class="node-wrap has-bubble"') : node(inner);
        if (i + 1 === store().chestAfter(u)) {
          const got = st().units[u.id] && st().units[u.id].chest;
          const can = store().chestOpen(u);
          h += node('<button class="node chest ' + (got ? 'claimed' : can ? 'ready' : 'locked') + '" data-act="chest" data-unit="' + u.id + '" aria-label="Treasure chest">' + ic('chest') + '</button>');
        }
      });
      const bopen = store().bossOpen(u);
      const bcur = nxt && nxt.boss === u;
      h += (bcur ? (s) => s.replace('class="node-wrap"', 'class="node-wrap has-bubble"') : (s) => s)(node((bcur ? '<div class="start-bubble boss">BOSS</div>' : '') + '<button class="node boss ' + (beaten ? 'beaten' : bopen ? 'open' : 'locked') + (bcur ? ' current' : '') + '" data-act="boss" data-unit="' + u.id + '" aria-label="Unit boss">' + ic(beaten ? 'trophy' : bopen ? 'skull' : 'lock') + '</button><span class="node-label">' + (beaten ? 'Boss beaten' : 'Unit boss') + '</span>'));
      h += '</div></section>';
    });
    h += '<div class="path-end">' + UI.nova('cheer', 88) + '<p>Finish every unit and the final exam simulator is all yours.</p></div>';
    $('#main').innerHTML = h;
    UI.renderSide();
    if (!UI._scrolled) {
      UI._scrolled = true;
      requestAnimationFrame(() => { const cur = $('.node.current'); if (cur) cur.scrollIntoView({ block: 'center' }); });
    }
  };

  UI.goalCard = function (compact) {
    const s = st();
    store().rollDay();
    const g = s.settings.goal;
    const pct = Math.min(1, s.daily.xp / g);
    const qs = store().quests();
    const ready = qs.filter((q) => q.done && !q.claimed).length;
    return '<div class="goal-card ' + (compact ? 'compact' : '') + '">' + UI.ring(pct, compact ? 46 : 64, compact ? 6 : 8, compact ? '' : Math.round(pct * 100) + '%') +
      '<div class="gc-txt"><b>Daily goal</b><span>' + s.daily.xp + ' / ' + g + ' XP</span></div>' +
      (compact ? '<button class="btn-ghost sm" data-act="quests">' + ic('target') + '<span>Quests' + (ready ? ' · ' + ready : '') + '</span></button>' : '') + '</div>';
  };

  UI.questList = function () {
    return store().quests().map((q) =>
      '<div class="quest ' + (q.claimed ? 'claimed' : q.done ? 'done' : '') + '"><div class="q-txt"><b>' + esc(q.label) + '</b>' +
      '<div class="bar"><i style="width:' + (q.val / q.target) * 100 + '%"></i><span>' + q.val + ' / ' + q.target + '</span></div></div>' +
      (q.claimed ? '<span class="q-claimed">' + ic('check') + '</span>' : q.done ? '<button class="btn sm gold" data-act="claim" data-q="' + q.id + '">' + ic('gem') + ' ' + q.gems + '</button>' : '<span class="q-gem">' + ic('gem') + q.gems + '</span>') + '</div>').join('');
  };

  UI.upNext = function () {
    return CQ.courseOrder.map((cid) => {
      const c = CQ.courses[cid];
      const n = store().nextLesson(cid);
      const label = n ? (n.lesson ? n.lesson.title : 'Unit ' + n.boss.n + ' boss') : 'All caught up';
      return '<button class="upnext" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '" data-act="upnext" data-course="' + cid + '"' + (n ? '' : ' disabled') + '><span class="un-ic">' + courseIcon(c) + '</span><span class="un-txt"><small>' + c.code + '</small><b>' + esc(label) + '</b></span>' + ic('play') + '</button>';
    }).join('');
  };

  UI.renderSide = function () {
    const side = $('#side');
    if (!side) return;
    const due = store().dueKeys().length;
    const c = course();
    side.innerHTML = UI.statPills() +
      '<div class="panel">' + UI.goalCard(false) + '</div>' +
      '<div class="panel"><h3>Daily quests</h3>' + UI.questList() + '</div>' +
      '<div class="panel"><h3>Up next</h3>' + UI.upNext() + (due ? '<button class="btn wide blue" data-act="start-review">' + ic('review') + ' Review ' + due + ' due</button>' : '') + '</div>' +
      '<div class="panel"><h3>Exam readiness · ' + c.code + '</h3>' + c.exams.map((e) => { const r = store().readiness(e); return '<div class="ready-row"><span>' + esc(e.name) + '</span><div class="bar ' + (r >= 85 ? 'good' : r >= 60 ? 'mid' : '') + '"><i style="width:' + r + '%"></i></div><b>' + r + '%</b></div>'; }).join('') + '<button class="btn-ghost sm wide" data-act="tab" data-tab="review">Open exam simulators</button></div>';
  };

  /* ---------- node actions ---------- */
  UI.openLesson = function (lid) {
    const l = CQ.idx.lessons[lid];
    const u = CQ.idx.units[l.unit];
    const c = CQ.courses[l.course];
    const cr = store().crowns(lid);
    if (!store().lessonOpen(l)) {
      UI.modal('<div class="sheet-head" style="--hue:' + c.color + '"><div class="eyebrow">Unit ' + u.n + ' · Lesson ' + l.n + '</div><h2>' + esc(l.title) + '</h2></div><p class="muted">Finish the lesson before this one to unlock it, or use <b>Jump here</b> on a later unit to test out.</p><button class="btn wide" data-act="close-modal">Got it</button>');
      return;
    }
    const exN = l.cards.filter(CQ.isExercise).length;
    const crownRow = [1, 2, 3].map((n) => '<span class="crown-step ' + (cr >= n ? 'on' : '') + '">' + ic('crown') + '<small>' + ['Learn', 'Level up', 'Legendary'][n - 1] + '</small></span>').join('');
    let btns = '';
    if (cr < 1) btns += '<button class="btn wide" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="go" data-mode="learn" data-lesson="' + lid + '">Start lesson · +' + (10 + exN * 2) + ' XP</button>';
    else {
      btns += '<button class="btn wide ' + (cr >= 2 ? 'ghost' : '') + '" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="go" data-mode="levelup" data-lesson="' + lid + '">' + (cr >= 2 ? 'Practice again' : 'Level up · crown 2') + '</button>';
      btns += '<button class="btn wide gold ' + (cr >= 2 ? '' : 'ghost') + '" data-act="go" data-mode="legend" data-lesson="' + lid + '">' + ic('crown') + ' Legendary · 3 hearts, no hints</button>';
      btns += '<button class="btn-ghost wide" data-act="go" data-mode="learn" data-lesson="' + lid + '">Replay the full lesson</button>';
    }
    UI.modal('<div class="sheet-head" style="--hue:' + c.color + '"><div class="eyebrow">Unit ' + u.n + ' · Lesson ' + l.n + ' of ' + u.lessons.length + '</div><h2>' + esc(l.title) + '</h2></div>' +
      '<p class="goal">' + ic('target') + '<span>' + CQ.inl(l.goal || '') + '</span></p>' +
      '<div class="crown-steps">' + crownRow + '</div>' +
      (cr >= 1 && l.key ? '<details class="keyidea"><summary>Key idea</summary><div>' + CQ.md(l.key) + '</div></details>' : '') +
      '<div class="btn-stack">' + btns + '</div>', { cls: 'lesson-sheet' });
  };

  UI.openBoss = function (uid) {
    const u = CQ.idx.units[uid];
    const c = CQ.courses[u.course];
    if (!store().bossOpen(u)) {
      UI.modal('<h2>Boss locked</h2><p class="muted">Finish every lesson in Unit ' + u.n + ' to face the boss.</p><button class="btn wide" data-act="close-modal">Okay</button>');
      return;
    }
    const beaten = store().unitBeaten(u);
    UI.modal('<div class="boss-hero">' + ic(beaten ? 'trophy' : 'skull') + '</div><div class="eyebrow center">Unit ' + u.n + ' boss</div><h2 class="center">' + esc(u.title) + '</h2>' +
      '<p class="muted center">12 exam-style questions from the whole unit. You have 3 hearts. Run out and the boss wins this round.</p>' +
      '<div class="btn-stack"><button class="btn wide" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="go" data-mode="boss" data-unit="' + uid + '">' + (beaten ? 'Fight again' : 'Fight the boss') + '</button></div>', { cls: 'boss-sheet' });
  };

  UI.openJump = function (uid) {
    const u = CQ.idx.units[uid];
    const c = CQ.courses[u.course];
    UI.modal('<div class="boss-hero jump">' + ic('bolt') + '</div><h2 class="center">Jump to Unit ' + u.n + '?</h2>' +
      '<p class="muted center">Take a 12-question test on Units 1–' + (u.n - 1) + '. Pass it with at least one heart left and everything before Unit ' + u.n + ' unlocks.</p>' +
      '<div class="btn-stack"><button class="btn wide" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="go" data-mode="jump" data-unit="' + uid + '">Start placement test</button><button class="btn-ghost wide" data-act="close-modal">Not now</button></div>');
  };

  UI.openChest = function (uid) {
    const u = CQ.idx.units[uid];
    const rec = st().units[uid] || {};
    if (rec.chest) { UI.toast('You already opened this chest.'); return; }
    if (!store().chestOpen(u)) { UI.toast(ic('lock') + ' Finish the lessons before this chest to open it.'); return; }
    const gems = 10 + Math.floor(Math.random() * 4) * 5;
    st().units[uid] = Object.assign(rec, { chest: true });
    st().gems += gems;
    st().stats.chests++;
    store().checkAch();
    store().save();
    CQ.sfx('chest');
    UI.confetti(80);
    UI.modal('<div class="chest-open">' + ic('chest') + '</div><h2 class="center">+' + gems + ' gems</h2><p class="muted center">Spend them on streak freezes and new looks for Nova in the shop.</p><button class="btn wide gold" data-act="close-modal">Collect</button>');
    UI.render();
  };

  UI.openGuide = function (uid) {
    const u = CQ.idx.units[uid];
    const c = CQ.courses[u.course];
    let h = '<div class="sheet-head" style="--hue:' + c.color + '"><div class="eyebrow">Guidebook · Unit ' + u.n + '</div><h2>' + esc(u.title) + '</h2></div>';
    u.lessons.forEach((l) => {
      h += '<div class="guide-l"><h3>' + l.n + '. ' + esc(l.title) + '</h3>' + (l.goal ? '<p class="muted">' + CQ.inl(l.goal) + '</p>' : '') + (l.key ? CQ.md(l.key) : '') +
        (l.formulas ? '<div class="formulas">' + l.formulas.map((f) => '<div class="formula"><span class="m">' + CQ.inl(f) + '</span></div>').join('') + '</div>' : '') + '</div>';
    });
    UI.modal(h, { cls: 'guide' });
  };

  UI.courseMenu = function () {
    UI.modal('<h2>Choose a course</h2><div class="course-list">' + CQ.courseOrder.map((cid) => {
      const c = CQ.courses[cid];
      const p = store().courseProgress(cid);
      return '<button class="course-opt ' + (cid === st().course ? 'on' : '') + '" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '" data-act="set-course" data-course="' + cid + '"><span class="co-ic">' + courseIcon(c) + '</span><span class="co-txt"><b>' + c.code + '</b><span>' + esc(c.name) + '</span><span class="bar"><i style="width:' + p * 100 + '%"></i></span></span></button>';
    }).join('') + '</div>');
  };

  /* ---------- REVIEW hub ---------- */
  UI.renderReview = function () {
    const rc = UI.reviewCourse;
    const due = store().dueKeys(rc).length;
    const weak = store().weakKeys(rc).length;
    const chips = '<div class="chips"><button class="chip ' + (!rc ? 'on' : '') + '" data-act="review-course" data-course="">All courses</button>' +
      CQ.courseOrder.map((cid) => '<button class="chip ' + (rc === cid ? 'on' : '') + '" data-act="review-course" data-course="' + cid + '">' + CQ.courses[cid].code + '</button>').join('') + '</div>';
    let h = '<header class="topbar"><h1 class="page-title">Review</h1>' + UI.statPills() + '</header>' + chips;
    h += '<div class="review-grid">' +
      '<div class="rv-card blue"><div class="rv-ic">' + ic('review') + '</div><div><h3>Spaced review</h3><p>' + (due ? due + ' question' + (due === 1 ? '' : 's') + ' due. Reviewing right before you forget is what makes it stick.' : 'Nothing due right now. Questions you answer come back here on a schedule.') + '</p></div>' +
      '<button class="btn blue" data-act="start-review"' + (Object.keys(st().srs).length ? '' : ' disabled') + '>' + (due ? 'Review now' : 'Practice anyway') + '</button></div>' +
      '<div class="rv-card red"><div class="rv-ic">' + ic('target') + '</div><div><h3>Weak spots</h3><p>' + (weak ? weak + ' question' + (weak === 1 ? '' : 's') + ' you have missed before, hardest first.' : 'No misses yet. Questions you get wrong land here.') + '</p></div>' +
      '<button class="btn red" data-act="start-weak"' + (weak ? '' : ' disabled') + '>Drill weak spots</button></div></div>';
    h += '<h2 class="sec-title">' + ic('flag') + ' Exam simulators</h2><p class="muted sec-sub">Timed, no feedback until you submit, mixed the way the real exam is. Aim for 85% on two runs in a row.</p>';
    const list = rc ? [rc] : CQ.courseOrder;
    list.forEach((cid) => {
      const c = CQ.courses[cid];
      h += '<div class="exam-course" style="--hue:' + c.color + ';--hue-dk:' + c.dark + '"><h3>' + courseIcon(c) + ' ' + c.code + ' · ' + esc(c.name) + '</h3><div class="exam-grid">';
      c.exams.forEach((e) => {
        const r = store().readiness(e);
        const runs = st().exams[e.id] || [];
        const last = runs.length ? runs[runs.length - 1].s : null;
        const units = e.units.map((uid) => CQ.idx.units[uid]).filter(Boolean);
        h += '<div class="exam-card">' + UI.ring(r / 100, 64, 8, r + '%') + '<div class="ex-txt"><b>' + esc(e.name) + '</b><small>' + (units.length ? 'Units ' + units[0].n + '–' + units[units.length - 1].n : '') + (e.note ? ' · ' + esc(e.note) : '') + '</small><small>' + (e.n || 20) + ' questions · ' + (e.mins || Math.round((e.n || 20) * 2.25)) + ' min' + (last != null ? ' · last ' + last + '%' : '') + '</small></div>' +
          '<button class="btn sm" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="exam" data-course="' + cid + '" data-exam="' + e.id + '"' + (units.length ? '' : ' disabled') + '>Start</button></div>';
      });
      h += '</div></div>';
    });
    $('#main').innerHTML = h;
    UI.renderSide();
  };

  UI.openExam = function (cid, eid) {
    const c = CQ.courses[cid];
    const e = c.exams.find((x) => x.id === eid);
    const mins = e.mins || Math.round((e.n || 20) * 2.25);
    UI.modal('<div class="boss-hero exam">' + ic('clock') + '</div><h2 class="center">' + c.code + ' · ' + esc(e.name) + '</h2><p class="muted center">' + (e.n || 20) + ' questions in ' + mins + ' minutes. You get no feedback until the end, just like the real thing. Then you get a full review with solutions.</p>' +
      '<div class="btn-stack"><button class="btn wide" style="--b:' + c.color + ';--bd:' + c.dark + '" data-act="go" data-mode="exam" data-course="' + cid + '" data-exam="' + eid + '">Start the clock</button><button class="btn-ghost wide" data-act="close-modal">Not yet</button></div>');
  };

  /* ---------- CHEAT SHEET ---------- */
  UI.renderSheet = function () {
    const cid = UI.sheetCourse || st().course;
    const c = CQ.courses[cid];
    const q = UI.sheetQuery.trim().toLowerCase();
    let h = '<header class="topbar"><h1 class="page-title">Cheat sheet</h1>' + UI.statPills() + '</header>';
    h += '<div class="chips">' + CQ.courseOrder.map((x) => '<button class="chip ' + (x === cid ? 'on' : '') + '" data-act="sheet-course" data-course="' + x + '">' + CQ.courses[x].code + '</button>').join('') +
      '<label class="chip toggle"><input type="checkbox" id="peek" ' + (UI.peek ? 'checked' : '') + '> Show locked</label></div>';
    h += '<input class="search" id="sheet-q" type="search" placeholder="Search formulas and ideas" value="' + esc(UI.sheetQuery) + '">';
    h += '<p class="muted sec-sub">Every key idea and formula you have unlocked in ' + c.code + '. Finish a lesson to add its entry.</p>';
    c.units.forEach((u) => {
      const ls = u.lessons.filter((l) => !q || (l.title + ' ' + (l.key || '') + ' ' + (l.formulas || []).join(' ')).toLowerCase().includes(q));
      if (!ls.length) return;
      h += '<section class="sheet-unit" style="--hue:' + c.color + '"><h2><span class="eyebrow">Unit ' + u.n + (u.ch ? ' · ' + esc(u.ch) : '') + '</span>' + esc(u.title) + '</h2><div class="sheet-grid">';
      ls.forEach((l) => {
        const got = store().crowns(l.id) >= 1;
        h += '<article class="sheet-card ' + (got || UI.peek ? '' : 'blur') + '"><h3>' + esc(l.title) + (got ? '' : ' <span class="lock-tag">' + ic('lock') + '</span>') + '</h3>' +
          (l.formulas ? '<div class="formulas">' + l.formulas.map((f) => '<div class="formula"><span class="m">' + CQ.inl(f) + '</span></div>').join('') + '</div>' : '') +
          (l.key ? '<div class="sk">' + CQ.md(l.key) + '</div>' : '') + '</article>';
      });
      h += '</div></section>';
    });
    $('#main').innerHTML = h;
    UI.renderSide();
    const inp = $('#sheet-q');
    inp.oninput = () => { UI.sheetQuery = inp.value; const pos = inp.selectionStart; UI.renderSheet(); const n = $('#sheet-q'); n.focus(); n.setSelectionRange(pos, pos); };
    $('#peek').onchange = (e) => { UI.peek = e.target.checked; UI.renderSheet(); };
  };

  /* ---------- PROFILE ---------- */
  UI.renderProfile = function () {
    const s = st();
    const lv = store().level();
    const t = s.stats;
    const acc = t.answered ? Math.round((t.correct / t.answered) * 100) : 0;
    let h = '<header class="topbar"><h1 class="page-title">Profile</h1>' + UI.statPills() + '</header>';
    h += '<section class="prof-hero"><div class="ph-nova">' + UI.nova('cheer', 120) + '</div><div class="ph-txt"><div class="eyebrow">Level ' + lv.n + '</div><h2>' + esc(lv.title) + '</h2>' +
      '<div class="bar xp"><i style="width:' + (lv.cur / lv.span) * 100 + '%"></i><span>' + lv.cur + ' / ' + lv.span + ' XP to level ' + (lv.n + 1) + '</span></div><small class="muted">' + s.xp.toLocaleString() + ' XP total</small></div></section>';
    const tile = (icn, v, l, cls) => '<div class="stat ' + cls + '">' + ic(icn) + '<b>' + v + '</b><span>' + l + '</span></div>';
    h += '<div class="stats">' + tile('flame', s.streak.n, 'day streak', 'orange') + tile('trophy', s.streak.best, 'best streak', 'gold') + tile('book', t.lessons, 'lessons', 'blue') + tile('target', acc + '%', 'accuracy', 'green') +
      tile('bolt', t.maxCombo, 'best combo', 'purple') + tile('skull', t.bosses, 'bosses beaten', 'red') + tile('clock', Math.round(t.ms / 60000), 'minutes', 'teal') + tile('crown', Object.values(s.lessons).filter((x) => x.c >= 3).length, 'legendary', 'gold') + '</div>';
    // heatmap: last 12 weeks
    h += '<h2 class="sec-title">' + ic('chart') + ' Study calendar</h2><div class="heat-wrap"><div class="heat">';
    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 83 - today.getDay());
    for (let i = 0; i < 84 + today.getDay() + 1; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      if (d > today) break;
      const k = CQ.dayKey(d);
      const xp = s.history[k] || 0;
      const lvl = xp === 0 ? 0 : xp < 20 ? 1 : xp < 50 ? 2 : xp < 100 ? 3 : 4;
      h += '<i class="h' + lvl + (s.streak.frozen.includes(k) ? ' frz' : '') + '" title="' + k + ': ' + xp + ' XP"></i>';
    }
    h += '</div><div class="heat-key"><span>less</span><i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><span>more</span></div></div>';
    // achievements
    const got = store().ACH.filter((a) => s.ach[a.id]).length;
    h += '<h2 class="sec-title">' + ic('trophy') + ' Achievements <small>' + got + ' / ' + store().ACH.length + '</small></h2><div class="ach-grid">' +
      store().ACH.map((a) => '<div class="ach ' + (s.ach[a.id] ? 'got' : '') + '"><span class="ach-ic">' + ic(s.ach[a.id] ? 'trophy' : 'lock') + '</span><b>' + esc(a.name) + '</b><small>' + esc(a.desc) + '</small></div>').join('') + '</div>';
    // shop
    h += '<h2 class="sec-title" id="shop">' + ic('gem') + ' Shop <small>' + s.gems + ' gems</small></h2><div class="shop">';
    h += '<div class="shop-item"><span class="si-ic freeze">' + ic('snow') + '</span><div><b>Streak freeze</b><small>Covers one missed day automatically. You have ' + s.streak.freezes + ' / 3.</small></div><button class="btn sm blue" data-act="buy-freeze"' + (s.gems >= 50 && s.streak.freezes < 3 ? '' : ' disabled') + '>' + ic('gem') + ' 50</button></div>';
    store().SKINS.forEach((k) => {
      const own = s.owned.includes(k.id);
      h += '<div class="shop-item"><span class="si-nova">' + UI.nova('happy', 54, k.id) + '</span><div><b>' + esc(k.name) + '</b><small>' + (s.skin === k.id ? 'Equipped' : own ? 'Owned' : 'A new look for Nova') + '</small></div>' +
        (s.skin === k.id ? '<span class="tag">On</span>' : own ? '<button class="btn sm ghost" data-act="skin" data-skin="' + k.id + '">Wear</button>' : '<button class="btn sm gold" data-act="buy-skin" data-skin="' + k.id + '"' + (s.gems >= k.cost ? '' : ' disabled') + '>' + ic('gem') + ' ' + k.cost + '</button>') + '</div>';
    });
    h += '</div>';
    // settings
    const se = s.settings;
    const tog = (k, label, sub) => '<label class="set-row"><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><input type="checkbox" class="switch" id="set-' + k + '" data-set="' + k + '" ' + (se[k] ? 'checked' : '') + '></label>';
    h += '<h2 class="sec-title">' + ic('cog') + ' Settings</h2><div class="settings">' +
      '<div class="set-row"><span><b>Daily goal</b><small>About 25 XP is one lesson</small></span><select id="set-goal" data-setsel="goal">' + [[20, 'Casual · 20'], [50, 'Regular · 50'], [100, 'Serious · 100'], [150, 'Intense · 150']].map(([v, l]) => '<option value="' + v + '" ' + (se.goal === v ? 'selected' : '') + '>' + l + ' XP</option>').join('') + '</select></div>' +
      '<div class="set-row"><span><b>Theme</b></span><select id="set-theme" data-setsel="theme">' + [['system', 'Match system'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => '<option value="' + v + '" ' + (se.theme === v ? 'selected' : '') + '>' + l + '</option>').join('') + '</select></div>' +
      tog('sound', 'Sound effects') + tog('haptics', 'Vibration', 'On phones that support it') + tog('motion', 'Animations', 'Confetti and motion effects') +
      tog('freeRoam', 'Free roam', 'Unlock every lesson, boss and unit right now') +
      '</div>';
    h += '<h2 class="sec-title">' + ic('copy') + ' Your save</h2><div class="settings"><p class="muted">Progress saves in this browser' + (store().cloud.ref ? ' and syncs to your account' : '') + '. To move it to another device, copy your save code and paste it there.</p>' +
      '<div class="btn-row"><button class="btn sm ghost" data-act="export">Copy save code</button><button class="btn sm ghost" data-act="import">Paste a save code</button><button class="btn sm red ghost" data-act="reset">Reset progress</button></div></div>';
    $('#main').innerHTML = h;
    UI.renderSide();
    document.querySelectorAll('[data-set]').forEach((el) => { el.onchange = () => { st().settings[el.dataset.set] = el.checked; store().save(); if (el.dataset.set === 'freeRoam') UI.toast(el.checked ? 'Free roam on: everything is unlocked.' : 'Free roam off.'); UI.renderSide(); }; });
    document.querySelectorAll('[data-setsel]').forEach((el) => { el.onchange = () => { const k = el.dataset.setsel; st().settings[k] = k === 'goal' ? +el.value : el.value; store().save(); if (k === 'theme') UI.applyTheme(); UI.renderSide(); }; });
  };

  UI.applyTheme = function () {
    const t = st().settings.theme;
    const root = document.documentElement;
    if (t === 'light' || t === 'dark') { root.setAttribute('data-theme', t); UI._themeSet = true; }
    else if (UI._themeSet) { root.removeAttribute('data-theme'); UI._themeSet = false; }
  };

  /* ---------- onboarding ---------- */
  UI.onboard = function () {
    UI.modal('<div class="onb">' + UI.nova('cheer', 130) + '<h2>Hi, I\'m Nova.</h2><p>I\'ll get you exam-ready for <b>PHYS 2325</b>, <b>CHEM 1311</b> and <b>MECH 1208</b>, one short lesson at a time.</p>' +
      '<div class="onb-pts"><div>' + ic('book') + '<span><b>Learn it.</b> Each lesson teaches one idea, then makes you use it.</span></div><div>' + ic('review') + '<span><b>Keep it.</b> Questions come back right before you\'d forget them.</span></div><div>' + ic('flag') + '<span><b>Prove it.</b> Bosses and timed exam simulators show when you\'re ready.</span></div></div>' +
      '<label class="onb-goal"><b>Daily goal</b><select id="onb-goal">' + [[20, 'Casual · 20 XP · ~10 min'], [50, 'Regular · 50 XP · ~20 min'], [100, 'Serious · 100 XP · ~40 min']].map(([v, l]) => '<option value="' + v + '" ' + (v === 50 ? 'selected' : '') + '>' + l + '</option>').join('') + '</select></label>' +
      '<p class="muted small">Already partway through the semester? Use <b>Jump here</b> on any unit to test out of what you know.</p>' +
      '<button class="btn wide" data-act="onboard-done" autofocus>Let\'s go</button></div>', { noClose: true, cls: 'onb-modal' });
  };

  /* ---------- tabs & render ---------- */
  UI.render = function () {
    document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === UI.tab && b.closest('.nav')));
    if (UI.tab === 'review') UI.renderReview();
    else if (UI.tab === 'sheet') UI.renderSheet();
    else if (UI.tab === 'profile') UI.renderProfile();
    else UI.renderLearn();
  };
  UI.go = function (tab, scrollTo) {
    UI.tab = tab;
    try { history.replaceState(null, '', '#' + tab); } catch (e) { /* sandboxed */ }
    UI.render();
    const m = $('#main');
    if (scrollTo) requestAnimationFrame(() => { const el = document.getElementById(scrollTo); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    else if (tab !== 'learn') window.scrollTo(0, 0);
    if (m) m.focus({ preventScroll: true });
  };

  /* ---------- actions ---------- */
  const A = (UI.actions = {
    tab: (el) => { UI.closeModal(); UI.go(el.dataset.tab, el.dataset.scroll); },
    'close-modal': () => UI.closeModal(),
    'course-menu': () => UI.courseMenu(),
    'set-course': (el) => { st().course = el.dataset.course; store().save(); UI.closeModal(); UI._scrolled = false; UI.go('learn'); },
    node: (el) => UI.openLesson(el.dataset.lesson),
    boss: (el) => UI.openBoss(el.dataset.unit),
    jump: (el) => UI.openJump(el.dataset.unit),
    chest: (el) => UI.openChest(el.dataset.unit),
    guide: (el) => UI.openGuide(el.dataset.unit),
    go: (el) => { UI.closeModal(); CQ.player.start(el.dataset.mode, { lesson: el.dataset.lesson, unit: el.dataset.unit, course: el.dataset.course, exam: el.dataset.exam }); },
    exam: (el) => UI.openExam(el.dataset.course, el.dataset.exam),
    upnext: (el) => {
      const n = store().nextLesson(el.dataset.course);
      if (!n) return;
      if (st().course !== el.dataset.course) { st().course = el.dataset.course; store().save(); }
      if (n.lesson) UI.openLesson(n.lesson.id); else UI.openBoss(n.boss.id);
      if (UI.tab === 'learn') UI.renderLearn();
    },
    'start-review': () => CQ.player.start('review', { course: UI.tab === 'review' ? UI.reviewCourse : null }),
    'start-weak': () => CQ.player.start('weak', { course: UI.reviewCourse }),
    'review-course': (el) => { UI.reviewCourse = el.dataset.course || null; UI.renderReview(); },
    'sheet-course': (el) => { UI.sheetCourse = el.dataset.course; UI.renderSheet(); },
    quests: () => UI.modal('<h2>Daily quests</h2><p class="muted">New quests every day at midnight.</p>' + UI.questList()),
    claim: (el) => { const g = store().claimQuest(el.dataset.q); if (g) { CQ.sfx('chest'); UI.toast(ic('gem') + ' +' + g + ' gems', 'gold'); } if ($('#overlay').hidden) UI.render(); else { UI.closeModal(); A.quests(); UI.render(); } },
    'streak-info': () => {
      const s = st();
      UI.modal('<div class="boss-hero streak">' + ic('flame') + '</div><h2 class="center">' + s.streak.n + '-day streak</h2><p class="muted center">' + (s.streak.last === CQ.dayKey() ? 'You studied today. Come back tomorrow to keep it going.' : 'Finish any lesson or review today to extend your streak.') + '</p><p class="center"><b>' + s.streak.freezes + '</b> streak freeze' + (s.streak.freezes === 1 ? '' : 's') + ' equipped · best streak <b>' + s.streak.best + '</b></p><button class="btn wide" data-act="close-modal">Keep learning</button>');
    },
    'buy-freeze': () => { const s = st(); if (s.gems >= 50 && s.streak.freezes < 3) { s.gems -= 50; s.streak.freezes++; store().save(); CQ.sfx('chest'); UI.toast(ic('snow') + ' Streak freeze equipped'); UI.renderProfile(); } },
    'buy-skin': (el) => { const s = st(); const k = store().SKINS.find((x) => x.id === el.dataset.skin); if (k && s.gems >= k.cost && !s.owned.includes(k.id)) { s.gems -= k.cost; s.owned.push(k.id); s.skin = k.id; store().save(); CQ.sfx('level'); UI.toast('Nova is now ' + esc(k.name)); UI.renderProfile(); } },
    skin: (el) => { st().skin = el.dataset.skin; store().save(); UI.renderProfile(); },
    export: () => {
      const code = store().exportCode();
      UI.modal('<h2>Your save code</h2><p class="muted">Paste this into Comet Quest on another device (Profile → Paste a save code).</p><textarea class="code" id="exp-code" readonly>' + code + '</textarea><button class="btn wide" data-act="copy-code">' + ic('copy') + ' Copy</button>');
      setTimeout(() => { const t = $('#exp-code'); t.focus(); t.select(); }, 60);
    },
    'copy-code': () => {
      const t = $('#exp-code');
      const done = () => UI.toast(ic('check') + ' Copied');
      try { navigator.clipboard.writeText(t.value).then(done, () => { t.select(); UI.toast('Selected. Press Ctrl/Cmd+C to copy.'); }); } catch (e) { t.select(); UI.toast('Selected. Press Ctrl/Cmd+C to copy.'); }
    },
    import: () => UI.modal('<h2>Paste a save code</h2><p class="muted">This replaces the progress in this browser.</p><textarea class="code" id="imp-code" placeholder="Paste your code here"></textarea><p class="err" id="imp-err" hidden></p><button class="btn wide" data-act="do-import">Load save</button>'),
    'do-import': () => {
      try { store().importCode($('#imp-code').value); UI.closeModal(); UI.applyTheme(); UI.toast(ic('check') + ' Save loaded'); UI.go('learn'); }
      catch (e) { const er = $('#imp-err'); er.hidden = false; er.textContent = 'That code did not load. Copy the whole code from the other device and try again.'; }
    },
    reset: () => UI.modal('<h2>Reset all progress?</h2><p class="muted">This wipes XP, crowns, streaks and review history in this browser. It cannot be undone.</p><div class="btn-stack"><button class="btn wide red" data-act="do-reset">Reset everything</button><button class="btn-ghost wide" data-act="close-modal">Cancel</button></div>'),
    'do-reset': () => { store().reset(); UI.closeModal(); UI.applyTheme(); UI.go('learn'); UI.onboard(); },
    'onboard-done': () => { const g = $('#onb-goal'); st().settings.goal = +g.value; st().onboarded = true; store().save(); UI.closeModal(); CQ.sfx('complete'); UI.render(); },
  });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.act] || (CQ.player && CQ.player.actions[el.dataset.act]);
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#overlay').hidden) {
      const x = $('#overlay .modal-x');
      if (x) UI.closeModal();
    }
  });
})();
