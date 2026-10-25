/* PHYS 2325 · Units 6–8: work & energy, potential energy, momentum (Young & Freedman Ch 6–8) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const g = 9.8;
  const D = CQ.dg;
  const deg = (r) => (r * 180) / Math.PI;
  const rad = (d) => (d * Math.PI) / 180;
  const sin = (d) => Math.sin(rad(d)), cos = (d) => Math.cos(rad(d));

  /* ================= generators: Unit 6 ================= */
  CQ.gen('p.work.const', (R) => {
    const Fp = R.pick([20, 30, 40, 50, 80]), d = R.pick([3, 5, 8, 10, 12, 15]), phi = R.pick([0, 20, 30, 37, 45, 60]);
    const W = Fp * d * cos(phi);
    return { t: 'num', q: 'You push a lawn mower **' + d + ' m** with a **' + Fp + ' N** force directed **' + phi + '°** below the horizontal. How much work does your push do?', a: W, unit: 'J',
      steps: ['W = Fd cos φ, where φ is the angle between the force and the displacement', 'W = ' + Fp + ' × ' + d + ' × cos ' + phi + '° = **' + F(W) + ' J**'],
      why: 'Only the component of force along the motion does work. The downward part of your push does none.' };
  });

  CQ.gen('p.work.signs', (R) => {
    const m = R.pick([2, 5, 10, 15]), h = R.pick([1.5, 2, 3, 4]), up = R.chance(0.5);
    const W = (up ? -1 : 1) * m * g * h;
    return { t: 'num', q: 'A **' + m + ' kg** box is ' + (up ? 'lifted' : 'lowered') + ' **' + h + ' m** at constant speed. How much work does **gravity** do on it?', a: W, unit: 'J',
      steps: ['Gravity (mg = ' + F(m * g) + ' N) points down', up ? 'Displacement is up → φ = 180° → W = −mgh' : 'Displacement is down → φ = 0° → W = +mgh', 'W_grav = **' + F(W) + ' J**'],
      why: 'Work is negative when the force opposes the displacement.' };
  });

  CQ.gen('p.wet.speed', (R) => {
    const m = R.pick([2, 4, 5, 10]), Fp = R.pick([10, 20, 25, 40]), d = R.pick([2, 4, 5, 8]), v0 = R.pick([0, 0, 2, 3]);
    const v = Math.sqrt(v0 * v0 + (2 * Fp * d) / m);
    return { t: 'num', q: 'A constant net force of **' + Fp + ' N** pushes a **' + m + ' kg** cart **' + d + ' m**' + (v0 ? ', starting at **' + v0 + ' m/s**' : ' from rest') + '. What is its final speed?', a: v, unit: 'm/s',
      hint: 'W_net = ΔK. Find the work, then solve for v.',
      steps: ['W_net = Fd = ' + Fp * d + ' J', 'W_net = ½mv² − ½mv₀² → ' + Fp * d + ' = ½(' + m + ')v² − ' + F(0.5 * m * v0 * v0), 'v = **' + F(v) + ' m/s**'] };
  });

  CQ.gen('p.wet.stop', (R) => {
    const v = R.pick([10, 15, 20, 25, 30]), mu = R.pick([0.4, 0.5, 0.6, 0.7, 0.8]);
    const d = (v * v) / (2 * mu * g);
    return { t: 'num', q: 'A car moving at **' + v + ' m/s** locks its brakes and skids to a stop. If **μₖ = ' + mu + '**, how far does it skid?', a: d, unit: 'm',
      steps: ['Only friction does work: −μₖmg·d = 0 − ½mv²', 'd = [[v²|2μₖg]] = [[' + v * v + '|2(' + mu + ')(9.8)]] = **' + F(d) + ' m**', 'Mass cancels. Doubling the speed quadruples the skid.'] };
  });

  CQ.gen('p.spring.k', (R) => {
    const k = R.pick([50, 100, 200, 250, 400, 500, 800]), x = R.pick([0.02, 0.05, 0.1, 0.15, 0.2, 0.25]);
    const kind = R.int(0, 2);
    if (kind === 0) return { t: 'num', q: 'A spring stretches **' + x * 100 + ' cm** when you pull it with **' + F(k * x) + ' N**. What is its spring constant?', a: k, unit: 'N/m', steps: ['Hooke\'s law: F = kx', 'k = F/x = ' + F(k * x) + '/' + x + ' = **' + F(k) + ' N/m**'], hint: 'Convert cm to m first.' };
    if (kind === 1) return { t: 'num', q: 'How much work does it take to stretch a **k = ' + k + ' N/m** spring by **' + x * 100 + ' cm** from its relaxed length?', a: 0.5 * k * x * x, unit: 'J', steps: ['The force grows as you stretch, so W = ∫kx dx = ½kx²', 'W = ½(' + k + ')(' + x + ')² = **' + F(0.5 * k * x * x) + ' J**'] };
    const x2 = x * 2;
    return { t: 'num', lvl: 4, q: 'A **k = ' + k + ' N/m** spring is already stretched **' + x * 100 + ' cm**. How much **more** work stretches it to **' + x2 * 100 + ' cm**?', a: 0.5 * k * (x2 * x2 - x * x), unit: 'J', steps: ['W = ½k(x₂² − x₁²)', '= ½(' + k + ')(' + x2 + '² − ' + x + '²) = **' + F(0.5 * k * (x2 * x2 - x * x)) + ' J**', 'Three times the work of the first ' + x * 100 + ' cm, even though it\'s the same extra distance.'] };
  });

  CQ.gen('p.work.var', (R) => {
    const a = R.pick([2, 3, 4, 5, 6]), x1 = 0, x2 = R.pick([1, 2, 3]);
    const W = (a * x2 * x2 * x2) / 3;
    return { t: 'num', lvl: 4, q: 'A force **Fₓ = ' + a + 'x²** (N, x in m) acts on a particle as it moves from x = 0 to x = ' + x2 + ' m. How much work does the force do?', a: W, unit: 'J',
      steps: ['The force varies, so W = ∫F dx', 'W = ∫₀^{' + x2 + '} ' + a + 'x² dx = [[' + a + 'x³|3]] from 0 to ' + x2, 'W = ' + a + '(' + x2 ** 3 + ')/3 = **' + F(W) + ' J**'] };
  });

  CQ.gen('p.power', (R) => {
    const k = R.int(0, 2);
    if (k === 0) {
      const m = R.pick([50, 60, 70, 80]), h = R.pick([3, 4, 5, 6, 10]), t = R.pick([4, 5, 6, 8, 10]);
      return { t: 'num', q: 'A **' + m + ' kg** student runs up stairs that rise **' + h + ' m** in **' + t + ' s**. What average power does she produce against gravity?', a: (m * g * h) / t, unit: 'W', steps: ['W = mgh = ' + m + '(9.8)(' + h + ') = ' + F(m * g * h) + ' J', 'P = W/t = **' + F((m * g * h) / t) + ' W**'] };
    }
    if (k === 1) {
      const Fd = R.pick([300, 500, 800, 1200]), v = R.pick([10, 15, 20, 25, 30]);
      return { t: 'num', q: 'A car moves at a constant **' + v + ' m/s** against a total drag force of **' + Fd + ' N**. What power must the engine deliver?', a: Fd * v, unit: 'W', steps: ['Constant speed → engine force = drag = ' + Fd + ' N', 'P = Fv = ' + Fd + ' × ' + v + ' = **' + F(Fd * v) + ' W** (' + F((Fd * v) / 746) + ' hp)'] };
    }
    const m = R.pick([500, 800, 1000, 1200]), v = R.pick([0.5, 1, 1.5, 2]);
    return { t: 'num', q: 'An elevator motor lifts a **' + m + ' kg** car at a constant **' + v + ' m/s**. What power does it supply (in kW)?', a: (m * g * v) / 1000, unit: 'kW', steps: ['Constant speed → tension = mg = ' + F(m * g) + ' N', 'P = Fv = ' + F(m * g) + ' × ' + v + ' = ' + F(m * g * v) + ' W = **' + F((m * g * v) / 1000) + ' kW**'] };
  });

  /* ================= generators: Unit 7 ================= */
  CQ.gen('p.cons.drop', (R) => {
    const h1 = R.pick([5, 10, 15, 20, 30]), h2 = R.pick([0, 0, 2, 4]), v1 = R.pick([0, 0, 3, 5]);
    const v = Math.sqrt(v1 * v1 + 2 * g * (h1 - h2));
    return { t: 'num', q: 'A skateboarder ' + (v1 ? 'moving at **' + v1 + ' m/s**' : 'starting from rest') + ' at a height of **' + h1 + ' m** rolls down a frictionless ramp. How fast is she going at a height of **' + h2 + ' m**?', a: v, unit: 'm/s',
      fig: D.bars({ items: [['K₁', 0.5 * v1 * v1 + 0.01, 'c2'], ['U₁', g * h1, 'c4'], ['K₂', 0.5 * v * v, 'c2'], ['U₂', g * h2 + 0.01, 'c4']], alt: 'Energy bar chart: kinetic and potential energy before and after' }),
      hint: 'K₁ + U₁ = K₂ + U₂. The mass cancels.',
      steps: ['½mv₁² + mgh₁ = ½mv₂² + mgh₂ (mass cancels)', 'v₂² = v₁² + 2g(h₁ − h₂) = ' + v1 * v1 + ' + 2(9.8)(' + (h1 - h2) + ')', 'v₂ = **' + F(v) + ' m/s**'],
      why: 'The shape of the ramp doesn\'t matter. Only the change in height does.' };
  });

  CQ.gen('p.cons.pend', (R) => {
    const L2 = R.pick([0.5, 1, 1.5, 2, 3]), th = R.pick([20, 30, 40, 45, 60]);
    const v = Math.sqrt(2 * g * L2 * (1 - cos(th)));
    return { t: 'num', q: 'A pendulum of length **' + L2 + ' m** is released from rest at **' + th + '°** from vertical. How fast is the bob moving at the bottom?', a: v, unit: 'm/s',
      fig: D.pendulum({ deg: th }), hint: 'Find how much height the bob drops: h = L(1 − cos θ).',
      steps: ['Height drop: h = L(1 − cos θ) = ' + L2 + '(1 − cos ' + th + '°) = ' + F(L2 * (1 - cos(th))) + ' m', 'mgh = ½mv² → v = √{2gh}', 'v = **' + F(v) + ' m/s**'],
      why: 'Tension does no work because it is always perpendicular to the motion.' };
  });

  CQ.gen('p.spring.launch', (R) => {
    const k = R.pick([200, 400, 500, 800, 1000]), x = R.pick([0.05, 0.1, 0.15, 0.2]), m = R.pick([0.05, 0.1, 0.2, 0.5]);
    const want = R.pick(['v', 'h']);
    const E = 0.5 * k * x * x;
    if (want === 'v') return { t: 'num', q: 'A spring (**k = ' + k + ' N/m**) is compressed **' + x * 100 + ' cm** and launches a **' + m * 1000 + ' g** ball horizontally on a frictionless surface. What is the ball\'s launch speed?', a: Math.sqrt((2 * E) / m), unit: 'm/s',
      steps: ['½kx² = ½mv²', 'v = x √{k/m} = ' + x + ' √{' + k + '/' + m + '}', 'v = **' + F(Math.sqrt((2 * E) / m)) + ' m/s**'] };
    return { t: 'num', lvl: 4, q: 'A toy gun\'s spring (**k = ' + k + ' N/m**) is compressed **' + x * 100 + ' cm** and fires a **' + m * 1000 + ' g** dart straight up. How high above its launch point does the dart rise?', a: E / (m * g), unit: 'm',
      steps: ['Spring PE → gravitational PE: ½kx² = mgh', 'h = [[kx²|2mg]] = [[' + k + '(' + x + ')²|2(' + m + ')(9.8)]] = **' + F(E / (m * g)) + ' m**'] };
  });

  CQ.gen('p.spring.compress', (R) => {
    const m = R.pick([0.5, 1, 2, 5]), v = R.pick([1, 2, 3, 4]), k = R.pick([100, 200, 500, 800, 1000]);
    const x = v * Math.sqrt(m / k);
    return { t: 'num', q: 'A **' + m + ' kg** block slides at **' + v + ' m/s** on frictionless ice into a spring with **k = ' + k + ' N/m**. What is the spring\'s maximum compression?', a: x, unit: 'm',
      fig: D.spring({ x: 130 }), steps: ['At max compression the block momentarily stops: ½mv² = ½kx²', 'x = v √{m/k} = ' + v + ' √{' + m + '/' + k + '} = **' + F(x) + ' m**'] };
  });

  CQ.gen('p.wother', (R) => {
    const m = R.pick([2, 5, 10, 20]), h = R.pick([3, 5, 8, 10]), frac = R.pick([0.6, 0.7, 0.8]);
    const vIdeal = Math.sqrt(2 * g * h), v = vIdeal * frac;
    const Wf = 0.5 * m * v * v - m * g * h;
    return { t: 'num', lvl: 4, q: 'A **' + m + ' kg** crate starts from rest and slides down a rough ramp whose top is **' + h + ' m** above the bottom. It reaches the bottom at **' + F(v) + ' m/s**. How much work did friction do?', a: Wf, unit: 'J',
      hint: 'K₁ + U₁ + W_other = K₂ + U₂',
      steps: ['0 + mgh + W_f = ½mv² + 0', 'W_f = ½mv² − mgh = ' + F(0.5 * m * v * v) + ' − ' + F(m * g * h), 'W_f = **' + F(Wf) + ' J** (negative: friction removes mechanical energy)'] };
  });

  CQ.gen('p.wother.mu', (R) => {
    const m = R.pick([1, 2, 5]), h = R.pick([2, 3, 5]), mu = R.pick([0.1, 0.2, 0.25, 0.3]);
    const d = h / mu;
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + m + ' kg** block slides from rest down a **frictionless** curved ramp of height **' + h + ' m**, then onto a rough flat floor with **μₖ = ' + mu + '**. How far along the floor does it slide before stopping?', a: d, unit: 'm',
      steps: ['Top to stop: mgh + W_f = 0 (starts and ends at rest)', 'W_f = −μₖmg·d', 'mgh = μₖmg·d → d = h/μₖ = ' + h + '/' + mu + ' = **' + F(d) + ' m**'] };
  });

  CQ.gen('p.Ux', (R) => {
    const a = R.pick([1, 2, 3, 4]), b = R.pick([2, 3, 5, 6]), x = R.pick([1, 2, 3]);
    const Fx = -(3 * a * x * x - b);
    return { t: 'num', lvl: 4, q: 'A particle moves in a potential energy **U(x) = ' + a + 'x³ − ' + b + 'x** (U in J, x in m). What is the force on it at x = ' + x + ' m?', a: Fx, unit: 'N', abs: 0.01,
      steps: ['Fₓ = −dU/dx', 'dU/dx = ' + 3 * a + 'x² − ' + b, 'Fₓ(' + x + ') = −(' + 3 * a + '(' + x * x + ') − ' + b + ') = **' + F(Fx) + ' N**'] };
  });

  /* ================= generators: Unit 8 ================= */
  CQ.gen('p.impulse', (R) => {
    const m = R.pick([0.15, 0.2, 0.4, 0.5]), v1 = R.pick([10, 15, 20, 25]), v2 = R.pick([5, 10, 15, 20]), dt = R.pick([0.002, 0.005, 0.01, 0.02]);
    const dp = m * (v2 + v1);
    const want = R.pick(['J', 'F']);
    return { t: 'num', lvl: want === 'F' ? 4 : 3, q: 'A **' + m * 1000 + ' g** ball hits a wall at **' + v1 + ' m/s** and bounces straight back at **' + v2 + ' m/s**. ' + (want === 'J' ? 'What is the magnitude of the impulse from the wall?' : 'If the contact lasts **' + dt * 1000 + ' ms**, what average force does the wall exert?'), a: want === 'J' ? dp : dp / dt, unit: want === 'J' ? 'N·s' : 'N',
      hint: 'Velocity reverses, so choose a sign convention. Δp = m(v_f − v_i), with one of them negative.',
      steps: ['Take the bounce direction as +: v_i = −' + v1 + ', v_f = +' + v2, 'J = Δp = m(v_f − v_i) = ' + m + '(' + v2 + ' + ' + v1 + ') = ' + F(dp) + ' N·s', ...(want === 'F' ? ['F_avg = J/Δt = ' + F(dp) + '/' + dt + ' = **' + F(dp / dt) + ' N**'] : ['J = **' + F(dp) + ' N·s**'])],
      why: 'A bounce gives a bigger impulse than a stop, because the momentum has to reverse, not just go to zero.' };
  });

  CQ.gen('p.recoil', (R) => {
    const m1 = R.pick([40, 50, 60, 70]), m2 = R.pick([50, 70, 80, 90]), v1 = R.pick([1.5, 2, 2.5, 3]);
    const v2 = (m1 * v1) / m2;
    return { t: 'num', q: 'Two ice skaters, **' + m1 + ' kg** and **' + m2 + ' kg**, stand at rest and push off each other. The ' + m1 + ' kg skater moves away at **' + v1 + ' m/s**. How fast does the other skater move?', a: v2, unit: 'm/s',
      steps: ['Total momentum before = 0', '0 = m₁v₁ + m₂v₂ → v₂ = −m₁v₁/m₂', '|v₂| = ' + m1 + ' × ' + v1 + '/' + m2 + ' = **' + F(v2) + ' m/s** (opposite direction)'] };
  });

  CQ.gen('p.coll.inel', (R) => {
    const m1 = R.pick([1000, 1200, 1500, 2000]), m2 = R.pick([800, 1000, 1500, 3000]), v1 = R.pick([10, 15, 20, 25]), v2 = R.pick([0, 0, 5, -5, -10]);
    const vf = (m1 * v1 + m2 * v2) / (m1 + m2);
    const want = R.pick(['v', 'v', 'ke']);
    const K1 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2, K2 = 0.5 * (m1 + m2) * vf * vf;
    const q = 'A **' + m1 + ' kg** car moving at **' + v1 + ' m/s** collides with a **' + m2 + ' kg** car ' + (v2 === 0 ? 'at rest' : 'moving at **' + Math.abs(v2) + ' m/s** ' + (v2 > 0 ? 'in the same direction' : 'toward it')) + '. They lock bumpers. ';
    if (want === 'v') return { t: 'num', q: q + 'What is their speed right after the collision?', a: Math.abs(vf), unit: 'm/s', fig: D.carts({ v2: v2 ? Math.abs(v2) + ' m/s' : null, v2dir: v2 < 0 ? 'left' : 'right', v1: v1 + ' m/s' }),
      steps: ['Momentum is conserved: m₁v₁ + m₂v₂ = (m₁ + m₂)v_f', 'v_f = [[' + m1 + '(' + v1 + ') + ' + m2 + '(' + v2 + ')|' + (m1 + m2) + ']]', 'v_f = **' + F(Math.abs(vf)) + ' m/s**' + (vf < 0 ? ' (in the second car\'s original direction)' : '')] };
    return { t: 'num', lvl: 4, q: q + 'What fraction of the original kinetic energy is lost? (Answer as a decimal.)', a: (K1 - K2) / K1, unit: '',
      steps: ['v_f = ' + F(vf) + ' m/s (momentum conservation)', 'K before = ' + F(K1) + ' J, K after = ' + F(K2) + ' J', 'Fraction lost = (K₁ − K₂)/K₁ = **' + F((K1 - K2) / K1) + '**'] };
  });

  CQ.gen('p.coll.el', (R) => {
    const m1 = R.pick([1, 2, 3, 4]), m2 = R.pick([1, 2, 4, 6]), v1 = R.pick([2, 3, 4, 6]);
    const v1f = ((m1 - m2) / (m1 + m2)) * v1, v2f = ((2 * m1) / (m1 + m2)) * v1;
    const want = R.pick(['1', '2']);
    return { t: 'num', lvl: 4, q: 'A **' + m1 + ' kg** cart at **' + v1 + ' m/s** has a perfectly **elastic** head-on collision with a **' + m2 + ' kg** cart at rest. What is the velocity of the ' + (want === '1' ? '**' + m1 + ' kg** cart' : '**' + m2 + ' kg** cart') + ' afterward? (+ = original direction)', a: want === '1' ? v1f : v2f, unit: 'm/s', abs: 0.01,
      steps: ['Elastic, target at rest: v₁f = [[m₁ − m₂|m₁ + m₂]]v₁, v₂f = [[2m₁|m₁ + m₂]]v₁', 'v₁f = ' + F(v1f) + ' m/s, v₂f = ' + F(v2f) + ' m/s', 'Answer: **' + F(want === '1' ? v1f : v2f) + ' m/s**'],
      why: m1 === m2 ? 'Equal masses swap velocities, like a cue ball stopping dead.' : m1 < m2 ? 'A light cart bounces back off a heavier one.' : 'A heavy cart keeps going forward, just slower.' };
  });

  CQ.gen('p.ballistic', (R) => {
    const m = R.pick([0.005, 0.008, 0.01, 0.012]), M = R.pick([1, 1.5, 2, 2.5]), h = R.pick([0.05, 0.08, 0.1, 0.15]);
    const V = Math.sqrt(2 * g * h), v = ((m + M) / m) * V;
    return { t: 'num', lvl: 4, exam: true, q: 'Ballistic pendulum: a **' + m * 1000 + ' g** bullet embeds in a **' + M + ' kg** block hanging on strings, and the block swings up **' + h * 100 + ' cm**. What was the bullet\'s speed?', a: v, unit: 'm/s',
      hint: 'Two stages: an inelastic collision (momentum conserved), then a swing (energy conserved). Work backward from the swing.',
      steps: ['Swing (energy): ½(m+M)V² = (m+M)gh → V = √{2gh} = ' + F(V) + ' m/s', 'Collision (momentum): mv = (m+M)V', 'v = [[m + M|m]]V = [[' + F(m + M, 4) + '|' + m + ']] × ' + F(V) + ' = **' + F(v) + ' m/s**'],
      why: 'Kinetic energy is NOT conserved during the embedding, so you can\'t go straight from the bullet\'s KE to the height.' };
  });

  CQ.gen('p.cm', (R) => {
    const ms = R.sample([1, 2, 3, 4, 5, 6], 3), xs = R.sample([0, 1, 2, 3, 4, 5, 6, 8], 3);
    const M = ms[0] + ms[1] + ms[2], xc = (ms[0] * xs[0] + ms[1] * xs[1] + ms[2] * xs[2]) / M;
    return { t: 'num', q: 'Three point masses lie on the x-axis: **' + ms[0] + ' kg at x = ' + xs[0] + ' m**, **' + ms[1] + ' kg at x = ' + xs[1] + ' m**, and **' + ms[2] + ' kg at x = ' + xs[2] + ' m**. Where is their center of mass?', a: xc, unit: 'm', abs: 0.01,
      steps: ['x_cm = [[Σmᵢxᵢ|Σmᵢ]]', '= [[' + ms[0] + '(' + xs[0] + ') + ' + ms[1] + '(' + xs[1] + ') + ' + ms[2] + '(' + xs[2] + ')|' + M + ']]', 'x_cm = **' + F(xc) + ' m**'] };
  });

  CQ.gen('p.coll2d', (R) => {
    const m1 = R.pick([1000, 1200, 1500]), v1 = R.pick([12, 15, 20]), m2 = R.pick([1500, 2000, 2500]), v2 = R.pick([8, 10, 12]);
    const px = m1 * v1, py = m2 * v2, M = m1 + m2;
    const vf = Math.hypot(px, py) / M, ang = deg(Math.atan(py / px));
    const want = R.pick(['v', 'a']);
    return { t: 'num', lvl: 4, exam: true, q: 'At an icy intersection, a **' + m1 + ' kg** car heading east at **' + v1 + ' m/s** collides with a **' + m2 + ' kg** truck heading north at **' + v2 + ' m/s**. They stick together. ' + (want === 'v' ? 'What is their speed right after the crash?' : 'At what angle north of east do they move?'), a: want === 'v' ? vf : ang, unit: want === 'v' ? 'm/s' : '°', abs: want === 'v' ? undefined : 0.6,
      steps: ['East: pₓ = ' + m1 + ' × ' + v1 + ' = ' + px + ' kg·m/s', 'North: pᵧ = ' + m2 + ' × ' + v2 + ' = ' + py + ' kg·m/s', want === 'v' ? 'v = √(pₓ² + pᵧ²)/(m₁ + m₂) = **' + F(vf) + ' m/s**' : 'θ = arctan(pᵧ/pₓ) = **' + F(ang) + '°** north of east'] };
  });

  /* ================= Unit 6 ================= */
  const u6 = U('p6', 'Work & Kinetic Energy', { sub: 'Work, the work–energy theorem & power', ch: 'Ch 6' }, [
    L('p6l1', 'Work by a Constant Force', {
      goal: 'Compute the work done by any constant force, including the sign.',
      key: '$W = Fd cos φ = vec{F}·vec{d}$, where φ is the angle between the force and the displacement. Work is a scalar, measured in joules (1 J = 1 N·m). It is positive when the force helps the motion, negative when it opposes it (friction, gravity on a rising object), and zero when it is perpendicular (normal force, centripetal force). Holding something still does no work.',
      formulas: ['W = Fd cos φ = vec{F}·vec{d}', '1 J = 1 N·m'],
    }, [
      T('Work = force × distance along it', `
$$ W = Fd cos φ = vec{F}·vec{d} $$
Only the component of force **along** the displacement counts. The sign tells you whether the force feeds energy in or drains it out:
| φ | cos φ | Work |
|---|---|---|
| 0° | 1 | +Fd (force helps) |
| 90° | 0 | 0 (perpendicular) |
| 180° | −1 | −Fd (force opposes) |
>! Holding a heavy box still: big force, zero displacement, **zero work**. Carrying it horizontally at constant velocity: gravity and the normal force do zero work.`),
      EX('Pulling a sled', 'You pull a sled 12 m with 50 N along a rope angled 30° above the ground. Friction is 35 N. Find the work done by each force.', ['Rope: W = 50 × 12 × cos 30° = **520 J**', 'Friction (opposite the motion): W = 35 × 12 × cos 180° = **−420 J**', 'Gravity and normal force (perpendicular): **0 J**', 'Net work = 520 − 420 = 100 J']),
      MC('A satellite moves in a circular orbit at constant speed. How much work does gravity do on it each orbit?', ['Zero: the force is always perpendicular to the motion', 'Positive', 'Negative', 'mgh per orbit'], 'Gravity points to the center and the velocity is tangent, so φ = 90° the whole way.'),
      G('p.work.const'),
      TF('Kinetic friction always does negative work on a sliding object.', true, 'It always opposes the sliding, so φ = 180°.'),
      G('p.work.signs'),
      MATCH('Match the situation with the sign of the work done by the named force.', [['Gravity on a falling ball', 'positive'], ['Gravity on a rising ball', 'negative'], ['Normal force on a block sliding on a floor', 'zero'], ['Tension pulling a cart forward', 'positive (helps the motion)']]),
      G('p.work.const'),
    ]),
    L('p6l2', 'Work–Energy Theorem', {
      goal: 'Use W_net = ΔK to get speeds without finding accelerations.',
      key: 'Kinetic energy is $K = ½mv²$, a scalar that is always ≥ 0. **Work–energy theorem:** $W_{net} = ΔK = ½mv₂² − ½mv₁²$, where W_net is the total work done by ALL forces. It skips acceleration and time entirely, so use it whenever the question links forces, distances and speeds. Stopping distance under friction is $d = v²/(2μg)$: twice the speed means four times the distance.',
      formulas: ['K = ½mv²', 'W_{net} = ΔK = ½mv₂² − ½mv₁²', 'skid: d = [[v²|2μₖg]]'],
    }, [
      T('Work changes kinetic energy', `
$$ K = ½ mv² :: kinetic energy, in joules $$
$$ W_{net} = K₂ − K₁ :: the work–energy theorem $$
Add up the work done by **every** force, and that total is exactly the change in kinetic energy.
>* This is a shortcut around ΣF = ma: if you know forces and distances and want a **speed**, use energy. No time or acceleration needed.`),
      EX('Skid marks', 'A car skids to a stop from 20 m/s with μₖ = 0.60. How long are the skid marks?', ['Only friction does work: W = −μₖmg·d', 'W_net = ΔK: −μₖmg·d = 0 − ½mv²', 'd = v²/(2μₖg) = 400/(2 × 0.60 × 9.8) = **34 m**']),
      MC('If a car\'s speed doubles, its kinetic energy…', ['quadruples', 'doubles', 'stays the same', 'halves'], 'K ∝ v², so 2² = 4.'),
      G('p.wet.speed'),
      MC('Two forces act on a box: +50 J of work from a push and −30 J from friction. The box\'s kinetic energy…', ['increases by 20 J', 'increases by 50 J', 'decreases by 30 J', 'increases by 80 J'], 'W_net = 50 − 30 = 20 J = ΔK.', { lvl: 2 }),
      G('p.wet.stop'),
      TF('Kinetic energy can be negative if the object moves in the −x direction.', false, 'K = ½mv² uses v², so it\'s never negative.'),
      G('p.wet.speed'),
    ]),
    L('p6l3', 'Springs & Variable Forces', {
      goal: 'Get the work done by a changing force from an integral or an area.',
      key: 'When the force varies, $W = ∫F dx$, which is the area under the F–x graph. Hooke\'s law: a spring pulls back with $Fₓ = −kx$. You have to pull with +kx. The work to stretch or compress a spring from relaxed by x is $½kx²$, and from x₁ to x₂ it is $½k(x₂² − x₁²)$. The work grows with the square of the stretch.',
      formulas: ['W = ∫_{x₁}^{x₂} Fₓ dx', 'Hooke: Fₓ = −kx', 'W_{stretch} = ½kx²'],
    }, [
      T('When the force changes along the way', `
$$ W = ∫_{x₁}^{x₂} Fₓ dx :: area under the F–x graph $$
A spring is the classic example. **Hooke's law** says the spring pulls back proportionally to the stretch:
$$ Fₓ = −kx :: k = spring constant (N/m) $$
The work you do stretching it is the triangle under F = kx:
$$ W = ½kx² $$`, { fig: D.graph({ pts: [[0, 0], [5, 10]], xmax: 6, ymax: 12, shade: true, xl: 'x', yl: 'F = kx', ticks: [5], alt: 'Spring force grows linearly with stretch; work is the triangle area' }) }),
      EX('Stretching twice as far', 'A spring with k = 200 N/m is stretched 10 cm, then 20 cm. Compare the work.', ['10 cm: W = ½(200)(0.10)² = 1.0 J', '20 cm: W = ½(200)(0.20)² = 4.0 J', 'Twice the stretch takes **4 times** the work, because W ∝ x².']),
      G('p.spring.k'),
      MC('The area under a force-vs-position graph represents…', ['work', 'power', 'impulse', 'momentum'], 'W = ∫F dx. (Area under F vs **time** would be impulse.)'),
      G('p.spring.k'),
      TF('Stretching a spring 2 cm takes twice as much work as stretching it 1 cm.', false, 'W = ½kx², so it takes 4 times as much.'),
      G('p.work.var'),
      G('p.spring.k'),
    ]),
    L('p6l4', 'Power', {
      goal: 'Compute power as a rate of work, and P = Fv for steady motion.',
      key: 'Power is how fast work is done: $P_{av} = W/Δt$, and instantaneous $P = vec{F}·vec{v} = Fv$ for a force along the motion. Units: 1 W = 1 J/s, and 1 hp = 746 W. A kilowatt-hour (kWh) is energy, 3.6 × 10⁶ J, not power. To move something at constant speed against a resisting force, the power needed is resisting force × speed.',
      formulas: ['P = [[W|Δt]]', 'P = Fv', '1 hp = 746 W   ·   1 kWh = 3.6×10⁶ J'],
    }, [
      T('How fast energy flows', `
$$ P_{av} = [[W|Δt]]   ·   P = vec{F}·vec{v} $$
Same work, done faster, means more power. Running up the stairs and walking up them take the same work but different power.
>> A car cruising at 30 m/s against 600 N of drag needs P = 600 × 30 = 18 kW ≈ 24 hp, just to hold its speed.
>! **kWh** on an electric bill is **energy** (power × time), not power.`),
      EX('Stair climb', 'A 70 kg student climbs 5.0 m of stairs in 4.0 s. Find her power output.', ['W = mgh = 70(9.8)(5.0) = 3430 J', 'P = W/t = 3430/4.0 = **858 W** (about 1.15 hp)']),
      MC('Which unit measures **energy**, not power?', ['kilowatt-hour', 'watt', 'horsepower', 'joule per second'], '1 kWh = (1000 J/s)(3600 s) = 3.6 × 10⁶ J.'),
      G('p.power'),
      G('p.power'),
      TF('Doing the same work in half the time requires twice the power.', true, 'P = W/t.'),
      G('p.power'),
    ]),
  ]);

  /* ================= Unit 7 ================= */
  const u7 = U('p7', 'Potential Energy & Conservation', { sub: 'Energy bookkeeping for any track or spring', ch: 'Ch 7' }, [
    L('p7l1', 'Gravitational PE & Conservation', {
      goal: 'Use K₁ + U₁ = K₂ + U₂ to solve speed-height problems.',
      key: 'Gravitational potential energy is $U = mgy$. Only changes in U matter, so you choose where y = 0. If only gravity (and other conservative forces) do work, mechanical energy is conserved: $K₁ + U₁ = K₂ + U₂$. The path doesn\'t matter, only the height change: $v = √{v₀² + 2gΔh}$. Forces perpendicular to the motion (normal force on a track, tension in a pendulum) do no work, so they don\'t enter the equation.',
      formulas: ['U_{grav} = mgy', 'K₁ + U₁ = K₂ + U₂', 'v = √{2gh} (from rest)'],
    }, [
      T('Energy is stored by height', `
Lifting an object stores energy you can get back:
$$ U = mgy :: you choose where y = 0 $$
If only gravity does work, the total **mechanical energy** stays constant:
$$ K₁ + U₁ = K₂ + U₂ $$
>* Energy methods don't care about the **shape** of the path. A frictionless slide, a ramp or a free fall from the same height all give the same final speed.`, { fig: D.bars({ items: [['K₁', 2, 'c2'], ['U₁', 8, 'c4'], ['K₂', 10, 'c2'], ['U₂', 0.05, 'c4']], alt: 'Energy bars: potential energy turns into kinetic energy' }) }),
      EX('Water slide', 'A kid starts from rest at the top of a 12 m tall frictionless water slide. How fast is she at the bottom?', ['K₁ + U₁ = K₂ + U₂ → 0 + mgh = ½mv² + 0', 'v = √(2gh) = √(2 × 9.8 × 12) = **15.3 m/s**', 'The slide\'s twists and turns don\'t matter.']),
      MC('Three balls are thrown from the same cliff at the same speed: one up, one horizontally, one down. Ignoring air, which hits the ground fastest?', ['All hit with the same speed', 'The one thrown down', 'The one thrown up', 'The one thrown horizontally'], 'Same starting K and U, same final U, so the same final K and speed. (Their directions differ.)', { lvl: 2 }),
      G('p.cons.drop'),
      G('p.cons.pend'),
      TF('Choosing a different y = 0 level changes the final speed you calculate.', false, 'Only differences in U matter, and the reference level cancels out.'),
      G('p.cons.drop'),
    ]),
    L('p7l2', 'Elastic PE', {
      goal: 'Include springs in energy conservation.',
      key: 'A spring stores $U_{el} = ½kx²$, where x is the stretch or compression from its relaxed length. That\'s true either way, since x² is positive. The full conservation equation becomes $K₁ + U_{grav,1} + U_{el,1} = K₂ + U_{grav,2} + U_{el,2}$. Classic results: launch speed $v = x√{k/m}$ and max compression $x = v√{m/k}$.',
      formulas: ['U_{el} = ½kx²', 'launch: v = x√{k/m}', 'compression: x = v√{m/k}'],
    }, [
      T('Springs store energy too', `
$$ U_{el} = ½kx² $$
Stretched or compressed, a spring stores energy, because x² is positive either way.
Now energy conservation includes every type of stored energy:
$$ K₁ + U_{grav,1} + U_{el,1} = K₂ + U_{grav,2} + U_{el,2} $$
>* Before writing anything, list the forms of energy at **point 1** and **point 2**. Anything that's zero (at rest, at y = 0, spring relaxed) drops out.`, { fig: D.spring({ x: 150, eq: 200, label: 'compressed by x' }) }),
      EX('Spring cannon', 'A spring (k = 800 N/m) compressed 10 cm launches a 0.20 kg ball horizontally. Find the launch speed.', ['½kx² = ½mv²', 'v = x√(k/m) = 0.10 × √(800/0.20) = 0.10 × 63.2 = **6.32 m/s**']),
      G('p.spring.compress'),
      MC('You compress a spring twice as far. The stored energy becomes…', ['4 times as much', 'twice as much', 'the same', 'half'], 'U ∝ x².'),
      G('p.spring.launch'),
      TF('A spring stretched by 5 cm stores the same energy as when compressed by 5 cm.', true, '½kx² is the same for x = +5 cm and x = −5 cm.'),
      G('p.spring.launch'),
    ]),
    L('p7l3', 'Friction & W_other', {
      goal: 'Account for energy lost to friction and other non-conservative forces.',
      key: 'Conservative forces (gravity, springs) store energy you can fully recover, and their work doesn\'t depend on the path. Non-conservative forces (friction, drag, your push) don\'t. Include their work as $W_{other}$: $K₁ + U₁ + W_{other} = K₂ + U₂$. Friction makes W_other negative ($−fₖd$), and that energy becomes thermal energy. On rough surfaces, the path length matters.',
      formulas: ['K₁ + U₁ + W_{other} = K₂ + U₂', 'friction: W_{other} = −fₖd = −μₖnd'],
    }, [
      T('When energy leaks out', `
**Conservative** forces (gravity, springs) give back everything you put in, and their work only depends on the endpoints.
**Non-conservative** forces like friction turn mechanical energy into heat. Add their work to the bookkeeping:
$$ K₁ + U₁ + W_{other} = K₂ + U₂ $$
>! Friction work is **negative**: $W_f = −fₖ d$. With friction, the path length matters, so a longer route loses more energy.`),
      EX('Rough landing', 'A 2.0 kg block slides from rest down a frictionless ramp of height 3.0 m, then 5.0 m across a rough floor (μₖ = 0.20). Find its final speed.', ['Top: K₁ = 0, U₁ = mgh = 58.8 J', 'Friction on the floor: W_f = −0.20(2.0)(9.8)(5.0) = −19.6 J', 'K₂ = 58.8 − 19.6 = 39.2 J → v = √(2 × 39.2/2.0) = **6.26 m/s**']),
      MC('Which of these is a **non-conservative** force?', ['Kinetic friction', 'Gravity', 'An ideal spring force', 'The electric force between charges'], 'Friction\'s work depends on the path and turns into heat.'),
      G('p.wother'),
      TF('The work done by gravity on an object depends on the path it takes between two points.', false, 'Gravity is conservative: W = −mgΔy, whatever the path.'),
      G('p.wother.mu'),
      G('p.wother'),
    ]),
    L('p7l4', 'Force from Potential Energy', {
      goal: 'Get force from U(x) and read energy diagrams.',
      key: 'Force is minus the slope of the potential energy: $Fₓ = −dU/dx$. On a U(x) graph, the force points downhill. Minima are stable equilibria (F = 0 and the force pushes back toward the minimum) and maxima are unstable. For total energy E, the object can only be where U(x) ≤ E. Turning points are where U = E, so K = 0 there.',
      formulas: ['Fₓ = −[[dU|dx]]', 'allowed region: U(x) ≤ E', 'turning points: U = E'],
    }, [
      T('Force rolls downhill', `
$$ Fₓ = −[[dU|dx]] $$
Picture a marble on a U(x) curve shaped like a hill:
- Force points **down the slope** of U
- **Minimum** of U: stable equilibrium, a small push and it rocks back
- **Maximum** of U: unstable equilibrium, a small push and it rolls away
- With total energy E, the particle is confined to where **U ≤ E**. It turns around where U = E.`, { fig: D.graph({ pts: [[0, 8], [1, 3], [2, 1], [3, 3], [4, 6], [5, 4], [6, 2], [7, 4], [8, 9]], xmax: 9, ymax: 10, xl: 'x', yl: 'U(x)', marks: [[2, 1, 'stable'], [4, 6, 'unstable']], alt: 'Potential energy curve with a stable minimum and an unstable maximum' }) }),
      EX('From U to F', 'U(x) = 3x² − 2x³ (J). Find the force at x = 2 m.', ['F = −dU/dx = −(6x − 6x²)', 'F(2) = −(12 − 24) = **+12 N**', 'Positive: it pushes toward +x, which is downhill on the U curve.']),
      MC('At a **minimum** of U(x), the force on a particle is…', ['zero, and the equilibrium is stable', 'zero, and the equilibrium is unstable', 'maximum', 'pointing away from the minimum'], 'Slope = 0 → F = 0. Nearby forces point back toward the minimum.'),
      G('p.Ux'),
      MC('A particle with total energy E moves in U(x). Where is its kinetic energy zero?', ['Where U(x) = E (turning points)', 'Where U(x) is minimum', 'Where U(x) = 0', 'Nowhere'], 'K = E − U, so K = 0 exactly where U = E.'),
      TF('A particle can never be found where U(x) > E.', true, 'That would require negative kinetic energy.'),
      G('p.Ux'),
    ]),
  ]);

  /* ================= Unit 8 ================= */
  const u8 = U('p8', 'Momentum & Collisions', { sub: 'Impulse, conservation & collisions', ch: 'Ch 8' }, [
    L('p8l1', 'Momentum & Impulse', {
      goal: 'Relate force, time and change in momentum.',
      key: 'Momentum is $vec{p} = mvec{v}$, a vector. Impulse $vec{J} = ∫F dt = F_{av}Δt = Δvec{p}$ is the area under the F–t graph. A bounce gives a bigger impulse than a stop, because the momentum reverses. Stretching out the collision time (airbags, bending your knees) lowers the average force for the same Δp. Watch your signs when the velocity reverses.',
      formulas: ['vec{p} = m vec{v}', 'vec{J} = F_{av}Δt = Δvec{p}', 'J = area under F–t'],
    }, [
      T('Momentum is mass in motion', `
$$ vec{p} = m vec{v} :: a vector, units kg·m/s $$
Newton's second law really says $Σvec{F} = dvec{p}/dt$. Integrate it over a collision:
$$ vec{J} = F_{av} Δt = Δvec{p} :: impulse–momentum theorem $$
>> Airbags and crumple zones make Δt longer. Same Δp, so a smaller average force on you.
>! A ball bouncing back has Δp = m(v_f − v_i) with **opposite signs**, so its magnitude is m(v_f + v_i), bigger than stopping.`),
      EX('Catching vs bouncing', 'A 0.50 kg ball hits a wall at 10 m/s. Find Δp if it (a) stops, (b) bounces back at 10 m/s.', ['Take toward the wall as −, away as +', '(a) Δp = 0 − (0.50)(−10) = **5.0 kg·m/s**', '(b) Δp = (0.50)(10) − (0.50)(−10) = **10 kg·m/s**, twice as much']),
      MC('Why do airbags reduce injuries?', ['They increase the stopping time, so the average force is smaller', 'They reduce your change in momentum', 'They reduce your mass', 'They make the collision elastic'], 'Same Δp, so a longer Δt gives a smaller F_av.'),
      G('p.impulse'),
      TF('Momentum and kinetic energy are both vectors.', false, 'Momentum is a vector, while kinetic energy is a scalar.'),
      MC('The area under a **force vs time** graph equals…', ['the impulse (change in momentum)', 'the work done', 'the change in kinetic energy', 'the power'], 'J = ∫F dt. Area under F vs **x** would be work.'),
      NUM('A bat\'s force on a ball rises linearly from 0 to a peak of **4000 N** and back to 0 over **2.0 ms** (a triangle on the F–t graph). What impulse does it deliver?', 4, 'N·s', 'Area of a triangle: ½ × 0.0020 s × 4000 N = 4.0 N·s.', { hint: 'Impulse is the area under F vs t.', steps: ['J = area = ½ × base × height', '= ½ × 0.0020 s × 4000 N = **4.0 N·s**'] }),
      G('p.impulse'),
    ]),
    L('p8l2', 'Conservation of Momentum', {
      goal: 'Apply momentum conservation to explosions, recoil and push-offs.',
      key: 'If the net external force on a system is zero (or negligible during a brief collision), the total momentum is conserved: $Σp_{before} = Σp_{after}$. Internal forces (third-law pairs inside the system) cancel. Use it per component. For objects starting at rest, the total momentum stays zero, so the pieces fly apart with $m₁v₁ = −m₂v₂$.',
      formulas: ['Σvec{p}_{before} = Σvec{p}_{after}', 'from rest: m₁v₁ = −m₂v₂'],
    }, [
      T('Internal forces cancel', `
In a collision or explosion, the objects push on each other with equal and opposite forces (third law), so those **internal** impulses cancel. If outside forces are negligible:
$$ m₁vec{v}₁ + m₂vec{v}₂ = m₁vec{v}₁′ + m₂vec{v}₂′ $$
>* Momentum is conserved in **every** collision, elastic or not, as long as the external forces can be ignored. Kinetic energy is a different story.`),
      EX('Rifle recoil', 'A 4.0 kg rifle fires a 10 g bullet at 400 m/s. Find the recoil speed.', ['Before: total p = 0', 'After: (0.010)(400) + (4.0)v = 0', 'v = −1.0 m/s, so the rifle recoils at **1.0 m/s**']),
      G('p.recoil'),
      MC('A cannon at rest fires a ball. After firing, the total momentum of the cannon + ball is…', ['zero', 'equal to the ball\'s momentum', 'equal to the cannon\'s momentum', 'greater than zero'], 'It started at zero with no external horizontal force, so it stays zero.'),
      TF('Momentum is conserved only in elastic collisions.', false, 'It\'s conserved in all collisions when external forces are negligible.'),
      MC('An astronaut floating at rest in space throws a wrench away from her. She…', ['moves in the opposite direction, slower than the wrench', 'stays at rest', 'moves with the wrench', 'moves opposite at the same speed as the wrench'], 'Total p stays 0: m_you v_you = −m_wrench v_wrench. Her bigger mass means a smaller speed.', { lvl: 2 }),
      G('p.recoil'),
    ]),
    L('p8l3', 'Inelastic Collisions', {
      goal: 'Solve sticking collisions and find how much kinetic energy is lost.',
      key: 'In an inelastic collision, momentum is conserved but kinetic energy is not, because some of it goes to heat, sound and deformation. In a perfectly inelastic collision the objects stick: $v_f = (m₁v₁ + m₂v₂)/(m₁ + m₂)$. Find v_f from momentum, then compare K before and after. Two-stage problems (ballistic pendulum): momentum for the collision, then energy for the swing.',
      formulas: ['v_f = [[m₁v₁ + m₂v₂|m₁ + m₂]]', 'ΔK = K_f − K_i < 0'],
    }, [
      T('Stick together, lose energy', `
When objects **stick**, the collision is *perfectly inelastic*:
$$ v_f = [[m₁v₁ + m₂v₂|m₁ + m₂]] $$
Momentum is conserved, but some **kinetic energy** turns into heat, sound and bent metal.
>! Ballistic pendulum: **momentum** for the collision, **energy** for the swing. Using energy across the collision is the #1 mistake on this problem.`, { fig: D.carts({ v1: 'v₁', v2: null }) }),
      EX('Fender bender', 'A 1500 kg car at 20 m/s rear-ends a 1000 kg car at rest. They lock. Find v_f and the KE lost.', ['v_f = (1500 × 20)/(2500) = **12 m/s**', 'K before = ½(1500)(20²) = 300 kJ', 'K after = ½(2500)(12²) = 180 kJ', 'Lost: **120 kJ** (40%)']),
      G('p.coll.inel'),
      MC('In a perfectly inelastic collision, which is conserved?', ['Momentum only', 'Kinetic energy only', 'Both momentum and kinetic energy', 'Neither'], 'Momentum yes, KE no.'),
      G('p.coll.inel'),
      TF('In a ballistic pendulum, you can set the bullet\'s kinetic energy equal to the block\'s final potential energy.', false, 'KE is lost when the bullet embeds. Use momentum for the collision first.'),
      G('p.ballistic'),
    ]),
    L('p8l4', 'Elastic Collisions', {
      goal: 'Solve 1-D elastic collisions and know the special cases.',
      key: 'Elastic collisions conserve momentum AND kinetic energy. For a 1-D collision with m₂ at rest: $v₁′ = [[m₁ − m₂|m₁ + m₂]]v₁$ and $v₂′ = [[2m₁|m₁ + m₂]]v₁$. Special cases: equal masses swap velocities; a light object hitting a heavy one bounces back; a heavy one hitting a light one keeps going and the light one shoots off at up to 2v₁. The relative speed is the same before and after, it just reverses.',
      formulas: ['v₁′ = [[m₁ − m₂|m₁ + m₂]]v₁', 'v₂′ = [[2m₁|m₁ + m₂]]v₁', 'v₂′ − v₁′ = −(v₂ − v₁)'],
    }, [
      T('Bouncy collisions keep their energy', `
**Elastic** means kinetic energy is conserved too. For a head-on hit on a target at rest:
$$ v₁′ = [[m₁ − m₂|m₁ + m₂]]v₁   ·   v₂′ = [[2m₁|m₁ + m₂]]v₁ $$
| Case | Result |
|---|---|
| m₁ = m₂ | they swap: v₁′ = 0, v₂′ = v₁ |
| m₁ ≪ m₂ | m₁ bounces back at about −v₁ |
| m₁ ≫ m₂ | m₂ flies off at about 2v₁ |`),
      EX('Pool shot', 'A cue ball hits an identical ball at rest, head-on and elastically, at 3.0 m/s. What happens?', ['m₁ = m₂ → v₁′ = 0, v₂′ = v₁', 'The cue ball **stops** and the target moves at **3.0 m/s**']),
      MC('A ping-pong ball hits a bowling ball (at rest) elastically. The ping-pong ball…', ['bounces back with nearly its original speed', 'stops', 'keeps going forward slowly', 'sticks to the bowling ball'], 'm₁ ≪ m₂ → v₁′ ≈ −v₁.'),
      G('p.coll.el'),
      MATCH('Match the collision type to what is conserved.', [['Elastic', 'momentum and KE'], ['Inelastic', 'momentum only'], ['Explosion from rest', 'total momentum stays zero']]),
      G('p.coll.el'),
      TF('In a 1-D elastic collision the relative speed of approach equals the relative speed of separation.', true, 'v₂′ − v₁′ = −(v₂ − v₁). A handy check.'),
    ]),
    L('p8l5', 'Center of Mass', {
      goal: 'Locate the center of mass and use it to describe system motion.',
      key: '$x_{cm} = Σmᵢxᵢ/Σmᵢ$, a mass-weighted average position (same for y). The center of mass moves as if all the mass were there and all the external forces acted on it: $ΣF_{ext} = Ma_{cm}$. With no external force, v_cm stays constant, even through collisions and explosions. Total momentum is $P = Mv_{cm}$.',
      formulas: ['x_{cm} = [[Σmᵢxᵢ|Σmᵢ]]', 'P = Mv_{cm}', 'ΣF_{ext} = Ma_{cm}'],
    }, [
      T('The balance point of a system', `
$$ x_{cm} = [[m₁x₁ + m₂x₂ + …|m₁ + m₂ + …]] $$
It sits closer to the heavier masses. The center of mass moves like a single particle carrying all the mass:
$$ ΣF_{ext} = M a_{cm}   ·   vec{P} = M vec{v}_{cm} $$
>> A firework that explodes mid-flight: the pieces scatter, but their center of mass keeps following the original parabola.`),
      EX('Earth–Moon balance point', 'Earth (6.0×10²⁴ kg) and Moon (7.4×10²² kg) are 3.84×10⁸ m apart. Where is their CM, measured from Earth\'s center?', ['x_cm = (m_E·0 + m_M·d)/(m_E + m_M)', '= (7.4×10²²)(3.84×10⁸)/(6.07×10²⁴)', '≈ **4.7×10⁶ m**, inside the Earth (its radius is 6.4×10⁶ m)']),
      G('p.cm'),
      MC('A projectile explodes into two pieces at the top of its path. Ignoring air, the center of mass of the pieces…', ['continues along the original parabola', 'stops and falls straight down', 'moves in a straight line', 'jumps to the heavier piece'], 'Only gravity acts externally, so the CM motion is unchanged.'),
      TF('The center of mass of an object must be located inside the material of the object.', false, 'A ring or a boomerang has its CM in empty space.'),
      G('p.cm'),
      G('p.coll2d'),
    ]),
  ]);

  CQ.addUnits('phys', [u6, u7, u8]);
})();
