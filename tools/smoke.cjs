// Browser smoke test: plays lessons through the real UI, collecting console errors and screenshots.
// usage: node tools/smoke.cjs [outDir] [lessonId...]
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || 'shots';
const lessons = process.argv.slice(3);
const url = 'file://' + path.resolve(__dirname, '..', process.env.PAGE || 'index.html');

async function answerCurrent(page, mode) {
  return page.evaluate(() => {
    const P = CQ.player, S = P.S, it = CQ.engine.current(S);
    return { t: it.t, n: it.steps ? it.steps.length : 0, phase: P.phase };
  });
}

async function playSession(page, shotPrefix, opts = {}) {
  let guard = 0, shots = 0, wrongDone = false;
  while (guard++ < 120) {
    const done = await page.evaluate(() => !CQ.player.S || !!document.querySelector('.results'));
    if (done) break;
    const info = await answerCurrent(page);
    if (info.t === 'teach' || info.t === 'rescue') {
      if (shots < 2 && opts.shots) { await page.screenshot({ path: `${out}/${shotPrefix}-teach${shots}.png` }); shots++; }
      await page.click('#primary');
      continue;
    }
    if (info.t === 'example') {
      for (let i = 0; i < info.n; i++) await page.click('#primary');
      continue;
    }
    // answer correctly (except one deliberate miss to exercise feedback + requeue)
    const wrong = opts.missOne && !wrongDone && ['mc', 'num'].includes(info.t);
    await page.evaluate(({ wrong }) => {
      const P = CQ.player, it = CQ.engine.current(P.S);
      const click = (el) => el && el.click();
      if (it.t === 'mc' || it.t === 'tf') {
        const i = it.choices.findIndex((c) => (wrong ? !c.ok : c.ok));
        click(document.querySelectorAll('.choice')[i]);
      } else if (it.t === 'multi') {
        it.choices.forEach((c, i) => { if (c.ok) click(document.querySelectorAll('.choice')[i]); });
      } else if (it.t === 'num' || it.t === 'txt') {
        const inp = document.querySelector('#ans');
        inp.value = it.t === 'num' ? (wrong ? String(it.a * 3 + 7) : String(it.a)) : it.a[0];
        inp.oninput();
      } else if (it.t === 'fill') {
        it.a.forEach((w) => { const idx = it.tiles.findIndex((t, k) => t.w === w && !P.sel.includes(k)); click(document.querySelectorAll('.bank .tile')[idx]); });
      } else if (it.t === 'order') {
        for (let k = 0; k < it.items.length; k++) { const idx = it.pool.findIndex((p, j) => p.i === k); click(document.querySelectorAll('.bank .tile')[idx]); }
      } else if (it.t === 'match') {
        it.left.forEach((l, li) => { const ri = it.right.findIndex((r) => r.i === l.i); click(document.querySelectorAll('.mcol')[0].querySelectorAll('.tile')[li]); click(document.querySelectorAll('.mcol')[1].querySelectorAll('.tile')[ri]); });
      }
    }, { wrong });
    if (info.t === 'match') await page.waitForTimeout(450);
    else {
      if (opts.shots && shots < 4) { await page.screenshot({ path: `${out}/${shotPrefix}-q-${info.t}.png` }); shots++; }
      await page.click('#primary');
    }
    if (wrong) { wrongDone = true; if (opts.shots) await page.screenshot({ path: `${out}/${shotPrefix}-wrong.png` }); }
    else if (opts.shots && shots === 4) { await page.screenshot({ path: `${out}/${shotPrefix}-right.png` }); shots++; }
    await page.click('#primary'); // continue
  }
  return guard;
}

(async () => {
  require('fs').mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const errors = [];
  for (const vp of [{ name: 'desk', width: 1320, height: 860 }, { name: 'phone', width: 390, height: 844, mobile: true }]) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme, hasTouch: !!vp.mobile, isMobile: !!vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 });
      const page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') errors.push(vp.name + '/' + scheme + ': ' + m.text()); });
      page.on('pageerror', (e) => errors.push(vp.name + '/' + scheme + ': PAGEERROR ' + e.message));
      await page.goto(url);
      await page.waitForTimeout(400);
      const tag = vp.name + '-' + scheme;
      await page.screenshot({ path: `${out}/${tag}-onboard.png` });
      await page.click('[data-act="onboard-done"]');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${tag}-path.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) errors.push(tag + ': horizontal overflow on path');
      if (scheme === 'light' || vp.name === 'phone') {
        const ids = lessons.length ? lessons : ['p1l1'];
        for (const id of ids) {
          await page.evaluate((id) => CQ.player.start('learn', { lesson: id }), id);
          await page.waitForTimeout(200);
          const steps = await playSession(page, tag + '-' + id, { shots: id === ids[0], missOne: true });
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${out}/${tag}-${id}-results.png` });
          await page.click('[data-act="done"]');
        }
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${out}/${tag}-path-after.png` });
        for (const tab of ['review', 'sheet', 'profile']) {
          await page.evaluate((t) => CQ.ui.go(t), tab);
          await page.waitForTimeout(200);
          await page.screenshot({ path: `${out}/${tag}-${tab}.png`, fullPage: tab !== 'profile' });
          const of = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
          if (of) errors.push(tag + ': horizontal overflow on ' + tab);
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console errors.');
})();
