/* Comet Quest — diagram builders. Every figure is inline SVG styled through
   theme tokens (see .dg rules in app.css), so it reads in light and dark. */
(function () {
  const CQ = window.CQ;
  const D = (CQ.dg = {});
  const r1 = (x) => Math.round(x * 10) / 10;
  const rad = (d) => (d * Math.PI) / 180;

  D.svg = (w, h, inner, label) => '<svg class="dg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + CQ.esc(label || 'diagram') + '">' + inner + '</svg>';
  D.line = (x1, y1, x2, y2, cls = 'ln') => '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" class="' + cls + '"/>';
  D.text = (x, y, s, cls = '', anchor = 'middle') => '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + anchor + '" dominant-baseline="middle" class="' + cls + '">' + s + '</text>';
  // Arrow with a solid head; the shaft stops short so the tip stays sharp.
  D.arrow = function (x1, y1, x2, y2, cls = 'c1', head = 11) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 1) return '';
    const sx = x2 - Math.cos(a) * head * 0.7, sy = y2 - Math.sin(a) * head * 0.7;
    const p1 = [x2 - head * Math.cos(a - 0.42), y2 - head * Math.sin(a - 0.42)];
    const p2 = [x2 - head * Math.cos(a + 0.42), y2 - head * Math.sin(a + 0.42)];
    return D.line(x1, y1, sx, sy, cls) + '<polygon points="' + [x2, y2, p1[0], p1[1], p2[0], p2[1]].map(r1).join(',') + '" class="' + cls + '"/>';
  };
  // Arrow given a start point, an angle (deg, math convention: 0 = right, 90 = up) and a length.
  D.arrowA = (x, y, deg, len, cls) => D.arrow(x, y, x + len * Math.cos(rad(deg)), y - len * Math.sin(rad(deg)), cls);
  D.arc = function (cx, cy, r, a0, a1, cls = 'thin') {
    const p = (a) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const sweep = a1 > a0 ? 0 : 1;
    return '<path d="M' + r1(x0) + ' ' + r1(y0) + ' A' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + r1(x1) + ' ' + r1(y1) + '" class="' + cls + '"/>';
  };
  D.ground = function (x1, x2, y, n) {
    let h = D.line(x1, y, x2, y, 'ln');
    const k = n || Math.floor((x2 - x1) / 14);
    for (let i = 0; i < k; i++) { const x = x1 + 6 + i * ((x2 - x1 - 6) / k); h += D.line(x, y, x - 8, y + 9, 'hatch'); }
    return h;
  };

  /* vector with its components */
  D.vector = function (o = {}) {
    const th = o.deg != null ? o.deg : 35, L = o.len || 170, ox = 44, oy = 176;
    const ex = ox + L * Math.cos(rad(th)), ey = oy - L * Math.sin(rad(th));
    let h = D.arrow(16, oy, 262, oy, 'thin', 8) + D.arrow(ox, 196, ox, 12, 'thin', 8);
    h += D.text(254, oy + 14, 'x', 't-m') + D.text(ox - 12, 18, 'y', 't-m');
    if (o.comps !== false) {
      h += D.arrow(ox, oy, ex, oy, 'c2') + D.arrow(ex, oy, ex, ey, 'c3');
      h += D.text((ox + ex) / 2, oy + 16, o.xl || 'A<tspan baseline-shift="sub" font-size="10">x</tspan> = A cos θ', 'c2');
      h += D.text(ex + 8, (oy + ey) / 2, o.yl || 'A<tspan baseline-shift="sub" font-size="10">y</tspan> = A sin θ', 'c3', 'start');
    }
    h += D.arrow(ox, oy, ex, ey, 'c1');
    h += D.text((ox + ex) / 2 - 14 * Math.sin(rad(th)), (oy + ey) / 2 - 14 * Math.cos(rad(th)), o.label || 'vec{A}'.replace(/vec\{(.)\}/, '$1⃗'), 'c1 t-it');
    h += D.arc(ox, oy, 36, 0, th) + D.text(ox + 50 * Math.cos(rad(th / 2)), oy - 50 * Math.sin(rad(th / 2)), 'θ', 't-it');
    return D.svg(o.w || 340, 210, h, 'Vector A at angle θ with its x and y components');
  };

  /* block on an incline */
  D.incline = function (o = {}) {
    const th = o.deg || 30, t = rad(th);
    const b = Math.min(270, 165 / Math.tan(t));
    const A = [300 - b, 196], B = [300, 196], C = [300, 196 - b * Math.tan(t)];
    let h = '<polygon points="' + [A, B, C].map((p) => p.map(r1).join(',')).join(' ') + '" class="gnd"/>' + D.line(A[0], A[1], C[0], C[1]) + D.line(10, 196, 316, 196);
    const u = [Math.cos(t), -Math.sin(t)], n = [-Math.sin(t), -Math.cos(t)];
    const s = (o.at || 0.55) * b / Math.cos(t);
    const P = [A[0] + s * u[0], A[1] + s * u[1]];
    const c = [P[0] + 21 * n[0], P[1] + 21 * n[1]];
    h += '<rect x="-21" y="-21" width="42" height="42" rx="4" class="obj" transform="translate(' + r1(c[0]) + ' ' + r1(c[1]) + ') rotate(' + -th + ')"/>';
    h += D.arc(A[0], A[1], 42, 0, th) + D.text(A[0] + 56 * Math.cos(t / 2), A[1] - 56 * Math.sin(t / 2), 'θ', 't-it');
    if (o.forces !== false) {
      h += D.arrow(c[0], c[1], c[0], c[1] + 78, 'c1') + D.text(c[0] + 14, c[1] + 82, 'mg', 'c1 t-it', 'start');
      h += D.arrow(c[0], c[1], c[0] + 70 * n[0], c[1] + 70 * n[1], 'c2') + D.text(c[0] + 84 * n[0], c[1] + 84 * n[1], 'n', 'c2 t-it');
      if (o.friction) h += D.arrow(c[0], c[1], c[0] + 62 * u[0] * o.friction, c[1] + 62 * u[1] * o.friction, 'c3') + D.text(c[0] + 76 * u[0] * o.friction, c[1] + 76 * u[1] * o.friction - 6, 'f', 'c3 t-it');
      if (o.comps) {
        h += D.arrow(c[0], c[1], c[0] - 78 * Math.sin(t) * u[0], c[1] - 78 * Math.sin(t) * u[1], 'c4');
        h += D.text(c[0] - 78 * Math.sin(t) * u[0] - 10, c[1] - 78 * Math.sin(t) * u[1] + 14, 'mg sin θ', 'c4', 'end');
        h += D.arrow(c[0], c[1], c[0] - 78 * Math.cos(t) * n[0], c[1] - 78 * Math.cos(t) * n[1], 'c5');
        h += D.text(c[0] - 78 * Math.cos(t) * n[0] + 10, c[1] - 78 * Math.cos(t) * n[1] + 6, 'mg cos θ', 'c5', 'start');
      }
    }
    return D.svg(330, 214, h, 'Block on an incline at angle θ' + (o.forces !== false ? ' with weight and normal force' : ''));
  };

  /* free-body diagram: forces = [{a: deg, len, label, cls}] */
  D.fbd = function (o = {}) {
    const cx = 150, cy = 115;
    let h = o.surface ? D.ground(40, 260, cy + 28) : '';
    h += '<rect x="' + (cx - 28) + '" y="' + (cy - 28) + '" width="56" height="56" rx="6" class="obj"/>' + (o.name ? D.text(cx, cy, o.name, 't-it') : '');
    (o.forces || []).forEach((f) => {
      const L = f.len || 70;
      const x2 = cx + L * Math.cos(rad(f.a)), y2 = cy - L * Math.sin(rad(f.a));
      h += D.arrow(cx, cy, x2, y2, f.cls || 'c1');
      h += D.text(cx + (L + 16) * Math.cos(rad(f.a)), cy - (L + 16) * Math.sin(rad(f.a)), f.label, (f.cls || 'c1') + ' t-it');
    });
    return D.svg(300, 230, h, o.alt || 'Free-body diagram');
  };

  /* projectile trajectory */
  D.projectile = function (o = {}) {
    const th = o.deg || 45, x0 = 34, y0 = 184, Rp = o.flat ? 0 : 270;
    const H = Math.min(132, (Rp / 4) * Math.tan(rad(th)));
    let h = D.ground(10, 330, y0);
    if (o.cliff) {
      // horizontal launch off a cliff of height h
      const top = 54;
      h = '<rect x="10" y="' + top + '" width="70" height="' + (y0 - top) + '" class="gnd"/>' + D.line(10, top, 80, top) + D.line(80, top, 80, y0) + D.line(10, y0, 330, y0);
      h += '<path d="M80 ' + top + ' Q 200 ' + top + ' 290 ' + y0 + '" class="dash"/>';
      h += D.arrow(80, top, 140, top, 'c1') + D.text(112, top - 14, 'v₀', 'c1 t-it');
      h += D.line(300, top, 300, y0, 'thin') + D.text(314, (top + y0) / 2, 'h', 't-it') + D.arrow(80, y0 + 12, 290, y0 + 12, 'thin', 7) + D.text(185, y0 + 24, 'x = ?', 't-m');
      return D.svg(340, 216, h, 'Ball launched horizontally from a cliff of height h');
    }
    h += '<path d="M' + x0 + ' ' + y0 + ' Q ' + (x0 + Rp / 2) + ' ' + (y0 - 2 * H) + ' ' + (x0 + Rp) + ' ' + y0 + '" class="dash"/>';
    const v = 74;
    const vx = v * Math.cos(rad(th)), vy = v * Math.sin(rad(th));
    h += D.arrow(x0, y0, x0 + vx, y0, 'c2') + D.arrow(x0 + vx, y0, x0 + vx, y0 - vy, 'c3');
    h += D.arrow(x0, y0, x0 + vx, y0 - vy, 'c1') + D.text(x0 + vx / 2 - 14, y0 - vy / 2 - 12, 'v₀', 'c1 t-it');
    h += D.text(x0 + vx / 2, y0 + 14, 'v₀ cos θ', 'c2') + D.text(x0 + vx + 6, y0 - vy / 2, 'v₀ sin θ', 'c3', 'start');
    h += D.line(x0 + Rp / 2, y0, x0 + Rp / 2, y0 - H, 'thin') + D.text(x0 + Rp / 2 + 10, y0 - H / 2, 'H', 't-it', 'start');
    h += D.arrow(x0 + Rp / 2, y0 - H, x0 + Rp / 2 + 50, y0 - H, 'c2') + D.text(x0 + Rp / 2 + 58, y0 - H, 'v = vₓ', 'c2', 'start');
    h += D.text(x0 + Rp, y0 + 16, 'R', 't-it');
    return D.svg(340, 210, h, 'Projectile launched at angle θ with range R and max height H');
  };

  /* simple graph: pts in data units */
  D.graph = function (o = {}) {
    const W = 300, Hh = 196, ox = 46, oy = 160, gw = 230, gh = 130;
    const xs = o.pts.map((p) => p[0]), ys = o.pts.map((p) => p[1]);
    const xmax = o.xmax || Math.max(...xs), ymax = o.ymax != null ? o.ymax : Math.max(0, ...ys), ymin = o.ymin != null ? o.ymin : Math.min(0, ...ys);
    const X = (x) => ox + (x / xmax) * gw, Y = (y) => oy - ((y - ymin) / (ymax - ymin || 1)) * gh;
    const y0 = Y(0);
    let h = D.arrow(ox, oy + 6, ox, oy - gh - 14, 'thin', 7) + D.arrow(ox - 4, y0, ox + gw + 14, y0, 'thin', 7);
    if (o.shade) h += '<polygon points="' + [[X(xs[0]), y0]].concat(o.pts.map((p) => [X(p[0]), Y(p[1])])).concat([[X(xs[xs.length - 1]), y0]]).map((p) => p.map(r1).join(',')).join(' ') + '" class="fillsoft"/>';
    h += '<polyline points="' + o.pts.map((p) => r1(X(p[0])) + ',' + r1(Y(p[1]))).join(' ') + '" class="c2" style="fill:none;stroke-width:3;stroke-linejoin:round"/>';
    (o.ticks || []).forEach((t) => { h += D.line(X(t), y0 - 3, X(t), y0 + 3, 'thin') + D.text(X(t), y0 + 13, t, 't-m'); });
    (o.yticks || []).forEach((t) => { h += D.line(ox - 3, Y(t), ox + 3, Y(t), 'thin') + D.text(ox - 8, Y(t), t, 't-m', 'end'); });
    (o.marks || []).forEach((m) => { h += '<circle cx="' + r1(X(m[0])) + '" cy="' + r1(Y(m[1])) + '" r="4.5" class="c1"/>' + (m[2] ? D.text(X(m[0]) + 8, Y(m[1]) - 12, m[2], 'c1', 'start') : ''); });
    h += D.text(ox + gw + 8, y0 - 12, o.xl || 't (s)', 't-m', 'end') + D.text(ox + 6, oy - gh - 12, o.yl || 'v (m/s)', 't-m', 'start');
    return D.svg(W, Hh, h, o.alt || 'Graph');
  };

  /* uniform circular motion */
  D.circle = function (o = {}) {
    const cx = 130, cy = 112, R = 80, a = o.deg || 50;
    const px = cx + R * Math.cos(rad(a)), py = cy - R * Math.sin(rad(a));
    let h = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="dash"/><circle cx="' + cx + '" cy="' + cy + '" r="3" class="c4"/>';
    h += D.line(cx, cy, px, py, 'thin') + D.text((cx + px) / 2 - 10, (cy + py) / 2 + 10, 'R', 't-it');
    h += '<circle cx="' + r1(px) + '" cy="' + r1(py) + '" r="10" class="obj"/>';
    h += D.arrowA(px, py, a + 90, 64, 'c2') + D.text(px + 78 * Math.cos(rad(a + 90)), py - 78 * Math.sin(rad(a + 90)), 'v', 'c2 t-it');
    h += D.arrowA(px, py, a + 180, 52, 'c1') + D.text(px + 40 * Math.cos(rad(a + 180)) + 4, py - 40 * Math.sin(rad(a + 180)) + 14, 'a', 'c1 t-it', 'start');
    return D.svg(270, 224, h, 'Object in uniform circular motion: velocity tangent, acceleration toward the center');
  };

  /* Atwood machine */
  D.atwood = function (o = {}) {
    let h = D.line(40, 14, 180, 14) + D.line(110, 14, 110, 40, 'ln');
    h += '<circle cx="110" cy="46" r="26" class="obj"/><circle cx="110" cy="46" r="4" class="c4"/>';
    h += D.line(84, 46, 84, 150, 'ln') + D.line(136, 46, 136, 116, 'ln');
    h += '<rect x="62" y="150" width="44" height="44" rx="4" class="obj"/>' + D.text(84, 172, o.l1 || 'm₁', 't-it');
    h += '<rect x="117" y="116" width="38" height="38" rx="4" class="obj2"/>' + D.text(136, 135, o.l2 || 'm₂', 't-it');
    h += D.arrow(84, 150, 84, 112, 'c2') + D.text(72, 120, 'T', 'c2 t-it', 'end') + D.arrow(84, 194, 84, 232, 'c1') + D.text(96, 228, o.w1 || 'm₁g', 'c1 t-it', 'start');
    h += D.arrow(136, 116, 136, 80, 'c2') + D.text(148, 86, 'T', 'c2 t-it', 'start') + D.arrow(136, 154, 136, 190, 'c1') + D.text(148, 188, o.w2 || 'm₂g', 'c1 t-it', 'start');
    return D.svg(220, 244, h, 'Atwood machine: two masses on a pulley');
  };

  /* block on a table pulled by a hanging mass */
  D.tablePulley = function (o = {}) {
    let h = '<rect x="20" y="104" width="214" height="12" class="gnd"/>' + D.line(20, 104, 234, 104) + D.line(40, 116, 40, 206) + D.line(214, 116, 214, 206);
    h += '<circle cx="240" cy="98" r="13" class="obj"/>';
    h += '<rect x="66" y="62" width="62" height="42" rx="4" class="obj"/>' + D.text(97, 83, 'm₁', 't-it');
    h += D.line(128, 83, 240, 85, 'ln') + D.line(253, 98, 253, 150, 'ln');
    h += '<rect x="234" y="150" width="38" height="38" rx="4" class="obj2"/>' + D.text(253, 169, 'm₂', 't-it');
    h += D.arrow(160, 70, 200, 70, 'c2') + D.text(180, 58, 'T', 'c2 t-it');
    if (o.friction) h += D.arrow(66, 96, 30, 96, 'c3') + D.text(36, 84, 'f', 'c3 t-it');
    h += D.arrow(253, 188, 253, 224, 'c1') + D.text(266, 216, 'm₂g', 'c1 t-it', 'start');
    return D.svg(300, 232, h, 'Block on a table connected over a pulley to a hanging mass');
  };

  /* mass hanging from two ropes */
  D.ropes = function (o = {}) {
    const a1 = o.a1 || 30, a2 = o.a2 || 60;
    const kx = 160, ky = 104;
    const lx = kx - (ky - 22) / Math.tan(rad(a1)), rx = kx + (ky - 22) / Math.tan(rad(a2));
    let h = D.line(Math.min(lx, 20) - 10, 22, Math.max(rx, 300) + 10, 22) + '<rect x="' + (Math.min(lx, 20) - 10) + '" y="10" width="' + (Math.max(rx, 300) - Math.min(lx, 20) + 20) + '" height="12" class="gnd"/>';
    h += D.line(lx, 22, kx, ky) + D.line(rx, 22, kx, ky) + D.line(kx, ky, kx, 150);
    h += '<rect x="' + (kx - 24) + '" y="150" width="48" height="40" rx="4" class="obj"/>' + D.text(kx, 170, o.m || 'm', 't-it');
    h += D.arc(lx, 22, 28, -a1, 0) + D.text(lx + 40 * Math.cos(rad(a1 / 2)), 22 + 40 * Math.sin(rad(a1 / 2)), 'θ₁', 't-it');
    h += D.arc(rx, 22, 28, 180, 180 + a2) + D.text(rx - 40 * Math.cos(rad(a2 / 2)), 22 + 40 * Math.sin(rad(a2 / 2)), 'θ₂', 't-it');
    h += D.text((lx + kx) / 2 - 12, (22 + ky) / 2 + 8, 'T₁', 'c2 t-it', 'end') + D.text((rx + kx) / 2 + 12, (22 + ky) / 2 + 8, 'T₂', 'c2 t-it', 'start');
    return D.svg(Math.max(rx, 300) + 20, 200, h, 'A weight hanging from two ropes at angles θ₁ and θ₂');
  };

  /* banked curve cross-section */
  D.banked = function (o = {}) {
    const th = o.deg || 20, t = rad(th);
    let h = '<polygon points="20,190 300,190 300,' + r1(190 - 280 * Math.tan(t)) + '" class="gnd"/>' + D.line(20, 190, 300, 190 - 280 * Math.tan(t));
    const P = [170, 190 - 150 * Math.tan(t)];
    const n = [-Math.sin(t), -Math.cos(t)];
    const c = [P[0] + 18 * n[0], P[1] + 18 * n[1]];
    h += '<rect x="-30" y="-18" width="60" height="36" rx="8" class="obj" transform="translate(' + r1(c[0]) + ' ' + r1(c[1]) + ') rotate(' + -th + ')"/>';
    h += D.arrow(c[0], c[1], c[0] + 86 * n[0], c[1] + 86 * n[1], 'c2') + D.text(c[0] + 98 * n[0], c[1] + 98 * n[1], 'n', 'c2 t-it');
    h += D.arrow(c[0], c[1], c[0], c[1] + 70, 'c1') + D.text(c[0] + 12, c[1] + 70, 'mg', 'c1 t-it', 'start');
    h += D.arrow(c[0] - 40, 40, c[0] - 110, 40, 'c4') + D.text(c[0] - 75, 28, 'to center', 'c4');
    h += D.arc(20, 190, 44, 0, th) + D.text(20 + 58 * Math.cos(t / 2), 190 - 58 * Math.sin(t / 2), 'β', 't-it');
    return D.svg(320, 206, h, 'Car on a curve banked at angle β');
  };

  /* mass on a horizontal spring */
  D.spring = function (o = {}) {
    let h = '<rect x="14" y="40" width="12" height="96" class="gnd"/>' + D.line(26, 40, 26, 136) + D.ground(26, 330, 136);
    const x1 = 26, x2 = o.x || 170, y = 98, n = 9;
    let d = 'M' + x1 + ' ' + y + ' L' + (x1 + 10) + ' ' + y;
    for (let i = 0; i < n; i++) d += ' L' + r1(x1 + 10 + ((i + 0.5) * (x2 - x1 - 20)) / n) + ' ' + (y + (i % 2 ? 12 : -12));
    d += ' L' + (x2 - 10) + ' ' + y + ' L' + x2 + ' ' + y;
    h += '<path d="' + d + '" class="ln"/><rect x="' + x2 + '" y="74" width="54" height="62" rx="5" class="obj"/>' + D.text(x2 + 27, 105, 'm', 't-it');
    if (o.eq) h += D.line(o.eq, 30, o.eq, 150, 'dash') + D.text(o.eq, 22, 'x = 0', 't-m');
    if (o.label) h += D.text(x1 + (x2 - x1) / 2, 64, o.label, 't-it');
    return D.svg(340, 160, h, 'Mass attached to a spring');
  };

  /* simple pendulum */
  D.pendulum = function (o = {}) {
    const th = o.deg || 25, L = 140, px = 150 + L * Math.sin(rad(th)), py = 20 + L * Math.cos(rad(th));
    let h = '<rect x="80" y="8" width="140" height="12" class="gnd"/>' + D.line(80, 20, 220, 20) + D.line(150, 20, 150, 176, 'dash');
    h += D.line(150, 20, px, py) + '<circle cx="' + r1(px) + '" cy="' + r1(py) + '" r="14" class="obj"/>';
    h += D.arc(150, 20, 42, -90, -90 + th) + D.text(150 + 54 * Math.sin(rad(th / 2)), 20 + 54 * Math.cos(rad(th / 2)), 'θ', 't-it');
    h += D.text((150 + px) / 2 + 12, (20 + py) / 2 - 4, 'L', 't-it', 'start');
    return D.svg(300, 196, h, 'Simple pendulum of length L displaced by angle θ');
  };

  /* bar chart of energies: items = [[label, value, cls]] */
  D.bars = function (o = {}) {
    const items = o.items, W = 60 + items.length * 70, base = 150, max = o.max || Math.max(...items.map((i) => Math.abs(i[1]))) || 1;
    let h = D.line(30, base, W - 10, base, 'ln');
    items.forEach((it, i) => {
      const x = 50 + i * 70, hh = (Math.abs(it[1]) / max) * 120;
      h += '<rect x="' + x + '" y="' + r1(it[1] >= 0 ? base - hh : base) + '" width="40" height="' + r1(hh) + '" rx="4" class="' + (it[2] || 'c2') + '" style="stroke:none"/>';
      h += D.text(x + 20, base + 16, it[0], 't-it') + (it[3] ? D.text(x + 20, (it[1] >= 0 ? base - hh : base + hh) - 10, it[3], 't-m') : '');
    });
    return D.svg(W, 176, h, o.alt || 'Energy bar chart');
  };

  /* two carts colliding */
  D.carts = function (o = {}) {
    const cart = (x, label, cls) => '<rect x="' + x + '" y="60" width="70" height="40" rx="6" class="' + cls + '"/>' + '<circle cx="' + (x + 16) + '" cy="106" r="7" class="obj"/><circle cx="' + (x + 54) + '" cy="106" r="7" class="obj"/>' + D.text(x + 35, 80, label, 't-it');
    let h = D.ground(10, 350, 113);
    h += cart(40, o.l1 || 'm₁', 'obj') + cart(220, o.l2 || 'm₂', 'obj2');
    h += D.arrow(80, 42, 150, 42, 'c1') + D.text(115, 28, o.v1 || 'v₁', 'c1 t-it');
    if (o.v2) h += D.arrow(255, 42, o.v2dir === 'left' ? 195 : 315, 42, 'c2') + D.text(255, 28, o.v2, 'c2 t-it');
    return D.svg(360, 130, h, 'Two carts on a track before a collision');
  };

  /* rotating disk with radius, ω and a point's speed */
  D.disk = function (o = {}) {
    const cx = 130, cy = 110, R = 78;
    let h = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="obj"/><circle cx="' + cx + '" cy="' + cy + '" r="4" class="c4"/>';
    h += D.line(cx, cy, cx + R * 0.94, cy - R * 0.34, 'ln') + D.text(cx + R * 0.45, cy - R * 0.08, 'r', 't-it');
    h += '<circle cx="' + r1(cx + R * 0.94) + '" cy="' + r1(cy - R * 0.34) + '" r="5" class="c1"/>';
    h += D.arrowA(cx + R * 0.94, cy - R * 0.34, 110, 56, 'c1') + D.text(cx + R * 0.94 + 6, cy - R * 0.34 - 62, 'v = rω', 'c1', 'start');
    h += '<path d="M' + (cx - 32) + ' ' + (cy + 46) + ' A 56 56 0 0 0 ' + (cx + 32) + ' ' + (cy + 46) + '" class="c2" style="fill:none;stroke-width:3"/>' + D.arrowA(cx + 30, cy + 47, 30, 10, 'c2') + D.text(cx, cy + 74, 'ω', 'c2 t-it');
    return D.svg(270, 220, h, 'Rotating disk: a point at radius r moves at v = rω');
  };

  /* wrench / lever arm torque */
  D.torque = function (o = {}) {
    const phi = o.deg || 60;
    const px = 40, py = 120, ex = 260, ey = 120;
    let h = '<rect x="' + px + '" y="' + (py - 9) + '" width="' + (ex - px) + '" height="18" rx="9" class="obj"/>' + '<circle cx="' + px + '" cy="' + py + '" r="16" class="obj2"/><circle cx="' + px + '" cy="' + py + '" r="4" class="c4"/>';
    h += D.text(px, py + 34, 'pivot', 't-m');
    h += D.arrowA(ex, ey, phi, 86, 'c1') + D.text(ex + 98 * Math.cos(rad(phi)), ey - 98 * Math.sin(rad(phi)), 'F', 'c1 t-it');
    h += D.arc(ex, ey, 30, 0, phi) + D.text(ex + 44 * Math.cos(rad(phi / 2)), ey - 44 * Math.sin(rad(phi / 2)), 'φ', 't-it');
    h += D.line(px, py + 22, ex, py + 22, 'thin') + D.text((px + ex) / 2, py + 34, 'r', 't-it');
    return D.svg(350, 160, h, 'Force F applied at distance r from a pivot at angle φ');
  };
})();
