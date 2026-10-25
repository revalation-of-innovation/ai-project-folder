/* Comet Quest — core utilities: namespace, RNG, number formatting/parsing,
   the lightweight math-markup renderer, and the icon set. */
(function () {
  const CQ = (window.CQ = window.CQ || {});

  /* ---------- random numbers ---------- */
  // Seedable PRNG (mulberry32) wrapped with the helpers generators use.
  CQ.rng = function (seed) {
    let s = (seed == null ? Math.random() * 4294967296 : seed) >>> 0;
    const next = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = {
      next,
      int: (a, b) => a + Math.floor(next() * (b - a + 1)),
      // a..b rounded to dp decimals
      float: (a, b, dp = 1) => CQ.round(a + next() * (b - a), dp),
      // a, a+st, a+2st ... <= b
      step: (a, b, st) => CQ.round(a + st * Math.floor(next() * (Math.floor((b - a) / st + 1e-9) + 1)), 6),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      sign: () => (next() < 0.5 ? -1 : 1),
      chance: (p) => next() < p,
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      // n distinct picks
      sample: (arr, n) => R.shuffle(arr).slice(0, n),
    };
    return R;
  };

  /* ---------- numbers ---------- */
  CQ.round = (x, dp = 0) => {
    const f = Math.pow(10, dp);
    return Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f;
  };

  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
  CQ.supNum = (n) => String(n).split('').map((c) => SUP[c] || c).join('');

  // Round to sig significant figures, returning a display string.
  // Uses ×10ⁿ notation for very large / very small magnitudes.
  CQ.fmt = function (x, sig = 3, opts = {}) {
    if (!isFinite(x)) return String(x);
    if (x === 0) return '0';
    const neg = x < 0 ? '−' : '';
    const ax = Math.abs(x);
    let e = Math.floor(Math.log10(ax));
    let m = ax / Math.pow(10, e);
    m = CQ.round(m, sig - 1);
    if (m >= 10) { m /= 10; e += 1; }
    const lo = opts.lo != null ? opts.lo : -3;
    const hi = opts.hi != null ? opts.hi : 5;
    if (e < lo || e >= hi) {
      return neg + m.toFixed(Math.max(0, sig - 1)) + ' × 10' + CQ.supNum(e);
    }
    const dp = Math.max(0, sig - 1 - e);
    let s = (ax < 1e-12 ? 0 : CQ.round(ax, dp)).toFixed(dp);
    if (opts.trim) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return neg + s;
  };
  // Trimmed variant (no trailing zeros) for clean question text.
  CQ.fmtT = (x, sig = 3) => CQ.fmt(x, sig, { trim: true });

  // Parse what a student typed: 6.02e23, 6.02x10^23, 6.02 × 10^-23, −4, 1,200, 3/4, 25 m/s
  const UNSUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  CQ.parseNum = function (raw) {
    if (raw == null) return NaN;
    let s = String(raw).trim();
    if (!s) return NaN;
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => UNSUP[c]);
    s = s.replace(/[−–—]/g, '-').replace(/,/g, '').replace(/\s+/g, '');
    // 6.02x10^23 / 6.02*10^23 / 6.02×10^23 / 6.02x10-23 → 6.02e23
    s = s.replace(/[x×*·]10\^?\(?([-+]?\d+)\)?/i, 'e$1');
    // bare 10^5
    s = s.replace(/^([-+]?)10\^\(?([-+]?\d+)\)?/, '$11e$2');
    const frac = s.match(/^([-+]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
    const m = s.match(/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i);
    if (!m) return NaN;
    return parseFloat(m[0]);
  };

  // Is the typed value close enough? tol is relative; abs is used when the answer is ~0.
  CQ.numMatch = function (val, ans, tol = 0.02, abs) {
    if (!isFinite(val)) return false;
    if (Math.abs(ans) < 1e-12) return Math.abs(val) <= (abs != null ? abs : 1e-6);
    if (abs != null && Math.abs(val - ans) <= abs) return true;
    return Math.abs(val - ans) / Math.abs(ans) <= tol;
  };

  // Normalize short text answers (formulas, names) for comparison.
  CQ.normText = function (s, caseSensitive) {
    let t = String(s || '')
      .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)))
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => UNSUP[c])
      .replace(/[−–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
    if (!caseSensitive) t = t.toLowerCase();
    return t.replace(/\s*([()\[\]])\s*/g, '$1');
  };

  // Unicode subscripts for chemical formulas written as plain text: "H2SO4" → "H₂SO₄"
  CQ.chem = (s) => String(s).replace(/([A-Za-z\)\]])(\d+)/g, (m, a, d) => a + d.split('').map((c) => '₀₁₂₃₄₅₆₇₈₉'[+c]).join(''));

  /* ---------- markup ---------- */
  // Inline markup (no backslashes, so it is safe inside JS template strings):
  //   **bold**  *italic*  $formula$ (or `formula`)  ==highlight==
  //   ^{sup} _{sub} x^2   [[num|den]] fraction   √{x} radical   vec{F} vector arrow
  CQ.inl = function (src) {
    if (src == null) return '';
    let s = String(src);
    s = s.replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>');
    s = s.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>');
    // shorthand subscripts: x_cm, P_A, v_esc
    s = s.replace(/([^\s_<>])_([A-Za-z0-9]{1,8})(?![A-Za-z0-9])/g, '$1<sub>$2</sub>');
    s = s.replace(/\^(-?[0-9]+|[a-zA-Z])(?![a-zA-Z0-9])/g, '<sup>$1</sup>');
    s = s.replace(/vec\{([^{}]*)\}/g, '<span class="vec">$1</span>');
    for (let k = 0; k < 4; k++) {
      s = s.replace(/√\{([^{}]*)\}/g, '<span class="sqrt">√<span class="rad">$1</span></span>');
      s = s.replace(/\[\[([^\[\]|]*)\|([^\[\]]*)\]\]/g, '<span class="fr"><span class="fn">$1</span><span class="fd">$2</span></span>');
    }
    s = s.replace(/`([^`]+)`/g, '<span class="m">$1</span>');
    s = s.replace(/\$([^$]+)\$/g, (m, f) => '<span class="m">' + f.trim() + '</span>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    s = s.replace(/(^|[\s(“"'>])\*(?!\s)([^*]+?)\*(?![\w*])/g, '$1<i>$2</i>');
    s = s.replace(/==(.+?)==/g, '<mark>$1</mark>');
    return s;
  };

  // Block markup: paragraphs, "## " headings, "- " / "1. " lists, "$$ display $$" formulas,
  // pipe tables, and callouts: ">* " key idea, ">! " exam trap, ">? " think, ">> " real world.
  const CALLOUT = { '*': ['key', 'Key idea'], '!': ['trap', 'Exam trap'], '?': ['think', 'Think about it'], '>': ['world', 'Real world'] };
  CQ.md = function (src) {
    if (src == null) return '';
    const lines = String(src).replace(/^\n+|\s+$/g, '').split('\n').map((l) => l.replace(/^\s{0,6}/, ''));
    const out = [];
    let para = [];
    let list = null;
    let callout = null;
    let table = null;
    const flushPara = () => { if (para.length) { out.push('<p>' + CQ.inl(para.join(' ')) + '</p>'); para = []; } };
    const flushList = () => { if (list) { out.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + CQ.inl(i) + '</li>').join('') + '</' + list.tag + '>'); list = null; } };
    const flushCallout = () => {
      if (callout) {
        const [cls, label] = CALLOUT[callout.kind];
        out.push('<div class="callout ' + cls + '"><div class="callout-h">' + label + '</div><div>' + callout.lines.map(CQ.inl).join('<br>') + '</div></div>');
        callout = null;
      }
    };
    const flushTable = () => {
      if (table) {
        const rows = table.filter((r) => !/^\|?\s*:?-{2,}/.test(r));
        const cells = (r) => r.replace(/\[\[[^\[\]]*\]\]/g, (f) => f.replace(/\|/g, '\u0001')).replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/\u0001/g, '|'));
        let h = '<div class="tbl-wrap"><table><thead><tr>' + cells(rows[0]).map((c) => '<th>' + CQ.inl(c) + '</th>').join('') + '</tr></thead><tbody>';
        rows.slice(1).forEach((r) => { h += '<tr>' + cells(r).map((c) => '<td>' + CQ.inl(c) + '</td>').join('') + '</tr>'; });
        out.push(h + '</tbody></table></div>');
        table = null;
      }
    };
    const flushAll = () => { flushPara(); flushList(); flushCallout(); flushTable(); };
    for (const line of lines) {
      let m;
      if (!line.trim()) { flushAll(); continue; }
      if ((m = line.match(/^>([*!?>])\s?(.*)$/))) {
        flushPara(); flushList(); flushTable();
        if (!callout || callout.kind !== m[1]) { flushCallout(); callout = { kind: m[1], lines: [] }; }
        callout.lines.push(m[2]);
        continue;
      }
      flushCallout();
      if ((m = line.match(/^\$\$(.+?)\$\$\s*$/))) {
        flushAll();
        const [f, note] = m[1].split('::');
        out.push('<div class="formula"><span class="m">' + CQ.inl(f.trim()) + '</span>' + (note ? '<span class="fnote">' + CQ.inl(note.trim()) + '</span>' : '') + '</div>');
        continue;
      }
      if (line.trim().startsWith('|')) { flushPara(); flushList(); (table = table || []).push(line.trim()); continue; }
      flushTable();
      if ((m = line.match(/^##\s+(.*)$/))) { flushAll(); out.push('<h4>' + CQ.inl(m[1]) + '</h4>'); continue; }
      if ((m = line.match(/^[-•]\s+(.*)$/))) {
        flushPara();
        if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; }
        list.items.push(m[1]);
        continue;
      }
      if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
        flushPara();
        if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; }
        list.items.push(m[1]);
        continue;
      }
      flushList();
      para.push(line);
    }
    flushAll();
    return out.join('');
  };

  CQ.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  CQ.strip = (html) => String(html || '').replace(/<[^>]+>/g, '');

  // Small stable string hash (for content ids).
  CQ.hash = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };

  /* ---------- dates ---------- */
  CQ.dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  CQ.dayNum = (d = new Date()) => Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  CQ.keyToNum = (k) => { const [y, m, d] = k.split('-').map(Number); return CQ.dayNum(new Date(y, m - 1, d)); };

  /* ---------- icons ---------- */
  const P = (d, extra = '') => '<path d="' + d + '"' + extra + '/>';
  const S = (inner, cls = '') => '<svg class="ic ' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>';
  const stroke = ' fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
  CQ.icons = {
    star: S(P('M12 2.6l2.85 5.9 6.45.88-4.7 4.5 1.17 6.42L12 17.2l-5.77 3.1 1.17-6.42-4.7-4.5 6.45-.88z')),
    check: S(P('M5 12.5l4.5 4.5L19 7.5', stroke)),
    x: S(P('M6 6l12 12M18 6L6 18', stroke)),
    lock: S('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/>' + P('M8 10.5V8a4 4 0 0 1 8 0v2.5', ' fill="none" stroke="currentColor" stroke-width="2.4"')),
    crown: S(P('M3 8.2l4.6 3.9L12 5l4.4 7.1L21 8.2l-1.9 10.3H4.9z') + '<rect x="4.9" y="19.6" width="14.2" height="2" rx="1"/>'),
    trophy: S(P('M7 3h10v5a5 5 0 0 1-10 0z') + P('M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5', ' fill="none" stroke="currentColor" stroke-width="2"') + '<rect x="10.8" y="12.5" width="2.4" height="4"/><rect x="7.5" y="17" width="9" height="3.5" rx="1"/>'),
    flame: S(P('M12.2 2c.7 3.7 5.3 6 5.3 11.3A5.5 5.5 0 0 1 12 19a5.5 5.5 0 0 1-5.5-5.7c0-2.7 1.5-4.4 2.6-5.3-.1 2 .8 3.4 2 3.6.2-3.1-.6-6.1 1.1-9.6z') + P('M12 21.5a3 3 0 0 1-3-3c0-1.6 1.1-2.6 1.8-3.2 0 1 .5 1.8 1.2 1.8.3-1 .4-1.6.2-3.2 1.6 1 2.8 2.6 2.8 4.6a3 3 0 0 1-3 3z', ' opacity=".55"')),
    gem: S(P('M6.5 3h11L22 8.6 12 21 2 8.6z') + P('M2 8.6h20M9 3l-2 5.6L12 21M15 3l2 5.6L12 21', ' fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"')),
    heart: S(P('M12 20.6S3.5 15.3 3.5 9.4A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.5 2.5c0 5.9-8.5 11.2-8.5 11.2z')),
    bolt: S(P('M13.5 2L4.5 13.6h6.6L10 22l9.5-12h-6.8z')),
    book: S(P('M3 5.2C5.8 4 8.9 4.2 12 6c3.1-1.8 6.2-2 9-.8V19c-2.8-1.1-5.9-.9-9 .9-3.1-1.8-6.2-2-9-.9z') + P('M12 6v13.9', ' fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.5"')),
    bulb: S(P('M12 2.5a6.5 6.5 0 0 0-4 11.6c.8.7 1.2 1.6 1.2 2.6v.8h5.6v-.8c0-1 .4-1.9 1.2-2.6A6.5 6.5 0 0 0 12 2.5z') + '<rect x="9.2" y="18.6" width="5.6" height="1.6" rx=".8"/><rect x="10" y="20.8" width="4" height="1.5" rx=".75"/>'),
    home: S(P('M3 11l9-7.5 9 7.5v9.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z')),
    review: S(P('M4.5 12a7.5 7.5 0 0 1 13.1-5M19.5 12a7.5 7.5 0 0 1-13.1 5', stroke) + P('M18.6 2.8v4.6H14M5.4 21.2v-4.6H10', stroke)),
    sheet: S(P('M6 2.5h8.5L19 7v13.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z') + P('M8.5 11h7M8.5 14.5h7M8.5 18h4.5', ' fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6" stroke-linecap="round"')),
    user: S('<circle cx="12" cy="8" r="4.5"/>' + P('M3.5 21a8.5 7 0 0 1 17 0z')),
    cog: S(P('M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', ' fill="none" stroke="currentColor" stroke-width="2.4"') + P('M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1', stroke)),
    sound: S(P('M4 9h3.5L13 4.5v15L7.5 15H4z') + P('M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12', ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"')),
    mute: S(P('M4 9h3.5L13 4.5v15L7.5 15H4z') + P('M16.5 9.5l5 5M21.5 9.5l-5 5', ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"')),
    chest: S(P('M3 10h18v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z') + P('M3 10V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2z', ' opacity=".75"') + '<rect x="10" y="8.5" width="4" height="5" rx="1" fill="rgba(255,255,255,.85)"/>'),
    play: S(P('M7 4.5v15l12-7.5z')),
    target: S('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.8"/>'),
    clock: S('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.3"/>' + P('M12 7v5.3l3.5 2', stroke)),
    flag: S(P('M5 21V3.5M5 4h11l-2 4 2 4H5', ' fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"')),
    chart: S('<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>'),
    sparkle: S(P('M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z')),
    arrowR: S(P('M5 12h13M13 6l6 6-6 6', stroke)),
    arrowL: S(P('M19 12H6M11 6l-6 6 6 6', stroke)),
    back: S(P('M15 5l-7 7 7 7', stroke)),
    rocket: S(P('M12 2c3.5 2.2 5.5 6 5.5 10.5l-2 4h-7l-2-4C6.5 8 8.5 4.2 12 2z') + '<circle cx="12" cy="9.5" r="2" fill="rgba(255,255,255,.8)"/>' + P('M8.5 16.5L6 21l3.5-1.5M15.5 16.5L18 21l-3.5-1.5', ' opacity=".7"')),
    flask: S(P('M9 2.5h6M10 2.5v6.2L4.3 18.4A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.7-3.1L14 8.7V2.5', ' fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"') + P('M7.2 14.5h9.6l2.6 4.4a1 1 0 0 1-.9 1.6H5.5a1 1 0 0 1-.9-1.6z')),
    gear: S(P('M10.3 2h3.4l.5 2.7 1.9.8 2.3-1.6 2.4 2.4-1.6 2.3.8 1.9 2.7.5v3.4l-2.7.5-.8 1.9 1.6 2.3-2.4 2.4-2.3-1.6-1.9.8-.5 2.7h-3.4l-.5-2.7-1.9-.8-2.3 1.6-2.4-2.4 1.6-2.3-.8-1.9L2 13.7v-3.4l2.7-.5.8-1.9-1.6-2.3 2.4-2.4 2.3 1.6 1.9-.8z') + '<circle cx="12" cy="12" r="3.4" fill="var(--surface)"/>'),
    skull: S(P('M12 2.5c-5 0-8.5 3.4-8.5 8 0 2.6 1.2 4.6 3 5.8V20a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-3.7c1.8-1.2 3-3.2 3-5.8 0-4.6-3.5-8-8.5-8z') + '<circle cx="8.6" cy="11.2" r="2.1" fill="var(--surface)"/><circle cx="15.4" cy="11.2" r="2.1" fill="var(--surface)"/>'),
    snow: S(P('M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5', stroke)),
    copy: S('<rect x="8" y="8" width="12" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/>' + P('M5 16V5a2 2 0 0 1 2-2h9', stroke)),
    eye: S(P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', ' fill="none" stroke="currentColor" stroke-width="2.2"') + '<circle cx="12" cy="12" r="3.2"/>'),
  };
  CQ.ic = (name, cls) => (cls ? (CQ.icons[name] || '').replace('class="ic ', 'class="ic ' + cls + ' ') : CQ.icons[name] || '');
})();
