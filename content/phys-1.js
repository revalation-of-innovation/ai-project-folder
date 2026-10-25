/* PHYS 2325 · Mechanics — course definition and Units 1–3 (Young & Freedman Ch 1–3) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, FILL, MATCH, ORDER, G } = CQ.dsl;
  const f = CQ.fmtT;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const g = 9.8;
  const D = CQ.dg;
  const deg = (r) => (r * 180) / Math.PI;
  const rad = (d) => (d * Math.PI) / 180;

  CQ.defineCourse({
    id: 'phys', code: 'PHYS 2325', name: 'Mechanics', icon: 'rocket', color: '#4f6bff', dark: '#3347c2',
    book: 'Young & Freedman, University Physics · Ch 1–15',
    exams: [
      { id: 'phys-e1', name: 'Exam 1', units: ['p1', 'p2', 'p3', 'p4', 'p5'], n: 20, mins: 50, note: 'Ch 1–5' },
      { id: 'phys-e2', name: 'Exam 2', units: ['p6', 'p7', 'p8'], n: 20, mins: 50, note: 'Ch 6–8' },
      { id: 'phys-e3', name: 'Exam 3', units: ['p9', 'p10', 'p11'], n: 20, mins: 50, note: 'Ch 9–11' },
      { id: 'phys-fin', name: 'Final', units: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14'], n: 30, mins: 90, note: 'Cumulative' },
    ],
  });

  /* ================= generators: Unit 1 ================= */
  CQ.gen('p.unitconv', (R) => {
    const k = R.int(0, 4);
    if (k === 0) {
      const v = R.pick([36, 54, 72, 90, 108, 126, 45, 63, 81]);
      return { t: 'num', q: 'Convert **' + v + ' km/h** to m/s.', a: v / 3.6, unit: 'm/s', hint: '1 km = 1000 m and 1 h = 3600 s.', steps: [v + ' km/h × [[1000 m|1 km]] × [[1 h|3600 s]]', '= [[' + v + '|3.6]] = **' + F(v / 3.6) + ' m/s**'] };
    }
    if (k === 1) {
      const d = R.pick([0.92, 1.25, 2.7, 7.87, 11.3, 13.6, 19.3]);
      return { t: 'num', q: 'A material has a density of **' + d + ' g/cm³**. Express it in kg/m³.', a: d * 1000, unit: 'kg/m³', hint: '1 g = 10⁻³ kg and 1 cm³ = 10⁻⁶ m³.', steps: ['1 g = 10⁻³ kg, and 1 cm³ = (10⁻² m)³ = 10⁻⁶ m³', d + ' × [[10⁻³|10⁻⁶]] = ' + d + ' × 1000 = **' + F(d * 1000) + ' kg/m³**'] };
    }
    if (k === 2) {
      const a = R.pick([250, 340, 480, 620, 750, 1200]);
      return { t: 'num', q: 'A tabletop has an area of **' + a + ' cm²**. What is that in m²?', a: a / 1e4, unit: 'm²', hint: 'Square the conversion factor: 1 m² = (100 cm)².', steps: ['1 m = 100 cm, so 1 m² = (100 cm)² = 10⁴ cm²', a + ' cm² ÷ 10⁴ = **' + F(a / 1e4) + ' m²**'] };
    }
    if (k === 3) {
      const um = R.pick([45, 75, 90, 120, 250]);
      return { t: 'num', q: 'A human hair is about **' + um + ' μm** thick. Express it in meters.', a: um * 1e-6, unit: 'm', hint: 'μ (micro) means 10⁻⁶.', steps: ['micro = 10⁻⁶', um + ' × 10⁻⁶ m = **' + F(um * 1e-6) + ' m**'] };
    }
    const mph = R.pick([60, 75, 85, 95, 100]);
    return { t: 'num', q: 'A fastball travels at **' + mph + ' mi/h**. What is that in m/s? (1 mi = 1609 m)', a: (mph * 1609) / 3600, unit: 'm/s', steps: [mph + ' mi/h × [[1609 m|1 mi]] × [[1 h|3600 s]]', '= **' + F((mph * 1609) / 3600) + ' m/s**'] };
  });

  CQ.gen('p.sigcount', (R) => {
    const pool = [['0.00450', 3], ['1200.', 4], ['3.0050', 5], ['6.02 × 10²³', 3], ['0.07', 1], ['45.00', 4], ['100.0', 4], ['2.10 × 10⁻⁵', 3], ['508', 3], ['0.010', 2], ['9.8', 2], ['1.000', 4]];
    const [n, c] = R.pick(pool);
    const opts = [c, c + 1, c - 1 || c + 2, c + 2].map(String);
    return { t: 'mc', q: 'How many significant figures are in **' + n + '**?', opts: [...new Set(opts)], why: 'Leading zeros never count. Zeros between nonzero digits count. Trailing zeros count only if there is a decimal point.', lvl: 2 };
  });

  CQ.gen('p.vcomp', (R) => {
    const A = R.pick([12, 15, 20, 25, 30, 40, 50, 65, 80]);
    const th = R.pick([25, 30, 37, 40, 53, 60, 120, 135, 150, 210, 240, 300, 330]);
    const want = R.pick(['x', 'y']);
    const ax = A * Math.cos(rad(th)), ay = A * Math.sin(rad(th));
    const a = want === 'x' ? ax : ay;
    return {
      t: 'num', q: 'A displacement vector has magnitude **' + A + ' m** at **' + th + '°** counterclockwise from the +x axis. Find its **' + want + '-component**.', a, unit: 'm', abs: 0.05,
      hint: 'A' + (want === 'x' ? 'ₓ = A cos θ' : 'ᵧ = A sin θ') + ', using the angle from the +x axis. The sign comes out on its own.',
      steps: ['Angle is from +x, so A' + (want === 'x' ? 'ₓ = A cos θ' : 'ᵧ = A sin θ'), '= ' + A + ' × ' + (want === 'x' ? 'cos' : 'sin') + '(' + th + '°) = **' + F(a) + ' m**'],
      why: th > 90 ? 'Past 90° the components can be negative. Using the angle from +x makes the calculator handle the sign.' : '',
    };
  });

  CQ.gen('p.vmag', (R) => {
    const ax = R.pick([-12, -8, -6, -5, 3, 4, 5, 6, 8, 9, 12, 15]), ay = R.pick([-9, -7, -4, 2, 5, 7, 8, 12, 16]);
    const m = Math.hypot(ax, ay);
    return { t: 'num', q: 'A vector has components **Aₓ = ' + ax + ' N** and **Aᵧ = ' + ay + ' N**. What is its magnitude?', a: m, unit: 'N', steps: ['A = √(Aₓ² + Aᵧ²)', '= √(' + ax * ax + ' + ' + ay * ay + ') = **' + F(m) + ' N**'], hint: 'Pythagorean theorem.' };
  });

  CQ.gen('p.vang', (R) => {
    const ax = R.pick([-12, -8, -5, -3, 4, 6, 9]), ay = R.pick([-10, -6, -4, 3, 5, 8, 11]);
    let th = deg(Math.atan2(ay, ax));
    if (th < 0) th += 360;
    const naive = deg(Math.atan(ay / ax));
    const quad = ax < 0 ? 'Aₓ < 0, so the vector is in quadrant ' + (ay > 0 ? 'II' : 'III') + ': add 180°' : ay < 0 ? 'Quadrant IV: add 360° to get a positive angle' : 'Quadrant I: the calculator answer is already right';
    return { t: 'num', q: 'Vector **A = ' + ax + 'î + ' + ay + 'ĵ**. What angle does it make, measured counterclockwise from the +x axis (0° to 360°)?', a: th, unit: '°', abs: 0.6, lvl: 4,
      hint: 'Find arctan(Aᵧ/Aₓ), then check which quadrant the vector is in.',
      steps: ['arctan(' + ay + '/' + ax + ') = ' + F(naive) + '°', quad, 'θ = **' + F(th) + '°**'],
      why: 'Calculators only return angles between −90° and +90°. Always sketch the vector to check the quadrant.' };
  });

  CQ.gen('p.vadd', (R) => {
    const A = R.pick([10, 12, 15, 20]), a1 = R.pick([0, 20, 30, 45]), B = R.pick([8, 10, 14, 18]), a2 = R.pick([90, 110, 120, 135, 150]);
    const rx = A * Math.cos(rad(a1)) + B * Math.cos(rad(a2)), ry = A * Math.sin(rad(a1)) + B * Math.sin(rad(a2));
    const m = Math.hypot(rx, ry);
    return { t: 'num', lvl: 4, q: 'A hiker walks **' + A + ' km at ' + a1 + '°**, then **' + B + ' km at ' + a2 + '°** (angles counterclockwise from east). How far is she from her starting point?', a: m, unit: 'km',
      hint: 'Break each leg into x and y components, add them, then use Pythagoras.',
      steps: ['Rₓ = ' + A + ' cos ' + a1 + '° + ' + B + ' cos ' + a2 + '° = ' + F(rx) + ' km', 'Rᵧ = ' + A + ' sin ' + a1 + '° + ' + B + ' sin ' + a2 + '° = ' + F(ry) + ' km', 'R = √(Rₓ² + Rᵧ²) = **' + F(m) + ' km**'] };
  });

  CQ.gen('p.vaddij', (R) => {
    const a = [R.int(-5, 6), R.int(-5, 6)], b = [R.int(-5, 6), R.int(-4, 6)];
    const c1 = R.pick([1, 2, 3]), sgn = R.pick([1, -1]);
    const rx = c1 * a[0] + sgn * b[0], ry = c1 * a[1] + sgn * b[1];
    const lab = (c1 === 1 ? '' : c1) + 'A ' + (sgn > 0 ? '+' : '−') + ' B';
    return { t: 'num', q: 'A = ' + a[0] + 'î + ' + a[1] + 'ĵ and B = ' + b[0] + 'î + ' + b[1] + 'ĵ. Find the magnitude of **' + lab + '**.', a: Math.hypot(rx, ry), unit: '', abs: 0.02,
      steps: ['x: ' + c1 + '(' + a[0] + ') ' + (sgn > 0 ? '+' : '−') + ' (' + b[0] + ') = ' + rx, 'y: ' + c1 + '(' + a[1] + ') ' + (sgn > 0 ? '+' : '−') + ' (' + b[1] + ') = ' + ry, '|' + lab + '| = √(' + rx * rx + ' + ' + ry * ry + ') = **' + F(Math.hypot(rx, ry)) + '**'] };
  });

  CQ.gen('p.dot', (R) => {
    const a = [R.int(-4, 5), R.int(-4, 5), R.int(-3, 4)], b = [R.int(-4, 5), R.int(-4, 5), R.int(-3, 4)];
    const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const v = (x) => x[0] + 'î ' + (x[1] < 0 ? '− ' + -x[1] : '+ ' + x[1]) + 'ĵ ' + (x[2] < 0 ? '− ' + -x[2] : '+ ' + x[2]) + 'k̂';
    return { t: 'num', q: 'A = ' + v(a) + ' and B = ' + v(b) + '. Find **A · B**.', a: d, unit: '', abs: 0.01, steps: ['A·B = AₓBₓ + AᵧBᵧ + A_zB_z', '= (' + a[0] + ')(' + b[0] + ') + (' + a[1] + ')(' + b[1] + ') + (' + a[2] + ')(' + b[2] + ') = **' + d + '**'], hint: 'Multiply matching components and add.' };
  });

  CQ.gen('p.angleBetween', (R) => {
    const a = [R.int(1, 5), R.int(-3, 4), 0], b = [R.int(-3, 4), R.int(1, 5), 0];
    const d = a[0] * b[0] + a[1] * b[1];
    const ma = Math.hypot(a[0], a[1]), mb = Math.hypot(b[0], b[1]);
    const th = deg(Math.acos(d / (ma * mb)));
    return { t: 'num', lvl: 4, q: 'Find the angle between **A = ' + a[0] + 'î + ' + a[1] + 'ĵ** and **B = ' + b[0] + 'î + ' + b[1] + 'ĵ**.', a: th, unit: '°', abs: 0.6,
      hint: 'cos φ = (A·B)/(AB).', steps: ['A·B = ' + d, 'A = ' + F(ma) + ', B = ' + F(mb), 'cos φ = ' + d + '/(' + F(ma) + ' × ' + F(mb) + ') = ' + F(d / (ma * mb)), 'φ = **' + F(th) + '°**'] };
  });

  CQ.gen('p.cross', (R) => {
    const a = [R.int(-4, 5), R.int(-4, 5)], b = [R.int(-4, 5), R.int(-4, 5)];
    const z = a[0] * b[1] - a[1] * b[0];
    return { t: 'num', q: 'A = ' + a[0] + 'î + ' + a[1] + 'ĵ and B = ' + b[0] + 'î + ' + b[1] + 'ĵ. **A × B** points along ±k̂. What is its z-component?', a: z, unit: '', abs: 0.01, lvl: 3,
      hint: '(A × B)_z = AₓBᵧ − AᵧBₓ', steps: ['(A × B)_z = AₓBᵧ − AᵧBₓ', '= (' + a[0] + ')(' + b[1] + ') − (' + a[1] + ')(' + b[0] + ') = **' + z + '**'] };
  });

  /* ================= generators: Unit 2 ================= */
  CQ.gen('p.avgvel', (R) => {
    const x1 = R.int(-20, 60), x2 = x1 + R.pick([-1, 1]) * R.int(15, 90), t = R.pick([2, 2.5, 4, 5, 6, 8, 10]);
    const v = (x2 - x1) / t;
    return { t: 'num', q: 'A runner is at x = ' + x1 + ' m at t = 0 and at x = ' + x2 + ' m at t = ' + t + ' s. What is her **average velocity**?', a: v, unit: 'm/s', abs: 0.01, steps: ['v_av = [[Δx|Δt]] = [[' + x2 + ' − (' + x1 + ')|' + t + ']]', '= **' + F(v) + ' m/s**' + (v < 0 ? ' (negative: she moved in −x)' : '')], why: 'Velocity carries a sign. Moving toward −x gives a negative velocity.' };
  });

  CQ.gen('p.avgspeedTrip', (R) => {
    const d = R.pick([30, 40, 60, 80, 120]), v1 = R.pick([20, 30, 40]), v2 = R.pick([50, 60, 80, 90].filter((x) => x !== v1));
    const tt = d / v1 + d / v2;
    const avg = (2 * d) / tt;
    return { t: 'num', lvl: 4, q: 'You drive **' + d + ' km at ' + v1 + ' km/h**, then another **' + d + ' km at ' + v2 + ' km/h**. What is your average speed for the whole trip?', a: avg, unit: 'km/h',
      hint: 'Average speed = total distance ÷ total time. Find each leg\'s time first.',
      steps: ['t₁ = ' + d + '/' + v1 + ' = ' + F(d / v1) + ' h, t₂ = ' + d + '/' + v2 + ' = ' + F(d / v2) + ' h', 'total time = ' + F(tt) + ' h', 'avg speed = ' + 2 * d + ' km / ' + F(tt) + ' h = **' + F(avg) + ' km/h**'],
      why: 'Not ' + (v1 + v2) / 2 + ' km/h. You spend more time at the slower speed, so the average leans toward it.' };
  });

  CQ.gen('p.deriv', (R) => {
    const A = R.pick([1, 2, 3, 0.5, 4]), B = R.pick([-6, -4, -3, 2, 5]), C = R.pick([-8, -2, 3, 6, 10]), t = R.pick([1, 2, 3, 4]);
    const want = R.pick(['v', 'a']);
    const v = 3 * A * t * t + 2 * B * t + C, a = 6 * A * t + 2 * B;
    const pol = A + 't³ ' + (B < 0 ? '− ' + -B : '+ ' + B) + 't² ' + (C < 0 ? '− ' + -C : '+ ' + C) + 't';
    return { t: 'num', q: 'A particle moves along x with **x(t) = ' + pol + '** (x in m, t in s). Find its ' + (want === 'v' ? '**velocity**' : '**acceleration**') + ' at t = ' + t + ' s.', a: want === 'v' ? v : a, unit: want === 'v' ? 'm/s' : 'm/s²', abs: 0.01,
      hint: want === 'v' ? 'v = dx/dt. Bring each power down: d(tⁿ)/dt = n tⁿ⁻¹.' : 'a = d²x/dt². Differentiate twice.',
      steps: ['v(t) = dx/dt = ' + 3 * A + 't² ' + (2 * B < 0 ? '− ' + -2 * B : '+ ' + 2 * B) + 't ' + (C < 0 ? '− ' + -C : '+ ' + C), want === 'v' ? 'v(' + t + ') = **' + F(v) + ' m/s**' : 'a(t) = dv/dt = ' + 6 * A + 't ' + (2 * B < 0 ? '− ' + -2 * B : '+ ' + 2 * B), ...(want === 'a' ? ['a(' + t + ') = **' + F(a) + ' m/s²**'] : [])] };
  });

  CQ.gen('p.kin.stop', (R) => {
    const v0 = R.pick([12, 15, 18, 20, 25, 28, 30, 35]), a = R.pick([3, 4, 5, 6, 7.5, 8]);
    const d = (v0 * v0) / (2 * a);
    return { t: 'num', q: 'A car traveling **' + v0 + ' m/s** brakes with a constant deceleration of **' + a + ' m/s²**. How far does it travel before stopping?', a: d, unit: 'm',
      hint: 'You don\'t know or need t, so use the equation without t.',
      steps: ['Knowns: v₀ = ' + v0 + ' m/s, v = 0, a = −' + a + ' m/s². Unknown Δx. No t.', 'v² = v₀² + 2aΔx → 0 = ' + v0 * v0 + ' + 2(−' + a + ')Δx', 'Δx = [[' + v0 * v0 + '|' + 2 * a + ']] = **' + F(d) + ' m**'] };
  });

  CQ.gen('p.kin.v', (R) => {
    const v0 = R.pick([0, 0, 3, 5, 8]), a = R.pick([1.5, 2, 2.5, 3, 4]), d = R.pick([20, 30, 50, 75, 100]);
    const v = Math.sqrt(v0 * v0 + 2 * a * d);
    return { t: 'num', q: 'A cyclist ' + (v0 ? 'moving at **' + v0 + ' m/s**' : 'starting from rest') + ' accelerates at **' + a + ' m/s²** for **' + d + ' m**. How fast is she going at the end?', a: v, unit: 'm/s',
      steps: ['No time given or asked → v² = v₀² + 2aΔx', 'v² = ' + v0 * v0 + ' + 2(' + a + ')(' + d + ') = ' + F(v * v), 'v = **' + F(v) + ' m/s**'] };
  });

  CQ.gen('p.kin.t', (R) => {
    const v0 = R.pick([0, 4, 6, 10]), v = v0 + R.pick([10, 15, 20, 24]), a = R.pick([2, 2.5, 3, 4, 5]);
    const t = (v - v0) / a;
    return { t: 'num', q: 'A train speeds up from **' + v0 + ' m/s** to **' + v + ' m/s** with constant acceleration **' + a + ' m/s²**. How long does it take?', a: t, unit: 's', steps: ['v = v₀ + at → t = [[v − v₀|a]]', 't = [[' + v + ' − ' + v0 + '|' + a + ']] = **' + F(t) + ' s**'] };
  });

  CQ.gen('p.kin.x', (R) => {
    const v0 = R.pick([0, 2, 5, 8, 12]), a = R.pick([1, 1.5, 2, 3, -1.5, -2]), t = R.pick([3, 4, 5, 6]);
    const x = v0 * t + 0.5 * a * t * t;
    if (v0 + a * t < 0) return CQ.gens['p.kin.x'](R);
    return { t: 'num', q: 'An object starts at **' + v0 + ' m/s** with constant acceleration **' + a + ' m/s²**. How far does it move in the first **' + t + ' s**?', a: x, unit: 'm',
      steps: ['Δx = v₀t + ½at²', '= (' + v0 + ')(' + t + ') + ½(' + a + ')(' + t + ')² = **' + F(x) + ' m**'] };
  });

  CQ.gen('p.kin.a', (R) => {
    const v0 = R.pick([5, 10, 15, 20, 30]), v = R.pick([0, 2, 25, 35, 40]), d = R.pick([40, 60, 80, 120, 150]);
    if (v === v0) return CQ.gens['p.kin.a'](R);
    const a = (v * v - v0 * v0) / (2 * d);
    return { t: 'num', lvl: 4, q: 'A jet goes from **' + v0 + ' m/s** to **' + v + ' m/s** over **' + d + ' m** of runway. What is its (constant) acceleration?', a, unit: 'm/s²', abs: 0.01,
      steps: ['No time → v² = v₀² + 2aΔx', 'a = [[v² − v₀²|2Δx]] = [[' + v * v + ' − ' + v0 * v0 + '|' + 2 * d + ']]', 'a = **' + F(a) + ' m/s²**' + (a < 0 ? ' (negative: slowing down)' : '')] };
  });

  CQ.gen('p.kin.chase', (R) => {
    const vT = R.pick([15, 18, 20, 24, 25]), a = R.pick([2, 2.5, 3, 4]);
    const t = (2 * vT) / a;
    return { t: 'num', lvl: 4, exam: true, q: 'A truck passes a parked police car at a constant **' + vT + ' m/s**. At that instant the police car starts from rest with acceleration **' + a + ' m/s²**. How long until it catches the truck?', a: t, unit: 's',
      hint: 'They have the same position when the police car catches up. Set x_truck = x_police.',
      steps: ['x_truck = ' + vT + 't, x_police = ½(' + a + ')t²', 'Set equal: ' + vT + 't = ' + a / 2 + 't² → t(' + a / 2 + 't − ' + vT + ') = 0', 't = 0 (the start) or t = [[2(' + vT + ')|' + a + ']] = **' + F(t) + ' s**'] };
  });

  CQ.gen('p.ff.h', (R) => {
    const v0 = R.pick([8, 10, 12, 14, 15, 18, 20, 24]);
    const H = (v0 * v0) / (2 * g);
    return { t: 'num', q: 'A ball is thrown straight up at **' + v0 + ' m/s**. How high above the release point does it rise? (g = 9.80 m/s²)', a: H, unit: 'm',
      hint: 'At the top v = 0. Use the equation with no t.', steps: ['At the top v = 0. Take up as +, so a = −9.80 m/s².', '0 = v₀² − 2gH → H = [[v₀²|2g]] = [[' + v0 * v0 + '|19.6]]', 'H = **' + F(H) + ' m**'] };
  });

  CQ.gen('p.ff.drop', (R) => {
    const h = R.pick([5, 10, 20, 30, 45, 60, 80]);
    const want = R.pick(['t', 'v']);
    const t = Math.sqrt((2 * h) / g), v = Math.sqrt(2 * g * h);
    return want === 't'
      ? { t: 'num', q: 'A phone is dropped from rest from a height of **' + h + ' m**. How long does it take to hit the ground?', a: t, unit: 's', steps: ['Dropped → v₀ = 0. h = ½gt²', 't = √{2h/g} = √{2(' + h + ')/9.8}', 't = **' + F(t) + ' s**'] }
      : { t: 'num', q: 'A rock is dropped from rest from a height of **' + h + ' m**. How fast is it moving just before it hits the ground?', a: v, unit: 'm/s', steps: ['v² = v₀² + 2gh with v₀ = 0', 'v = √{2(9.8)(' + h + ')}', 'v = **' + F(v) + ' m/s**'] };
  });

  CQ.gen('p.ff.cliff', (R) => {
    const h = R.pick([15, 20, 25, 30, 40]), v0 = R.pick([5, 8, 10, 12]), up = R.chance(0.5);
    // y = h + v0y t − ½ g t² = 0, v0y = +v0 (up) or −v0 (down)
    const vy = up ? v0 : -v0;
    const t = (vy + Math.sqrt(vy * vy + 2 * g * h)) / g;
    return { t: 'num', lvl: 4, exam: true, q: 'From the edge of a **' + h + ' m** high cliff, a stone is thrown straight **' + (up ? 'up' : 'down') + '** at **' + v0 + ' m/s**. How long until it hits the ground below?', a: t, unit: 's',
      hint: 'Put the origin at the ground: y₀ = ' + h + ' m, v₀ = ' + vy + ' m/s, a = −9.8 m/s². Solve y = 0 with the quadratic formula.',
      steps: ['0 = ' + h + ' + (' + vy + ')t − 4.9t²', '4.9t² − (' + vy + ')t − ' + h + ' = 0', 't = [[' + vy + ' + √{' + vy + '² + 4(4.9)(' + h + ')}|2(4.9)]] (take the positive root)', 't = **' + F(t) + ' s**'] };
  });

  CQ.gen('p.ff.round', (R) => {
    const v0 = R.pick([6, 9, 12, 15, 19.6]);
    return { t: 'num', q: 'A ball is tossed straight up at **' + v0 + ' m/s** and caught at the same height. How long is it in the air?', a: (2 * v0) / g, unit: 's', steps: ['Time to the top: t = v₀/g = ' + F(v0 / g) + ' s', 'Time down equals time up (same height)', 'Total = 2v₀/g = **' + F((2 * v0) / g) + ' s**'] };
  });

  CQ.gen('p.area', (R) => {
    const V = R.pick([4, 6, 8, 10, 12]), t1 = R.pick([2, 3, 4]), t2 = R.pick([2, 3, 4, 5]), t3 = R.pick([2, 3, 4]);
    const d = 0.5 * V * t1 + V * t2 + 0.5 * V * t3;
    const T1 = t1, T2 = t1 + t2, T3 = t1 + t2 + t3;
    return { t: 'num', q: 'The v–t graph below shows a scooter that speeds up, cruises at **' + V + ' m/s**, then slows to a stop. How far does it travel?', a: d, unit: 'm',
      fig: D.graph({ pts: [[0, 0], [T1, V], [T2, V], [T3, 0]], xmax: T3 + 1, ymax: V * 1.25, shade: true, ticks: [T1, T2, T3], yticks: [V], alt: 'Trapezoid-shaped velocity-time graph' }),
      hint: 'Displacement = area under the v–t graph. Split it into two triangles and a rectangle.',
      steps: ['Speed-up triangle: ½(' + t1 + ')(' + V + ') = ' + 0.5 * V * t1 + ' m', 'Cruise rectangle: (' + t2 + ')(' + V + ') = ' + V * t2 + ' m', 'Slow-down triangle: ½(' + t3 + ')(' + V + ') = ' + 0.5 * V * t3 + ' m', 'Total = **' + F(d) + ' m**'] };
  });

  CQ.gen('p.integ', (R) => {
    const C = R.pick([0.5, 1, 1.5, 2, 3]), v0 = R.pick([0, 2, 4, 5]), T = R.pick([2, 3, 4]);
    const v = v0 + 0.5 * C * T * T;
    return { t: 'num', lvl: 4, q: 'A rocket sled has acceleration **a(t) = ' + C + 't** m/s² and starts at **' + v0 + ' m/s**. What is its velocity at t = ' + T + ' s?', a: v, unit: 'm/s',
      hint: 'The acceleration isn\'t constant, so the Big Four don\'t apply. Integrate: v(t) = v₀ + ∫a dt.',
      steps: ['v(t) = v₀ + ∫₀ᵗ ' + C + 't′ dt′ = v₀ + ' + C / 2 + 't²', 'v(' + T + ') = ' + v0 + ' + ' + C / 2 + '(' + T + ')² = **' + F(v) + ' m/s**'] };
  });

  /* ================= generators: Unit 3 ================= */
  CQ.gen('p.2dv', (R) => {
    const A = R.pick([1, 1.5, 2, 3]), B = R.pick([2, 3, 4, 5]), t = R.pick([1, 2, 3]);
    const vx = 2 * A * t, vy = B;
    return { t: 'num', q: 'A drone\'s position is **r(t) = (' + A + 't²) î + (' + B + 't) ĵ** meters. What is its speed at t = ' + t + ' s?', a: Math.hypot(vx, vy), unit: 'm/s',
      steps: ['v = dr/dt = (' + 2 * A + 't) î + (' + B + ') ĵ', 'At t = ' + t + ': vₓ = ' + vx + ', vᵧ = ' + vy, 'speed = √(' + vx + '² + ' + vy + '²) = **' + F(Math.hypot(vx, vy)) + ' m/s**'] };
  });

  CQ.gen('p.proj.h', (R) => {
    const h = R.pick([1.2, 5, 10, 20, 45, 80]), v0 = R.pick([3, 5, 8, 10, 15, 20]);
    const t = Math.sqrt((2 * h) / g), x = v0 * t;
    const want = R.pick(['x', 'x', 't']);
    return { t: 'num', q: 'A ball rolls off a **' + h + ' m** high ledge with a horizontal speed of **' + v0 + ' m/s**. ' + (want === 'x' ? 'How far from the base of the ledge does it land?' : 'How long is it in the air?'), a: want === 'x' ? x : t, unit: want === 'x' ? 'm' : 's',
      fig: D.projectile({ cliff: true }),
      hint: 'Vertical motion alone sets the time (it starts with v₀ᵧ = 0). Horizontal speed stays constant.',
      steps: ['Vertical: h = ½gt² → t = √{2h/g} = √{2(' + h + ')/9.8} = ' + F(t) + ' s', ...(want === 'x' ? ['Horizontal: x = v₀t = ' + v0 + ' × ' + F(t) + ' = **' + F(x) + ' m**'] : ['t = **' + F(t) + ' s**. The horizontal speed doesn\'t matter for the time.'])] };
  });

  CQ.gen('p.proj.hv', (R) => {
    const h = R.pick([10, 20, 30, 45]), v0 = R.pick([5, 8, 12, 15]);
    const vy = Math.sqrt(2 * g * h), v = Math.hypot(v0, vy), ang = deg(Math.atan(vy / v0));
    const want = R.pick(['v', 'a']);
    return { t: 'num', lvl: 4, q: 'A package is pushed horizontally at **' + v0 + ' m/s** off a **' + h + ' m** tall roof. ' + (want === 'v' ? 'What is its speed just before it hits the ground?' : 'At what angle below horizontal does it hit the ground?'), a: want === 'v' ? v : ang, unit: want === 'v' ? 'm/s' : '°', abs: want === 'v' ? undefined : 0.6,
      steps: ['vₓ stays ' + v0 + ' m/s', 'vᵧ² = 2gh → vᵧ = √{2(9.8)(' + h + ')} = ' + F(vy) + ' m/s (down)', want === 'v' ? 'v = √(vₓ² + vᵧ²) = **' + F(v) + ' m/s**' : 'θ = arctan(vᵧ/vₓ) = arctan(' + F(vy) + '/' + v0 + ') = **' + F(ang) + '°**'] };
  });

  CQ.gen('p.proj.R', (R) => {
    const v0 = R.pick([10, 12, 15, 18, 20, 25, 30]), th = R.pick([15, 20, 30, 37, 40, 45, 53, 60, 70]);
    const want = R.pick(['R', 'H', 'T']);
    const vy = v0 * Math.sin(rad(th)), vx = v0 * Math.cos(rad(th));
    const T2 = (2 * vy) / g, H = (vy * vy) / (2 * g), Rg = vx * T2;
    const q = 'A soccer ball is kicked from level ground at **' + v0 + ' m/s** at **' + th + '°** above horizontal. ';
    if (want === 'R') return { t: 'num', q: q + 'How far away does it land?', a: Rg, unit: 'm', fig: D.projectile({ deg: th }), steps: ['v₀ₓ = ' + v0 + ' cos ' + th + '° = ' + F(vx) + ' m/s, v₀ᵧ = ' + v0 + ' sin ' + th + '° = ' + F(vy) + ' m/s', 'Time of flight: T = 2v₀ᵧ/g = ' + F(T2) + ' s', 'R = v₀ₓT = **' + F(Rg) + ' m**  (same as v₀² sin 2θ / g)'] };
    if (want === 'H') return { t: 'num', q: q + 'What is its maximum height?', a: H, unit: 'm', fig: D.projectile({ deg: th }), steps: ['v₀ᵧ = ' + v0 + ' sin ' + th + '° = ' + F(vy) + ' m/s', 'At the top vᵧ = 0: H = [[v₀ᵧ²|2g]]', 'H = **' + F(H) + ' m**'] };
    return { t: 'num', q: q + 'How long is it in the air?', a: T2, unit: 's', steps: ['v₀ᵧ = ' + F(vy) + ' m/s', 'Lands at the same height: T = [[2v₀ᵧ|g]] = **' + F(T2) + ' s**'] };
  });

  CQ.gen('p.proj.wall', (R) => {
    const v0 = R.pick([15, 18, 20, 22, 25]), th = R.pick([30, 35, 40, 45, 50]), d = R.pick([10, 12, 15, 18, 20]);
    const vx = v0 * Math.cos(rad(th)), vy = v0 * Math.sin(rad(th));
    const t = d / vx, y = vy * t - 0.5 * g * t * t;
    if (y < 0.5) return CQ.gens['p.proj.wall'](R);
    return { t: 'num', lvl: 4, exam: true, q: 'A ball is thrown at **' + v0 + ' m/s** at **' + th + '°** above horizontal toward a wall **' + d + ' m** away. At what height (above the launch point) does it hit the wall?', a: y, unit: 'm',
      hint: 'Use the horizontal distance to find the time, then plug that time into the vertical equation.',
      steps: ['vₓ = ' + F(vx) + ' m/s, v₀ᵧ = ' + F(vy) + ' m/s', 't = d/vₓ = ' + d + '/' + F(vx) + ' = ' + F(t) + ' s', 'y = v₀ᵧt − ½gt² = ' + F(vy) + '(' + F(t) + ') − 4.9(' + F(t) + ')²', 'y = **' + F(y) + ' m**'] };
  });

  CQ.gen('p.ucm.a', (R) => {
    const v = R.pick([5, 8, 10, 12, 15, 20, 25]), Rr = R.pick([10, 20, 25, 40, 50, 80]);
    return { t: 'num', q: 'A car rounds a curve of radius **' + Rr + ' m** at a constant **' + v + ' m/s**. What is the magnitude of its acceleration?', a: (v * v) / Rr, unit: 'm/s²', steps: ['Constant speed on a circle → only centripetal acceleration', 'a = [[v²|R]] = [[' + v * v + '|' + Rr + ']] = **' + F((v * v) / Rr) + ' m/s²** toward the center'] };
  });

  CQ.gen('p.ucm.T', (R) => {
    const Rr = R.pick([0.5, 0.8, 1.2, 2, 3]), T = R.pick([0.5, 0.8, 1, 1.5, 2]);
    const a = (4 * Math.PI * Math.PI * Rr) / (T * T);
    return { t: 'num', q: 'A ball on a string moves in a horizontal circle of radius **' + Rr + ' m**, making one revolution every **' + T + ' s**. Find its centripetal acceleration.', a, unit: 'm/s²', hint: 'Find the speed v = 2πR/T first.',
      steps: ['v = [[2πR|T]] = [[2π(' + Rr + ')|' + T + ']] = ' + F((2 * Math.PI * Rr) / T) + ' m/s', 'a = v²/R = 4π²R/T² = **' + F(a) + ' m/s²**'] };
  });

  CQ.gen('p.rel.boat', (R) => {
    const vb = R.pick([3, 4, 5, 6, 8]), vr = R.pick([1, 1.5, 2, 2.5, 3]), w = R.pick([60, 80, 100, 120, 150]);
    const want = R.pick(['drift', 'speed', 'time']);
    const t = w / vb;
    if (want === 'speed') return { t: 'num', q: 'A boat heads straight across a river at **' + vb + ' m/s** relative to the water. The river flows at **' + vr + ' m/s**. What is the boat\'s speed relative to the shore?', a: Math.hypot(vb, vr), unit: 'm/s', steps: ['The two velocities are perpendicular', 'v = √(' + vb + '² + ' + vr + '²) = **' + F(Math.hypot(vb, vr)) + ' m/s**'] };
    if (want === 'time') return { t: 'num', q: 'A boat points straight across a **' + w + ' m** wide river and moves at **' + vb + ' m/s** relative to the water, while the current flows at **' + vr + ' m/s**. How long does the crossing take?', a: t, unit: 's', steps: ['Only the across-component of velocity gets you across', 't = ' + w + '/' + vb + ' = **' + F(t) + ' s**. The current doesn\'t change it.'] };
    return { t: 'num', q: 'A boat points straight across a **' + w + ' m** wide river at **' + vb + ' m/s** (relative to the water). The current is **' + vr + ' m/s**. How far downstream does it land?', a: vr * t, unit: 'm', steps: ['Crossing time: t = ' + w + '/' + vb + ' = ' + F(t) + ' s', 'Drift = v_river × t = ' + vr + ' × ' + F(t) + ' = **' + F(vr * t) + ' m**'] };
  });

  CQ.gen('p.rel.1d', (R) => {
    const vt = R.pick([10, 15, 20, 25]), vw = R.pick([1, 1.5, 2]), back = R.chance(0.5);
    const v = back ? vt - vw : vt + vw;
    return { t: 'num', q: 'A train moves east at **' + vt + ' m/s**. A passenger walks toward the **' + (back ? 'back' : 'front') + '** of the train at **' + vw + ' m/s** relative to the train. What is the passenger\'s speed relative to the ground?', a: v, unit: 'm/s', steps: ['v_P/G = v_P/T + v_T/G', '= ' + (back ? '−' : '+') + vw + ' + ' + vt + ' = **' + F(v) + ' m/s** east'] };
  });

  CQ.gen('p.rel.heading', (R) => {
    const vb = R.pick([4, 5, 6, 8, 10]), vr = R.pick([1.5, 2, 2.5, 3, 4].filter((x) => x < vb));
    const th = deg(Math.asin(vr / vb));
    return { t: 'num', lvl: 4, exam: true, q: 'A swimmer can swim **' + vb + ' m/s** in still water. The river flows at **' + vr + ' m/s**. At what angle upstream from "straight across" must she aim to land directly opposite her start?', a: th, unit: '°', abs: 0.6,
      hint: 'Her upstream velocity component has to cancel the current exactly.',
      steps: ['Upstream component: ' + vb + ' sin θ must equal ' + vr, 'sin θ = ' + vr + '/' + vb + ' = ' + F(vr / vb), 'θ = **' + F(th) + '°** upstream'] };
  });

  /* ================= Unit 1 ================= */
  const u1 = U('p1', 'The Physicist\'s Toolkit', { sub: 'Units, sig figs & vectors', ch: 'Ch 1' }, [
    L('p1l1', 'Units & Conversions', {
      goal: 'Convert between units quickly and check any formula with units.',
      key: 'Multiply by conversion factors equal to 1, like $[[1000 m|1 km]]$, so the units you don\'t want cancel. Prefixes: n = 10⁻⁹, μ = 10⁻⁶, m = 10⁻³, c = 10⁻², k = 10³, M = 10⁶, G = 10⁹. Squared and cubed units square and cube the factor: 1 m² = 10⁴ cm², 1 m³ = 10⁶ cm³. A formula is only possible if the units match on both sides.',
      formulas: ['1 km/h = [[1|3.6]] m/s', '1 m² = 10⁴ cm²   ·   1 m³ = 10⁶ cm³', '1 N = 1 kg·m/s²'],
    }, [
      T('Units are a free answer-checker', `
Every quantity in physics is a **number × a unit**. SI uses three base units for mechanics: the **meter** (m), the **kilogram** (kg) and the **second** (s). Everything else is built from them. A newton is $1 N = 1 kg·m/s²$.

To convert, multiply by a fraction that equals 1:
$$ 72 [[km|h]] × [[1000 m|1 km]] × [[1 h|3600 s]] = 20 [[m|s]] $$
Cancel units like algebra: km on top cancels km on the bottom.
>* If your units come out wrong, your answer is wrong. Track units through every step and they catch mistakes for you.`),
      T('Prefixes & the squared-unit trap', `
| Prefix | Symbol | Factor |
|---|---|---|
| giga | G | 10⁹ |
| mega | M | 10⁶ |
| kilo | k | 10³ |
| centi | c | 10⁻² |
| milli | m | 10⁻³ |
| micro | μ | 10⁻⁶ |
| nano | n | 10⁻⁹ |
>! 1 m = 100 cm, but **1 m² = 10,000 cm²** and **1 m³ = 1,000,000 cm³**. When the unit is squared or cubed, the conversion factor is too.`),
      EX('A fastball in SI', 'Convert **65 mi/h** to m/s. (1 mi = 1609 m)', ['Write the conversion chain: $65 [[mi|h]] × [[1609 m|1 mi]] × [[1 h|3600 s]]$', 'Miles cancel, hours cancel, leaving m/s', '$[[65 × 1609|3600]]$ = **29.1 m/s**', 'Sanity check: a car on the highway is around 30 m/s. ✓']),
      MC('Which of these is **not** an SI base unit?', [['newton', 'Right. The newton is *derived*: 1 N = 1 kg·m/s².'], 'meter', 'kilogram', 'second'], 'The newton is built from base units: 1 N = 1 kg·m/s².'),
      MATCH('Match each prefix to its power of ten.', [['kilo (k)', '10³'], ['milli (m)', '10⁻³'], ['micro (μ)', '10⁻⁶'], ['mega (M)', '10⁶'], ['nano (n)', '10⁻⁹']]),
      NUM('Convert **90 km/h** to m/s.', 25, 'm/s', 'Divide km/h by 3.6: 90/3.6 = 25 m/s.', { hint: 'Dividing by 3.6 converts km/h to m/s.', lvl: 2 }),
      MC('How many cm² are in **1 m²**?', ['10,000', ['100', 'That\'s the factor for 1 m → cm. Area squares it: (100)² = 10⁴.'], '1,000', '1,000,000'], '1 m² = (100 cm)² = 10⁴ cm².'),
      G('p.unitconv'),
      MC('If **v** is in m/s, **a** in m/s² and **t** in s, which expression has units of **meters**?', ['v²/a', ['v/a', 'v/a has units (m/s)/(m/s²) = s.'], 'a·t', 'v·a'], '(m²/s²)/(m/s²) = m. Checking units like this catches wrong formulas on exams.', { lvl: 2 }),
      TF('A newton is equivalent to kg·m/s².', true, 'F = ma, so N = kg × m/s².'),
      G('p.unitconv'),
    ]),
    L('p1l2', 'Sig Figs & Estimation', {
      goal: 'Report answers with sensible precision and estimate orders of magnitude.',
      key: 'Count sig figs: nonzero digits count, zeros between them count, leading zeros never count, trailing zeros count only with a decimal point. When multiplying or dividing, keep the fewest sig figs of any input. When adding or subtracting, keep the fewest decimal places. To estimate, round every input to one digit times a power of ten.',
      formulas: ['× ÷ → fewest sig figs', '+ − → fewest decimal places'],
    }, [
      T('How precise is your answer?', `
A measurement like **2.50 m** has 3 significant figures. It says you know the value to about ±0.01 m.
- Nonzero digits always count: **472** has 3
- Zeros between nonzero digits count: **3.005** has 4
- Leading zeros don't: **0.0045** has 2
- Trailing zeros count if there's a decimal point: **45.00** has 4, **4500.** has 4

$$ 3.0 × 4.56 = 13.68 → 14 :: × or ÷: fewest sig figs (2) $$
$$ 12.11 + 3.2 = 15.31 → 15.3 :: + or −: fewest decimal places (1) $$
>* Keep all digits during the calculation. Round only the final answer.`),
      MC('How many significant figures are in **0.00450**?', ['3', ['5', 'Leading zeros are placeholders and never count.'], '2', '6'], 'The leading zeros are placeholders. 4, 5 and the trailing 0 after the decimal count.'),
      MC('What is **3.0 × 4.56**, written with correct significant figures?', ['14', ['13.68', 'That keeps every calculator digit. 3.0 has only 2 sig figs, so the answer gets 2.'], '13.7', '13'], 'For multiplication, keep the fewest sig figs of any factor. 3.0 has 2, so the answer gets 2: 14.'),
      MC('What is **12.11 + 3.2**, with correct precision?', ['15.3', '15.31', '15', '15.310'], 'For addition, keep the fewest decimal places. 3.2 has one, so the answer is 15.3.', { lvl: 2 }),
      G('p.sigcount'),
      T('Fermi estimates', `
Physicists estimate before they calculate. Round each input to one digit times a power of ten, then multiply.
**Heartbeats in a lifetime:** $70 [[beats|min]] × 60 × 24 × 365 × 80 ≈ (7×10¹)(6×10¹)(2.4×10¹)(3.65×10²)(8×10¹) ≈ 3×10⁹$
>? An estimate that lands within a factor of 10 of the real answer is a good estimate. On an exam, a quick estimate tells you whether a computed answer is reasonable.`),
      MC('Roughly how many seconds are in a year?', ['3 × 10⁷', '3 × 10⁵', '3 × 10⁹', '9 × 10⁶'], '365 × 24 × 3600 ≈ 3.15 × 10⁷ s. A useful number to remember.', { lvl: 2 }),
      TF('On an exam you should report every digit your calculator shows.', false, 'Extra digits claim precision you don\'t have. Round the final answer to match the data, usually 3 sig figs.'),
      G('p.sigcount'),
    ]),
    L('p1l3', 'Vector Components', {
      goal: 'Break any vector into x and y components and rebuild it from them.',
      key: 'With θ measured counterclockwise from +x: $Aₓ = A cos θ$, $Aᵧ = A sin θ$. Going back: $A = √{Aₓ² + Aᵧ²}$ and $θ = arctan(Aᵧ/Aₓ)$, then check the quadrant, because a calculator\'s arctan only returns −90° to +90°. If the angle is measured from the y-axis, sine and cosine swap.',
      formulas: ['Aₓ = A cos θ   ·   Aᵧ = A sin θ', 'A = √{Aₓ² + Aᵧ²}', 'θ = arctan(Aᵧ/Aₓ)  (+ quadrant check)'],
    }, [
      T('Scalars vs vectors', `
A **scalar** is just a number with units: mass, time, speed, energy.
A **vector** has a magnitude **and** a direction: displacement, velocity, force.

Almost every mechanics problem is solved by turning vectors into **components**, the parts along x and along y. Each component then behaves like an ordinary signed number.`, { fig: D.vector({ deg: 35 }) }),
      T('The component recipe', `
Measure θ **counterclockwise from the +x axis**. Then:
$$ Aₓ = A cos θ   ·   Aᵧ = A sin θ $$
Going back from components to the vector:
$$ A = √{Aₓ² + Aᵧ²}   ·   tan θ = [[Aᵧ|Aₓ]] $$
>! If a problem gives the angle from the **y-axis** (like "20° east of north"), the cos/sin roles swap. Draw it every time.`),
      EX('Components of a push', 'A 50 N force points 37° above the +x axis. Find its components.', ['Angle from +x → use cos for x and sin for y', '$Fₓ = 50 cos 37° = 50(0.799) = 39.9 N$', '$Fᵧ = 50 sin 37° = 50(0.602) = 30.1 N$', 'Check: √(39.9² + 30.1²) = 50.0 ✓']),
      MC('A vector points into the **second quadrant** (up and to the left). What are the signs of its components?', ['Aₓ < 0, Aᵧ > 0', 'Aₓ > 0, Aᵧ > 0', 'Aₓ < 0, Aᵧ < 0', 'Aₓ > 0, Aᵧ < 0'], 'Left means negative x and up means positive y.'),
      G('p.vcomp'),
      TF('The magnitude of a vector can be negative.', false, 'Magnitude is a length, so it\'s always ≥ 0. Components can be negative.'),
      G('p.vmag'),
      MC('A force of magnitude F acts at **25° from the +y axis**, tilted toward +x. What is Fₓ?', ['F sin 25°', ['F cos 25°', 'That would be right if 25° were measured from the x-axis. Here it\'s from y.'], 'F tan 25°', 'F / cos 25°'], 'The angle is measured from the y-axis, so the x component is opposite the angle: F sin 25°.', { lvl: 2 }),
      G('p.vcomp'),
      G('p.vang'),
    ]),
    L('p1l4', 'Adding Vectors & Unit Vectors', {
      goal: 'Add and subtract vectors by components and with î, ĵ, k̂ notation.',
      key: 'To add vectors, add components: $Rₓ = Aₓ + Bₓ$, $Rᵧ = Aᵧ + Bᵧ$, then find the magnitude and angle of R. In unit-vector form $A = Aₓî + Aᵧĵ + A_zk̂$, you just combine like terms. Subtracting means adding the negative. The magnitude of a sum is between |A − B| and A + B.',
      formulas: ['R = A + B → Rₓ = Aₓ + Bₓ, Rᵧ = Aᵧ + Bᵧ', 'A = Aₓî + Aᵧĵ + A_zk̂', '|A − B| ≤ |A + B| ≤ A + B'],
    }, [
      T('Add components, not magnitudes', `
Geometrically, vectors add **tip to tail**. Algebraically, it's even easier: **add the components**.
$$ Rₓ = Aₓ + Bₓ   ·   Rᵧ = Aᵧ + Bᵧ $$
**Unit vectors** î, ĵ, k̂ have length 1 and point along +x, +y, +z, so
$$ vec{A} = Aₓ î + Aᵧ ĵ + A_z k̂ $$
Adding is then just combining like terms.
>! A 3 m and a 4 m displacement only add to 7 m when they point the same way. At right angles they make 5 m.`),
      EX('Combine like terms', 'A = 3î + 4ĵ and B = −1î + 2ĵ. Find A + B and its magnitude.', ['x: 3 + (−1) = 2', 'y: 4 + 2 = 6', 'A + B = 2î + 6ĵ', '|A + B| = √(4 + 36) = √40 = **6.32**']),
      ORDER('Put the steps for adding vectors given as magnitudes and angles in order.', ['Draw a sketch and note each angle from +x', 'Find the x and y components of each vector', 'Add all x components and add all y components', 'Get the magnitude with Pythagoras', 'Get the direction with arctan and check the quadrant']),
      MC('Two vectors have magnitudes **3** and **4**. Which resultant magnitude is **impossible**?', ['8', '1', '5', '7'], 'The resultant ranges from 4 − 3 = 1 (opposite) to 4 + 3 = 7 (parallel). 8 is out of range.', { lvl: 2 }),
      G('p.vaddij'),
      TF('|A + B| always equals |A| + |B|.', false, 'Only when A and B point the same way.'),
      G('p.vaddij'),
      G('p.vadd'),
      FILL('To subtract B from A, add A to the ___ of B. In components, (A − B)ₓ = ___.', ['negative', 'Aₓ − Bₓ'], ['inverse', 'Aₓ + Bₓ', 'magnitude'], 'A − B = A + (−B), so subtract component by component.'),
    ]),
    L('p1l5', 'Dot & Cross Products', {
      goal: 'Compute dot and cross products and know what each one tells you.',
      key: 'Dot product (a scalar): $A·B = AB cos φ = AₓBₓ + AᵧBᵧ + A_zB_z$. It is zero when the vectors are perpendicular. Cross product (a vector): $|A×B| = AB sin φ$, direction by the right-hand rule, zero when parallel, and $A×B = −B×A$. Unit vectors: î×ĵ = k̂, ĵ×k̂ = î, k̂×î = ĵ. Work uses the dot product; torque and angular momentum use the cross product.',
      formulas: ['A·B = AB cos φ = AₓBₓ + AᵧBᵧ + A_zB_z', '|A × B| = AB sin φ', '(A × B)_z = AₓBᵧ − AᵧBₓ', 'î × ĵ = k̂, ĵ × k̂ = î, k̂ × î = ĵ'],
    }, [
      T('The dot product: how aligned are they?', `
$$ vec{A}·vec{B} = AB cos φ = AₓBₓ + AᵧBᵧ + A_zB_z $$
The result is a **scalar**. Parallel vectors give the maximum AB, perpendicular vectors give **0**, and opposite vectors give −AB.
>> Work is a dot product: $W = vec{F}·vec{d}$. Only the part of the force along the motion does work.`),
      T('The cross product: how perpendicular are they?', `
$$ |vec{A}×vec{B}| = AB sin φ $$
The result is a **vector** perpendicular to both. Point your right-hand fingers along A, curl them toward B, and your thumb points along A × B.
$$ î×ĵ = k̂   ·   ĵ×k̂ = î   ·   k̂×î = ĵ :: go the other way around the circle and you get a minus sign $$
For vectors in the xy-plane: $(A×B)_z = AₓBᵧ − AᵧBₓ$.
>! Order matters: $A×B = −B×A$. Parallel vectors give $A×B = 0$.`),
      EX('Dot product by components', 'A = 2î + 3ĵ − k̂ and B = î − 2ĵ + 4k̂. Find A · B. Are they perpendicular?', ['Multiply matching components: (2)(1) + (3)(−2) + (−1)(4)', '= 2 − 6 − 4 = **−8**', 'Not zero, so not perpendicular. The negative sign means the angle between them is more than 90°.']),
      MC('What is **î × ĵ**?', ['k̂', '−k̂', '0', '1'], 'î → ĵ → k̂ goes around the cycle in order, which gives +k̂.'),
      MC('What is **ĵ × î**?', ['−k̂', 'k̂', '0', 'î'], 'Swapping the order flips the sign: ĵ × î = −(î × ĵ) = −k̂.'),
      MATCH('Match each statement to what it tells you.', [['A·B = 0', 'perpendicular'], ['A × B = 0', 'parallel'], ['A·B result', 'a scalar'], ['A × B result', 'a vector']]),
      G('p.dot'),
      G('p.cross'),
      TF('A × B = B × A', false, 'The cross product is anticommutative: A × B = −B × A.'),
      G('p.angleBetween'),
    ]),
  ]);

  /* ================= Unit 2 ================= */
  const u2 = U('p2', 'Motion in a Line', { sub: 'Velocity, acceleration & the Big Four', ch: 'Ch 2' }, [
    L('p2l1', 'Displacement, Velocity & Speed', {
      goal: 'Tell displacement from distance and velocity from speed.',
      key: 'Displacement $Δx = x₂ − x₁$ is signed and only cares about the start and end. Distance is the total path length. Average velocity $= Δx/Δt$ (signed). Average speed = total distance / total time. For a round trip the average velocity is 0, but the average speed is not. To average speeds over legs of a trip, divide total distance by total time. Never average the speeds directly.',
      formulas: ['Δx = x₂ − x₁', 'v_av = [[Δx|Δt]]', 'avg speed = [[total distance|total time]]'],
    }, [
      T('Where you are vs how far you went', `
**Position** x tells where something is on a number line. **Displacement** $Δx = x₂ − x₁$ is the change in position, and it carries a **sign**.
**Distance** is how much ground you actually covered. It's never negative.

$$ v_{av} = [[Δx|Δt]] :: average velocity: signed, uses displacement $$
**Average speed** = total distance / total time.
>* Run one lap of a 400 m track in 80 s. Your displacement is 0, so your average velocity is 0. Your average speed is 400/80 = 5 m/s.`),
      EX('Backing up', 'A car moves from x = 50 m to x = 20 m in 6.0 s. Find its average velocity.', ['Δx = 20 − 50 = −30 m', 'v_av = −30 m / 6.0 s = **−5.0 m/s**', 'The minus sign means it moved toward −x.']),
      MC('A runner completes one full lap of a 400 m track in 80 s. What is her **average velocity**?', ['0 m/s', ['5 m/s', 'That\'s her average speed. Velocity uses displacement, and she ended where she started.'], '400 m/s', '−5 m/s'], 'She ends where she started, so Δx = 0.'),
      G('p.avgvel'),
      TF('Average speed is always greater than or equal to the magnitude of average velocity.', true, 'Distance traveled ≥ |displacement|, so speed ≥ |velocity| on average.'),
      MC('You drive **60 km at 30 km/h**, then **60 km at 60 km/h**. Average speed?', ['40 km/h', ['45 km/h', 'You can\'t average speeds when the legs take different times. The slow leg takes twice as long.'], '50 km/h', '35 km/h'], 'Times: 2 h + 1 h = 3 h for 120 km → 40 km/h.', { lvl: 2 }),
      G('p.avgspeedTrip'),
      G('p.avgvel'),
    ]),
    L('p2l2', 'Instantaneous Velocity & Acceleration', {
      goal: 'Get velocity and acceleration as slopes or derivatives, and tell when something speeds up.',
      key: '$v = dx/dt$ is the slope of the x–t graph. $a = dv/dt = d²x/dt²$ is the slope of the v–t graph. Power rule: $d(tⁿ)/dt = n tⁿ⁻¹$. An object **speeds up** when v and a have the same sign and **slows down** when they have opposite signs. v = 0 does not mean a = 0, for example at the top of a throw.',
      formulas: ['v = [[dx|dt]]   ·   a = [[dv|dt]] = [[d²x|dt²]]', 'd(tⁿ)/dt = n tⁿ⁻¹'],
    }, [
      T('Slopes and derivatives', `
Shrink Δt toward zero and the average velocity becomes the **instantaneous velocity**:
$$ v = [[dx|dt]] :: slope of the tangent line on an x–t graph $$
Acceleration is how fast velocity changes:
$$ a = [[dv|dt]] = [[d²x|dt²]] :: slope of a v–t graph $$
For polynomials, use the power rule: if $x = 4t³$, then $v = 12t²$ and $a = 24t$.`),
      T('Speeding up or slowing down?', `
The **sign of a alone doesn't tell you**. Compare it with v:
| v | a | motion |
|---|---|---|
| + | + | speeding up |
| − | − | speeding up (faster in −x) |
| + | − | slowing down |
| − | + | slowing down |
>! At the top of a vertical throw, v = 0 but a = −9.8 m/s². Zero velocity doesn't mean zero acceleration.`),
      EX('Differentiate twice', 'x(t) = 2t³ − 4t (meters). Find v and a at t = 2 s.', ['v = dx/dt = 6t² − 4', 'v(2) = 24 − 4 = **20 m/s**', 'a = dv/dt = 12t', 'a(2) = **24 m/s²**. Same sign as v, so it\'s speeding up.']),
      MC('On a position–time graph, the **slope** at a point equals the…', ['instantaneous velocity', 'acceleration', 'displacement', 'distance traveled'], 'v = dx/dt is the slope of x vs t.'),
      MC('An object has **v = −5 m/s** and **a = −2 m/s²**. It is…', ['speeding up', ['slowing down', 'Negative acceleration doesn\'t always mean slowing down. Here v and a point the same way.'], 'at rest', 'moving at constant speed'], 'Same sign → speeding up (in the −x direction).', { lvl: 2 }),
      MATCH('Match the graph feature to what it gives you.', [['slope of x–t', 'velocity'], ['slope of v–t', 'acceleration'], ['area under v–t', 'displacement'], ['area under a–t', 'change in velocity']]),
      G('p.deriv'),
      TF('If an object\'s velocity is zero at some instant, its acceleration must also be zero then.', false, 'A ball at the top of its flight has v = 0 and a = −g.'),
      G('p.deriv', { lvl: 4 }),
    ]),
    L('p2l3', 'The Big Four', {
      goal: 'Solve any constant-acceleration problem by choosing the right kinematic equation.',
      key: 'With constant a there are five variables (Δx, v₀, v, a, t) and four equations, each missing one variable: $v = v₀ + at$ (no Δx), $Δx = v₀t + ½at²$ (no v), $v² = v₀² + 2aΔx$ (no t), $Δx = ½(v₀ + v)t$ (no a). List what you know, find the variable you neither know nor need, and use the equation without it.',
      formulas: ['v = v₀ + at', 'Δx = v₀t + ½at²', 'v² = v₀² + 2aΔx', 'Δx = ½(v₀ + v)t'],
    }, [
      T('Five variables, four equations', `
When acceleration is **constant**, every problem involves the same five quantities: **Δx, v₀, v, a, t**. Each of the four equations leaves exactly **one** of them out:
| Equation | Missing |
|---|---|
| $v = v₀ + at$ | Δx |
| $Δx = v₀t + ½at²$ | v |
| $v² = v₀² + 2aΔx$ | t |
| $Δx = ½(v₀ + v)t$ | a |
>* Write the five symbols down. Fill in the three you know. Find the one you don't know **and don't need**, then use the equation that's missing it.`),
      EX('Braking car', 'A car going 25 m/s brakes at a constant 5.0 m/s². How far does it go before stopping?', ['Knowns: v₀ = 25, v = 0, a = −5.0. Want Δx. Don\'t care about t.', 'Equation without t: $v² = v₀² + 2aΔx$', '0 = 625 + 2(−5.0)Δx', 'Δx = 625/10 = **62.5 m**']),
      MATCH('Match each equation to the variable it leaves out.', [['v = v₀ + at', 'Δx'], ['Δx = v₀t + ½at²', 'v (final)'], ['v² = v₀² + 2aΔx', 't'], ['Δx = ½(v₀+v)t', 'a']]),
      MC('You know v₀, a and Δx and want v. Which equation?', ['v² = v₀² + 2aΔx', 'v = v₀ + at', 'Δx = v₀t + ½at²', 'Δx = ½(v₀ + v)t'], 'Time is neither known nor wanted, so use the equation without t.'),
      G('p.kin.stop'),
      G('p.kin.v'),
      G('p.kin.t'),
      ORDER('Order the steps for a kinematics problem.', ['Sketch it and choose a positive direction', 'List Δx, v₀, v, a, t and fill in the knowns', 'Pick the equation missing the variable you don\'t need', 'Solve for the unknown algebraically first', 'Plug in numbers and check the sign and size']),
      G('p.kin.x'),
      G('p.kin.a'),
      G('p.kin.chase'),
    ]),
    L('p2l4', 'Free Fall', {
      goal: 'Solve vertical-motion problems with a = −g.',
      key: 'Ignoring air, everything near Earth accelerates at $g = 9.80 m/s²$ downward, whether it\'s rising, falling or at the top. With up as positive, a = −9.80 m/s². At the top v = 0, so $H = v₀²/2g$ and $t_{top} = v₀/g$. Coming back to the launch height takes the same time as going up, and the ball returns at the same speed. Mass doesn\'t matter.',
      formulas: ['a = −g = −9.80 m/s² (up +)', 'H = [[v₀²|2g]]   ·   t_{top} = [[v₀|g]]', 'dropped: t = √{2h/g}, v = √{2gh}'],
    }, [
      T('Gravity is the only acceleration', `
Without air resistance, **every** object near Earth's surface has the same acceleration:
$$ a = −g = −9.80 m/s² :: taking up as positive $$
That's true going up, coming down, and at the very top. It doesn't depend on mass, so a bowling ball and a marble dropped together land together.
>* Free fall is just the Big Four with a = −9.80 m/s². Nothing new to memorize.
>! At the highest point **v = 0 but a is still −9.80 m/s²**. This is one of the most-tested ideas on Exam 1.`),
      EX('How high, how long?', 'A ball is thrown straight up at 15 m/s. Find its max height and the time to reach it.', ['Up is +, so a = −9.80 m/s². At the top v = 0.', 'Height (no t): 0 = 15² − 2(9.80)H → H = 225/19.6 = **11.5 m**', 'Time: 0 = 15 − 9.80t → t = **1.53 s**', 'It returns to your hand at 2 × 1.53 = 3.06 s, moving at 15 m/s downward.']),
      MC('What is a ball\'s acceleration at the very top of its flight?', ['9.80 m/s² downward', ['zero', 'Velocity is zero there, but velocity is still changing, from up to down. So a ≠ 0.'], '9.80 m/s² upward', 'it depends on the mass'], 'Gravity never switches off.'),
      TF('Without air resistance, a heavier object falls faster than a lighter one.', false, 'All objects fall with the same acceleration g.'),
      G('p.ff.h'),
      G('p.ff.drop'),
      G('p.ff.round'),
      MC('A ball is thrown up at 12 m/s. When it comes back down past the launch point, its speed is…', ['12 m/s', 'less than 12 m/s', 'more than 12 m/s', 'zero'], 'Free fall is symmetric: same height, same speed (opposite direction).', { lvl: 2 }),
      G('p.ff.cliff'),
    ]),
    L('p2l5', 'Motion Graphs & Calculus', {
      goal: 'Read displacement from areas and handle acceleration that changes with time.',
      key: 'Areas undo slopes. The area under a v–t graph is the displacement (area below the axis counts negative), and the area under an a–t graph is Δv. When acceleration changes with time, the Big Four don\'t apply. Integrate instead: $v(t) = v₀ + ∫₀ᵗ a dt$ and $x(t) = x₀ + ∫₀ᵗ v dt$.',
      formulas: ['Δx = ∫v dt = area under v–t', 'Δv = ∫a dt = area under a–t', 'v(t) = v₀ + ∫₀ᵗ a(t′) dt′'],
    }, [
      T('Areas undo slopes', `
If slope takes you from x to v to a, **area** takes you back:
$$ Δx = ∫ v dt :: area under the v–t graph $$
$$ Δv = ∫ a dt :: area under the a–t graph $$
Area below the time axis counts as **negative** displacement.
>! The Big Four only work for **constant** acceleration. If $a = 3t$ or $a = 2t²$, you have to integrate.`, { fig: D.graph({ pts: [[0, 0], [3, 9], [7, 9], [9, 0]], xmax: 10, ymax: 11, shade: true, ticks: [3, 7, 9], yticks: [9], alt: 'Velocity-time graph with the area underneath shaded' }) }),
      EX('Integrate a changing acceleration', 'A particle starts at rest at x = 0 with a(t) = 6t m/s². Find v and x at t = 2 s.', ['v(t) = 0 + ∫₀ᵗ 6t dt = 3t²', 'v(2) = 3(4) = **12 m/s**', 'x(t) = ∫₀ᵗ 3t² dt = t³', 'x(2) = **8 m**']),
      MC('A v–t graph is a **horizontal line above the time axis**. The object has…', ['constant positive velocity', 'constant positive acceleration', 'increasing velocity', 'zero displacement'], 'Flat v means zero acceleration, and above the axis means v > 0.'),
      MC('The area under an **acceleration–time** graph gives…', ['the change in velocity', 'the displacement', 'the position', 'the jerk'], 'Δv = ∫a dt.'),
      G('p.area'),
      G('p.integ'),
      TF('The kinematic equation Δx = v₀t + ½at² works for a(t) = 4t.', false, 'It assumes constant acceleration. Integrate instead.'),
      G('p.area'),
    ]),
  ]);

  /* ================= Unit 3 ================= */
  const u3 = U('p3', 'Motion in 2D', { sub: 'Projectiles, circles & relative motion', ch: 'Ch 3' }, [
    L('p3l1', 'Position & Velocity Vectors', {
      goal: 'Differentiate position vectors and know what perpendicular acceleration does.',
      key: 'In 2D, $r = xî + yĵ$, $v = dr/dt$ and $a = dv/dt$, each worked out component by component. Speed is $|v| = √{vₓ² + vᵧ²}$. The part of a along v changes the speed. The part of a perpendicular to v changes only the direction.',
      formulas: ['vec{v} = [[dvec{r}|dt]] = [[dx|dt]]î + [[dy|dt]]ĵ', 'speed = √{vₓ² + vᵧ²}'],
    }, [
      T('Two 1-D problems at once', `
In 2D, position is a vector $vec{r} = xî + yĵ$. Velocity and acceleration are derivatives, **one component at a time**:
$$ vec{v} = [[dx|dt]]î + [[dy|dt]]ĵ   ·   vec{a} = [[dvₓ|dt]]î + [[dvᵧ|dt]]ĵ $$
>* Acceleration **parallel** to v changes the speed. Acceleration **perpendicular** to v changes the direction only. That's why circular motion at constant speed still has acceleration.`),
      EX('Drone velocity', 'r(t) = (2t²)î + (3t)ĵ m. Find the speed at t = 1 s.', ['v = (4t)î + 3ĵ', 'At t = 1: v = 4î + 3ĵ m/s', 'speed = √(16 + 9) = **5 m/s**']),
      MC('A car moves at constant **speed** around a curve. Its acceleration is…', ['nonzero and perpendicular to its velocity', 'zero', 'parallel to its velocity', 'opposite to its velocity'], 'The direction is changing, so there is an acceleration. Perpendicular acceleration turns the velocity without changing its size.'),
      G('p.2dv'),
      TF('In 2D motion, the x and y components of motion can be treated as independent 1-D problems.', true, 'This is what makes projectile motion easy: only the time links them.'),
      MC('A particle\'s position is r = (3t)î + (5 − t²)ĵ. Which statement about its acceleration is true?', ['It is constant: −2ĵ', 'It is zero', 'It points along +x', 'It grows with time'], 'vₓ = 3, vᵧ = −2t → aₓ = 0, aᵧ = −2. Constant and along −y.', { lvl: 2 }),
      G('p.2dv'),
    ]),
    L('p3l2', 'Horizontal Launch', {
      goal: 'Solve "rolls off a table / thrown off a cliff" problems.',
      key: 'Treat horizontal and vertical motion separately. The only thing they share is time. Horizontally there\'s no acceleration, so $x = v₀t$. Vertically it\'s free fall starting from vᵧ = 0, so $h = ½gt²$ and $t = √{2h/g}$. Fall time depends only on height, so a dropped ball and a ball thrown horizontally from the same height land at the same moment.',
      formulas: ['t = √{2h/g}', 'x = v₀t', 'v_{impact} = √{v₀² + 2gh}'],
    }, [
      T('Split it in two', `
Launch something **horizontally** at speed v₀ from height h:
- **Horizontal:** no force, so constant velocity: $x = v₀t$
- **Vertical:** free fall from rest: $h = ½gt²$

The two motions **share only the time**.
$$ t = √{2h/g}   →   x = v₀ √{2h/g} $$
>* Fall time depends only on height. Throwing the ball faster sends it farther but doesn't keep it in the air any longer.`, { fig: D.projectile({ cliff: true }) }),
      EX('Off the table', 'A marble rolls off a 1.2 m high table at 2.0 m/s. Where does it land?', ['Vertical: 1.2 = 4.9t² → t = √(1.2/4.9) = 0.495 s', 'Horizontal: x = 2.0 × 0.495 = **0.99 m** from the table\'s edge']),
      MC('One ball is dropped and another is fired horizontally from the same height at the same moment. Which lands first?', ['They land at the same time', 'The dropped ball', 'The fired ball', 'It depends on the firing speed'], 'Both have vᵧ₀ = 0 and the same vertical acceleration.'),
      G('p.proj.h'),
      TF('During horizontal launch, the horizontal velocity increases as the object falls.', false, 'No horizontal force means vₓ stays constant. Only vᵧ grows.'),
      G('p.proj.h'),
      G('p.proj.hv'),
    ]),
    L('p3l3', 'Angled Launch', {
      goal: 'Find range, max height and flight time for any launch angle.',
      key: 'Resolve: $v₀ₓ = v₀ cos θ$ and $v₀ᵧ = v₀ sin θ$. At the top vᵧ = 0, but vₓ is still $v₀ cos θ$. On level ground: $T = 2v₀ sin θ/g$, $H = v₀² sin²θ/2g$, $R = v₀² sin 2θ/g$. Maximum range is at 45°, and complementary angles (30° and 60°) give equal range. If the landing height differs from the launch height, don\'t use the range formula. Find t from the vertical motion and then x = vₓt.',
      formulas: ['v₀ₓ = v₀ cos θ   ·   v₀ᵧ = v₀ sin θ', 'T = [[2v₀ sin θ|g]]   ·   H = [[v₀² sin²θ|2g]]', 'R = [[v₀² sin 2θ|g]] (level ground only)'],
    }, [
      T('Resolve, then run two clocks', `
$$ v₀ₓ = v₀ cos θ   ·   v₀ᵧ = v₀ sin θ $$
Horizontal: $x = v₀ₓ t$. Vertical: $y = v₀ᵧt − ½gt²$.
**Level ground** shortcuts:
$$ R = [[v₀² sin 2θ|g]]   ·   H = [[v₀² sin² θ|2g]]   ·   T = [[2 v₀ sin θ|g]] $$
>! The range formula only works when it **lands at the launch height**. For walls, cliffs or rooftops, use the component equations.`, { fig: D.projectile({ deg: 50 }) }),
      EX('A punted ball', 'A ball is kicked at 20 m/s at 30° above level ground. Find T and R.', ['v₀ₓ = 20 cos 30° = 17.3 m/s, v₀ᵧ = 20 sin 30° = 10.0 m/s', 'T = 2(10.0)/9.8 = **2.04 s**', 'R = 17.3 × 2.04 = **35.3 m**', 'Check: v₀² sin 60°/g = 400(0.866)/9.8 = 35.3 ✓']),
      MC('At the very top of a projectile\'s path, its velocity is…', ['horizontal, equal to v₀ cos θ', 'zero', 'vertical', 'equal to v₀'], 'Only vᵧ is zero at the top. vₓ never changes.'),
      MC('Which pair of launch angles gives the **same range** on level ground (same speed)?', ['30° and 60°', '30° and 45°', '20° and 40°', '45° and 90°'], 'sin 2θ is the same for complementary angles: sin 60° = sin 120°.'),
      G('p.proj.R'),
      G('p.proj.R'),
      FILL('On level ground, maximum range happens at ___ and the time of flight depends only on the ___ component of the launch velocity.', ['45°', 'vertical'], ['90°', 'horizontal', '30°'], 'sin 2θ peaks at θ = 45°. T = 2v₀ᵧ/g.'),
      G('p.proj.R', { lvl: 3 }),
      G('p.proj.wall'),
    ]),
    L('p3l4', 'Uniform Circular Motion', {
      goal: 'Compute centripetal acceleration from speed or period.',
      key: 'Moving in a circle at constant speed still means accelerating, because the direction keeps changing. The acceleration points toward the center: $a_{rad} = v²/R$. With period T: $v = 2πR/T$, so $a_{rad} = 4π²R/T²$. The velocity is always tangent to the circle.',
      formulas: ['a_{rad} = [[v²|R]]', 'v = [[2πR|T]]', 'a_{rad} = [[4π²R|T²]]'],
    }, [
      T('Constant speed, changing direction', `
On a circle at constant speed, the velocity is always **tangent** to the circle and keeps turning. That turning requires an acceleration pointing **toward the center**:
$$ a_{rad} = [[v²|R]] :: centripetal (center-seeking) acceleration $$
If it takes time T for one lap: $v = 2πR/T$, so $a_{rad} = 4π²R/T²$.`, { fig: D.circle({ deg: 50 }) }),
      EX('Merry-go-round', 'A child sits 2.0 m from the center of a ride that turns once every 4.0 s. Find her acceleration.', ['v = 2π(2.0)/4.0 = 3.14 m/s', 'a = v²/R = 3.14²/2.0 = **4.93 m/s²**, toward the center']),
      MC('For uniform circular motion, the acceleration points…', ['toward the center', 'along the velocity', 'outward from the center', 'nowhere, since it is zero'], 'Centripetal means center-seeking.'),
      TF('An object moving in a circle at constant speed has zero acceleration.', false, 'Its velocity direction changes, so a = v²/R ≠ 0.'),
      G('p.ucm.a'),
      MC('If a car doubles its speed around the same curve, its centripetal acceleration…', ['quadruples', 'doubles', 'stays the same', 'halves'], 'a = v²/R, so (2v)² = 4v².', { lvl: 2 }),
      G('p.ucm.T'),
      G('p.ucm.a'),
    ]),
    L('p3l5', 'Relative Velocity', {
      goal: 'Combine velocities between reference frames (rivers, planes, trains).',
      key: 'Velocities add like vectors: $v_{A/C} = v_{A/B} + v_{B/C}$. The inner letters match and cancel. For a boat aimed straight across a river, crossing time = width / boat speed, and the current only adds downstream drift. To land straight across, aim upstream at angle θ with $sin θ = v_{river}/v_{boat}$.',
      formulas: ['vec{v}_{A/C} = vec{v}_{A/B} + vec{v}_{B/C}', 'aim upstream: sin θ = [[v_{river}|v_{boat}]]'],
    }, [
      T('Whose point of view?', `
Velocity depends on who is watching. If A moves relative to B, and B moves relative to C:
$$ vec{v}_{A/C} = vec{v}_{A/B} + vec{v}_{B/C} $$
The inner subscripts (B) "cancel", like dominoes.
>> A boat aimed straight across a river at 4 m/s, with the current at 3 m/s, moves at 5 m/s relative to the shore and drifts downstream as it crosses.`),
      EX('Crossing a river', 'A boat heads straight across a 100 m river at 4.0 m/s (relative to the water). The current is 3.0 m/s. Find the crossing time and the downstream drift.', ['Across: only the boat\'s 4.0 m/s counts → t = 100/4.0 = **25 s**', 'Downstream: 3.0 m/s × 25 s = **75 m** of drift', 'Speed relative to shore: √(4² + 3²) = 5.0 m/s']),
      MC('A passenger walks toward the front of a train at 2 m/s while the train moves at 20 m/s. Relative to the ground, the passenger moves at…', ['22 m/s', '18 m/s', '20 m/s', '2 m/s'], 'v_P/G = v_P/T + v_T/G = 2 + 20.'),
      G('p.rel.1d'),
      G('p.rel.boat'),
      TF('A stronger current makes a boat (aimed straight across) take longer to cross the river.', false, 'Crossing time depends only on the across-component, so the current only adds drift.'),
      G('p.rel.boat'),
      G('p.rel.heading'),
    ]),
  ]);

  CQ.addUnits('phys', [u1, u2, u3]);
})();
