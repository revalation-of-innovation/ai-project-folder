/* PHYS 2325 · Units 9–11: rotation, rotational dynamics, equilibrium & elasticity (Young & Freedman Ch 9–11) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const g = 9.8;
  const D = CQ.dg;
  const PI = Math.PI;
  const deg = (r) => (r * 180) / PI;
  const rad = (d) => (d * PI) / 180;
  const sin = (d) => Math.sin(rad(d)), cos = (d) => Math.cos(rad(d));

  const SHAPES = [
    ['solid disk (cylinder)', 0.5, '½MR²'],
    ['thin hoop (ring)', 1, 'MR²'],
    ['solid sphere', 0.4, '⅖MR²'],
    ['thin spherical shell', 2 / 3, '⅔MR²'],
  ];

  /* ================= generators: Unit 9 ================= */
  CQ.gen('p.rot.conv', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const rpm = R.pick([30, 45, 60, 120, 300, 1200, 3000]); return { t: 'num', q: 'A motor spins at **' + rpm + ' rpm**. What is its angular speed in rad/s?', a: (rpm * 2 * PI) / 60, unit: 'rad/s', steps: ['1 rev = 2π rad and 1 min = 60 s', 'ω = ' + rpm + ' × [[2π|60]] = **' + F((rpm * 2 * PI) / 60) + ' rad/s**'] }; }
    if (k === 1) { const rev = R.pick([2.5, 3, 5, 10, 12]); return { t: 'num', q: 'A wheel turns through **' + rev + ' revolutions**. How many radians is that?', a: rev * 2 * PI, unit: 'rad', steps: ['θ = ' + rev + ' × 2π = **' + F(rev * 2 * PI) + ' rad**'] }; }
    const w = R.pick([2, 5, 10, 20, 50]);
    return { t: 'num', q: 'A disk spins at **' + w + ' rad/s**. How long does one revolution take?', a: (2 * PI) / w, unit: 's', steps: ['T = [[2π|ω]] = [[2π|' + w + ']] = **' + F((2 * PI) / w) + ' s**'] };
  });

  CQ.gen('p.rot.kin', (R) => {
    const w0 = R.pick([0, 0, 5, 10, 20]), al = R.pick([1.5, 2, 3, 4, 5]), t = R.pick([2, 3, 4, 5, 6]);
    const k = R.int(0, 2);
    const w = w0 + al * t, th = w0 * t + 0.5 * al * t * t;
    if (k === 0) return { t: 'num', q: 'A turbine ' + (w0 ? 'turning at **' + w0 + ' rad/s**' : 'starting from rest') + ' speeds up with constant **α = ' + al + ' rad/s²**. What is its angular speed after **' + t + ' s**?', a: w, unit: 'rad/s', steps: ['ω = ω₀ + αt = ' + w0 + ' + ' + al + '(' + t + ') = **' + F(w) + ' rad/s**'] };
    if (k === 1) return { t: 'num', q: 'A wheel ' + (w0 ? 'at **' + w0 + ' rad/s**' : 'starting from rest') + ' has constant **α = ' + al + ' rad/s²**. How many **revolutions** does it make in **' + t + ' s**?', a: th / (2 * PI), unit: 'rev', steps: ['θ = ω₀t + ½αt² = ' + F(th) + ' rad', 'revolutions = θ/2π = **' + F(th / (2 * PI)) + ' rev**'] };
    const W0 = R.pick([20, 30, 40, 60]), A = R.pick([2, 4, 5, 8]);
    return { t: 'num', lvl: 4, q: 'A spinning fan at **' + W0 + ' rad/s** is switched off and slows with constant **α = −' + A + ' rad/s²**. Through what angle does it turn before stopping?', a: (W0 * W0) / (2 * A), unit: 'rad', steps: ['No time given → ω² = ω₀² + 2αΔθ', '0 = ' + W0 * W0 + ' − 2(' + A + ')Δθ', 'Δθ = **' + F((W0 * W0) / (2 * A)) + ' rad** (' + F((W0 * W0) / (2 * A) / (2 * PI)) + ' rev)'] };
  });

  CQ.gen('p.rot.link', (R) => {
    const r = R.pick([0.1, 0.2, 0.3, 0.5, 1.2]), w = R.pick([4, 6, 10, 15, 20]), al = R.pick([2, 3, 5]);
    const k = R.int(0, 2);
    if (k === 0) return { t: 'num', q: 'A point on a grinding wheel is **' + r * 100 + ' cm** from the axis. The wheel spins at **' + w + ' rad/s**. How fast is the point moving?', a: r * w, unit: 'm/s', fig: D.disk(), steps: ['v = rω = ' + r + ' × ' + w + ' = **' + F(r * w) + ' m/s**'], hint: 'Convert cm to m first.' };
    if (k === 1) return { t: 'num', q: 'A point **' + r * 100 + ' cm** from the center of a wheel spinning at **' + w + ' rad/s**. What is its centripetal (radial) acceleration?', a: w * w * r, unit: 'm/s²', steps: ['a_rad = ω²r = ' + w + '² × ' + r + ' = **' + F(w * w * r) + ' m/s²**'] };
    const at = r * al, ar = w * w * r;
    return { t: 'num', lvl: 4, q: 'A point **' + r * 100 + ' cm** from the axis of a wheel has **ω = ' + w + ' rad/s** and **α = ' + al + ' rad/s²** at some instant. What is the magnitude of its total acceleration?', a: Math.hypot(at, ar), unit: 'm/s²', steps: ['Tangential: a_tan = rα = ' + F(at) + ' m/s²', 'Radial: a_rad = ω²r = ' + F(ar) + ' m/s²', 'They\'re perpendicular: a = √(a_tan² + a_rad²) = **' + F(Math.hypot(at, ar)) + ' m/s²**'] };
  });

  CQ.gen('p.I', (R) => {
    const [name, c, form] = R.pick(SHAPES);
    const M = R.pick([0.5, 1, 2, 3, 5]), r = R.pick([0.1, 0.2, 0.25, 0.4, 0.5]);
    return { t: 'num', q: 'What is the moment of inertia of a **' + name + '** with mass **' + M + ' kg** and radius **' + r + ' m**, about its central axis?', a: c * M * r * r, unit: 'kg·m²', steps: ['I = ' + form, 'I = ' + F(c, 3) + ' × ' + M + ' × ' + r + '² = **' + F(c * M * r * r) + ' kg·m²**'] };
  });

  CQ.gen('p.I.points', (R) => {
    const m1 = R.pick([1, 2, 3]), m2 = R.pick([1, 2, 4]), r1 = R.pick([0.2, 0.3, 0.5]), r2 = R.pick([0.4, 0.6, 0.8]);
    const I = m1 * r1 * r1 + m2 * r2 * r2;
    return { t: 'num', q: 'Two small balls are fixed to a light rod: **' + m1 + ' kg at ' + r1 + ' m** and **' + m2 + ' kg at ' + r2 + ' m** from the rotation axis. Find the moment of inertia.', a: I, unit: 'kg·m²', steps: ['I = Σmr²', '= ' + m1 + '(' + r1 + ')² + ' + m2 + '(' + r2 + ')² = **' + F(I) + ' kg·m²**'] };
  });

  CQ.gen('p.parallel', (R) => {
    const M = R.pick([1, 2, 3, 4]), L2 = R.pick([0.6, 1, 1.2, 2]);
    const Icm = (M * L2 * L2) / 12, d = L2 / 2;
    return { t: 'num', lvl: 4, q: 'A uniform rod (**M = ' + M + ' kg**, **L = ' + L2 + ' m**) has I_cm = [[1|12]]ML² about its center. Use the parallel-axis theorem to find I about one **end**.', a: Icm + M * d * d, unit: 'kg·m²',
      steps: ['I = I_cm + Md², with d = L/2 = ' + d + ' m', '= ' + F(Icm) + ' + ' + M + '(' + d + ')² = **' + F(Icm + M * d * d) + ' kg·m²**', 'That equals ⅓ML², as expected.'] };
  });

  CQ.gen('p.KErot', (R) => {
    const [name, c, form] = R.pick(SHAPES.slice(0, 3));
    const M = R.pick([2, 5, 10, 20]), r = R.pick([0.2, 0.3, 0.5]), w = R.pick([10, 20, 30, 50]);
    const I = c * M * r * r;
    return { t: 'num', q: 'A **' + name + '** flywheel (**M = ' + M + ' kg**, **R = ' + r + ' m**) spins at **' + w + ' rad/s**. How much rotational kinetic energy does it store?', a: 0.5 * I * w * w, unit: 'J', steps: ['I = ' + form + ' = ' + F(I) + ' kg·m²', 'K = ½Iω² = ½(' + F(I) + ')(' + w + ')² = **' + F(0.5 * I * w * w) + ' J**'] };
  });

  /* ================= generators: Unit 10 ================= */
  CQ.gen('p.torque', (R) => {
    const r = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), Fp = R.pick([20, 40, 50, 80, 100]), phi = R.pick([30, 45, 60, 90, 120]);
    return { t: 'num', q: 'You push on a wrench **' + r * 100 + ' cm** from the bolt with **' + Fp + ' N**, at **' + phi + '°** to the handle. What torque do you apply?', a: r * Fp * sin(phi), unit: 'N·m', fig: D.torque({ deg: phi }),
      steps: ['τ = rF sin φ (φ = angle between r and F)', '= ' + r + ' × ' + Fp + ' × sin ' + phi + '° = **' + F(r * Fp * sin(phi)) + ' N·m**'], why: phi === 90 ? 'Perpendicular pushes give the most torque.' : 'Only the perpendicular part of the force, F sin φ, turns the wrench.' };
  });

  CQ.gen('p.torque.net', (R) => {
    const r1 = R.pick([0.1, 0.2, 0.3]), r2 = R.pick([0.4, 0.5, 0.6]), F1 = R.pick([30, 40, 60, 80]), F2 = R.pick([10, 20, 25, 30]);
    const net = F1 * r1 - F2 * r2;
    return { t: 'num', q: 'A wheel has two forces applied tangentially: **' + F1 + ' N** at radius **' + r1 + ' m** turning it **counterclockwise**, and **' + F2 + ' N** at radius **' + r2 + ' m** turning it **clockwise**. What is the net torque? (CCW = +)', a: net, unit: 'N·m', abs: 0.01,
      steps: ['τ₁ = +' + F1 + ' × ' + r1 + ' = +' + F(F1 * r1) + ' N·m', 'τ₂ = −' + F2 + ' × ' + r2 + ' = −' + F(F2 * r2) + ' N·m', 'Στ = **' + F(net) + ' N·m**' + (net < 0 ? ' (clockwise)' : '')] };
  });

  CQ.gen('p.alpha', (R) => {
    const [name, c, form] = R.pick(SHAPES.slice(0, 2));
    const M = R.pick([2, 4, 5, 10]), r = R.pick([0.2, 0.3, 0.5]), Fp = R.pick([5, 10, 20, 30]);
    const I = c * M * r * r, al = (Fp * r) / I;
    return { t: 'num', q: 'A **' + name + '** (M = ' + M + ' kg, R = ' + r + ' m) can spin freely on a fixed axle. A string wrapped around its rim is pulled with **' + Fp + ' N**. What is its angular acceleration?', a: al, unit: 'rad/s²',
      steps: ['τ = FR = ' + Fp + ' × ' + r + ' = ' + F(Fp * r) + ' N·m', 'I = ' + form + ' = ' + F(I) + ' kg·m²', 'α = τ/I = **' + F(al) + ' rad/s²**'] };
  });

  CQ.gen('p.pulleymass', (R) => {
    const m = R.pick([1, 2, 3, 5]), M = R.pick([2, 4, 6, 10]);
    const a = (m * g) / (m + M / 2), Tt = m * (g - a);
    const want = R.pick(['a', 'T']);
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + m + ' kg** bucket hangs from a rope wrapped around a solid-disk pulley (**M = ' + M + ' kg**, I = ½MR²) that turns without friction. The bucket is released. Find the ' + (want === 'a' ? '**acceleration** of the bucket.' : '**tension** in the rope.'), a: want === 'a' ? a : Tt, unit: want === 'a' ? 'm/s²' : 'N',
      hint: 'Two equations: the bucket (mg − T = ma) and the disk (TR = Iα with α = a/R). The radius cancels.',
      steps: ['Bucket: mg − T = ma', 'Disk: TR = (½MR²)(a/R) → T = ½Ma', 'Add: mg = (m + ½M)a → a = [[mg|m + M/2]] = ' + F(a) + ' m/s²', want === 'a' ? 'a = **' + F(a) + ' m/s²**' : 'T = ½Ma = **' + F(Tt) + ' N**'] };
  });

  CQ.gen('p.roll', (R) => {
    const pick = R.pick([['solid sphere', 0.4], ['solid cylinder', 0.5], ['hoop', 1], ['hollow sphere', 2 / 3]]);
    const h = R.pick([0.5, 1, 1.5, 2, 3]);
    const v = Math.sqrt((2 * g * h) / (1 + pick[1]));
    return { t: 'num', lvl: 4, q: 'A **' + pick[0] + '** rolls without slipping from rest down a ramp of vertical height **' + h + ' m**. What is its speed at the bottom?', a: v, unit: 'm/s', fig: D.roll(),
      hint: 'Energy: mgh = ½mv² + ½Iω², with ω = v/R and I = cMR².',
      steps: ['I = ' + F(pick[1], 3) + 'MR², ω = v/R', 'mgh = ½mv²(1 + ' + F(pick[1], 3) + ')', 'v = √{[[2gh|1 + ' + F(pick[1], 3) + ']]} = **' + F(v) + ' m/s**'],
      why: 'Some of the energy goes into spinning, so it\'s slower than a frictionless slide (√2gh = ' + F(Math.sqrt(2 * g * h)) + ' m/s).' };
  });

  CQ.gen('p.rotpower', (R) => {
    const tau = R.pick([50, 100, 200, 300, 400]), rpm = R.pick([1000, 2000, 3000, 4000]);
    const w = (rpm * 2 * PI) / 60;
    return { t: 'num', q: 'An engine delivers **' + tau + ' N·m** of torque at **' + rpm + ' rpm**. What power is that (in kW)?', a: (tau * w) / 1000, unit: 'kW',
      steps: ['ω = ' + rpm + ' × 2π/60 = ' + F(w) + ' rad/s', 'P = τω = ' + tau + ' × ' + F(w) + ' = ' + F(tau * w) + ' W = **' + F((tau * w) / 1000) + ' kW**'] };
  });

  CQ.gen('p.L', (R) => {
    const k = R.int(0, 1);
    if (k === 0) {
      const I1 = R.pick([3, 4, 5, 6]), f = R.pick([2, 2.5, 3, 4]), w1 = R.pick([2, 3, 4, 6]);
      const I2 = I1 / f;
      return { t: 'num', q: 'A skater spins at **' + w1 + ' rad/s** with arms out (**I = ' + I1 + ' kg·m²**). She pulls her arms in and her moment of inertia drops to **' + F(I2) + ' kg·m²**. What is her new angular speed?', a: w1 * f, unit: 'rad/s',
        steps: ['No external torque → L conserved: I₁ω₁ = I₂ω₂', 'ω₂ = [[I₁ω₁|I₂]] = [[' + I1 + ' × ' + w1 + '|' + F(I2) + ']] = **' + F(w1 * f) + ' rad/s**'] };
    }
    const M = R.pick([100, 150, 200]), Rr = R.pick([1.5, 2, 2.5]), m = R.pick([30, 40, 50, 60]), w1 = R.pick([1, 1.5, 2]);
    const I1 = 0.5 * M * Rr * Rr, I2 = I1 + m * Rr * Rr;
    return { t: 'num', lvl: 4, exam: true, q: 'A merry-go-round (solid disk, **M = ' + M + ' kg**, **R = ' + Rr + ' m**) spins freely at **' + w1 + ' rad/s**. A **' + m + ' kg** child jumps on at the rim (straight down, no tangential speed). What is the new angular speed?', a: (I1 * w1) / I2, unit: 'rad/s',
      steps: ['I₁ = ½MR² = ' + F(I1) + ' kg·m²', 'I₂ = I₁ + mR² = ' + F(I2) + ' kg·m²', 'L conserved: ω₂ = I₁ω₁/I₂ = **' + F((I1 * w1) / I2) + ' rad/s**'] };
  });

  /* ================= generators: Unit 11 ================= */
  CQ.gen('p.seesaw', (R) => {
    const m1 = R.pick([20, 25, 30, 40]), d1 = R.pick([1, 1.2, 1.5, 2]), m2 = R.pick([35, 45, 50, 60]);
    return { t: 'num', q: 'On a seesaw, a **' + m1 + ' kg** child sits **' + d1 + ' m** from the pivot. Where must a **' + m2 + ' kg** child sit on the other side to balance?', a: (m1 * d1) / m2, unit: 'm',
      fig: D.beam({ supports: [{ x: 0.5, type: 'fulcrum' }], loads: [{ x: 0.5 - d1 / 6, label: m1 + 'g' }, { x: 0.5 + (m1 * d1) / m2 / 6, label: m2 + 'g', cls: 'c4' }] }),
      steps: ['Στ = 0 about the pivot: m₁g·d₁ = m₂g·d₂', 'd₂ = m₁d₁/m₂ = ' + m1 + ' × ' + d1 + '/' + m2 + ' = **' + F((m1 * d1) / m2) + ' m**'] };
  });

  CQ.gen('p.beam', (R) => {
    const L2 = R.pick([4, 5, 6, 8]), wb = R.pick([200, 300, 400]), wp = R.pick([500, 600, 700, 800]), xp = R.pick([1, 1.5, 2, 3].filter((x) => x < L2));
    const NB = (wb * (L2 / 2) + wp * xp) / L2, NA = wb + wp - NB;
    const want = R.pick(['A', 'B']);
    return { t: 'num', lvl: 4, q: 'A uniform **' + L2 + ' m** plank weighing **' + wb + ' N** rests on supports at each end (A at the left, B at the right). A **' + wp + ' N** painter stands **' + xp + ' m** from end A. What force does support **' + want + '** exert?', a: want === 'A' ? NA : NB, unit: 'N',
      fig: D.beam({ supports: [{ x: 0, type: 'pin', label: 'n_A' }, { x: 1, type: 'pin', label: 'n_B' }], loads: [{ x: 0.5, label: wb + ' N' }, { x: xp / L2, label: wp + ' N', cls: 'c4' }], dims: [[0, xp / L2, xp + ' m']] }),
      hint: 'Take torques about the support you DON\'T want. That removes its unknown force.',
      steps: ['Στ about A = 0: n_B(' + L2 + ') − ' + wb + '(' + L2 / 2 + ') − ' + wp + '(' + xp + ') = 0', 'n_B = ' + F(NB) + ' N', 'ΣFᵧ = 0: n_A = ' + (wb + wp) + ' − ' + F(NB) + ' = ' + F(NA) + ' N', 'Support ' + want + ': **' + F(want === 'A' ? NA : NB) + ' N**'] };
  });

  CQ.gen('p.ladder', (R) => {
    const w = R.pick([150, 200, 250, 300]), th = R.pick([50, 55, 60, 65, 70]);
    const nw = w / (2 * Math.tan(rad(th)));
    const want = R.pick(['f', 'mu']);
    return { t: 'num', lvl: 4, exam: true, q: 'A uniform ladder weighing **' + w + ' N** leans against a **frictionless** wall at **' + th + '°** above the floor. ' + (want === 'f' ? 'What friction force must the floor provide to keep it from slipping?' : 'What is the minimum μₛ between the ladder and the floor?'), a: want === 'f' ? nw : nw / w, unit: want === 'f' ? 'N' : '',
      fig: D.ladder({ deg: th }),
      hint: 'Take torques about the bottom of the ladder. Weight acts at the middle, the wall force acts at the top.',
      steps: ['ΣFᵧ: n₁ = w = ' + w + ' N', 'Στ about the base: n₂(L sin θ) = w(L/2)cos θ → n₂ = [[w|2 tan θ]] = ' + F(nw) + ' N', 'ΣFₓ: f = n₂ = ' + F(nw) + ' N', ...(want === 'mu' ? ['μₛ ≥ f/n₁ = ' + F(nw) + '/' + w + ' = **' + F(nw / w) + '**'] : ['f = **' + F(nw) + ' N**'])] };
  });

  CQ.gen('p.stress', (R) => {
    const mats = [['steel', 200e9], ['aluminum', 70e9], ['copper', 110e9], ['brass', 90e9]];
    const [mat, Y] = R.pick(mats);
    const d = R.pick([1, 2, 3, 4]) * 1e-3, L0 = R.pick([1, 2, 3, 5]), Fp = R.pick([500, 1000, 2000, 5000]);
    const A = PI * (d / 2) ** 2, dL = (Fp * L0) / (A * Y);
    const k = R.int(0, 1);
    if (k === 0) return { t: 'num', q: 'A **' + mat + '** wire (Y = ' + F(Y, 2) + ' Pa) is **' + L0 + ' m** long with diameter **' + d * 1000 + ' mm**. How much does it stretch under a **' + Fp + ' N** load (in mm)?', a: dL * 1000, unit: 'mm',
      steps: ['A = π(d/2)² = ' + F(A) + ' m²', 'ΔL = [[FL₀|AY]] = [[' + Fp + ' × ' + L0 + '|' + F(A) + ' × ' + F(Y, 2) + ']]', 'ΔL = ' + F(dL) + ' m = **' + F(dL * 1000) + ' mm**'] };
    return { t: 'num', q: 'A **' + Fp + ' N** tension acts on a wire of diameter **' + d * 1000 + ' mm**. What is the tensile stress (in MPa)?', a: Fp / A / 1e6, unit: 'MPa', steps: ['A = π(d/2)² = ' + F(A) + ' m²', 'σ = F/A = ' + F(Fp / A) + ' Pa = **' + F(Fp / A / 1e6) + ' MPa**'] };
  });

  /* ================= Unit 9 ================= */
  const u9 = U('p9', 'Rotation', { sub: 'Angular motion & moment of inertia', ch: 'Ch 9' }, [
    L('p9l1', 'Angular Variables', {
      goal: 'Work fluently in radians with θ, ω and α.',
      key: 'Measure angles in radians: $θ = s/r$, and one revolution = 2π rad = 360°. Angular velocity is $ω = dθ/dt$ (rad/s) and angular acceleration is $α = dω/dt$ (rad/s²). To convert rpm to rad/s, multiply by 2π/60. Period $T = 2π/ω$. Every point on a rigid body has the same θ, ω and α.',
      formulas: ['θ = s/r (radians)', 'ω = [[dθ|dt]]   ·   α = [[dω|dt]]', '1 rev = 2π rad   ·   rpm × [[2π|60]] = rad/s'],
    }, [
      T('Rotation has its own Big Four', `
Every quantity in linear motion has a rotational twin:
| Linear | Rotational |
|---|---|
| x (m) | θ (rad) |
| v (m/s) | ω (rad/s) |
| a (m/s²) | α (rad/s²) |
**Radians** are defined by arc length: $θ = s/r$. One full turn is $2π$ rad.
>! Use radians in every rotation formula. Formulas like v = rω only work in radians.
>* Every point on a spinning rigid body shares the same θ, ω and α. What differs from point to point is the linear speed v.`),
      MC('How many radians are in one full revolution?', ['2π', 'π', '360', '1'], '360° = 2π rad.'),
      G('p.rot.conv'),
      MC('Two kids ride a merry-go-round, one near the center and one at the edge. Which has the larger angular speed ω?', ['They have the same ω', 'The one at the edge', 'The one near the center', 'It depends on their masses'], 'A rigid body rotates as one piece, so ω is the same everywhere. Linear speed differs.'),
      G('p.rot.conv'),
      TF('A wheel spinning at 60 rpm has an angular speed of 2π rad/s.', true, '60 rev/min = 1 rev/s = 2π rad/s.'),
      G('p.rot.conv'),
    ]),
    L('p9l2', 'Constant Angular Acceleration', {
      goal: 'Solve rotation problems with the rotational Big Four.',
      key: 'With constant α, the linear kinematics equations carry over directly with x → θ, v → ω, a → α: $ω = ω₀ + αt$, $θ = ω₀t + ½αt²$, $ω² = ω₀² + 2αΔθ$, $Δθ = ½(ω₀ + ω)t$. Same strategy: pick the equation missing the variable you don\'t need. Revolutions = θ/2π.',
      formulas: ['ω = ω₀ + αt', 'θ = ω₀t + ½αt²', 'ω² = ω₀² + 2αΔθ', 'Δθ = ½(ω₀ + ω)t'],
    }, [
      T('Same equations, new letters', `
$$ ω = ω₀ + αt   ·   Δθ = ω₀t + ½αt² $$
$$ ω² = ω₀² + 2αΔθ   ·   Δθ = ½(ω₀ + ω)t $$
Same strategy as Unit 2: list the variables, find the one you don't need, and pick the equation without it.
>! Answers come out in **radians**. If the question asks for revolutions, divide by 2π at the end.`),
      EX('Spinning down', 'A ceiling fan at 12 rad/s is switched off and stops in 8.0 s. How many revolutions does it make while stopping?', ['α = (0 − 12)/8.0 = −1.5 rad/s²', 'Δθ = ½(ω₀ + ω)t = ½(12 + 0)(8.0) = 48 rad', 'Revolutions = 48/2π = **7.6 rev**']),
      MATCH('Match each linear quantity to its rotational partner.', [['x', 'θ'], ['v', 'ω'], ['a', 'α'], ['v² = v₀² + 2aΔx', 'ω² = ω₀² + 2αΔθ']]),
      G('p.rot.kin'),
      G('p.rot.kin'),
      MC('You know ω₀, ω and Δθ and want α. Which equation?', ['ω² = ω₀² + 2αΔθ', 'ω = ω₀ + αt', 'Δθ = ½(ω₀ + ω)t', 'Δθ = ω₀t + ½αt²'], 'Time isn\'t involved, so use the one without t.'),
      G('p.rot.kin'),
    ]),
    L('p9l3', 'Linking Linear & Angular', {
      goal: 'Convert between a point\'s linear motion and the body\'s rotation.',
      key: 'For a point at distance r from the axis: $v = rω$, tangential acceleration $a_{tan} = rα$, and radial (centripetal) acceleration $a_{rad} = ω²r = v²/r$. The two acceleration components are perpendicular: $a = √{a_{tan}² + a_{rad}²}$. A belt or rope that doesn\'t slip has the same linear speed at every point, which is how gears and pulleys link ω₁r₁ = ω₂r₂.',
      formulas: ['v = rω', 'a_{tan} = rα', 'a_{rad} = ω²r = [[v²|r]]'],
    }, [
      T('Farther out moves faster', `
A point at distance r from the axis moves on a circle:
$$ v = rω   ·   a_{tan} = rα   ·   a_{rad} = ω²r $$
- a_tan changes the point's **speed**, and only exists if α ≠ 0
- a_rad changes its **direction**, and exists whenever ω ≠ 0
>* Belts and chains: a non-slipping belt moves at the same linear speed on both pulleys, so $ω₁r₁ = ω₂r₂$. Smaller pulleys spin faster.`, { fig: D.disk() }),
      EX('Bike wheel', 'A bike wheel of radius 0.35 m turns at 20 rad/s. How fast is the bike moving (rolling without slipping)?', ['v = rω = 0.35 × 20 = **7.0 m/s**', 'The rim\'s centripetal acceleration: ω²r = 400 × 0.35 = 140 m/s²']),
      G('p.rot.link'),
      MC('A small pulley (r = 5 cm) drives a large one (r = 20 cm) with a belt. If the small pulley spins at 40 rad/s, the large one spins at…', ['10 rad/s', '40 rad/s', '160 rad/s', '20 rad/s'], 'Same belt speed: ω₁r₁ = ω₂r₂ → ω₂ = 40 × 5/20 = 10 rad/s.', { lvl: 2 }),
      G('p.rot.link'),
      TF('A point on a wheel spinning at constant ω has zero acceleration.', false, 'It still has centripetal acceleration ω²r.'),
      G('p.rot.link'),
    ]),
    L('p9l4', 'Rotational KE & Moment of Inertia', {
      goal: 'Compute I for standard shapes and point masses, and use K = ½Iω².',
      key: 'Moment of inertia $I = Σmr²$ is the rotational version of mass. It depends on how far the mass sits from the axis, so the same object has different I about different axes. Standard shapes: hoop MR², solid disk ½MR², solid sphere ⅖MR², thin shell ⅔MR², rod about its center [[1|12]]ML², rod about an end ⅓ML². Parallel-axis theorem: $I = I_{cm} + Md²$. Rotational KE is $K = ½Iω²$.',
      formulas: ['I = Σmᵢrᵢ²', 'K_{rot} = ½Iω²', 'I = I_{cm} + Md²', 'hoop MR² · disk ½MR² · sphere ⅖MR²'],
    }, [
      T('Mass far from the axis is hard to spin', `
$$ I = Σ mᵢ rᵢ² :: units kg·m² $$
Mass far from the axis counts a lot (r²). That's why a tightrope walker carries a long pole.
| Shape (about center) | I |
|---|---|
| thin hoop | MR² |
| solid disk / cylinder | ½MR² |
| solid sphere | ⅖MR² |
| thin spherical shell | ⅔MR² |
| rod, axis at center | [[1|12]]ML² |
| rod, axis at end | ⅓ML² |
$$ K_{rot} = ½ I ω² :: rotational kinetic energy $$`),
      T('Moving the axis: the parallel-axis theorem', `
If you know I about the center of mass, then about any parallel axis a distance d away:
$$ I = I_{cm} + Md² $$
Rod example: $I_{end} = [[1|12]]ML² + M(L/2)² = ⅓ML²$ ✓
>! I_cm is always the **smallest** I for a given direction of axis. Moving the axis anywhere else adds Md².`),
      MC('A hoop and a solid disk have the same mass and radius. Which has the larger moment of inertia about its center?', ['The hoop', 'The disk', 'They are equal', 'It depends on how fast they spin'], 'All the hoop\'s mass sits at r = R, while the disk\'s is spread inward.'),
      G('p.I'),
      G('p.I.points'),
      TF('An object has a single moment of inertia, whatever axis it rotates about.', false, 'I depends on the axis. A rod is 4× harder to spin about its end than about its center.'),
      G('p.KErot'),
      G('p.parallel'),
    ]),
  ]);

  /* ================= Unit 10 ================= */
  const u10 = U('p10', 'Rotational Dynamics', { sub: 'Torque, rolling & angular momentum', ch: 'Ch 10' }, [
    L('p10l1', 'Torque', {
      goal: 'Compute torque from force, lever arm and angle, with the right sign.',
      key: 'Torque is the turning effect of a force: $τ = rF sin φ = F·l$, where the lever arm $l = r sin φ$ is the perpendicular distance from the axis to the force\'s line of action. Vector form: $vec{τ} = vec{r} × vec{F}$. Sign convention: counterclockwise +, clockwise −. A force aimed straight through the axis gives zero torque. Units: N·m (not joules).',
      formulas: ['τ = rF sin φ', 'τ = F × (lever arm)', 'vec{τ} = vec{r} × vec{F}'],
    }, [
      T('Turning power', `
$$ τ = rF sin φ :: φ = angle between vec{r} and vec{F} $$
Three ways to get more torque: push **harder**, push **farther** from the axis, push more **perpendicular**.
Another way to write it: τ = F × (lever arm), where the lever arm is the perpendicular distance from the axis to the line of the force.
>* Counterclockwise = positive, clockwise = negative. Add torques with their signs.
>! A force pointing straight at the axis (φ = 0) produces **no** torque, however strong it is.`, { fig: D.torque({ deg: 60 }) }),
      EX('Stubborn bolt', 'You need 60 N·m to loosen a bolt. With a 0.30 m wrench, what is the minimum force, and when?', ['τ is maximum when F ⊥ wrench (sin 90° = 1)', 'F = τ/r = 60/0.30 = **200 N**, pushing perpendicular to the handle']),
      MC('Why are door handles placed far from the hinges?', ['A larger lever arm gives more torque for the same force', 'It reduces the door\'s moment of inertia', 'It makes the force more perpendicular', 'It reduces friction in the hinges'], 'τ = rF sin φ, so larger r means more torque.'),
      G('p.torque'),
      G('p.torque.net'),
      TF('A force directed straight toward the rotation axis produces maximum torque.', false, 'φ = 0 → sin 0 = 0 → no torque.'),
      G('p.torque'),
    ]),
    L('p10l2', 'Στ = Iα', {
      goal: 'Use Newton\'s second law for rotation, including pulley problems where the pulley has mass.',
      key: 'Rotational second law: $Στ = Iα$. For systems that mix rotation and translation (a mass hanging from a pulley that has mass), write ΣF = ma for each translating object, Στ = Iα for each rotating one, and link them with the no-slip condition $a = Rα$. A massive pulley makes the tensions on its two sides different.',
      formulas: ['Στ = Iα', 'no slip: a = Rα', 'disk pulley + hanging m: a = [[mg|m + M/2]]'],
    }, [
      T('Torque causes angular acceleration', `
$$ Στ = I α :: the rotational version of ΣF = ma $$
For pulley problems where the pulley has mass:
1. Hanging object: $mg − T = ma$
2. Pulley: $TR = Iα$
3. String doesn't slip: $a = Rα$
>! A massive pulley has **different tensions** on its two sides. The difference in tension is what spins it.`),
      EX('Heavy pulley', 'A 2.0 kg mass hangs from a rope wrapped around a 4.0 kg solid-disk pulley. Find a.', ['Mass: 2.0(9.8) − T = 2.0a', 'Pulley: TR = ½(4.0)R²(a/R) → T = 2.0a', 'Add: 19.6 = 4.0a → a = **4.9 m/s²** (half of g)']),
      G('p.alpha'),
      MC('Equal torques are applied to a hoop and a solid disk with the same M and R. Which spins up faster?', ['The disk, because it has the smaller I', 'The hoop', 'They\'re equal', 'Neither will spin'], 'α = τ/I and I_disk = ½MR² < I_hoop = MR².'),
      G('p.pulleymass'),
      TF('If a pulley has mass, the tension in the rope is the same on both sides of it.', false, 'The difference in tension creates the net torque that spins the pulley.'),
      G('p.pulleymass'),
    ]),
    L('p10l3', 'Rolling', {
      goal: 'Handle rolling without slipping, with energy and with forces.',
      key: 'Rolling without slipping: $v_{cm} = Rω$, and the contact point is momentarily at rest. Total KE = translational + rotational: $K = ½Mv² + ½I_{cm}ω²$. Down a ramp from rest with $I = cMR²$: $v = √{2gh/(1 + c)}$, so a lower c wins the race: sphere (⅖) beats cylinder (½), which beats hoop (1). Mass and radius cancel. Static friction does no work in pure rolling.',
      formulas: ['v_{cm} = Rω', 'K = ½Mv² + ½Iω²', 'v = √{[[2gh|1 + c]]}, I = cMR²'],
    }, [
      T('Rolling = sliding + spinning', `
A wheel rolling without slipping moves forward and spins at the same time, linked by
$$ v_{cm} = Rω $$
Its kinetic energy has two parts:
$$ K = ½Mv_{cm}² + ½I_{cm}ω² $$
Rolling down a height h, with $I = cMR²$:
$$ v = √{[[2gh|1 + c]]} $$
>* **The race:** sphere (c = ⅖) beats cylinder (½), which beats hoop (1). Mass and radius don't matter, only the shape.
>! Static friction makes it roll but does **no work**, because the contact point doesn't slide.`, { fig: D.roll() }),
      EX('Solid ball down a hill', 'A solid ball rolls from rest down a 2.0 m high hill. Find v at the bottom.', ['c = ⅖ for a solid sphere', 'v = √(2gh/(1 + 0.4)) = √(39.2/1.4) = **5.29 m/s**', 'Compare a frictionless slide: √(2gh) = 6.26 m/s']),
      MC('A hoop, a solid cylinder and a solid sphere race down a ramp from rest. Which reaches the bottom first?', ['The solid sphere', 'The hoop', 'The solid cylinder', 'They tie'], 'Smallest I/MR² means the least energy goes into spin, so the most goes into speed.'),
      G('p.roll'),
      TF('In rolling without slipping, the point of the wheel touching the ground is momentarily at rest.', true, 'v_contact = v_cm − Rω = 0.'),
      MC('A solid cylinder rolls without slipping. What fraction of its total kinetic energy is rotational?', ['⅓', '½', '¼', '⅔'], 'K_rot = ½(½MR²)(v/R)² = ¼Mv², K_trans = ½Mv². So K_rot/K_total = ¼/(¾) = ⅓.', { lvl: 3 }),
      G('p.roll'),
    ]),
    L('p10l4', 'Rotational Work & Power', {
      goal: 'Use W = τΔθ and P = τω.',
      key: 'Work done by a torque: $W = τΔθ$ (constant τ) or $∫τ dθ$. Rotational work–energy: $W_{net} = Δ(½Iω²)$. Power: $P = τω$, which is how engines are rated: same power, more torque at lower rpm. Convert rpm to rad/s before using it.',
      formulas: ['W = τΔθ', 'P = τω', 'W_{net} = ½Iω₂² − ½Iω₁²'],
    }, [
      T('Torque × angle = work', `
$$ W = τ Δθ   ·   P = τ ω $$
The rotational twins of W = Fd and P = Fv.
>> A car engine making 300 N·m at 4000 rpm (419 rad/s) produces P = 300 × 419 ≈ 126 kW ≈ 169 hp. Gears trade ω for τ at (nearly) the same power, which you'll see again in MECH 1208.`),
      EX('Spinning up a flywheel', 'A constant 20 N·m torque spins a flywheel (I = 0.50 kg·m²) from rest through 10 revolutions. Find its final ω.', ['W = τΔθ = 20 × (10 × 2π) = 1257 J', '½Iω² = 1257 → ω = √(2 × 1257/0.50) = **70.9 rad/s**']),
      G('p.rotpower'),
      MC('An engine has the same power output at two speeds. At the lower rpm its torque is…', ['higher', 'lower', 'the same', 'zero'], 'P = τω is fixed, so smaller ω means larger τ.'),
      G('p.rotpower'),
      TF('In P = τω, ω can be plugged in directly in rpm.', false, 'Use rad/s.'),
      NUM('A constant **15 N·m** torque turns a wheel through **5.0 revolutions**. How much work does it do?', 15 * 10 * Math.PI, 'J', 'W = τΔθ with Δθ in radians: 5.0 rev × 2π = 31.4 rad, so W = 15 × 31.4 = 471 J.', { hint: 'Convert revolutions to radians first.', steps: ['Δθ = 5.0 × 2π = 31.4 rad', 'W = τΔθ = 15 × 31.4 = **471 J**'] }),
    ]),
    L('p10l5', 'Angular Momentum', {
      goal: 'Use L = Iω and conservation of angular momentum.',
      key: 'Angular momentum: $L = Iω$ for a rigid body, and $vec{L} = vec{r} × vec{p}$ for a particle. Newton\'s law for rotation is really $Στ = dL/dt$. With zero net external torque, L is conserved: $I₁ω₁ = I₂ω₂$. Pulling mass inward lowers I and raises ω (spinning skater, diver tucking). Kinetic energy is usually NOT conserved when I changes.',
      formulas: ['L = Iω', 'Στ_{ext} = [[dL|dt]]', 'I₁ω₁ = I₂ω₂ (no external torque)'],
    }, [
      T('Spin is conserved', `
$$ L = I ω   ·   Στ_{ext} = [[dL|dt]] $$
If no external torque acts, **L stays constant**:
$$ I₁ω₁ = I₂ω₂ $$
>> A figure skater pulls in her arms: I drops, so ω shoots up. A diver tucks to flip faster, then opens up to slow down before entering the water.
>! Kinetic energy ½Iω² is **not** conserved here. The skater does work with her muscles pulling her arms in.`),
      EX('Skater spin-up', 'A skater spins at 2.0 rev/s with I = 4.0 kg·m², then pulls in her arms to I = 1.6 kg·m². Find her new spin rate.', ['L conserved: 4.0 × 2.0 = 1.6 × ω₂', 'ω₂ = **5.0 rev/s**']),
      G('p.L'),
      MC('A diver tucks into a ball during a dive. Her angular speed…', ['increases because I decreases', 'decreases because I decreases', 'stays the same', 'increases because L increases'], 'L = Iω is conserved in the air, so smaller I means larger ω.'),
      TF('When a spinning skater pulls in her arms, her rotational kinetic energy stays the same.', false, 'K = L²/2I, so smaller I means larger K. Her muscles supply the extra energy.'),
      G('p.L'),
      G('p.L'),
    ]),
  ]);

  /* ================= Unit 11 ================= */
  const u11 = U('p11', 'Equilibrium & Elasticity', { sub: 'Balancing forces and torques, stress & strain', ch: 'Ch 11' }, [
    L('p11l1', 'Conditions for Equilibrium', {
      goal: 'State the two equilibrium conditions and balance a seesaw.',
      key: 'A rigid body in static equilibrium needs BOTH $ΣF = 0$ (no linear acceleration) AND $Στ = 0$ about ANY axis (no angular acceleration). Weight acts at the center of gravity, which is the center of the body for a uniform object. Seesaw balance: $m₁d₁ = m₂d₂$. If Στ = 0 about one point and ΣF = 0, then Στ = 0 about every point, so you can pick whichever pivot is easiest.',
      formulas: ['ΣFₓ = 0, ΣFᵧ = 0', 'Στ = 0 (about any point)', 'seesaw: m₁d₁ = m₂d₂'],
    }, [
      T('Two conditions, not one', `
For an object to stay completely at rest:
$$ Σvec{F} = 0   ·   Στ = 0 $$
A pair of equal and opposite forces that don't line up (a *couple*) has ΣF = 0 but still spins the object, so the torque condition matters too.
>* For a body in equilibrium, Στ = 0 about **every** point, so you choose the pivot. Put it where an unknown force acts, and that force drops out of the torque equation.`, { fig: D.beam({ supports: [{ x: 0.5, type: 'fulcrum' }], loads: [{ x: 0.18, label: 'm₁g' }, { x: 0.74, label: 'm₂g', cls: 'c4' }] }) }),
      MC('Two equal and opposite forces act at opposite ends of a ruler, perpendicular to it. The ruler…', ['has no net force but starts to rotate', 'stays in equilibrium', 'accelerates in a straight line', 'has a net force but no torque'], 'ΣF = 0 but Στ ≠ 0. That pair is called a couple.'),
      G('p.seesaw'),
      TF('In equilibrium, you can compute torques about any point you like.', true, 'If ΣF = 0, the torque sum is the same about every point.'),
      G('p.seesaw'),
      FILL('A body is in static equilibrium only if the net ___ is zero and the net ___ is zero.', ['force', 'torque'], ['velocity', 'momentum', 'energy'], 'Both conditions are needed.'),
    ]),
    L('p11l2', 'Beams, Ladders & Struts', {
      goal: 'Solve multi-force equilibrium problems with a smart choice of pivot.',
      key: 'Recipe: draw the FBD with the weight at the center of gravity. Pick the pivot at the point with the most unknowns. Write Στ = 0 there to get one unknown, then use ΣFₓ = 0 and ΣFᵧ = 0 for the rest. Ladder on a frictionless wall: the wall force is horizontal, so floor friction = wall force = $w/(2 tan θ)$ for a uniform ladder, and lower angles need more friction.',
      formulas: ['pivot at the unknown force → it drops out', 'ladder: f = n_{wall} = [[w|2 tan θ]]'],
    }, [
      T('The smart-pivot recipe', `
1. FBD: every force, with the weight at the center of gravity
2. Choose the pivot where an **unknown** force acts
3. Στ = 0 about that pivot gives the other unknown
4. ΣFₓ = 0 and ΣFᵧ = 0 give the rest
>! Lever arms are **perpendicular** distances. For a ladder at angle θ, the weight's lever arm about the base is (L/2) cos θ, not L/2.`, { fig: D.ladder({ deg: 60 }) }),
      EX('Plank on two supports', 'A 6.0 m, 300 N uniform plank rests on supports at its ends. A 600 N painter stands 2.0 m from the left end. Find both support forces.', ['Pivot at left (A): n_B(6.0) − 300(3.0) − 600(2.0) = 0', 'n_B = 2100/6.0 = **350 N**', 'ΣFᵧ: n_A = 900 − 350 = **550 N**. The support nearer the painter carries more.']),
      G('p.beam'),
      MC('A ladder leans against a frictionless wall. As you lower its angle (closer to the floor), the friction force needed at the floor…', ['increases', 'decreases', 'stays the same', 'drops to zero'], 'f = w/(2 tan θ). Smaller θ means smaller tan θ, so larger f.'),
      G('p.ladder'),
      TF('Choosing the pivot at a support makes that support\'s force drop out of the torque equation.', true, 'Its lever arm is zero.'),
      G('p.beam'),
    ]),
    L('p11l3', 'Stress, Strain & Young\'s Modulus', {
      goal: 'Compute stress, strain and elongation of loaded rods and wires.',
      key: 'Stress = force per area: $σ = F/A$ (Pa = N/m²). Strain = fractional deformation: $ε = ΔL/L₀$ (no units). In the elastic region, Hooke\'s law gives $σ = Yε$, where Y is Young\'s modulus (steel ≈ 200 GPa). Elongation: $ΔL = FL₀/(AY)$. Doubling the diameter quadruples A and quarters the stretch. Shear and bulk moduli work the same way for other kinds of deformation.',
      formulas: ['σ = F/A', 'ε = ΔL/L₀', 'Y = σ/ε', 'ΔL = [[FL₀|AY]]'],
    }, [
      T('How materials stretch', `
$$ σ = [[F|A]] :: stress (Pa) $$
$$ ε = [[ΔL|L₀]] :: strain (no units) $$
In the elastic (springy) region they're proportional:
$$ Y = [[σ|ε]]   ⇒   ΔL = [[F L₀|A Y]] $$
| Material | Y (GPa) |
|---|---|
| steel | 200 |
| copper | 110 |
| aluminum | 70 |
| bone | ~15 |
>! For a round wire, $A = π(d/2)²$. Doubling the **diameter** makes the area 4× and the stretch ¼.`),
      EX('Elevator cable', 'A steel cable (Y = 200 GPa) 50 m long with A = 2.0 cm² holds 10,000 N. How much does it stretch?', ['A = 2.0 × 10⁻⁴ m²', 'ΔL = FL₀/(AY) = (10⁴)(50)/((2.0×10⁻⁴)(2.0×10¹¹))', 'ΔL = **0.0125 m = 12.5 mm**']),
      G('p.stress'),
      MC('Two steel wires have the same length and load, but wire B has twice the diameter of wire A. Wire B stretches…', ['¼ as much', '½ as much', 'the same', '2 times as much'], 'Area ∝ d², so B has 4× the area and ¼ the stretch.', { lvl: 2 }),
      G('p.stress'),
      TF('Strain has units of meters.', false, 'Strain = ΔL/L₀, which is dimensionless.'),
      MATCH('Match the quantity to its units.', [['stress', 'Pa (N/m²)'], ['strain', 'none'], ['Young\'s modulus', 'Pa'], ['elongation ΔL', 'm']]),
    ]),
  ]);

  CQ.addUnits('phys', [u9, u10, u11]);
})();
