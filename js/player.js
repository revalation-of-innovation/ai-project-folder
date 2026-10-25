/* Comet Quest — the lesson player: renders every card type, the check bar,
   combo/hearts/timer HUD, and the results screen. */
(function () {
  const CQ = window.CQ;
  const E = () => CQ.engine;
  const UI = () => CQ.ui;
  const st = () => CQ.store.state;
  const $ = (s, r = document) => r.querySelector(s);
  const ic = (n, c) => CQ.ic(n, c);
  const md = (s) => CQ.md(s);
  const inl = (s) => CQ.inl(s);
  const P = (CQ.player = { S: null });

  const PRAISE = ['Nice!', 'Correct!', 'Nailed it!', 'Great work!', 'Exactly!', 'You got it!', 'Brilliant!', 'Spot on!'];
  const COMBO_WORDS = { 5: 'Combo ×2', 10: 'Combo ×3', 15: 'Unstoppable', 20: 'Legendary streak', 30: 'Are you even human?' };
  const LABEL = { mc: 'Choose the answer', tf: 'True or false?', multi: 'Select all that apply', num: 'Calculate', txt: 'Type the answer', fill: 'Fill in the blanks', match: 'Match the pairs', order: 'Put these in order' };
  const touch = () => matchMedia('(pointer: coarse)').matches;

  /* ---------- start / quit ---------- */
  P.start = function (mode, p) {
    let S;
    try { S = E().build(mode, p); } catch (e) { console.error(e); UI().toast('Could not start that session.'); return; }
    if (!S.items.length) {
      UI().toast(mode === 'review' || mode === 'weak' ? 'Nothing to review yet. Finish a lesson first.' : 'No questions here yet.');
      return;
    }
    P.S = S;
    P.reset();
    document.body.classList.add('in-session');
    const el = $('#player');
    el.hidden = false;
    el.className = 'player mode-' + mode;
    const c = S.course && CQ.courses[S.course];
    if (c) { el.style.setProperty('--hue', c.color); el.style.setProperty('--hue-dk', c.dark); }
    P.render();
    clearInterval(P.timer);
    if (S.timeLimit) P.timer = setInterval(P.tick, 1000);
  };

  P.reset = function () {
    P.phase = 'answer';
    P.sel = null;
    P.revealed = 1;
    P.hint = false;
    P.match = null;
    P.lastOk = null;
  };

  P.close = function () {
    clearInterval(P.timer);
    P.S = null;
    const el = $('#player');
    el.hidden = true;
    el.innerHTML = '';
    document.body.classList.remove('in-session');
    UI().render();
  };

  P.askQuit = function () {
    if (!P.S) return P.close();
    const exam = P.S.mode === 'exam';
    UI().modal('<div class="center">' + UI().nova('sad', 110) + '</div><h2 class="center">' + (exam ? 'Leave the exam?' : 'Wait, don\'t go!') + '</h2><p class="muted center">' + (exam ? 'This attempt will not be scored.' : 'You\'ll lose the progress from this session.') + '</p>' +
      '<div class="btn-stack"><button class="btn wide" data-act="close-modal" autofocus>Keep going</button><button class="btn-ghost wide red-text" data-act="quit-now">' + (exam ? 'Leave exam' : 'End session') + '</button></div>');
  };

  /* ---------- HUD ---------- */
  function hud() {
    const S = P.S;
    let h = '<div class="hud"><button class="hud-x" data-act="quit" aria-label="Quit">' + ic('x') + '</button>';
    h += '<div class="prog"><i style="width:' + Math.max(3, E().progress(S) * 100) + '%"></i>' + (S.combo >= 5 ? '<b class="prog-glow"></b>' : '') + '</div>';
    if (S.timeLimit) h += '<span class="timer" id="timer">' + ic('clock') + '<span>' + fmtTime(S.timeLimit - (Date.now() - S.start)) + '</span></span>';
    else if (S.hearts != null) h += '<span class="hearts">' + ic('heart') + '<b>' + S.hearts + '</b></span>';
    else h += '<span class="combo ' + (S.combo >= 5 ? 'hot' : S.combo >= 2 ? 'warm' : '') + '">' + ic('flame') + '<b>' + S.combo + '</b></span>';
    return h + '</div>';
  }
  const fmtTime = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  P.tick = function () {
    const S = P.S;
    if (!S || !S.timeLimit) return;
    const left = S.timeLimit - (Date.now() - S.start);
    const t = $('#timer span');
    if (t) t.textContent = fmtTime(left);
    if (left < 60000) { const tt = $('#timer'); if (tt) tt.classList.add('low'); }
    if (left <= 0) { clearInterval(P.timer); UI().toast(ic('clock') + ' Time is up'); P.finish(); }
  };

  /* ---------- rendering ---------- */
  P.render = function () {
    const S = P.S;
    const it = E().current(S);
    const el = $('#player');
    let body = '';
    if (it.t === 'teach') body = renderTeach(it);
    else if (it.t === 'example') body = renderExample(it);
    else if (it.t === 'rescue') body = renderRescue(it);
    else body = renderQuestion(it);
    // slide in only when a new item appears, not when a tile tap re-renders the same one
    const fresh = P._shown !== it;
    P._shown = it;
    const keepScroll = !fresh && $('#stage') ? $('#stage').scrollTop : 0;
    el.innerHTML = hud() + '<div class="stage" id="stage"><div class="card-wrap' + (fresh ? ' enter' : '') + '">' + body + '</div></div><footer class="checkbar" id="checkbar">' + footer(it) + '</footer>';
    bindInputs(it);
    $('#stage').scrollTop = keepScroll;
  };

  function renderTeach(it) {
    return '<article class="lcard teach"><div class="eyebrow">' + ic('book') + ' New idea</div><h2>' + inl(it.title) + '</h2>' + (it.fig ? '<figure class="fig">' + it.fig + '</figure>' : '') + '<div class="mdx">' + md(it.md) + '</div></article>';
  }
  function renderExample(it) {
    const steps = it.steps.map((s, i) => '<li class="step ' + (i < P.revealed ? 'shown' : '') + '"><span class="sn">' + (i + 1) + '</span><div>' + inl(s) + '</div></li>').join('');
    return '<article class="lcard example"><div class="eyebrow">' + ic('bulb') + ' Worked example</div><h2>' + inl(it.title) + '</h2>' +
      '<div class="problem">' + md(it.q) + '</div>' + (it.fig ? '<figure class="fig">' + it.fig + '</figure>' : '') + '<ol class="steps">' + steps + '</ol>' +
      (P.revealed < it.steps.length ? '<p class="muted small center">Try the next step in your head first, then reveal it.</p>' : '') + '</article>';
  }
  function renderRescue(it) {
    return '<article class="lcard rescue"><div class="rescue-top">' + UI().nova('think', 96) + '<div><div class="eyebrow">' + ic('bulb') + ' Quick reset</div><h2>Let\'s slow down for a second</h2><p class="muted">Two misses in a row usually means one idea isn\'t clicking yet. Here it is again, short version.</p></div></div><div class="mdx keybox">' + md(it.md) + '</div><p class="muted small">Next up is an easier question to get your footing.</p></article>';
  }

  function badge(it) {
    if (it.retry) return '<span class="badge retry">' + ic('review') + ' Try again</span>';
    if (it.stepping) return '<span class="badge step">Stepping stone</span>';
    if (it.review) return '<span class="badge rev">' + ic('review') + ' Review</span>';
    if (it.lvl >= 4 || it.exam) return '<span class="badge hard">' + ic('flag') + ' Exam-level</span>';
    return '';
  }

  function renderQuestion(it) {
    let h = '<article class="lcard q q-' + it.t + '"><div class="q-top"><span class="eyebrow">' + LABEL[it.t] + '</span>' + badge(it) + '</div>';
    if (it.t === 'fill') {
      const parts = it.q.split('___');
      if (!P.sel) P.sel = new Array(parts.length - 1).fill(null);
      h += '<div class="qtext fill-text">' + parts.map((p, i) => inl(p) + (i < parts.length - 1 ? '<button class="slot ' + (P.sel[i] != null ? 'full' : '') + '" data-act="slot" data-i="' + i + '">' + (P.sel[i] != null ? inl(it.tiles[P.sel[i]].w) : '&nbsp;') + '</button>' : '')).join('') + '</div>';
    } else h += '<div class="qtext">' + md(it.q) + '</div>';
    h += it.fig ? '<figure class="fig">' + it.fig + '</figure>' : '';
    h += '<div class="hintbox" id="hintbox"' + (P.hint ? '' : ' hidden') + '>' + ic('bulb') + '<div>' + inl(hintOf(it) || '') + '</div></div>';
    if (it.t === 'mc' || it.t === 'multi') {
      h += '<div class="choices ' + (it.choices.length > 4 || it.choices.some((c) => CQ.strip(c.text).length > 46) ? 'list' : 'grid') + '">' + it.choices.map((c, i) => '<button class="choice" data-act="pick" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span>' + inl(c.text) + '</span></button>').join('') + '</div>';
    } else if (it.t === 'tf') {
      h += '<div class="choices tf">' + it.choices.map((c, i) => '<button class="choice tfc ' + (i ? 'f' : 't') + '" data-act="pick" data-i="' + i + '">' + ic(i ? 'x' : 'check') + '<span>' + c.text + '</span></button>').join('') + '</div>';
    } else if (it.t === 'num') {
      h += '<div class="numrow"><input id="ans" class="ans-in" ' + (touch() ? 'readonly inputmode="none"' : 'inputmode="decimal"') + ' autocomplete="off" placeholder="Your answer" aria-label="Your answer">' + (it.unit ? '<span class="u-lbl">' + inl(it.unit) + '</span>' : '') + '</div>' +
        '<p class="muted small">Tip: type 3.2e-5 or 3.2x10^-5 for scientific notation.' + (it.tol && it.tol > 0.02 ? '' : ' Answers within 2% count.') + '</p>' + (touch() ? keypad() : '');
    } else if (it.t === 'txt') {
      h += '<div class="numrow"><input id="ans" class="ans-in txt" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + (it.ph || 'Type here') + '" aria-label="Your answer"></div>' + (it.chemPreview ? '<div class="chem-prev" id="chem-prev"></div>' : '');
    } else if (it.t === 'fill') {
      h += '<div class="bank">' + it.tiles.map((t, i) => '<button class="tile ' + (P.sel.includes(i) ? 'used' : '') + '" data-act="tile" data-i="' + i + '">' + inl(t.w) + '</button>').join('') + '</div>';
    } else if (it.t === 'match') {
      if (!P.match) P.match = { l: null, r: null, done: new Set(), bad: 0 };
      const col = (arr, side) => '<div class="mcol">' + arr.map((x, i) => '<button class="tile mt ' + (P.match.done.has(x.i) ? 'matched' : '') + ' ' + ((side === 'l' ? P.match.l : P.match.r) === i ? 'sel' : '') + '" data-act="m' + side + '" data-i="' + i + '"' + (P.match.done.has(x.i) ? ' disabled' : '') + '>' + inl(x.text) + '</button>').join('') + '</div>';
      h += '<div class="match">' + col(it.left, 'l') + col(it.right, 'r') + '</div>';
    } else if (it.t === 'order') {
      if (!P.sel) P.sel = [];
      h += '<div class="order-ans" id="order-ans">' + (P.sel.length ? P.sel.map((pi, k) => '<button class="tile ord" data-act="oans" data-k="' + k + '"><span class="on">' + (k + 1) + '</span>' + inl(it.pool[pi].text) + '</button>').join('') : '<span class="muted small">Tap the steps below in the right order</span>') + '</div>';
      h += '<div class="bank col">' + it.pool.map((p, i) => '<button class="tile ' + (P.sel.includes(i) ? 'used' : '') + '" data-act="opool" data-i="' + i + '">' + inl(p.text) + '</button>').join('') + '</div>';
    }
    return h + '</article>';
  }

  const hintOf = (it) => it.hint || (it.steps && it.steps.length > 1 ? it.steps[0] : null);
  function keypad() {
    const keys = ['7', '8', '9', 'del', '4', '5', '6', '-', '1', '2', '3', 'exp', '0', '.', '/', 'ok'];
    const lab = { del: ic('back'), '-': '−', exp: '×10ⁿ', ok: ic('check'), '/': '/' };
    return '<div class="keypad">' + keys.map((k) => '<button class="key k-' + (k === '.' ? 'dot' : k === '/' ? 'slash' : k === '-' ? 'minus' : k) + '" data-act="key" data-k="' + k + '">' + (lab[k] || k) + '</button>').join('') + '</div>';
  }

  function footer(it) {
    const S = P.S;
    if (it.t === 'teach' || it.t === 'rescue') return '<div class="cb-in"><span></span><button class="btn big" data-act="continue" id="primary">Continue</button></div>';
    if (it.t === 'example') {
      const more = P.revealed < it.steps.length;
      return '<div class="cb-in"><span></span><button class="btn big ' + (more ? 'blue' : '') + '" data-act="' + (more ? 'reveal' : 'continue') + '" id="primary">' + (more ? 'Next step' : 'Got it') + '</button></div>';
    }
    if (it.t === 'match') return '<div class="cb-in"><span class="muted small">Tap one on each side to pair them.</span><button class="btn big" disabled id="primary">Check</button></div>';
    const canHint = S.allowHints && hintOf(it) && !P.hint;
    return '<div class="cb-in">' + (S.noFeedback ? '<button class="btn-ghost" data-act="skip">Skip</button>' : canHint ? '<button class="btn-ghost hint-btn" data-act="hint">' + ic('bulb') + '<span>Hint</span></button>' : '<span></span>') +
      '<button class="btn big" data-act="check" id="primary" disabled>' + (S.noFeedback ? 'Submit' : 'Check') + '</button></div>';
  }

  function enableCheck(on) { const b = $('#primary'); if (b && b.dataset.act === 'check') b.disabled = !on; }

  function bindInputs(it) {
    const inp = $('#ans');
    if (inp) {
      if (P.sel) inp.value = P.sel;
      inp.oninput = () => {
        P.sel = inp.value;
        enableCheck(inp.value.trim().length > 0);
        if (it.chemPreview) { const pv = $('#chem-prev'); if (pv) pv.innerHTML = inp.value ? 'Reads as: <b>' + CQ.esc(CQ.chem(inp.value)) + '</b>' : ''; }
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); const b = $('#primary'); if (b && !b.disabled) b.click(); } };
      if (!touch()) setTimeout(() => inp.focus(), 30);
    }
  }

  /* ---------- check & feedback ---------- */
  P.check = function () {
    const S = P.S;
    const it = E().current(S);
    let resp = P.sel;
    let respText = '';
    if (it.t === 'mc' || it.t === 'tf') respText = CQ.strip(inl(it.choices[resp].text));
    else if (it.t === 'multi') respText = it.choices.filter((c, i) => resp.has(i)).map((c) => CQ.strip(inl(c.text))).join(', ');
    else if (it.t === 'num' || it.t === 'txt') respText = String(resp || '');
    else if (it.t === 'fill') { resp = P.sel.map((i) => (i == null ? '' : it.tiles[i].w)); respText = resp.join(' · '); }
    else if (it.t === 'order') { resp = P.sel.map((i) => it.pool[i].i); respText = resp.map((i) => it.items[i]).join(' → '); }
    else if (it.t === 'match') { resp = P.match.bad; respText = P.match.bad + ' mismatches'; }
    const ok = E().grade(it, resp);
    const res = E().answer(S, ok, { hint: P.hint, respText });
    if (S.noFeedback) { P.next(); return; }
    P.phase = 'feedback';
    P.lastOk = ok;
    showFeedback(it, ok, res, resp);
  };

  function showFeedback(it, ok, res, resp) {
    const S = P.S;
    CQ.sfx(ok ? 'correct' : 'wrong');
    if (!ok) CQ.buzz(60);
    // mark the choices
    if (it.t === 'mc' || it.t === 'tf' || it.t === 'multi') {
      document.querySelectorAll('.choice').forEach((b, i) => {
        b.disabled = true;
        b.classList.remove('sel');
        if (it.choices[i].ok) b.classList.add('right');
        else if (it.t === 'multi' ? resp.has(i) : i === resp) b.classList.add('wrong');
      });
    }
    document.querySelectorAll('.tile, .slot, .key, #ans').forEach((b) => { b.disabled = true; });
    const card = $('.card-wrap');
    if (card && !ok) card.classList.add('shake');
    // option-specific feedback for the misconception that was picked
    let fb = '';
    if (!ok && it.t === 'mc' && it.choices[resp] && it.choices[resp].fb) fb = '<p class="fb-pick">' + inl(it.choices[resp].fb) + '</p>';
    const title = ok ? (S.combo >= 5 && COMBO_WORDS[S.combo] ? COMBO_WORDS[S.combo] : PRAISE[Math.floor(Math.random() * PRAISE.length)]) : 'Not quite';
    const ans = !ok && it.t !== 'match' ? '<div class="fb-ans"><small>Correct answer</small><div>' + inl(E().correctText(it)) + '</div></div>' : '';
    const why = it.why ? '<div class="fb-why">' + md(it.why) + '</div>' : '';
    const steps = it.steps && it.steps.length ? '<details class="fb-steps" ' + (ok ? '' : 'open') + '><summary>' + (ok ? 'See the full solution' : 'Full solution') + '</summary><ol>' + it.steps.map((s) => '<li>' + inl(s) + '</li>').join('') + '</ol></details>' : '';
    const extra = (res.retry ? '<p class="fb-note">' + ic('review') + ' This one comes back at the end' + (it.gen ? ' with new numbers.' : '.') + '</p>' : '') + (res.rescue ? '<p class="fb-note">' + ic('bulb') + ' Next: a quick reset on the key idea.</p>' : '');
    const cb = $('#checkbar');
    cb.className = 'checkbar ' + (ok ? 'good' : 'bad');
    cb.innerHTML = '<div class="cb-in fb"><div class="fb-body"><div class="fb-head">' + ic(ok ? 'check' : 'x', 'fb-ic') + '<b>' + title + '</b>' + (ok && res.gain ? '<span class="xp-pop">+' + res.gain + ' XP' + (res.mult > 1 ? ' <small>×' + res.mult + '</small>' : '') + '</span>' : '') + '</div>' +
      fb + ans + why + steps + extra + '</div><button class="btn big ' + (ok ? 'green' : 'red') + '" data-act="continue" id="primary">Continue</button></div>';
    if (ok && COMBO_WORDS[S.combo]) CQ.sfx('combo');
    if (!ok && S.hearts != null) { CQ.sfx('heart'); const hh = $('.hearts'); if (hh) { hh.querySelector('b').textContent = S.hearts; hh.classList.add('lose'); } }
    const cmb = $('.combo');
    if (cmb) { cmb.querySelector('b').textContent = S.combo; cmb.className = 'combo ' + (S.combo >= 5 ? 'hot' : S.combo >= 2 ? 'warm' : '') + (ok ? ' bump' : ''); }
    const prog = $('.prog i');
    if (prog) prog.style.width = Math.max(3, E().progress(S, 1) * 100) + '%';
    setTimeout(() => { const b = $('#primary'); if (b) b.focus({ preventScroll: true }); }, 30);
    // make sure the feedback is visible on short screens
    requestAnimationFrame(() => { const s = $('#stage'); if (s) s.style.paddingBottom = cb.offsetHeight + 24 + 'px'; });
  }

  P.next = function () {
    const S = P.S;
    if (!S) return;
    if (S.hearts === 0 && !S.revived && st().gems >= 30 && (S.mode === 'boss' || S.mode === 'jump' || S.mode === 'legend')) return reviveOffer();
    const over = E().advance(S);
    if (over) return P.finish();
    P.reset();
    P.render();
    if (S.fastNow) UI().toast(ic('bolt') + ' Fast track: skipped ' + S.fastNow + ' warm-up' + (S.fastNow > 1 ? 's' : '') + '. You clearly have this.', 'blue');
  };

  function reviveOffer() {
    const S = P.S;
    $('#stage').innerHTML = '<div class="card-wrap enter"><article class="lcard center">' + UI().nova('sad', 120) + '<h2>Out of hearts</h2><p class="muted">Spend 30 gems for one more heart and keep fighting, or call it here.</p></article></div>';
    $('#checkbar').className = 'checkbar';
    $('#checkbar').innerHTML = '<div class="cb-in"><button class="btn-ghost" data-act="give-up">End run</button><button class="btn big gold" data-act="revive">' + ic('heart') + ' +1 heart · ' + ic('gem') + ' 30</button></div>';
  }

  /* ---------- results ---------- */
  P.finish = function () {
    clearInterval(P.timer);
    const S = P.S;
    const R = E().finish(S);
    const el = $('#player');
    const win = R.passed;
    CQ.sfx(win ? 'complete' : 'fail');
    if (win && (S.mode !== 'exam' || R.score >= 70)) UI().confetti();
    const mins = Math.floor(R.ms / 60000), secs = Math.floor((R.ms % 60000) / 1000);
    const tiles = (S.mode === 'exam'
      ? [['gold', 'star', 'Total XP', R.xp], ['green', 'target', 'Score', R.score + '%'], ['blue', 'clock', 'Time', mins + ':' + String(secs).padStart(2, '0')], ['purple', 'check', 'Correct', R.right + ' / ' + R.total]]
      : [['gold', 'star', 'Total XP', R.xp], ['green', 'target', 'Accuracy', Math.round(R.acc * 100) + '%'], ['blue', 'clock', 'Time', mins + ':' + String(secs).padStart(2, '0')], ['orange', 'flame', 'Best combo', R.combo]])
      .map(([c, i, l, v]) => '<div class="rtile ' + c + '"><small>' + l + '</small><div>' + ic(i) + '<b>' + v + '</b></div></div>').join('');
    const head = {
      learn: ['Lesson complete!', R.perfect ? 'Flawless. Not a single miss.' : R.acc >= 0.85 ? 'Right in the zone. That\'s how it sticks.' : 'You worked for that one. The misses are queued for review.'],
      levelup: ['Leveled up!', 'Crown 2 means you can do it without the training wheels.'],
      legend: win ? ['Legendary!', 'Exam-level, no hints, 90%+. This lesson is locked in.'] : ['So close', 'Legendary needs 90% with hearts left. Review the misses and run it again.'],
      boss: win ? ['Boss defeated!', 'The next unit is open.'] : ['The boss won this round', 'Check the solutions below, then come back swinging.'],
      jump: win ? ['You tested out!', 'Everything before this unit is unlocked.'] : ['Not this time', 'Brush up with the earlier lessons and try the jump again.'],
      review: ['Review done!', 'Every answer pushed those memories further out on the schedule.'],
      weak: ['Weak spots drilled', 'Missed ones stay in the drill until they stick.'],
      exam: [R.score >= 85 ? 'A-range run!' : R.score >= 70 ? 'Solid run' : 'Good scouting run', R.score >= 85 ? 'Do one more run to confirm it, and keep your crowns and reviews up so the readiness meter follows.' : 'Work through the review below, drill your weak spots, then run it again.'],
    }[S.mode];
    let h = '<div class="results"><div class="res-hero">' + UI().nova(win ? 'cheer' : 'sad', 150) + '<h1>' + head[0] + '</h1><p>' + head[1] + '</p></div>';
    if (S.mode === 'exam') h += '<div class="exam-score ' + (R.score >= 85 ? 'good' : R.score >= 70 ? 'mid' : 'low') + '"><b>' + R.score + '%</b><span>Readiness now ' + CQ.store.readiness(S.exam) + '%</span></div>';
    h += '<div class="rtiles">' + tiles + '</div>';
    const banners = [];
    if (R.crown) banners.push('<div class="rbanner crown c' + R.crown + '">' + ic('crown') + '<span>Crown ' + R.crown + ' earned · ' + ['', 'Learned', 'Leveled up', 'Legendary'][R.crown] + '</span></div>');
    if (R.gems) banners.push('<div class="rbanner gem">' + ic('gem') + '<span>+' + R.gems + ' gems</span></div>');
    if (R.streakGrew) banners.push('<div class="rbanner streak">' + ic('flame') + '<span>' + R.streak + '-day streak!</span></div>');
    if (R.levelUp) banners.push('<div class="rbanner level">' + ic('star') + '<span>Level ' + R.levelUp.n + ' · ' + R.levelUp.title + '</span></div>');
    R.ach.forEach((a) => banners.push('<div class="rbanner achv">' + ic('trophy') + '<span>Achievement: ' + CQ.esc(a.name) + '</span></div>'));
    if (banners.length) h += '<div class="rbanners">' + banners.join('') + '</div>';
    // review list
    const list = S.mode === 'exam' ? S.items.map((it) => ({ it, a: S.answers.find((x) => x.item === it) })) : S.mistakes.map((it) => ({ it, a: S.answers.find((x) => x.item === it) }));
    if (list.length) {
      h += '<details class="res-review" ' + (S.mode === 'exam' || !win ? 'open' : '') + '><summary>' + (S.mode === 'exam' ? 'Review every question' : 'Review your misses (' + list.length + ')') + '</summary>';
      list.forEach(({ it, a }, k) => {
        const ok = a && a.ok;
        h += '<div class="rv-item ' + (ok ? 'ok' : 'no') + '"><div class="rv-q"><span class="rv-n">' + (k + 1) + '</span>' + ic(ok ? 'check' : 'x') + '<div>' + md(it.t === 'fill' ? it.q.replace(/___/g, '____') : it.q) + '</div></div>' +
          (a && a.resp && !ok ? '<p class="rv-you">You: ' + CQ.esc(a.resp) + '</p>' : !a ? '<p class="rv-you">Skipped</p>' : '') +
          (it.t !== 'match' ? '<p class="rv-a"><b>Answer:</b> ' + inl(E().correctText(it)) + '</p>' : '') + (it.why ? '<div class="rv-why">' + md(it.why) + '</div>' : '') +
          (it.steps ? '<ol class="rv-steps">' + it.steps.map((s) => '<li>' + inl(s) + '</li>').join('') + '</ol>' : '') + '</div>';
      });
      h += '</details>';
    }
    h += '</div>';
    let btns = '<button class="btn big" data-act="done">Continue</button>';
    if (!win && (S.mode === 'boss' || S.mode === 'jump' || S.mode === 'legend')) btns = '<button class="btn-ghost" data-act="done">Back to path</button><button class="btn big" data-act="again">Try again</button>';
    else if (S.mode === 'learn' && R.passed) btns = '<button class="btn-ghost" data-act="again-levelup">Level up now</button><button class="btn big" data-act="done">Continue</button>';
    else if (S.mode === 'exam') btns = '<button class="btn-ghost" data-act="again">Run it again</button><button class="btn big" data-act="done">Done</button>';
    el.innerHTML = '<div class="stage res-stage">' + h + '</div><footer class="checkbar"><div class="cb-in">' + (btns.startsWith('<button class="btn big"') ? '<span></span>' : '') + btns + '</div></footer>';
    if (R.levelUp) setTimeout(() => CQ.sfx('level'), 700);
    P.lastRun = { mode: S.mode, p: S.p };
  };

  /* ---------- actions ---------- */
  P.actions = {
    quit: () => P.askQuit(),
    'quit-now': () => { UI().closeModal(); P.close(); },
    continue: () => {
      const it = E().current(P.S);
      if (it && (it.t === 'teach' || it.t === 'example' || it.t === 'rescue')) CQ.sfx('tap');
      if (P.phase === 'answer' && it && it.t === 'match') return;
      P.next();
    },
    reveal: () => {
      P.revealed++;
      CQ.sfx('reveal');
      const it = E().current(P.S);
      const steps = document.querySelectorAll('.step');
      steps.forEach((s, i) => s.classList.toggle('shown', i < P.revealed));
      const last = steps[P.revealed - 1];
      if (last) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      $('#checkbar').innerHTML = footer(it);
      const note = $('.example .muted.small.center');
      if (note && P.revealed >= it.steps.length) note.remove();
    },
    hint: () => {
      P.hint = true;
      $('#hintbox').hidden = false;
      const hb = $('.hint-btn');
      if (hb) hb.replaceWith(Object.assign(document.createElement('span'), { className: 'muted small', textContent: 'Hint used · half XP' }));
      CQ.sfx('reveal');
    },
    skip: () => { E().advance(P.S) ? P.finish() : (P.reset(), P.render()); },
    check: () => P.check(),
    pick: (el) => {
      if (P.phase !== 'answer') return;
      const it = E().current(P.S);
      const i = +el.dataset.i;
      CQ.sfx('tap');
      if (it.t === 'multi') {
        if (!P.sel) P.sel = new Set();
        P.sel.has(i) ? P.sel.delete(i) : P.sel.add(i);
        el.classList.toggle('sel', P.sel.has(i));
        enableCheck(P.sel.size > 0);
      } else {
        P.sel = i;
        document.querySelectorAll('.choice').forEach((b) => b.classList.toggle('sel', b === el));
        enableCheck(true);
      }
    },
    key: (el) => {
      const inp = $('#ans');
      if (!inp || P.phase !== 'answer') return;
      const k = el.dataset.k;
      CQ.sfx('tap');
      if (k === 'ok') { const b = $('#primary'); if (b && !b.disabled) b.click(); return; }
      if (k === 'del') inp.value = inp.value.slice(0, -1);
      else if (k === 'exp') inp.value += '×10^';
      else inp.value += k;
      inp.oninput();
    },
    tile: (el) => {
      if (P.phase !== 'answer') return;
      const i = +el.dataset.i;
      if (P.sel.includes(i)) return;
      const slot = P.sel.indexOf(null);
      if (slot < 0) return;
      P.sel[slot] = i;
      CQ.sfx('tap');
      P.render();
      enableCheck(!P.sel.includes(null));
    },
    slot: (el) => {
      if (P.phase !== 'answer') return;
      P.sel[+el.dataset.i] = null;
      P.render();
      enableCheck(false);
    },
    opool: (el) => {
      if (P.phase !== 'answer') return;
      const i = +el.dataset.i;
      if (P.sel.includes(i)) return;
      P.sel.push(i);
      CQ.sfx('tap');
      P.render();
      enableCheck(P.sel.length === E().current(P.S).pool.length);
    },
    oans: (el) => {
      if (P.phase !== 'answer') return;
      P.sel.splice(+el.dataset.k, 1);
      P.render();
      enableCheck(false);
    },
    ml: (el) => matchTap('l', +el.dataset.i, el),
    mr: (el) => matchTap('r', +el.dataset.i, el),
    revive: () => { const S = P.S; st().gems -= 30; S.hearts = 1; S.revived = true; CQ.store.save(); CQ.sfx('level'); const over = E().advance(S); if (over) return P.finish(); P.reset(); P.render(); },
    'give-up': () => { P.S.revived = true; P.finish(); },
    done: () => P.close(),
    again: () => { const r = P.lastRun; P.close(); P.start(r.mode, r.p); },
    'again-levelup': () => { const r = P.lastRun; P.close(); P.start('levelup', r.p); },
  };

  function matchTap(side, i, el) {
    if (P.phase !== 'answer') return;
    const it = E().current(P.S);
    const m = P.match;
    m[side] = m[side] === i ? null : i;
    CQ.sfx('tap');
    document.querySelectorAll('.mcol')[side === 'l' ? 0 : 1].querySelectorAll('.tile').forEach((b, k) => b.classList.toggle('sel', k === m[side]));
    if (m.l != null && m.r != null) {
      const a = it.left[m.l], b = it.right[m.r];
      const lb = document.querySelectorAll('.mcol')[0].querySelectorAll('.tile')[m.l];
      const rb = document.querySelectorAll('.mcol')[1].querySelectorAll('.tile')[m.r];
      if (a.i === b.i) {
        m.done.add(a.i);
        [lb, rb].forEach((x) => { x.classList.remove('sel'); x.classList.add('matched', 'pop'); x.disabled = true; });
        CQ.sfx('correct');
      } else {
        m.bad++;
        [lb, rb].forEach((x) => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 500); });
        CQ.sfx('wrong');
      }
      m.l = m.r = null;
      if (m.done.size === it.pairs.length) setTimeout(() => P.check(), 350);
    }
  }

  // keyboard: 1-9 choose, Enter = primary button
  document.addEventListener('keydown', (e) => {
    if (!P.S || !$('#overlay').hidden) return;
    const typing = document.activeElement && (document.activeElement.id === 'ans');
    if (e.key === 'Enter' && !typing) {
      const b = $('#primary');
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    } else if (/^[1-9]$/.test(e.key) && !typing && P.phase === 'answer') {
      const b = document.querySelectorAll('.choice')[+e.key - 1];
      if (b) b.click();
    } else if (e.key === 'Escape') {
      P.askQuit();
    }
  });
})();
