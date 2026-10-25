/* Comet Quest — diagram builders. Every figure is inline SVG styled through
   theme tokens (see .dg rules in app.css), so it reads in light and dark. */
(function () {
  const CQ = window.CQ;
  const D = (CQ.dg = {});
  const r1 = (x) => Math.round(x * 10) / 10;
  const rad = (d) => (d * Math.PI) / 180;

  D.svg = (w, h, inner, label) => '<svg class="dg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + CQ.esc(label || 'diagram') + '">' + inner + '</svg>';
  D.line = (x1, y1, x2, y2, cls = 'ln') => '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" class="' + cls + '"/>';
  // "n_A" or "F_{g}" in labels becomes a real subscript
  const subs = (s) => String(s).replace(/_\{?([A-Za-z0-9]+)\}?/g, '<tspan baseline-shift="sub" font-size="10">$1</tspan>');
  D.text = (x, y, s, cls = '', anchor = 'middle') => '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + anchor + '" dominant-baseline="middle" class="' + cls + '">' + subs(s) + '</text>';
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
    h += D.text((ox + ex) / 2 - 14 * Math.sin(rad(th)), (oy + ey) / 2 - 14 * Math.cos(rad(th)), o.label || 'A', 'c1 t-it');
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
    h += D.text(x0 + vx / 2 + 6, y0 + 22, 'v₀ cos θ', 'c2') + D.text(x0 + vx + 6, y0 - vy / 2, 'v₀ sin θ', 'c3', 'start');
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
    h += D.line(cx, cy, px, py, 'thin') + D.text((cx + px) / 2 - 12 * Math.sin(rad(a)), (cy + py) / 2 - 12 * Math.cos(rad(a)), 'R', 't-it');
    h += '<circle cx="' + r1(px) + '" cy="' + r1(py) + '" r="10" class="obj"/>';
    h += D.arrowA(px, py, a + 90, 64, 'c2') + D.text(px + 78 * Math.cos(rad(a + 90)), py - 78 * Math.sin(rad(a + 90)), 'v', 'c2 t-it');
    h += D.arrowA(px, py, a + 180, 52, 'c1') + D.text(px + 34 * Math.cos(rad(a + 180)) + 12 * Math.sin(rad(a)), py - 34 * Math.sin(rad(a + 180)) + 12 * Math.cos(rad(a)), 'a', 'c1 t-it');
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

  /* horizontal beam with supports and loads.
     supports: [{x: 0..1, type: 'pin'|'roller'|'fulcrum', label}], loads: [{x: 0..1, label, up}] */
  D.beam = function (o = {}) {
    const x0 = 40, x1 = 320, y = 92, X = (f) => x0 + f * (x1 - x0);
    let h = '<rect x="' + x0 + '" y="' + (y - 7) + '" width="' + (x1 - x0) + '" height="14" rx="3" class="obj"/>';
    (o.supports || []).forEach((s) => {
      const x = X(s.x);
      h += '<polygon points="' + x + ',' + (y + 7) + ' ' + (x - 13) + ',' + (y + 30) + ' ' + (x + 13) + ',' + (y + 30) + '" class="obj2"/>';
      if (s.type === 'roller') h += '<circle cx="' + (x - 6) + '" cy="' + (y + 35) + '" r="4" class="obj"/><circle cx="' + (x + 6) + '" cy="' + (y + 35) + '" r="4" class="obj"/>';
      h += D.line(x - 22, y + (s.type === 'roller' ? 40 : 31), x + 22, y + (s.type === 'roller' ? 40 : 31), 'ln');
      if (s.label) h += D.arrow(x, y + 70, x, y + 12, 'c2') + D.text(x + 10, y + 64, s.label, 'c2 t-it', 'start');
    });
    (o.loads || []).forEach((l) => {
      const x = X(l.x);
      h += D.arrow(x, y - 64, x, y - 8, l.cls || 'c1') + D.text(x, y - 74, l.label, (l.cls || 'c1') + ' t-it');
    });
    (o.dims || []).forEach((d) => { h += D.line(X(d[0]), 168, X(d[1]), 168, 'thin') + D.line(X(d[0]), 162, X(d[0]), 174, 'thin') + D.line(X(d[1]), 162, X(d[1]), 174, 'thin') + D.text((X(d[0]) + X(d[1])) / 2, 184, d[2], 't-m'); });
    return D.svg(360, 194, h, o.alt || 'Beam on supports with loads');
  };

  /* ladder against a frictionless wall */
  D.ladder = function (o = {}) {
    const th = o.deg || 60, Lp = 190, fx = 60, fy = 200;
    const tx = fx + Lp * Math.cos(rad(th)), ty = fy - Lp * Math.sin(rad(th));
    let h = '<rect x="' + (tx) + '" y="10" width="14" height="' + (fy - 10) + '" class="gnd"/>' + D.line(tx, 10, tx, fy) + D.ground(20, tx, fy);
    h += D.line(fx, fy, tx, ty, 'ln') + D.line(fx + 6, fy + 2, tx + 4, ty + 3, 'thin');
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;
    h += D.arrow(mx, my, mx, my + 56, 'c1') + D.text(mx + 10, my + 52, 'w', 'c1 t-it', 'start');
    h += D.arrow(tx, ty, tx - 52, ty, 'c2') + D.text(tx - 60, ty - 10, 'n₂', 'c2 t-it');
    h += D.arrow(fx, fy, fx, fy - 56, 'c2') + D.text(fx - 12, fy - 52, 'n₁', 'c2 t-it', 'end');
    h += D.arrow(fx, fy, fx + 48, fy, 'c3') + D.text(fx + 30, fy + 14, 'f', 'c3 t-it');
    h += D.arc(fx, fy, 30, 0, th) + D.text(fx + 44 * Math.cos(rad(th / 2)), fy - 44 * Math.sin(rad(th / 2)), 'θ', 't-it');
    return D.svg(300, 220, h, 'Ladder leaning on a frictionless wall at angle θ');
  };

  /* rolling object on an incline */
  D.roll = function (o = {}) {
    const th = 22, t = rad(th);
    let h = '<polygon points="20,190 320,190 320,' + r1(190 - 300 * Math.tan(t)) + '" class="gnd"/>' + D.line(20, 190, 320, 190 - 300 * Math.tan(t));
    const P = [250, 190 - 230 * Math.tan(t)], n = [-Math.sin(t), -Math.cos(t)];
    const c = [P[0] + 26 * n[0], P[1] + 26 * n[1]];
    h += '<circle cx="' + r1(c[0]) + '" cy="' + r1(c[1]) + '" r="26" class="obj"/>' + D.line(c[0], c[1], c[0] + 26 * Math.cos(rad(50)), c[1] - 26 * Math.sin(rad(50)), 'thin');
    h += D.arrowA(c[0] - 34, c[1] - 6, 180 + th, 50, 'c1') + D.text(c[0] - 70, c[1] + 26, 'v = Rω', 'c1');
    h += D.text(300, 60, 'h', 't-it') + D.line(310, 190, 310, P[1], 'dash');
    return D.svg(340, 206, h, 'Ball rolling without slipping down an incline');
  };

  /* satellite on a circular orbit */
  D.orbit = function () {
    const cx = 140, cy = 112, R = 86;
    let h = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="dash"/><circle cx="' + cx + '" cy="' + cy + '" r="30" class="obj2"/>' + D.text(cx, cy, 'M', 't-it');
    const a = 35, px = cx + R * Math.cos(rad(a)), py = cy - R * Math.sin(rad(a));
    h += '<circle cx="' + r1(px) + '" cy="' + r1(py) + '" r="8" class="obj"/>' + D.line(cx, cy, px, py, 'thin') + D.text((cx + px) / 2 - 6, (cy + py) / 2 - 12, 'r', 't-it');
    h += D.arrowA(px, py, a + 90, 60, 'c2') + D.text(px + 72 * Math.cos(rad(a + 90)), py - 72 * Math.sin(rad(a + 90)), 'v', 'c2 t-it');
    h += D.arrowA(px, py, a + 180, 40, 'c1') + D.text(px - 8, py + 34, 'F_g', 'c1 t-it');
    return D.svg(290, 226, h, 'Satellite of mass m orbiting a planet of mass M at radius r');
  };

  /* sinusoidal wave with wavelength and amplitude marked */
  D.wave = function (o = {}) {
    const x0 = 30, W = 300, y0 = 90, A = 44, lam = o.lam || 150;
    let d = '';
    for (let x = 0; x <= W; x += 3) d += (x ? ' L' : 'M') + r1(x0 + x) + ' ' + r1(y0 - A * Math.sin((2 * Math.PI * x) / lam));
    let h = D.line(x0 - 6, y0, x0 + W + 10, y0, 'thin') + '<path d="' + d + '" class="c2" style="fill:none;stroke-width:3"/>';
    const p1 = x0 + lam / 4, p2 = p1 + lam;
    h += D.line(p1, y0 - A - 12, p1, y0 - A - 2, 'thin') + D.line(p2, y0 - A - 12, p2, y0 - A - 2, 'thin') + D.arrow(p1 + 4, y0 - A - 7, p2 - 2, y0 - A - 7, 'thin', 7) + D.arrow(p2 - 4, y0 - A - 7, p1 + 2, y0 - A - 7, 'thin', 7) + D.text((p1 + p2) / 2, y0 - A - 20, 'λ', 't-it');
    const px = x0 + (3 * lam) / 4;
    h += D.arrow(px, y0, px, y0 + A, 'c1', 8) + D.text(px + 10, y0 + A / 2, 'A', 'c1 t-it', 'start');
    if (o.dir) h += D.arrow(x0 + W - 70, 20, x0 + W - 10, 20, 'c4') + D.text(x0 + W - 40, 8, 'v', 'c4 t-it');
    return D.svg(350, 160, h, 'Sinusoidal wave showing wavelength λ and amplitude A');
  };

  /* standing waves on a string fixed at both ends: harmonics 1..n */
  D.standing = function (o = {}) {
    const n = o.n || 3, x0 = 30, W = 280, rows = o.all ? n : 1;
    let h = '';
    for (let r = 0; r < rows; r++) {
      const k = o.all ? r + 1 : n, y0 = 36 + r * 62, A = 20;
      let d1 = '', d2 = '';
      for (let x = 0; x <= W; x += 3) {
        const yy = A * Math.sin((k * Math.PI * x) / W);
        d1 += (x ? ' L' : 'M') + r1(x0 + x) + ' ' + r1(y0 - yy);
        d2 += (x ? ' L' : 'M') + r1(x0 + x) + ' ' + r1(y0 + yy);
      }
      h += '<path d="' + d1 + '" class="c2" style="fill:none;stroke-width:2.5"/><path d="' + d2 + '" class="c2" style="fill:none;stroke-width:2.5;opacity:.45"/>';
      h += '<rect x="' + (x0 - 8) + '" y="' + (y0 - 24) + '" width="8" height="48" class="gnd"/><rect x="' + (x0 + W) + '" y="' + (y0 - 24) + '" width="8" height="48" class="gnd"/>';
      h += D.text(x0 + W + 22, y0, 'n = ' + k, 't-m', 'start');
    }
    return D.svg(370, 20 + rows * 62, h, 'Standing wave harmonics on a string fixed at both ends');
  };

  /* ===== chemistry ===== */
  // orbital box diagram: subs = [['1s', 2], ['2s', 2], ['2p', 3]]
  D.orbBoxes = function (subs, o = {}) {
    const W = 24, gap = 16;
    let x = 10, h = '';
    subs.forEach(([lab, n]) => {
      const cap = { s: 2, p: 6, d: 10, f: 14 }[lab.slice(-1)], k = cap / 2;
      for (let i = 0; i < k; i++) {
        const up = n > i ? 1 : 0, dn = n > k + i ? 1 : 0;
        h += '<rect x="' + (x + i * W) + '" y="14" width="' + W + '" height="30" class="obj"/>';
        if (up) h += D.arrow(x + i * W + (dn ? 8 : 12), 39, x + i * W + (dn ? 8 : 12), 19, 'c2', 6);
        if (dn) h += D.arrow(x + i * W + 16, 19, x + i * W + 16, 39, 'c1', 6);
      }
      h += D.text(x + (k * W) / 2, 58, lab, 't-it');
      x += k * W + gap;
    });
    return D.svg(x, 70, h, o.alt || 'Orbital box diagram');
  };

  // Bohr energy levels for hydrogen with optional transitions [[from, to], ...]
  D.levels = function (o = {}) {
    const top = 22, bot = 200, Y = (n) => top + (bot - top) * (1 / (n * n));
    let h = D.line(70, top - 6, 70, bot + 6, 'thin') + D.text(36, top, 'E = 0', 't-m');
    for (let n = 1; n <= 6; n++) { h += D.line(60, Y(n) + 0, 250, Y(n), n === 1 ? 'ln' : 'thin') + (n <= 3 ? D.text(262, Y(n) + (n === 3 ? 4 : 0), 'n = ' + n, 't-m', 'start') : ''); }
    h += D.text(262, top - 8, 'n = 4, 5, … ∞', 't-m', 'start');
    (o.trans || []).forEach(([a, b], i) => {
      const x = 110 + i * 40;
      h += D.arrow(x, Y(a), x, Y(b), b < a ? 'c1' : 'c2', 9);
    });
    h += D.text(30, bot, '−2.18', 't-m') + D.text(30, bot + 14, '×10⁻¹⁸ J', 't-m');
    return D.svg(320, 222, h, 'Energy levels of the hydrogen atom');
  };

  // electromagnetic spectrum strip
  D.spectrum = function () {
    const bands = [['γ ray', 'c4'], ['X-ray', 'c4'], ['UV', 'c4'], ['visible', ''], ['IR', 'c6'], ['micro', 'c6'], ['radio', 'c6']];
    let h = '<defs><linearGradient id="vis"><stop offset="0" stop-color="#7b3fe4"/><stop offset=".25" stop-color="#2f6bff"/><stop offset=".5" stop-color="#22c55e"/><stop offset=".75" stop-color="#facc15"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs>';
    bands.forEach(([lab, cls], i) => {
      const x = 10 + i * 48;
      h += '<rect x="' + x + '" y="30" width="46" height="30" rx="4" ' + (lab === 'visible' ? 'fill="url(#vis)"' : 'class="' + (i < 3 ? 'fillsoft' : 'fillgold') + '"') + '/>' + D.text(x + 23, 74, lab, 't-m');
    });
    h += D.arrow(20, 14, 330, 14, 'c2', 8) + D.text(175, 6, 'wavelength λ increases →', 't-m');
    h += D.arrow(330, 96, 20, 96, 'c1', 8) + D.text(175, 110, '← frequency ν and energy E increase', 't-m');
    return D.svg(350, 118, h, 'Electromagnetic spectrum from gamma rays to radio');
  };

  // simplified periodic table (no f block); hl = {Sym: cls}; trend = 'radius' | 'ie' | 'en'
  const PT = ['H', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'He',
    'Li', 'Be', '', '', '', '', '', '', '', '', '', '', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', '', '', '', '', '', '', '', '', '', '', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
    'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
    'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
    'Cs', 'Ba', 'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn'];
  D.ptable = function (o = {}) {
    const c = 19, x0 = 6, y0 = 6;
    let h = '';
    PT.forEach((sym, i) => {
      if (!sym) return;
      const col = i % 18, row = Math.floor(i / 18);
      const block = col < 2 || sym === 'He' ? 'fillsoft' : col < 12 ? 'fillgold' : 'fillgood';
      const hl = o.hl && o.hl[sym];
      h += '<rect x="' + (x0 + col * c) + '" y="' + (y0 + row * c) + '" width="' + (c - 2) + '" height="' + (c - 2) + '" rx="3" class="' + (hl || block) + '"' + (hl ? ' style="stroke:none"' : '') + '/>';
      h += '<text x="' + (x0 + col * c + (c - 2) / 2) + '" y="' + (y0 + row * c + (c - 2) / 2 + 1) + '" text-anchor="middle" dominant-baseline="middle" style="font-size:7.5px;font-weight:800' + (hl ? ';fill:#fff' : '') + '">' + sym + '</text>';
    });
    const W = x0 + 18 * c, H = y0 + 6 * c;
    if (o.trend) {
      const lab = { radius: 'atomic radius', ie: 'ionization energy', en: 'electronegativity', ea: 'electron affinity (more −)', metal: 'metallic character' }[o.trend];
      const up = o.trend === 'radius' || o.trend === 'metal';
      // arrows point toward increase
      h += up ? D.arrow(W - 20, H + 14, 20, H + 14, 'c1', 8) : D.arrow(20, H + 14, W - 20, H + 14, 'c1', 8);
      h += up ? D.arrow(W + 10, 12, W + 10, H - 4, 'c1', 8) : D.arrow(W + 10, H - 4, W + 10, 12, 'c1', 8);
      h += D.text(W / 2, H + 28, lab + ' increases', 'c1');
    }
    return D.svg(W + 24, H + (o.trend ? 38 : 8), h, 'Periodic table' + (o.trend ? ' with the ' + o.trend + ' trend' : ''));
  };

  /* Lewis structure: atoms [{e, x, y, lp: [angles of lone pairs], fc: '+'|'−'|'2−'}], bonds [[i, j, order]] */
  D.lewis = function (o) {
    const A = o.atoms;
    let h = '';
    (o.bonds || []).forEach(([i, j, n]) => {
      const a = A[i], b = A[j];
      const dx = b.x - a.x, dy = b.y - a.y, Lb = Math.hypot(dx, dy), ux = dx / Lb, uy = dy / Lb, px = -uy, py = ux, sh = 14;
      for (let k = 0; k < n; k++) { const off = (k - (n - 1) / 2) * 6; h += D.line(a.x + ux * sh + px * off, a.y + uy * sh + py * off, b.x - ux * sh + px * off, b.y - uy * sh + py * off, 'ln'); }
    });
    A.forEach((a) => {
      h += '<text x="' + a.x + '" y="' + (a.y + 1) + '" text-anchor="middle" dominant-baseline="middle" class="at">' + a.e + '</text>';
      (a.lp || []).forEach((ang) => {
        const r = 18, cx = a.x + r * Math.cos(rad(ang)), cy = a.y - r * Math.sin(rad(ang)), tx = -Math.sin(rad(ang)), ty = -Math.cos(rad(ang));
        h += '<circle cx="' + r1(cx + 4 * tx) + '" cy="' + r1(cy + 4 * ty) + '" r="2.6" class="lp"/><circle cx="' + r1(cx - 4 * tx) + '" cy="' + r1(cy - 4 * ty) + '" r="2.6" class="lp"/>';
      });
      if (a.fc) h += D.text(a.x + 16, a.y - 16, a.fc, 'c6 t-m', 'start');
    });
    if (o.bracket) { const xs = A.map((a) => a.x), ys = A.map((a) => a.y); const x1 = Math.min(...xs) - 34, x2 = Math.max(...xs) + 34, y1 = Math.min(...ys) - 34, y2 = Math.max(...ys) + 34; h += '<path d="M' + (x1 + 8) + ' ' + y1 + ' H' + x1 + ' V' + y2 + ' H' + (x1 + 8) + ' M' + (x2 - 8) + ' ' + y1 + ' H' + x2 + ' V' + y2 + ' H' + (x2 - 8) + '" class="ln"/>' + D.text(x2 + 6, y1 + 4, o.bracket, 't-it', 'start'); }
    return D.svg(o.w || 240, o.h || 140, h, o.alt || 'Lewis structure');
  };

  /* enthalpy level diagram for an exothermic or endothermic reaction */
  D.enthalpy = function (o = {}) {
    const exo = o.exo !== false, yR = exo ? 50 : 140, yP = exo ? 140 : 50;
    let h = D.arrow(30, 180, 30, 14, 'thin', 7) + D.text(42, 18, 'H', 't-it', 'start');
    h += D.line(60, yR, 150, yR, 'ln') + D.text(105, yR - 14, o.r || 'reactants', 't-m');
    h += D.line(190, yP, 280, yP, 'ln') + D.text(235, yP - 14, o.p || 'products', 't-m');
    h += D.line(150, yR, 190, yR, 'dash');
    h += D.arrow(170, yR, 170, yP, exo ? 'c1' : 'c2', 9) + D.text(176, (yR + yP) / 2, 'ΔH ' + (exo ? '< 0' : '> 0'), (exo ? 'c1' : 'c2'), 'start');
    h += D.text(160, 196, exo ? 'exothermic: heat released' : 'endothermic: heat absorbed', 't-m');
    return D.svg(300, 206, h, exo ? 'Exothermic enthalpy diagram' : 'Endothermic enthalpy diagram');
  };

  /* ===== mechanical engineering ===== */
  // simple triangular truss: pin at A (left), roller at B (right), apex C loaded by P
  D.truss = function (o = {}) {
    const th = o.deg || 40, A = [50, 170], B = [290, 170], h2 = 120 * Math.tan(rad(th)), C = [170, 170 - Math.min(130, h2)];
    let h = '';
    [[A, B], [A, C], [B, C]].forEach(([p, q]) => { h += D.line(p[0], p[1], q[0], q[1], 'ln') + D.line(p[0], p[1], q[0], q[1], 'thin'); });
    [A, B, C].forEach((p) => { h += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="6" class="obj"/>'; });
    h += '<polygon points="' + A[0] + ',' + (A[1] + 6) + ' ' + (A[0] - 12) + ',' + (A[1] + 26) + ' ' + (A[0] + 12) + ',' + (A[1] + 26) + '" class="obj2"/>' + D.line(A[0] - 20, A[1] + 27, A[0] + 20, A[1] + 27, 'ln');
    h += '<polygon points="' + B[0] + ',' + (B[1] + 6) + ' ' + (B[0] - 12) + ',' + (B[1] + 22) + ' ' + (B[0] + 12) + ',' + (B[1] + 22) + '" class="obj2"/><circle cx="' + (B[0] - 6) + '" cy="' + (B[1] + 27) + '" r="4" class="obj"/><circle cx="' + (B[0] + 6) + '" cy="' + (B[1] + 27) + '" r="4" class="obj"/>' + D.line(B[0] - 20, B[1] + 32, B[0] + 20, B[1] + 32, 'ln');
    h += D.arrow(C[0], C[1] - 62, C[0], C[1] - 9, 'c1') + D.text(C[0] + 10, C[1] - 56, o.P || 'P', 'c1 t-it', 'start');
    h += D.text(A[0] - 14, A[1] - 12, 'A', 't-it') + D.text(B[0] + 14, B[1] - 12, 'B', 't-it') + D.text(C[0] - 16, C[1] - 4, 'C', 't-it');
    h += D.arc(A[0], A[1], 34, 0, Math.atan2(A[1] - C[1], C[0] - A[0]) * 180 / Math.PI) + D.text(A[0] + 46, A[1] - 12, 'θ', 't-it');
    return D.svg(340, 206, h, 'Triangular truss with a load P at the top joint');
  };

  // two meshing gears with tooth counts
  D.gears = function (o = {}) {
    const n1 = o.n1 || 12, n2 = o.n2 || 24, m = 3.2;
    const r1g = n1 * m / 2 + 6, r2g = n2 * m / 2 + 6;
    const cy = 20 + Math.max(r1g, r2g), c1 = 20 + r1g, c2 = c1 + r1g + r2g - 6;
    const gear = (cx, r, n, lab, cls) => '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" class="' + cls + '" style="stroke-width:10;stroke-dasharray:' + r1((Math.PI * r) / n) + ' ' + r1((Math.PI * r) / n) + '"/><circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r - 5) + '" class="' + cls + '"/><circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="5" class="c4"/>' + D.text(cx, cy + r + 18, lab, 't-it');
    let h = gear(c1, r1g, n1, (o.l1 || 'N₁ = ' + n1), 'obj2') + gear(c2, r2g, n2, (o.l2 || 'N₂ = ' + n2), 'obj');
    h += '<path d="M' + r1(c1 - 16) + ' ' + r1(cy - r1g - 14) + ' A 26 26 0 0 1 ' + r1(c1 + 16) + ' ' + r1(cy - r1g - 14) + '" class="c2" style="fill:none;stroke-width:3"/>' + D.arrowA(c1 + 14, cy - r1g - 15, -30, 8, 'c2') + D.text(c1, cy - r1g - 34, o.w1 || 'ω_in', 'c2 t-it');
    h += '<path d="M' + r1(c2 + 16) + ' ' + r1(cy - r2g - 14) + ' A 26 26 0 0 0 ' + r1(c2 - 16) + ' ' + r1(cy - r2g - 14) + '" class="c1" style="fill:none;stroke-width:3"/>' + D.arrowA(c2 - 14, cy - r2g - 15, 210, 8, 'c1') + D.text(c2, cy - r2g - 34, o.w2 || 'ω_out', 'c1 t-it');
    return D.svg(r1(c2 + r2g + 24), r1(cy + Math.max(r1g, r2g) + 32), h, 'Two meshing spur gears; they turn in opposite directions');
  };

  // compound gear train: gear 1 drives 2; 2 and 3 share a shaft; 3 drives 4
  D.train = function () {
    let h = '';
    const g = (cx, cy, r, lab, cls) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="' + cls + '" style="stroke-width:8;stroke-dasharray:4 4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 4) + '" class="' + cls + '"/>' + D.text(cx, cy + r + 14, lab, 't-it');
    h += g(50, 70, 22, '1', 'obj2') + g(122, 70, 48, '2', 'obj') + g(122, 70, 18, '', 'obj2') + D.text(122, 70, '3', 't-it') + g(184, 70, 42, '4', 'obj');
    h += '<circle cx="122" cy="70" r="4" class="c4"/>' + D.text(122, 160, 'gears 2 & 3 share a shaft', 't-m');
    h += D.text(50, 30, 'input', 't-m') + D.text(184, 14, 'output', 't-m');
    return D.svg(250, 170, h, 'Compound gear train with gears 2 and 3 on a common shaft');
  };

  // stress–strain curve for a ductile metal
  D.stressStrain = function () {
    const ox = 44, oy = 186;
    let h = D.arrow(ox, oy, 330, oy, 'thin', 7) + D.arrow(ox, oy, ox, 14, 'thin', 7) + D.text(322, oy + 14, 'strain ε', 't-m', 'end') + D.text(ox + 6, 18, 'stress σ', 't-m', 'start');
    h += '<path d="M' + ox + ' ' + oy + ' L 84 70 Q 92 62 104 66 Q 150 72 200 44 Q 240 30 262 48 Q 282 66 296 96" class="c2" style="fill:none;stroke-width:3"/>';
    h += '<circle cx="84" cy="70" r="4.5" class="c1"/>' + D.text(76, 58, 'yield S_y', 'c1', 'end');
    h += '<circle cx="236" cy="33" r="4.5" class="c4"/>' + D.text(236, 20, 'ultimate S_u', 'c4');
    h += '<text x="296" y="110" text-anchor="middle" class="t-m">fracture ×</text>';
    h += D.text(74, 168, 'E = slope', 'c3', 'start') + D.text(150, oy - 10, 'plastic region', 't-m') + D.line(84, oy - 4, 84, oy + 4, 'thin');
    return D.svg(340, 200, h, 'Stress–strain curve showing elastic slope E, yield strength, ultimate strength and fracture');
  };

  // pin in single or double shear
  D.shear = function (o = {}) {
    let h = '';
    if (!o.double) {
      h += '<rect x="20" y="40" width="170" height="24" rx="4" class="obj"/><rect x="110" y="64" width="170" height="24" rx="4" class="obj2"/>';
      h += '<rect x="140" y="28" width="16" height="72" rx="3" class="fillgold" style="stroke:var(--fg);stroke-width:2"/>';
      h += D.arrow(30, 52, -4 + 8, 52, 'c1') + D.arrow(270, 76, 304, 76, 'c1') + D.text(12, 36, 'F', 'c1 t-it') + D.text(296, 98, 'F', 'c1 t-it');
      h += D.line(130, 64, 166, 64, 'c6') + D.text(200, 18, '1 shear plane', 'c6');
    } else {
      h += '<rect x="20" y="30" width="170" height="20" rx="4" class="obj"/><rect x="20" y="78" width="170" height="20" rx="4" class="obj"/><rect x="110" y="54" width="170" height="20" rx="4" class="obj2"/>';
      h += '<rect x="140" y="20" width="16" height="88" rx="3" class="fillgold" style="stroke:var(--fg);stroke-width:2"/>';
      h += D.arrow(270, 64, 304, 64, 'c1') + D.text(296, 86, 'F', 'c1 t-it') + D.arrow(30, 64, 6, 64, 'c1') + D.text(14, 50, 'F', 'c1 t-it');
      h += D.line(130, 52, 166, 52, 'c6') + D.line(130, 76, 166, 76, 'c6') + D.text(210, 14, '2 shear planes', 'c6');
    }
    return D.svg(320, 120, h, o.double ? 'Pin in double shear' : 'Bolt in single shear');
  };

  // orthographic projection of a stepped block (third-angle)
  D.ortho = function () {
    const u = 30;
    let h = '';
    // isometric sketch
    const iso = (x, y, z) => [70 + (x - z) * u * 0.87, 100 - y * u + (x + z) * u * 0.5];
    const face = (pts, cls) => '<polygon points="' + pts.map((p) => iso(...p).map(r1).join(',')).join(' ') + '" class="' + cls + '"/>';
    h += face([[0, 0, 0], [3, 0, 0], [3, 1, 0], [1.5, 1, 0], [1.5, 2, 0], [0, 2, 0]], 'obj');
    h += face([[0, 2, 0], [1.5, 2, 0], [1.5, 2, -2], [0, 2, -2]], 'obj2') + face([[1.5, 1, 0], [3, 1, 0], [3, 1, -2], [1.5, 1, -2]], 'obj2');
    h += face([[1.5, 1, 0], [1.5, 2, 0], [1.5, 2, -2], [1.5, 1, -2]], 'fillgold') + face([[3, 0, 0], [3, 1, 0], [3, 1, -2], [3, 0, -2]], 'fillgold');
    h += D.text(70, 150, 'isometric', 't-m');
    // views
    const fx = 190, fy = 150, s = 22;
    h += '<polygon points="' + [[0, 0], [3, 0], [3, 1], [1.5, 1], [1.5, 2], [0, 2]].map(([x, y]) => (fx + x * s) + ',' + (fy - y * s)).join(' ') + '" class="obj"/>' + D.text(fx + 1.5 * s, fy + 14, 'FRONT', 't-m');
    h += '<rect x="' + fx + '" y="' + (fy - 2 * s - 18 - 2 * s) + '" width="' + 3 * s + '" height="' + 2 * s + '" class="obj"/>' + D.line(fx + 1.5 * s, fy - 4 * s - 18, fx + 1.5 * s, fy - 2 * s - 18, 'ln') + D.text(fx + 1.5 * s, fy - 4 * s - 26, 'TOP', 't-m');
    h += '<rect x="' + (fx + 3 * s + 18) + '" y="' + (fy - 2 * s) + '" width="' + 2 * s + '" height="' + 2 * s + '" class="obj"/>' + D.line(fx + 3 * s + 18, fy - s, fx + 5 * s + 18, fy - s, 'ln') + D.text(fx + 4 * s + 18, fy + 14, 'RIGHT', 't-m');
    return D.svg(340, 172, h, 'Stepped block in isometric view and its front, top and right orthographic views');
  };

  // conduction through a wall
  D.wall = function () {
    let h = '<rect x="120" y="20" width="70" height="140" class="fillgold" style="stroke:var(--fg);stroke-width:2"/>';
    h += D.text(70, 40, 'T_hot', 'c6 t-it') + D.text(240, 40, 'T_cold', 'c2 t-it');
    h += D.arrow(40, 90, 280, 90, 'c1') + D.text(160, 78, 'q', 'c1 t-it');
    h += D.line(120, 172, 190, 172, 'thin') + D.line(120, 166, 120, 178, 'thin') + D.line(190, 166, 190, 178, 'thin') + D.text(155, 186, 'L', 't-it');
    h += D.text(155, 130, 'κ, area A', 't-m');
    return D.svg(310, 196, h, 'Heat conducting through a wall of thickness L from the hot side to the cold side');
  };

  // floating block with buoyant force
  D.buoy = function () {
    let h = '<rect x="20" y="70" width="280" height="110" class="fillsoft"/>' + D.line(20, 70, 300, 70, 'c2');
    h += '<rect x="120" y="40" width="80" height="70" rx="4" class="obj"/>';
    h += D.arrow(160, 75, 160, 150, 'c1') + D.text(172, 146, 'W = mg', 'c1 t-it', 'start') + D.arrow(150, 110, 150, 18, 'c3') + D.text(138, 20, 'F_B', 'c3 t-it', 'end');
    h += D.text(250, 150, 'fluid ρ', 't-m');
    return D.svg(320, 190, h, 'Floating block: buoyant force balances weight');
  };

  // pipe narrowing: continuity
  D.pipe = function () {
    let h = '<path d="M20 40 H140 L200 70 H310 M20 150 H140 L200 120 H310" class="ln"/>';
    h += '<rect x="20" y="40" width="120" height="110" class="fillsoft"/><polygon points="140,40 200,70 200,120 140,150" class="fillsoft"/><rect x="200" y="70" width="110" height="50" class="fillsoft"/>';
    h += D.arrow(40, 95, 100, 95, 'c2') + D.text(70, 80, 'v₁, A₁', 'c2 t-it') + D.arrow(220, 95, 300, 95, 'c1') + D.text(258, 84, 'v₂, A₂', 'c1 t-it');
    return D.svg(330, 170, h, 'Pipe narrowing: the fluid speeds up where the area is smaller');
  };
})();
