/* PHYS 2325 · Units 4–5: Newton's laws and applying them (Young & Freedman Ch 4–5) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const g = 9.8;
  const D = CQ.dg;
  const deg = (r) => (r * 180) / Math.PI;
  const rad = (d) => (d * Math.PI) / 180;
  const sin = (d) => Math.sin(rad(d)), cos = (d) => Math.cos(rad(d));

  /* ================= generators: Unit 4 ================= */
  CQ.gen('p.netforce', (R) => {
    const F1 = R.pick([10, 12, 15, 20, 25]), F2 = R.pick([8, 10, 15, 18, 30]), a2 = R.pick([60, 90, 120, 135, 150, 180]);
    const rx = F1 + F2 * cos(a2), ry = F2 * sin(a2);
    const m = Math.hypot(rx, ry);
    return { t: 'num', q: 'Two forces act on a crate: **' + F1 + ' N along +x** and **' + F2 + ' N at ' + a2 + '°** from +x. What is the magnitude of the net force?', a: m, unit: 'N', abs: 0.05,
      fig: D.fbd({ forces: [{ a: 0, len: 40 + F1 * 2, label: F1 + ' N', cls: 'c1' }, { a: a2, len: 40 + F2 * 2, label: F2 + ' N', cls: 'c2' }] }),
      steps: ['ΣFₓ = ' + F1 + ' + ' + F2 + ' cos ' + a2 + '° = ' + F(rx) + ' N', 'ΣFᵧ = ' + F2 + ' sin ' + a2 + '° = ' + F(ry) + ' N', '|ΣF| = √(ΣFₓ² + ΣFᵧ²) = **' + F(m) + ' N**'] };
  });

  CQ.gen('p.n2', (R) => {
    const m = R.pick([2, 4, 5, 8, 10, 12, 25, 1200]), a = R.pick([0.5, 1.5, 2, 3, 4, 2.5]);
    const Fn = m * a;
    const k = R.int(0, 2);
    if (k === 0) return { t: 'num', q: 'A net force of **' + F(Fn) + ' N** acts on a **' + m + ' kg** object. What is its acceleration?', a, unit: 'm/s²', steps: ['a = ΣF/m = ' + F(Fn) + '/' + m + ' = **' + F(a) + ' m/s²**'] };
    if (k === 1) return { t: 'num', q: 'What net force is needed to accelerate a **' + m + ' kg** object at **' + a + ' m/s²**?', a: Fn, unit: 'N', steps: ['ΣF = ma = ' + m + ' × ' + a + ' = **' + F(Fn) + ' N**'] };
    return { t: 'num', q: 'A **' + F(Fn) + ' N** net force gives an object an acceleration of **' + a + ' m/s²**. What is its mass?', a: m, unit: 'kg', steps: ['m = ΣF/a = ' + F(Fn) + '/' + a + ' = **' + F(m) + ' kg**'] };
  });

  CQ.gen('p.n2.2d', (R) => {
    const m = R.pick([2, 3, 4, 5, 6]), Fx = R.pick([6, 8, 9, 12]), Fy = R.pick([5, 8, 12, 16]);
    const a = Math.hypot(Fx, Fy) / m;
    return { t: 'num', lvl: 4, q: 'A **' + m + ' kg** puck on frictionless ice is pushed by **' + Fx + ' N east** and **' + Fy + ' N north** at the same time. What is the magnitude of its acceleration?', a, unit: 'm/s²',
      steps: ['ΣF = √(' + Fx + '² + ' + Fy + '²) = ' + F(Math.hypot(Fx, Fy)) + ' N', 'a = ΣF/m = **' + F(a) + ' m/s²**'] };
  });

  CQ.gen('p.n2.kin', (R) => {
    const m = R.pick([2, 5, 10, 20]), Fn = R.pick([10, 20, 30, 40, 50]), t = R.pick([2, 3, 4, 5]);
    const a = Fn / m, x = 0.5 * a * t * t;
    return { t: 'num', lvl: 4, q: 'A constant net force of **' + Fn + ' N** pushes a **' + m + ' kg** cart that starts from rest. How far does it travel in **' + t + ' s**?', a: x, unit: 'm',
      hint: 'Newton\'s 2nd law gives a. Then it\'s a kinematics problem.', steps: ['a = F/m = ' + Fn + '/' + m + ' = ' + F(a) + ' m/s²', 'x = ½at² = ½(' + F(a) + ')(' + t + ')² = **' + F(x) + ' m**'] };
  });

  CQ.gen('p.weight', (R) => {
    const m = R.pick([2, 5, 12, 60, 75, 80]);
    const k = R.int(0, 2);
    if (k === 0) return { t: 'num', q: 'What is the weight of a **' + m + ' kg** object on Earth?', a: m * g, unit: 'N', steps: ['w = mg = ' + m + ' × 9.80 = **' + F(m * g) + ' N**'] };
    if (k === 1) return { t: 'num', q: 'An astronaut has a mass of **' + m + ' kg**. What does she weigh on the Moon (g = 1.62 m/s²)?', a: m * 1.62, unit: 'N', steps: ['Mass is the same everywhere: ' + m + ' kg', 'w = mg_Moon = ' + m + ' × 1.62 = **' + F(m * 1.62) + ' N**'] };
    const w = m * g;
    return { t: 'num', q: 'A box weighs **' + F(w) + ' N** on Earth. What is its mass?', a: m, unit: 'kg', steps: ['m = w/g = ' + F(w) + '/9.80 = **' + F(m) + ' kg**'] };
  });

  CQ.gen('p.elev', (R) => {
    const m = R.pick([50, 60, 70, 80]), a = R.pick([1, 1.5, 2, 2.5, 3]), up = R.chance(0.5), speedUp = R.chance(0.5);
    // effective acceleration direction: up if (moving up & speeding up) or (moving down & slowing down)
    const accUp = up === speedUp;
    const n = m * (g + (accUp ? a : -a));
    const desc = 'moving **' + (up ? 'up' : 'down') + '** and **' + (speedUp ? 'speeding up' : 'slowing down') + '** at ' + a + ' m/s²';
    return { t: 'num', lvl: 4, q: 'A **' + m + ' kg** student stands on a scale in an elevator that is ' + desc + '. What does the scale read (in newtons)?', a: n, unit: 'N',
      hint: 'First decide which way the acceleration points. Speeding up means a is along v. Slowing down means a is opposite v.',
      steps: ['Acceleration points **' + (accUp ? 'up' : 'down') + '**', 'ΣFᵧ = n − mg = m(' + (accUp ? '+' : '−') + a + ')', 'n = m(g ' + (accUp ? '+' : '−') + ' a) = ' + m + '(9.8 ' + (accUp ? '+' : '−') + ' ' + a + ') = **' + F(n) + ' N**'],
      why: 'The scale reads the normal force. It reads heavy when a points up and light when a points down. The direction of motion doesn\'t matter.' };
  });

  CQ.gen('p.push2', (R) => {
    const m1 = R.pick([2, 3, 4, 5]), m2 = R.pick([1, 2, 3, 6]), Fp = R.pick([12, 18, 24, 30]);
    const a = Fp / (m1 + m2), c = m2 * a;
    return { t: 'num', lvl: 4, q: 'Two blocks sit side by side on a frictionless floor: **' + m1 + ' kg** (left) and **' + m2 + ' kg** (right). You push the left block to the right with **' + Fp + ' N**. What force does the left block exert on the right block?', a: c, unit: 'N',
      hint: 'Find the shared acceleration first, then look at the right block alone. The only horizontal force on it is the contact force.',
      steps: ['Both together: a = ' + Fp + '/(' + m1 + ' + ' + m2 + ') = ' + F(a) + ' m/s²', 'Right block alone: P = m₂a = ' + m2 + ' × ' + F(a) + ' = **' + F(c) + ' N**', 'By the 3rd law, the right block pushes back on the left with the same ' + F(c) + ' N.'] };
  });

  /* ================= generators: Unit 5 ================= */
  CQ.gen('p.eq.sym', (R) => {
    const m = R.pick([2, 5, 8, 10, 15, 20]), th = R.pick([20, 30, 40, 45, 60, 70]);
    const T2 = (m * g) / (2 * sin(th));
    return { t: 'num', q: 'A **' + m + ' kg** sign hangs from two ropes. Each makes **' + th + '°** with the horizontal (symmetric). What is the tension in each rope?', a: T2, unit: 'N',
      fig: D.ropes({ a1: th, a2: th }),
      steps: ['Horizontal parts cancel by symmetry', 'Vertical: 2T sin ' + th + '° = mg', 'T = [[mg|2 sin ' + th + '°]] = [[' + F(m * g) + '|' + F(2 * sin(th)) + ']] = **' + F(T2) + ' N**'],
      why: th < 30 ? 'Shallow ropes need a lot of tension. Only a small vertical part of each one holds the sign up.' : '' };
  });

  CQ.gen('p.eq.asym', (R) => {
    const m = R.pick([5, 8, 10, 12]), a1 = R.pick([30, 37, 40]), a2 = R.pick([50, 53, 60]);
    const T1 = (m * g * cos(a2)) / sin(a1 + a2), T2 = (m * g * cos(a1)) / sin(a1 + a2);
    const want = R.pick([1, 2]);
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + m + ' kg** lamp hangs from two cords. Cord 1 makes **' + a1 + '°** with the ceiling on the left; cord 2 makes **' + a2 + '°** with the ceiling on the right. Find **T' + (want === 1 ? '₁' : '₂') + '**.', a: want === 1 ? T1 : T2, unit: 'N',
      fig: D.ropes({ a1, a2 }),
      hint: 'Write ΣFₓ = 0 and ΣFᵧ = 0 at the knot: two equations, two unknowns.',
      steps: ['ΣFₓ = 0: T₁ cos ' + a1 + '° = T₂ cos ' + a2 + '°', 'ΣFᵧ = 0: T₁ sin ' + a1 + '° + T₂ sin ' + a2 + '° = mg = ' + F(m * g) + ' N', 'Solve: T₁ = [[mg cos ' + a2 + '°|sin(' + a1 + '° + ' + a2 + '°)]] = ' + F(T1) + ' N, T₂ = [[mg cos ' + a1 + '°|sin(' + (a1 + a2) + '°)]] = ' + F(T2) + ' N', 'T' + (want === 1 ? '₁' : '₂') + ' = **' + F(want === 1 ? T1 : T2) + ' N**'] };
  });

  CQ.gen('p.eq.side', (R) => {
    const m = R.pick([2, 3, 4, 5]), Fh = R.pick([8, 10, 15, 20]);
    const want = R.pick(['T', 'th']);
    const T2 = Math.hypot(Fh, m * g), th = deg(Math.atan(Fh / (m * g)));
    return { t: 'num', q: 'A **' + m + ' kg** ball hangs from a string. A horizontal force of **' + Fh + ' N** pushes it sideways and it hangs at rest. ' + (want === 'T' ? 'What is the tension in the string?' : 'What angle does the string make with the vertical?'), a: want === 'T' ? T2 : th, unit: want === 'T' ? 'N' : '°', abs: want === 'T' ? undefined : 0.6,
      steps: ['ΣFₓ = 0: T sin θ = ' + Fh + ' N', 'ΣFᵧ = 0: T cos θ = mg = ' + F(m * g) + ' N', want === 'T' ? 'T = √(' + Fh + '² + ' + F(m * g) + '²) = **' + F(T2) + ' N**' : 'tan θ = ' + Fh + '/' + F(m * g) + ' → θ = **' + F(th) + '°**'] };
  });

  CQ.gen('p.incl.a', (R) => {
    const th = R.pick([10, 15, 20, 25, 30, 35, 40]);
    return { t: 'num', q: 'A block slides down a **frictionless** ramp inclined at **' + th + '°**. What is its acceleration?', a: g * sin(th), unit: 'm/s²',
      fig: D.incline({ deg: th }), hint: 'Only the part of gravity along the slope accelerates it.',
      steps: ['Along the slope: ΣF = mg sin θ = ma', 'a = g sin θ = 9.8 sin ' + th + '° = **' + F(g * sin(th)) + ' m/s²**', 'The mass cancels.'] };
  });

  CQ.gen('p.incl.n', (R) => {
    const m = R.pick([2, 4, 5, 10, 15]), th = R.pick([15, 20, 30, 37, 45]);
    return { t: 'num', q: 'A **' + m + ' kg** box rests on a ramp tilted **' + th + '°**. What is the normal force on it?', a: m * g * cos(th), unit: 'N',
      fig: D.incline({ deg: th, comps: true }), steps: ['Perpendicular to the ramp nothing accelerates: n = mg cos θ', 'n = ' + m + '(9.8) cos ' + th + '° = **' + F(m * g * cos(th)) + ' N**'], why: 'n is less than mg on a slope. Only the perpendicular part of the weight presses into the surface.' };
  });

  CQ.gen('p.incl.slide', (R) => {
    const th = R.pick([15, 20, 25, 30]), L2 = R.pick([2, 3, 4, 5, 6]);
    const a = g * sin(th);
    const want = R.pick(['v', 't']);
    const v = Math.sqrt(2 * a * L2), t = Math.sqrt((2 * L2) / a);
    return { t: 'num', lvl: 4, q: 'A sled starts from rest at the top of a **' + L2 + ' m** long frictionless slope inclined at **' + th + '°**. ' + (want === 'v' ? 'How fast is it going at the bottom?' : 'How long does it take to reach the bottom?'), a: want === 'v' ? v : t, unit: want === 'v' ? 'm/s' : 's',
      steps: ['a = g sin θ = ' + F(a) + ' m/s² along the slope', want === 'v' ? 'v² = 2aL → v = √{2(' + F(a) + ')(' + L2 + ')} = **' + F(v) + ' m/s**' : 'L = ½at² → t = √{2L/a} = **' + F(t) + ' s**'] };
  });

  CQ.gen('p.incl.push', (R) => {
    const m = R.pick([5, 10, 15, 20]), th = R.pick([15, 20, 25, 30]);
    const Fp = m * g * sin(th);
    return { t: 'num', q: 'What force **parallel to a frictionless ramp** (tilted **' + th + '°**) is needed to push a **' + m + ' kg** crate up at **constant speed**?', a: Fp, unit: 'N',
      steps: ['Constant speed → a = 0 → forces along the slope balance', 'F = mg sin θ = ' + m + '(9.8) sin ' + th + '° = **' + F(Fp) + ' N**'] };
  });

  CQ.gen('p.fric.a', (R) => {
    const m = R.pick([5, 10, 15, 20, 25]), mu = R.pick([0.15, 0.2, 0.25, 0.3, 0.4]);
    const Fp = Math.ceil(mu * m * g + R.pick([10, 15, 20, 30]));
    const a = (Fp - mu * m * g) / m;
    return { t: 'num', q: 'You push a **' + m + ' kg** box across the floor with a horizontal **' + Fp + ' N** force. If **μₖ = ' + mu + '**, what is its acceleration?', a, unit: 'm/s²',
      steps: ['n = mg = ' + F(m * g) + ' N', 'fₖ = μₖn = ' + mu + ' × ' + F(m * g) + ' = ' + F(mu * m * g) + ' N', 'a = [[F − fₖ|m]] = [[' + Fp + ' − ' + F(mu * m * g) + '|' + m + ']] = **' + F(a) + ' m/s²**'] };
  });

  CQ.gen('p.fric.static', (R) => {
    const m = R.pick([10, 20, 30, 40]), mus = R.pick([0.3, 0.4, 0.5, 0.6]);
    const max = mus * m * g;
    const moves = R.chance(0.5);
    const Fp = Math.round(moves ? max * R.pick([1.15, 1.3, 1.5]) : max * R.pick([0.5, 0.7, 0.85]));
    return { t: 'mc', lvl: 3, q: 'A **' + m + ' kg** crate rests on a floor with **μₛ = ' + mus + '**. You push horizontally with **' + Fp + ' N**. What happens?',
      opts: moves ? ['It starts to slide', 'It stays at rest, and friction = ' + Fp + ' N', 'It stays at rest, and friction = ' + F(max) + ' N', 'It moves at constant velocity right away'] : ['It stays at rest, and friction = ' + Fp + ' N', 'It starts to slide', 'It stays at rest, and friction = ' + F(max) + ' N', 'It stays at rest, and friction = 0'],
      steps: ['Maximum static friction: fₛ,max = μₛmg = ' + mus + ' × ' + F(m * g) + ' = ' + F(max) + ' N', moves ? Fp + ' N > ' + F(max) + ' N → it breaks loose and slides' : Fp + ' N < ' + F(max) + ' N → it stays put. Static friction only matches your push: ' + Fp + ' N'],
      why: 'Static friction is only as large as it needs to be, up to μₛn.' };
  });

  CQ.gen('p.fric.incl', (R) => {
    const th = R.pick([30, 35, 40, 45]), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    const a = g * (sin(th) - mu * cos(th));
    return { t: 'num', lvl: 4, q: 'A block slides down a ramp inclined at **' + th + '°** with kinetic friction coefficient **μₖ = ' + mu + '**. Find its acceleration.', a, unit: 'm/s²',
      fig: D.incline({ deg: th, friction: 1 }),
      steps: ['Along slope (down +): mg sin θ − μₖ mg cos θ = ma', 'a = g(sin θ − μₖ cos θ) = 9.8(' + F(sin(th)) + ' − ' + mu + ' × ' + F(cos(th)) + ')', 'a = **' + F(a) + ' m/s²**'] };
  });

  CQ.gen('p.fric.angle', (R) => {
    const mus = R.pick([0.25, 0.3, 0.4, 0.5, 0.6, 0.75]);
    return { t: 'num', q: 'You slowly tilt a board with a coin on it. The coin starts to slip when the board reaches angle θ. If **μₛ = ' + mus + '**, what is θ?', a: deg(Math.atan(mus)), unit: '°', abs: 0.6,
      steps: ['On the verge of slipping: mg sin θ = μₛ mg cos θ', 'tan θ = μₛ → θ = arctan(' + mus + ') = **' + F(deg(Math.atan(mus))) + '°**'] };
  });

  CQ.gen('p.fric.pull', (R) => {
    const m = R.pick([10, 15, 20]), Fp = R.pick([60, 80, 100]), th = R.pick([20, 30, 37]), mu = R.pick([0.2, 0.25, 0.3]);
    const n = m * g - Fp * sin(th), a = (Fp * cos(th) - mu * n) / m;
    return { t: 'num', lvl: 4, exam: true, q: 'You pull a **' + m + ' kg** sled with a rope at **' + th + '°** above horizontal with **' + Fp + ' N**. μₖ = **' + mu + '**. What is the sled\'s acceleration?', a, unit: 'm/s²',
      hint: 'The rope\'s upward component lifts the sled a little, so n is less than mg.',
      steps: ['Vertical: n + F sin θ − mg = 0 → n = ' + F(m * g) + ' − ' + F(Fp * sin(th)) + ' = ' + F(n) + ' N', 'fₖ = μₖn = ' + F(mu * n) + ' N', 'Horizontal: a = [[F cos θ − fₖ|m]] = [[' + F(Fp * cos(th)) + ' − ' + F(mu * n) + '|' + m + ']] = **' + F(a) + ' m/s²**'] };
  });

  CQ.gen('p.atw', (R) => {
    const m1 = R.pick([2, 3, 4, 5]), m2 = m1 + R.pick([1, 2, 3]);
    const a = ((m2 - m1) * g) / (m1 + m2), Tt = (2 * m1 * m2 * g) / (m1 + m2);
    const want = R.pick(['a', 'T']);
    return { t: 'num', lvl: want === 'T' ? 4 : 3, q: 'An Atwood machine holds **m₁ = ' + m1 + ' kg** and **m₂ = ' + m2 + ' kg** over a light, frictionless pulley. Find the ' + (want === 'a' ? '**acceleration** of the masses.' : '**tension** in the string.'), a: want === 'a' ? a : Tt, unit: want === 'a' ? 'm/s²' : 'N',
      fig: D.atwood(),
      hint: 'Write ΣF = ma for each mass (m₂ goes down, m₁ goes up), then add the equations to eliminate T.',
      steps: ['m₁: T − m₁g = m₁a', 'm₂: m₂g − T = m₂a', 'Add them: a = [[(m₂ − m₁)g|m₁ + m₂]] = ' + F(a) + ' m/s²', ...(want === 'a' ? ['a = **' + F(a) + ' m/s²**'] : ['T = m₁(g + a) = ' + m1 + '(9.8 + ' + F(a) + ') = **' + F(Tt) + ' N**'])] };
  });

  CQ.gen('p.tab', (R) => {
    const m1 = R.pick([2, 3, 4, 5, 8]), m2 = R.pick([1, 2, 3]), mu = R.pick([0, 0, 0.1, 0.2]);
    const a = ((m2 - mu * m1) * g) / (m1 + m2);
    if (a <= 0) return CQ.gens['p.tab'](R);
    const Tt = m2 * (g - a);
    const want = R.pick(['a', 'T']);
    return { t: 'num', lvl: 4, q: 'A **' + m1 + ' kg** block on a table is tied by a string over a pulley to a hanging **' + m2 + ' kg** block. ' + (mu ? 'The table has **μₖ = ' + mu + '**.' : 'The table is frictionless.') + ' Find the ' + (want === 'a' ? 'acceleration.' : 'tension in the string.'), a: want === 'a' ? a : Tt, unit: want === 'a' ? 'm/s²' : 'N',
      fig: D.tablePulley({ friction: !!mu }),
      steps: ['Table block: T ' + (mu ? '− μₖm₁g ' : '') + '= m₁a', 'Hanging block: m₂g − T = m₂a', 'Add: a = [[(m₂' + (mu ? ' − μₖm₁' : '') + ')g|m₁ + m₂]] = ' + F(a) + ' m/s²', ...(want === 'a' ? ['a = **' + F(a) + ' m/s²**'] : ['T = m₂(g − a) = **' + F(Tt) + ' N**'])] };
  });

  CQ.gen('p.circ.flat', (R) => {
    const Rr = R.pick([25, 40, 50, 80, 100, 150]), mu = R.pick([0.3, 0.5, 0.6, 0.7, 0.8]);
    const v = Math.sqrt(mu * g * Rr);
    return { t: 'num', q: 'What is the maximum speed a car can take a **flat** curve of radius **' + Rr + ' m** if **μₛ = ' + mu + '** between tires and road?', a: v, unit: 'm/s',
      hint: 'Static friction is the only horizontal force, so it has to supply mv²/R.',
      steps: ['Friction provides the centripetal force: μₛmg = mv²/R', 'v = √{μₛgR} = √{' + mu + ' × 9.8 × ' + Rr + '} = **' + F(v) + ' m/s**', 'The mass cancels, so trucks and bikes get the same limit.'] };
  });

  CQ.gen('p.circ.bank', (R) => {
    const Rr = R.pick([50, 80, 100, 150, 200]), v = R.pick([12, 15, 18, 20, 25]);
    const b = deg(Math.atan((v * v) / (g * Rr)));
    return { t: 'num', lvl: 4, q: 'A highway curve of radius **' + Rr + ' m** is banked so that a car at **' + v + ' m/s** needs **no friction**. What is the banking angle?', a: b, unit: '°', abs: 0.6,
      fig: D.banked({ deg: Math.max(10, Math.min(35, b)) }),
      steps: ['Vertical: n cos β = mg', 'Horizontal (toward center): n sin β = mv²/R', 'Divide: tan β = [[v²|gR]] = [[' + v * v + '|9.8 × ' + Rr + ']] = ' + F((v * v) / (g * Rr)), 'β = **' + F(b) + '°**'] };
  });

  CQ.gen('p.circ.loop', (R) => {
    const Rr = R.pick([5, 8, 10, 12, 20]), m = R.pick([50, 60, 70]);
    const want = R.pick(['vmin', 'n']);
    if (want === 'vmin') return { t: 'num', q: 'A roller-coaster car goes around a vertical loop of radius **' + Rr + ' m**. What is the **minimum speed** at the top for the car to stay on the track?', a: Math.sqrt(g * Rr), unit: 'm/s', steps: ['At the top, both n and mg point down (toward the center)', 'n + mg = mv²/R. Minimum speed is when n just reaches 0', 'v_min = √{gR} = √{9.8 × ' + Rr + '} = **' + F(Math.sqrt(g * Rr)) + ' m/s**'] };
    const v = Math.sqrt(g * Rr) * R.pick([1.3, 1.5, 1.8]);
    const n = m * (v * v / Rr - g);
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + m + ' kg** rider passes the **top** of a vertical loop of radius **' + Rr + ' m** at **' + F(v) + ' m/s**. What normal force does the seat exert on the rider?', a: n, unit: 'N',
      steps: ['At the top, toward the center = down: n + mg = mv²/R', 'n = m(v²/R − g) = ' + m + '(' + F((v * v) / Rr) + ' − 9.8)', 'n = **' + F(n) + ' N** (downward)'] };
  });

  CQ.gen('p.circ.vert', (R) => {
    const m = R.pick([0.2, 0.5, 1, 1.5]), L2 = R.pick([0.5, 0.8, 1, 1.2]), v = R.pick([3, 4, 5, 6]);
    const Tt = m * (g + (v * v) / L2);
    return { t: 'num', q: 'A **' + m + ' kg** ball swings on a **' + L2 + ' m** string in a vertical circle. At the **bottom** it moves at **' + v + ' m/s**. What is the string tension there?', a: Tt, unit: 'N',
      steps: ['At the bottom, the center is up: T − mg = mv²/R', 'T = m(g + v²/R) = ' + m + '(9.8 + ' + F((v * v) / L2) + ') = **' + F(Tt) + ' N**'], why: 'The tension is larger than the weight at the bottom, because it has to hold the ball up and also bend its path.' };
  });

  /* ================= Unit 4 ================= */
  const u4 = U('p4', 'Newton\'s Laws', { sub: 'Force, mass & interactions', ch: 'Ch 4' }, [
    L('p4l1', 'Forces & the First Law', {
      goal: 'Find a net force and explain what happens when it\'s zero.',
      key: 'A force is a push or pull: a vector, measured in newtons. Add all forces as vectors to get the net force ΣF. **First law:** if ΣF = 0, velocity stays constant, either at rest or moving in a straight line at constant speed. You don\'t need a force to keep something moving, only to change its velocity. That resistance to changes in velocity is called inertia.',
      formulas: ['ΣF = F₁ + F₂ + … (vector sum)', 'ΣF = 0 ⇔ v = constant'],
    }, [
      T('Forces change motion, not maintain it', `
A **force** is a push or a pull with a size (newtons, N) and a direction. Only the **net force**, the vector sum $Σvec{F}$, matters for motion.

**Newton's first law:** an object with zero net force keeps its velocity. A hockey puck on frictionless ice would slide forever.
>* Motion doesn't need a force. **Changes** in motion do. Everyday objects stop because friction is a force acting on them.
>! "The force of the throw" doesn't exist after the ball leaves your hand. In flight, only gravity (and air) push on it.`),
      MC('A puck slides across frictionless ice at constant velocity. What horizontal force keeps it moving?', ['None: no net force is needed', 'A forward force equal to its weight', 'A small forward force left over from the push', 'Its momentum force'], 'Constant velocity means ΣF = 0. Once released, nothing horizontal pushes it.'),
      TF('An object moving at constant velocity has zero net force on it.', true, 'That\'s the first law: ΣF = 0 ⇔ constant velocity.'),
      MC('After you throw a ball straight up and it leaves your hand, which forces act on it (ignore air)?', ['Only gravity', ['Gravity and the upward force of the throw', 'The throw only acts while your hand touches the ball. In flight, only gravity acts.'], 'Only the upward force of the throw', 'No forces at the top'], 'Only gravity, which is why its acceleration is g downward the entire flight.', { lvl: 2 }),
      G('p.netforce'),
      FILL('Newton\'s first law says that if the net force on an object is ___, its ___ stays constant.', ['zero', 'velocity'], ['large', 'acceleration', 'mass'], 'ΣF = 0 means no change in velocity (speed and direction).'),
      G('p.netforce'),
    ]),
    L('p4l2', 'ΣF = ma', {
      goal: 'Use Newton\'s second law, in components, to connect forces and acceleration.',
      key: '**Second law:** $ΣF = ma$. The net force sets the acceleration, in the same direction. Apply it per axis: $ΣFₓ = maₓ$ and $ΣFᵧ = maᵧ$. 1 N = 1 kg·m/s². Bigger force → bigger a. Bigger mass → smaller a. Once you have a, kinematics gives the motion.',
      formulas: ['Σvec{F} = m vec{a}', 'ΣFₓ = maₓ   ·   ΣFᵧ = maᵧ'],
    }, [
      T('The most important equation in the course', `
$$ Σvec{F} = m vec{a} $$
The **net** force on an object equals its mass times its acceleration, and points the same way as a.
In practice you use it **one axis at a time**:
$$ ΣFₓ = maₓ   ·   ΣFᵧ = maᵧ $$
>* ΣF = ma is the bridge between forces and kinematics. Forces give you a, and a gives you the motion through the Big Four.`),
      EX('From force to motion', 'A 1200 kg car\'s engine provides a net 3600 N forward force. Starting from rest, how fast is it going after 5.0 s?', ['a = ΣF/m = 3600/1200 = 3.0 m/s²', 'v = v₀ + at = 0 + 3.0(5.0) = **15 m/s**']),
      MC('You double the net force on a cart **and** halve its mass. Its acceleration becomes…', ['4 times as large', '2 times as large', 'the same', 'half as large'], 'a = F/m → (2F)/(m/2) = 4F/m.', { lvl: 2 }),
      G('p.n2'),
      G('p.n2'),
      TF('The acceleration of an object always points in the direction of the net force.', true, 'ΣF = ma: a vector equation, so the directions match.'),
      G('p.n2.2d'),
      G('p.n2.kin'),
    ]),
    L('p4l3', 'Mass, Weight & Normal Force', {
      goal: 'Tell mass from weight and find the normal force in tricky situations.',
      key: 'Mass (kg) measures inertia and is the same everywhere. Weight $w = mg$ is the gravitational force in newtons, and it depends on g. The **normal force** n is the surface pushing back perpendicular to itself. It is NOT always mg: an extra downward push increases it, an upward pull reduces it, and on a slope $n = mg cos θ$. In an elevator, a scale reads $n = m(g + a)$, with a positive when the acceleration points up.',
      formulas: ['w = mg', 'elevator: n = m(g + a), a up = +', 'push down with F: n = mg + F'],
    }, [
      T('Mass vs weight', `
**Mass** m (kg) is how much stuff, and how hard it is to accelerate. It's the same on the Moon.
**Weight** $w = mg$ (N) is the force of gravity on that stuff. On the Moon, g = 1.62 m/s², so you weigh about ⅙ as much.`),
      T('The normal force adjusts itself', `
A surface pushes **perpendicular** to itself with whatever force stops you from sinking in. That's the **normal force** n.
- Book on a table: n = mg
- You push down on the book with F: n = mg + F
- You pull up on it with F: n = mg − F
- Elevator accelerating **up** at a: n = m(g + a), so you feel heavier
>! n = mg is a special case, not a rule. Always find n from ΣFᵧ = maᵧ.`),
      EX('Bathroom scale in an elevator', 'A 60 kg person rides an elevator accelerating upward at 2.0 m/s². What does the scale read?', ['Up is +. Forces: n up, mg down.', 'ΣFᵧ = n − mg = ma', 'n = m(g + a) = 60(9.8 + 2.0) = **708 N** (about 72 kg "worth")']),
      G('p.weight'),
      MC('You press down on a book resting on a table with force F. The normal force from the table is…', ['mg + F', 'mg', 'mg − F', 'F'], 'The table has to hold up the book\'s weight and your push.'),
      TF('The normal force on an object always equals its weight.', false, 'Elevators, inclines and extra pushes or pulls all change n.'),
      G('p.elev'),
      MC('An elevator moves **downward** and is **slowing down**. Compared with your weight, the scale reads…', ['more', ['less', 'Slowing down while going down means the acceleration points up, so the scale reads more.'], 'the same', 'zero'], 'Slowing a downward motion requires upward acceleration, so n > mg.', { lvl: 2 }),
      G('p.elev'),
    ]),
    L('p4l4', 'Third-Law Pairs', {
      goal: 'Identify action–reaction pairs and avoid the classic third-law traps.',
      key: '**Third law:** if A pushes on B, then B pushes on A with an equal and opposite force. The two forces act on **different** objects and are the same type (contact–contact, gravity–gravity). That\'s why they never cancel. Weight and the normal force on a book are **not** a third-law pair: both act on the book. In a collision, the forces on the two objects are equal, but their accelerations differ because a = F/m.',
      formulas: ['vec{F}_{A on B} = −vec{F}_{B on A}'],
    }, [
      T('Forces come in pairs', `
$$ vec{F}_{A on B} = −vec{F}_{B on A} $$
Every force is an **interaction** between two objects. The two partners in a pair:
- are equal in size and opposite in direction
- act on **different** objects
- are the same kind of force
>! A book on a table: its weight (Earth pulls the book) and the normal force (table pushes the book) are equal and opposite, but both act on the **book**. They are NOT a third-law pair. The partner of the weight is the book pulling up on Earth.`),
      MC('Earth pulls an apple down with force mg. What is the third-law partner of that force?', ['The apple pulls Earth up with force mg', ['The ground pushes the apple up with mg', 'That acts on the apple too. Third-law partners act on different objects.'], 'The apple\'s inertia', 'There is none while the apple is falling'], 'Swap the objects: "Earth on apple" becomes "apple on Earth".'),
      MC('A truck collides head-on with a small car. During the crash, the force of the truck on the car is…', ['equal in size to the force of the car on the truck', 'larger than the force of the car on the truck', 'smaller than the force of the car on the truck', 'zero, since the truck keeps moving'], 'Third law: equal and opposite. The car gets the larger acceleration because its mass is smaller.'),
      TF('Weight and the normal force on a book at rest on a table form a third-law pair.', false, 'Both act on the book. They are equal here because of the first law, not the third.'),
      MATCH('Match each force to its third-law partner.', [['Earth pulls you down', 'You pull Earth up'], ['Floor pushes your foot forward', 'Foot pushes floor backward'], ['Rope pulls the box', 'Box pulls the rope'], ['Table pushes the book up', 'Book pushes the table down']]),
      G('p.push2'),
      MC('If action and reaction are equal and opposite, why can a horse pull a cart forward?', ['The two forces act on different objects, so they can\'t cancel each other', 'The horse pulls slightly harder than the cart pulls back', 'The reaction force arrives a moment later', 'Friction cancels the reaction force'], 'The cart moves because of the forces on the **cart**. The horse moves forward because the ground pushes it forward.', { lvl: 2 }),
    ]),
    L('p4l5', 'Free-Body Diagrams', {
      goal: 'Draw a correct free-body diagram and turn it into equations.',
      key: 'Free-body diagram (FBD) recipe: isolate one object, draw only the forces acting ON it (weight, normal, tension, friction, applied pushes), each starting from the object. Never draw "ma" as a force, and never draw forces the object exerts on other things. Choose axes, with one along the acceleration if you can, then write ΣFₓ = maₓ and ΣFᵧ = maᵧ.',
      formulas: ['FBD → ΣFₓ = maₓ, ΣFᵧ = maᵧ'],
    }, [
      T('The FBD is the problem', `
Most force-problem mistakes are FBD mistakes. The recipe:
1. Draw the object alone, as a box or dot
2. Draw every force **acting on it**: weight (always), normal (if touching a surface), tension (if a rope is attached), friction (if surfaces rub), any push or pull
3. Choose axes, with one along the acceleration if you can
4. Write ΣFₓ = maₓ and ΣFᵧ = maᵧ
>! **ma is not a force.** Don't draw it. And "the force of motion" doesn't exist either.`, { fig: D.fbd({ surface: true, forces: [{ a: -90, len: 70, label: 'mg', cls: 'c1' }, { a: 90, len: 70, label: 'n', cls: 'c2' }, { a: 0, len: 80, label: 'T', cls: 'c4' }, { a: 180, len: 50, label: 'f', cls: 'c3' }] }) }),
      ORDER('Put the free-body-diagram steps in order.', ['Isolate the object', 'Draw its weight', 'Add contact forces: normal, friction, tension, pushes', 'Choose axes along and perpendicular to the acceleration', 'Write ΣF = ma for each axis']),
      MULTI('A box is pulled across a rough floor by a horizontal rope. Which forces belong on its FBD?', [['Weight', 1], ['Normal force', 1], ['Tension', 1], ['Kinetic friction', 1], ['"Force of motion"', 0], ['ma', 0]], 'Weight, normal, tension and friction. "ma" is the result of the forces, not one of them.'),
      MC('A lamp hangs at rest from a single cord. Its FBD has…', ['tension up and weight down, equal in size', 'only weight', 'tension up, weight down and a normal force', 'tension up larger than the weight'], 'At rest: ΣF = 0, so T = mg.'),
      TF('A free-body diagram for a block should include the force the block exerts on the floor.', false, 'Only forces acting **on** the block. The block\'s push on the floor belongs on the floor\'s FBD.'),
      G('p.n2.2d'),
      G('p.elev'),
    ]),
  ]);

  /* ================= Unit 5 ================= */
  const u5 = U('p5', 'Applying Newton\'s Laws', { sub: 'Inclines, friction, pulleys & curves', ch: 'Ch 5' }, [
    L('p5l1', 'Equilibrium & Tension', {
      goal: 'Solve static equilibrium problems with ropes at angles.',
      key: 'Equilibrium means ΣFₓ = 0 and ΣFᵧ = 0 (a = 0). An ideal rope carries the same tension T all along its length and can only pull. For a weight hung symmetrically from two ropes at angle θ above horizontal: $2T sin θ = mg$, so shallow ropes need a huge tension. With unequal angles, write both component equations at the knot and solve them together.',
      formulas: ['ΣFₓ = 0, ΣFᵧ = 0', 'symmetric: T = [[mg|2 sin θ]]'],
    }, [
      T('Balance in every direction', `
An object in **equilibrium** (at rest or at constant velocity) has a = 0, so
$$ ΣFₓ = 0   ·   ΣFᵧ = 0 $$
Ropes pull **along themselves**. Break each tension into components at the knot.
>* For a symmetric two-rope hang at angle θ above horizontal: $T = mg / (2 sin θ)$. As θ → 0 the tension blows up, which is why a clothesline can never be pulled perfectly straight.`, { fig: D.ropes({ a1: 30, a2: 30 }) }),
      EX('Hanging a sign', 'A 10 kg sign hangs from two ropes, each at 30° above horizontal. Find the tension.', ['Vertical: 2T sin 30° = mg', 'T = (10)(9.8)/(2 × 0.5) = **98 N**', 'Interesting: each rope carries the sign\'s full weight, because only half of each tension points up.']),
      MC('Why can\'t a rope holding a hanging weight ever be perfectly horizontal?', ['A horizontal rope has no vertical component to balance the weight', 'Ropes can\'t carry horizontal forces', 'The tension would be zero', 'Gravity pulls ropes into a curve'], 'You need an upward component, which requires some angle. As the angle → 0, T → ∞.'),
      G('p.eq.sym'),
      G('p.eq.side'),
      TF('In an ideal massless rope, the tension is the same everywhere along it.', true, 'A massless rope passes the tension along unchanged, even over a frictionless pulley.'),
      G('p.eq.sym'),
      G('p.eq.asym'),
    ]),
    L('p5l2', 'Inclined Planes', {
      goal: 'Tilt your axes and solve any frictionless incline.',
      key: 'Put x along the slope and y perpendicular to it. Then gravity splits into $mg sin θ$ (down the slope) and $mg cos θ$ (into the slope). Normal force: $n = mg cos θ$. Frictionless slide: $a = g sin θ$, whatever the mass. Check the limits: θ = 0 gives a = 0, and θ = 90° gives free fall.',
      formulas: ['along slope: mg sin θ', 'into slope: mg cos θ', 'n = mg cos θ', 'frictionless: a = g sin θ'],
    }, [
      T('Tilt the axes, not the problem', `
On a ramp, choose **x along the slope** and **y perpendicular** to it. Then n and the motion each sit on a single axis, and only gravity needs to be split:
$$ mg sin θ :: along the slope (downhill) $$
$$ mg cos θ :: into the slope $$
So $n = mg cos θ$, and a frictionless block slides with $a = g sin θ$.
>* Check the limits. At θ = 0, sin = 0 and nothing slides. At θ = 90°, a = g, which is free fall. If your formula fails these checks, sin and cos got swapped.`, { fig: D.incline({ deg: 30, comps: true }) }),
      EX('Sliding down', 'A 5.0 kg box slides down a frictionless 25° ramp. Find a and n.', ['Along slope: a = g sin 25° = 9.8 × 0.423 = **4.14 m/s²**', 'Perpendicular: n = mg cos 25° = 5.0 × 9.8 × 0.906 = **44.4 N**']),
      MC('Which component of the weight points **along** an incline of angle θ?', ['mg sin θ', ['mg cos θ', 'Check θ = 0: cos 0 = 1 would mean a full-weight push along a flat floor. Not possible.'], 'mg tan θ', 'mg'], 'At θ = 0 the along-slope part has to vanish, and sin 0 = 0.'),
      G('p.incl.a'),
      G('p.incl.n'),
      TF('On a frictionless incline, a heavier block slides down with a larger acceleration.', false, 'a = g sin θ, so mass cancels.'),
      G('p.incl.push'),
      G('p.incl.slide'),
    ]),
    L('p5l3', 'Friction', {
      goal: 'Handle static vs kinetic friction, including on slopes.',
      key: 'Kinetic friction (sliding): $fₖ = μₖn$, pointing opposite the sliding. Static friction (not sliding): $fₛ ≤ μₛn$. It is only as large as needed to prevent slipping, up to that maximum. Usually μₖ < μₛ, which is why things are harder to start than to keep going. Always compute n first, since it isn\'t always mg. On a slope: about to slip when $tan θ = μₛ$, and sliding down gives $a = g(sin θ − μₖ cos θ)$.',
      formulas: ['fₖ = μₖn', 'fₛ ≤ μₛn', 'slip angle: tan θ = μₛ', 'down slope: a = g(sin θ − μₖ cos θ)'],
    }, [
      T('Two kinds of friction', `
**Kinetic** (surfaces sliding past each other): $fₖ = μₖ n$, opposite the motion.
**Static** (surfaces stuck together): $fₛ ≤ μₛ n$. It matches whatever force is trying to slide the object, up to that maximum.
>! If a crate sits still while you push with 50 N, static friction is exactly 50 N, **not** μₛn. The formula μₛn only gives the breaking point.
>* Friction depends on **n**, not directly on the weight. Find n from the FBD first.`),
      EX('Pushing a crate', 'You push a 20 kg crate with 100 N horizontally. μₛ = 0.50, μₖ = 0.40. Does it move? If so, what is a?', ['n = mg = 196 N', 'fₛ,max = 0.50 × 196 = 98 N < 100 N → it slides', 'fₖ = 0.40 × 196 = 78.4 N', 'a = (100 − 78.4)/20 = **1.08 m/s²**']),
      G('p.fric.static'),
      MC('Why does it take more force to start a heavy box moving than to keep it moving?', ['μₛ is usually greater than μₖ', 'The box gains mass when it\'s at rest', 'Kinetic friction increases with speed', 'Normal force drops once it moves'], 'Static friction can reach a higher maximum than kinetic friction.'),
      G('p.fric.a'),
      G('p.fric.angle'),
      TF('Static friction always equals μₛn.', false, 'It\'s only as large as needed, up to μₛn.'),
      G('p.fric.incl'),
      G('p.fric.pull'),
    ]),
    L('p5l4', 'Connected Objects', {
      goal: 'Solve pulley and multi-block systems (Atwood, table + hanging mass).',
      key: 'Draw an FBD for each object. Choose each object\'s positive direction so that they all move "together" (if one goes down, the other goes right or up). Objects joined by a taut string share the same size of acceleration. Write ΣF = ma for each, then add the equations to cancel T. Atwood: $a = (m₂ − m₁)g/(m₁ + m₂)$, $T = 2m₁m₂g/(m₁ + m₂)$. Table + hanging mass: $a = (m₂ − μₖm₁)g/(m₁ + m₂)$.',
      formulas: ['Atwood: a = [[(m₂ − m₁)g|m₁ + m₂]]', 'Atwood: T = [[2m₁m₂g|m₁ + m₂]]', 'table: a = [[(m₂ − μₖm₁)g|m₁ + m₂]]'],
    }, [
      T('One string, one acceleration', `
When objects are tied by a taut string, they move with the **same size of acceleration**. Strategy:
1. Draw a separate FBD for each object
2. Pick each object's + direction so that they all move "together"
3. Write ΣF = ma for each object
4. **Add** the equations, and the internal tensions cancel
$$ a = [[(m₂ − m₁)g|m₁ + m₂]] :: Atwood machine: driving force over total mass $$
>* Think of it as "net driving force ÷ total mass". It works for any string-connected system.`, { fig: D.atwood() }),
      EX('Table and hanging block', 'A 4.0 kg block on a frictionless table is tied over a pulley to a hanging 1.0 kg block. Find a and T.', ['Table block (+ toward pulley): T = 4.0a', 'Hanging block (+ down): 1.0(9.8) − T = 1.0a', 'Add: 9.8 = 5.0a → a = **1.96 m/s²**', 'T = 4.0 × 1.96 = **7.84 N**. Less than the hanging weight (9.8 N), as it has to be.']),
      MC('In an Atwood machine with m₂ > m₁, how does the string tension T compare with the weights?', ['m₁g < T < m₂g', 'T = m₂g', 'T = m₁g', 'T > m₂g'], 'T must exceed m₁g to lift m₁ and be less than m₂g to let m₂ fall.'),
      G('p.atw'),
      G('p.tab'),
      TF('In an Atwood machine, the hanging masses accelerate at g.', false, 'Less than g. Only the difference in weight drives the total mass.'),
      G('p.atw'),
      G('p.tab'),
    ]),
    L('p5l5', 'Circular Dynamics', {
      goal: 'Find the force that makes something move in a circle: friction, banking, loops, strings.',
      key: 'Circular motion needs a net inward force: $ΣF_{toward center} = mv²/R$. That is a requirement, not a new force. Something real has to supply it: friction, tension, gravity, a normal force, or a combination. Flat curve: $v_{max} = √{μₛgR}$. Frictionless banked curve: $tan β = v²/gR$. Top of a loop: $n + mg = mv²/R$, so the minimum speed is $√{gR}$. Bottom of a vertical swing: $T = m(g + v²/R)$. There is no outward "centrifugal force" in an inertial frame.',
      formulas: ['ΣF_{in} = [[mv²|R]]', 'flat: v_{max} = √{μₛgR}', 'banked: tan β = [[v²|gR]]', 'loop top: v_{min} = √{gR}'],
    }, [
      T('Who supplies the inward force?', `
To move in a circle, the net force must point to the **center** with size
$$ ΣF_{in} = [[mv²|R]] $$
This isn't an extra force to draw. Ask which real force does the job:
| Situation | Supplies mv²/R |
|---|---|
| car on flat curve | static friction |
| ball on string | tension |
| satellite | gravity |
| loop-the-loop top | normal + gravity |
>! There is no outward "centrifugal force" on your FBD. You feel thrown outward because your body tends to keep going straight (first law).`),
      EX('Top of a loop', 'A coaster car moves through the top of a 10 m radius loop. What is the slowest speed that keeps it on the track?', ['At the top, n and mg both point down, toward the center', 'n + mg = mv²/R', 'Slowest when n → 0: mg = mv²/R', 'v = √(gR) = √(98) = **9.9 m/s**']),
      MC('A car rounds a flat, unbanked curve at constant speed. What force provides the centripetal force?', ['Static friction from the road', 'The normal force', 'Centrifugal force', 'The engine\'s forward force'], 'Tires grip without sliding sideways, so the friction is static.'),
      G('p.circ.flat'),
      G('p.circ.vert'),
      TF('Centrifugal force should be drawn pointing outward on a free-body diagram for circular motion.', false, 'In an inertial frame, only real forces go on the FBD. Their net points inward.'),
      G('p.circ.loop'),
      G('p.circ.bank'),
    ]),
  ]);

  CQ.addUnits('phys', [u4, u5]);
})();
