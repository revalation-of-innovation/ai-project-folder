/* Comet Quest — boot. */
(function () {
  const CQ = window.CQ;
  const NAV = [['learn', 'home', 'Learn'], ['review', 'review', 'Review'], ['sheet', 'sheet', 'Cheat sheet'], ['profile', 'user', 'Profile']];

  function renderNav() {
    const btns = NAV.map(([t, i, l]) => '<button data-act="tab" data-tab="' + t + '">' + CQ.ic(i) + '<span>' + l + '</span></button>').join('');
    document.getElementById('rail').innerHTML = '<div class="brand">' + CQ.ui.nova('happy', 44) + '<span>Comet Quest</span></div>' + btns + '<div class="rail-foot">PHYS 2325 · CHEM 1311 · MECH 1208</div>';
    document.getElementById('tabbar').innerHTML = btns;
  }

  function boot() {
    const store = CQ.store;
    store.load();
    if (!CQ.courses[store.state.course]) store.state.course = CQ.courseOrder[0];
    CQ.ui.applyTheme();
    const tab = (location.hash || '').replace('#', '');
    if (['learn', 'review', 'sheet', 'profile'].includes(tab)) CQ.ui.tab = tab;
    renderNav();
    CQ.ui.render();
    if (!store.state.onboarded) CQ.ui.onboard();
    if (store.flash) {
      const f = store.flash;
      setTimeout(() => CQ.ui.toast(f.type === 'freeze' ? CQ.ic('snow') + ' A streak freeze saved your streak' + (f.n > 1 ? ' (' + f.n + ' days)' : '') + '.' : 'Your ' + f.n + '-day streak ended. Start a new one today.', f.type === 'freeze' ? 'blue' : ''), 600);
      store.flash = null;
      store.save();
    }
    store.onChange(() => { if (!CQ.player.S) CQ.ui.render(); });
    store.cloud.init();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { store.rollDay(); if (!CQ.player.S) CQ.ui.render(); }
      else store.cloud.flush();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
