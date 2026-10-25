/* PHYS 2325 · Units 12–14: gravitation, periodic motion, mechanical waves (Young & Freedman Ch 13–15) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const g = 9.8;
  const D = CQ.dg;
  const PI = Math.PI;
  const Gc = 6.674e-11, ME = 5.97e24, RE = 6.37e6;

  /* ================= generators: Unit 12 ================= */
  CQ.gen('p.grav.F', (R) => {
    const m1 = R.pick([50, 70, 100, 1000, 5000]), m2 = R.pick([60, 80, 200, 2000]), r = R.pick([0.5, 1, 2, 5, 10]);
    const Fg = (Gc * m1 * m2) / (r * r);
    return { t: 'num', q: 'Two masses, **' + m1 + ' kg** and **' + m2 + ' kg**, are **' + r + ' m** apart (center to center). What is the gravitational force between them? (G = 6.674 × 10⁻¹¹ N·m²/kg²)', a: Fg, unit: 'N',
      steps: ['F = [[Gm₁m₂|r²]]', '= [[(6.674×10⁻¹¹)(' + m1 + ')(' + m2 + ')|' + r + '²]]', 'F = **' + F(Fg) + ' N**, tiny for everyday masses'] };
  });

  CQ.gen('p.grav.ratio', (R) => {
    const k = R.pick([2, 3, 4, 0.5]), mk = R.pick([1, 2, 3]);
    const factor = mk / (k * k);
    return { t: 'mc', lvl: 2, q: 'Two asteroids attract each other with force F. If one asteroid\'s mass is multiplied by **' + mk + '** and the distance between them is multiplied by **' + k + '**, the new force is…',
      opts: CQ.numOpts(factor, [mk / k, mk * k * k, mk / k / k / k, 1 / (k * k)], 3, '× F'),
      steps: ['F ∝ m₁m₂/r²', 'New F = (' + mk + ')/(' + k + ')² × F = **' + F(factor) + ' F**'], why: 'Inverse-square: doubling the distance cuts the force to ¼.' };
  });

  CQ.gen('p.grav.g', (R) => {
    const k = R.int(0, 1);
    if (k === 0) {
      const h = R.pick([400, 1000, 6370, 20000, 36000]) * 1000;
      const gg = (Gc * ME) / ((RE + h) ** 2);
      return { t: 'num', q: 'What is the gravitational acceleration at an altitude of **' + F(h / 1000, 4) + ' km** above Earth\'s surface? (M_E = 5.97 × 10²⁴ kg, R_E = 6370 km)', a: gg, unit: 'm/s²',
        steps: ['g = [[GM_E|(R_E + h)²]]', 'r = ' + F(RE + h) + ' m', 'g = **' + F(gg) + ' m/s²**'], why: h === 400000 ? 'At the ISS altitude g is still about 90% of its surface value. Astronauts float because they\'re in free fall, not because gravity is gone.' : '' };
    }
    const mf = R.pick([0.1, 0.5, 2, 3]), rf = R.pick([0.5, 1, 2]);
    return { t: 'num', q: 'A planet has **' + mf + '×** Earth\'s mass and **' + rf + '×** Earth\'s radius. What is g at its surface? (Earth: 9.80 m/s²)', a: (g * mf) / (rf * rf), unit: 'm/s²',
      steps: ['g = GM/R² ∝ M/R²', 'g = 9.80 × ' + mf + '/' + rf + '² = **' + F((g * mf) / (rf * rf)) + ' m/s²**'] };
  });

  CQ.gen('p.escape', (R) => {
    const pl = R.pick([['Earth', 5.97e24, 6.37e6], ['the Moon', 7.35e22, 1.74e6], ['Mars', 6.42e23, 3.39e6], ['Jupiter', 1.9e27, 6.99e7]]);
    const v = Math.sqrt((2 * Gc * pl[1]) / pl[2]);
    return { t: 'num', q: 'What is the escape speed from the surface of **' + pl[0] + '**? (M = ' + F(pl[1]) + ' kg, R = ' + F(pl[2]) + ' m) Answer in km/s.', a: v / 1000, unit: 'km/s',
      steps: ['Escape: ½mv² − GMm/R = 0', 'v = √{2GM/R}', 'v = ' + F(v) + ' m/s = **' + F(v / 1000) + ' km/s**'], why: 'Escape speed doesn\'t depend on the mass of the rocket or the direction it\'s launched.' };
  });

  CQ.gen('p.gravU', (R) => {
    const m = R.pick([100, 500, 1000, 2000]), h = R.pick([300, 500, 1000, 3000]) * 1000;
    const dU = Gc * ME * m * (1 / RE - 1 / (RE + h));
    return { t: 'num', lvl: 4, q: 'How much energy (in J) does it take to lift a **' + m + ' kg** satellite from Earth\'s surface to an altitude of **' + h / 1000 + ' km** (just the change in gravitational PE)?', a: dU, unit: 'J',
      hint: 'Use U = −GMm/r, not mgh. g changes over this distance.',
      steps: ['ΔU = GM_Em([[1|R_E]] − [[1|R_E + h]])', '= (6.674×10⁻¹¹)(5.97×10²⁴)(' + m + ')([[1|' + F(RE) + ']] − [[1|' + F(RE + h) + ']])', 'ΔU = **' + F(dU) + ' J**'] };
  });

  CQ.gen('p.orbit', (R) => {
    const h = R.pick([300, 400, 800, 2000, 20200, 35800]) * 1000, r = RE + h;
    const v = Math.sqrt((Gc * ME) / r), Tp = (2 * PI * r) / v;
    const want = R.pick(['v', 'T']);
    return { t: 'num', lvl: want === 'T' ? 4 : 3, q: 'A satellite orbits Earth in a circle at an altitude of **' + F(h / 1000, 4) + ' km**. ' + (want === 'v' ? 'What is its orbital speed (in km/s)?' : 'What is its orbital period (in hours)?'), a: want === 'v' ? v / 1000 : Tp / 3600, unit: want === 'v' ? 'km/s' : 'h',
      fig: D.orbit(),
      steps: ['Gravity supplies the centripetal force: GMm/r² = mv²/r', 'r = R_E + h = ' + F(r) + ' m', 'v = √{GM/r} = ' + F(v) + ' m/s', ...(want === 'v' ? ['v = **' + F(v / 1000) + ' km/s**'] : ['T = 2πr/v = ' + F(Tp) + ' s = **' + F(Tp / 3600) + ' h**'])] };
  });

  CQ.gen('p.kepler', (R) => {
    const k = R.pick([2, 4, 9]);
    const Tr = Math.pow(k, 1.5);
    return { t: 'num', q: 'Planet B orbits a star at **' + k + ' times** the orbital radius of planet A. How many times longer is B\'s orbital period?', a: Tr, unit: '× T_A',
      steps: ['Kepler\'s third law: T² ∝ r³', 'T_B/T_A = (' + k + ')^{3/2} = **' + F(Tr) + '**'] };
  });

  /* ================= generators: Unit 13 ================= */
  CQ.gen('p.shm.basic', (R) => {
    const m = R.pick([0.2, 0.5, 1, 2, 4]), k = R.pick([20, 50, 80, 100, 200, 500]);
    const w = Math.sqrt(k / m);
    const want = R.pick(['w', 'f', 'T']);
    const val = want === 'w' ? w : want === 'f' ? w / (2 * PI) : (2 * PI) / w;
    return { t: 'num', q: 'A **' + m + ' kg** mass on a spring with **k = ' + k + ' N/m** oscillates. What is its ' + (want === 'w' ? 'angular frequency ω' : want === 'f' ? 'frequency f' : 'period T') + '?', a: val, unit: want === 'w' ? 'rad/s' : want === 'f' ? 'Hz' : 's',
      fig: D.spring({ x: 160, eq: 190 }),
      steps: ['ω = √{k/m} = √{' + k + '/' + m + '} = ' + F(w) + ' rad/s', ...(want === 'f' ? ['f = ω/2π = **' + F(val) + ' Hz**'] : want === 'T' ? ['T = 2π/ω = 2π√{m/k} = **' + F(val) + ' s**'] : ['ω = **' + F(w) + ' rad/s**'])] };
  });

  CQ.gen('p.shm.max', (R) => {
    const A = R.pick([0.02, 0.05, 0.1, 0.15]), w = R.pick([5, 10, 12, 20, 30]);
    const want = R.pick(['v', 'a']);
    return { t: 'num', q: 'An object in SHM has amplitude **' + A * 100 + ' cm** and angular frequency **' + w + ' rad/s**. What is its maximum ' + (want === 'v' ? 'speed' : 'acceleration') + '?', a: want === 'v' ? A * w : A * w * w, unit: want === 'v' ? 'm/s' : 'm/s²',
      steps: [want === 'v' ? 'v_max = ωA (at equilibrium, x = 0)' : 'a_max = ω²A (at the turning points, x = ±A)', '= ' + (want === 'v' ? w + ' × ' + A : w + '² × ' + A) + ' = **' + F(want === 'v' ? A * w : A * w * w) + (want === 'v' ? ' m/s' : ' m/s²') + '**'] };
  });

  CQ.gen('p.shm.x', (R) => {
    const A = R.pick([0.05, 0.1, 0.2]), w = R.pick([2, 3, 4, 5]), t = R.pick([0.2, 0.3, 0.5, 0.8, 1]);
    const want = R.pick(['x', 'v']);
    const x = A * Math.cos(w * t), v = -A * w * Math.sin(w * t);
    return { t: 'num', lvl: 4, q: 'A block oscillates with **x(t) = (' + A + ' m) cos(' + w + 't)** (t in s). What is its ' + (want === 'x' ? 'position' : 'velocity') + ' at t = ' + t + ' s?', a: want === 'x' ? x : v, unit: want === 'x' ? 'm' : 'm/s', abs: 0.002,
      hint: 'Put your calculator in RADIANS. ωt is in radians.',
      steps: want === 'x' ? ['ωt = ' + w + ' × ' + t + ' = ' + F(w * t) + ' rad', 'x = ' + A + ' cos(' + F(w * t) + ') = **' + F(x) + ' m**'] : ['v = dx/dt = −Aω sin(ωt)', 'ωt = ' + F(w * t) + ' rad', 'v = −' + A + '(' + w + ') sin(' + F(w * t) + ') = **' + F(v) + ' m/s**'],
      why: 'Calculator in degrees is the #1 way to lose points on SHM questions.' };
  });

  CQ.gen('p.shm.E', (R) => {
    const k = R.pick([50, 100, 200, 400]), A = R.pick([0.05, 0.1, 0.2]), m = R.pick([0.5, 1, 2]);
    const xf = R.pick([0.5, 0.6, 0.8]);
    const want = R.pick(['E', 'v']);
    const E = 0.5 * k * A * A, x = xf * A, v = Math.sqrt(k / m) * Math.sqrt(A * A - x * x);
    if (want === 'E') return { t: 'num', q: 'A spring (**k = ' + k + ' N/m**) oscillates with amplitude **' + A * 100 + ' cm**. What is the total mechanical energy?', a: E, unit: 'J', steps: ['At x = ±A, all the energy is spring PE', 'E = ½kA² = ½(' + k + ')(' + A + ')² = **' + F(E) + ' J**'] };
    return { t: 'num', lvl: 4, q: 'A **' + m + ' kg** mass on a **k = ' + k + ' N/m** spring oscillates with amplitude **' + A * 100 + ' cm**. How fast is it moving when it is **' + F(x * 100) + ' cm** from equilibrium?', a: v, unit: 'm/s',
      steps: ['Energy: ½kA² = ½mv² + ½kx²', 'v = √{k/m} √{A² − x²}', '= ' + F(Math.sqrt(k / m)) + ' × √(' + A + '² − ' + F(x) + '²) = **' + F(v) + ' m/s**'] };
  });

  CQ.gen('p.pend', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const L2 = R.pick([0.25, 0.5, 1, 1.5, 2, 4]); return { t: 'num', q: 'What is the period of a simple pendulum of length **' + L2 + ' m** (small swings)?', a: 2 * PI * Math.sqrt(L2 / g), unit: 's', fig: D.pendulum({ deg: 20 }), steps: ['T = 2π√{L/g} = 2π√{' + L2 + '/9.8}', 'T = **' + F(2 * PI * Math.sqrt(L2 / g)) + ' s**'] }; }
    if (k === 1) { const Tt = R.pick([1, 1.5, 2, 3]); return { t: 'num', q: 'How long must a simple pendulum be to have a period of **' + Tt + ' s**?', a: g * (Tt / (2 * PI)) ** 2, unit: 'm', steps: ['T = 2π√{L/g} → L = g(T/2π)²', 'L = 9.8 × (' + Tt + '/2π)² = **' + F(g * (Tt / (2 * PI)) ** 2) + ' m**'] }; }
    const L2 = R.pick([0.5, 0.8, 1, 1.2]);
    const Tt = 2 * PI * Math.sqrt((2 * L2) / (3 * g));
    return { t: 'num', lvl: 4, q: 'A uniform rod of length **' + L2 + ' m** swings as a physical pendulum, pivoted at one end. What is its period for small swings?', a: Tt, unit: 's',
      steps: ['Physical pendulum: T = 2π√{I/(mgd)}', 'I = ⅓mL², d = L/2', 'T = 2π√{2L/(3g)} = **' + F(Tt) + ' s**'] };
  });

  /* ================= generators: Unit 14 ================= */
  CQ.gen('p.wave.v', (R) => {
    const f = R.pick([2, 5, 50, 256, 440, 1000]), lam = R.pick([0.2, 0.5, 0.78, 1.2, 3]);
    const k = R.int(0, 2);
    const v = f * lam;
    if (k === 0) return { t: 'num', q: 'A wave has frequency **' + f + ' Hz** and wavelength **' + lam + ' m**. What is its speed?', a: v, unit: 'm/s', steps: ['v = fλ = ' + f + ' × ' + lam + ' = **' + F(v) + ' m/s**'] };
    if (k === 1) return { t: 'num', q: 'Sound travels at **343 m/s** in air. What is the wavelength of a **' + f + ' Hz** tone?', a: 343 / f, unit: 'm', steps: ['λ = v/f = 343/' + f + ' = **' + F(343 / f) + ' m**'] };
    return { t: 'num', q: 'Ocean waves move at **' + F(v) + ' m/s** with crests **' + lam + ' m** apart. What is their period?', a: lam / v, unit: 's', steps: ['f = v/λ = ' + F(f) + ' Hz', 'T = 1/f = λ/v = **' + F(lam / v) + ' s**'] };
  });

  CQ.gen('p.wave.fn', (R) => {
    const A = R.pick([0.01, 0.02, 0.05]), k = R.pick([2, 3, 4, 5, 6.28]), w = R.pick([10, 20, 30, 50, 60]);
    const want = R.pick(['v', 'lam', 'f']);
    const val = want === 'v' ? w / k : want === 'lam' ? (2 * PI) / k : w / (2 * PI);
    return { t: 'num', q: 'A wave on a string is described by **y(x,t) = (' + A + ' m) cos(' + k + 'x − ' + w + 't)** (SI units). What is its ' + (want === 'v' ? 'speed' : want === 'lam' ? 'wavelength' : 'frequency') + '?', a: val, unit: want === 'v' ? 'm/s' : want === 'lam' ? 'm' : 'Hz',
      steps: ['Compare with y = A cos(kx − ωt): k = ' + k + ' rad/m, ω = ' + w + ' rad/s', want === 'v' ? 'v = ω/k = **' + F(val) + ' m/s**' : want === 'lam' ? 'λ = 2π/k = **' + F(val) + ' m**' : 'f = ω/2π = **' + F(val) + ' Hz**'],
      why: 'The minus sign in (kx − ωt) means the wave moves toward +x.' };
  });

  CQ.gen('p.wave.string', (R) => {
    const Ft = R.pick([20, 50, 80, 100, 200]), mu = R.pick([0.002, 0.005, 0.01, 0.02]);
    const v = Math.sqrt(Ft / mu);
    const k = R.int(0, 1);
    if (k === 0) return { t: 'num', q: 'A string with linear mass density **μ = ' + mu + ' kg/m** is under **' + Ft + ' N** of tension. How fast do waves travel on it?', a: v, unit: 'm/s', steps: ['v = √{F/μ} = √{' + Ft + '/' + mu + '} = **' + F(v) + ' m/s**'] };
    return { t: 'num', lvl: 3, q: 'You increase the tension in a guitar string from **' + Ft + ' N** to **' + 4 * Ft + ' N**. By what factor does the wave speed change?', a: 2, unit: '×', steps: ['v ∝ √F', '√(4) = **2**: the wave speed doubles'] };
  });

  CQ.gen('p.standing', (R) => {
    const L2 = R.pick([0.5, 0.65, 0.8, 1, 1.2]), v = R.pick([120, 200, 260, 300, 400]), n = R.pick([1, 2, 3, 4]);
    const f = (n * v) / (2 * L2);
    const kind = R.int(0, 1);
    if (kind === 0) return { t: 'num', q: 'A string **' + L2 + ' m** long is fixed at both ends, and waves travel on it at **' + v + ' m/s**. What is the frequency of the **' + (n === 1 ? 'fundamental (n = 1)' : 'n = ' + n + ' harmonic') + '**?', a: f, unit: 'Hz',
      fig: D.standing({ n }), steps: ['Fixed–fixed: λₙ = 2L/n', 'fₙ = n[[v|2L]] = ' + n + ' × [[' + v + '|2(' + L2 + ')]] = **' + F(f) + ' Hz**'] };
    const f1 = v / (2 * L2);
    return { t: 'num', lvl: 4, q: 'A string fixed at both ends has resonances at **' + F(n * f1) + ' Hz** and **' + F((n + 1) * f1) + ' Hz**, with no resonances in between. If the string is **' + L2 + ' m** long, what is the wave speed?', a: v, unit: 'm/s',
      hint: 'Adjacent harmonics differ by exactly the fundamental frequency.',
      steps: ['f₁ = difference between adjacent harmonics = ' + F(f1) + ' Hz', 'f₁ = v/2L → v = 2Lf₁ = 2(' + L2 + ')(' + F(f1) + ') = **' + F(v) + ' m/s**'] };
  });

  /* ================= Unit 12 ================= */
  const u12 = U('p12', 'Gravitation', { sub: 'Newton\'s law, orbits & escape speed', ch: 'Ch 13' }, [
    L('p12l1', 'Newton\'s Law of Gravitation', {
      goal: 'Use the inverse-square law and find g anywhere.',
      key: 'Every pair of masses attracts with $F = Gm₁m₂/r²$, where G = 6.674 × 10⁻¹¹ N·m²/kg² and r is center-to-center. It is inverse-square: double r and F drops to ¼. At distance r from a planet\'s center, $g = GM/r²$, so at altitude h, $g = GM/(R + h)²$. Inside a spherical shell the net pull is zero. Astronauts in orbit are weightless because they\'re in free fall, not because g = 0.',
      formulas: ['F = [[Gm₁m₂|r²]]', 'g = [[GM|r²]]', 'G = 6.674×10⁻¹¹ N·m²/kg²'],
    }, [
      T('One law for apples and moons', `
$$ F_g = [[G m₁ m₂|r²]] :: G = 6.674 × 10⁻¹¹ N·m²/kg² $$
- Always attractive, along the line between the centers
- **Inverse-square:** 2× the distance → ¼ the force
- r is measured **center to center**
Near a planet, the force on m is mg, so
$$ g = [[GM|r²]] $$
>! Astronauts on the ISS still feel about 90% of surface gravity. They float because they are **falling around** the Earth along with their station.`),
      EX('g on the ISS', 'Find g at 400 km altitude. (M_E = 5.97×10²⁴ kg, R_E = 6370 km)', ['r = 6370 + 400 = 6770 km = 6.77×10⁶ m', 'g = GM/r² = (6.674×10⁻¹¹)(5.97×10²⁴)/(6.77×10⁶)²', 'g = **8.69 m/s²**, about 89% of surface g']),
      G('p.grav.ratio'),
      G('p.grav.F'),
      TF('Astronauts aboard the ISS are weightless because there is no gravity at that altitude.', false, 'g is still about 8.7 m/s² there. They\'re in continuous free fall.'),
      G('p.grav.g'),
      G('p.grav.g'),
    ]),
    L('p12l2', 'Gravitational PE & Escape Speed', {
      goal: 'Use U = −GMm/r for large distances and find escape speed.',
      key: 'Far from the surface, use $U = −GMm/r$, which is zero at infinity and negative everywhere else. mgh only works near the surface. Lifting from r₁ to r₂ takes $ΔU = GMm(1/r₁ − 1/r₂)$. Escape speed, the minimum launch speed to reach infinity: $½mv² − GMm/R = 0$, so $v_{esc} = √{2GM/R}$. That\'s 11.2 km/s for Earth, and it doesn\'t depend on the rocket\'s mass.',
      formulas: ['U = −[[GMm|r]]', 'v_{esc} = √{[[2GM|R]]}', 'Earth: v_esc ≈ 11.2 km/s'],
    }, [
      T('Energy in a deep gravity well', `
$$ U = −[[GMm|r]] :: zero at r = ∞ $$
The minus sign means you're **bound**: you have to add energy to get to U = 0 (infinitely far away).
**Escape speed:** launch with just enough kinetic energy to reach infinity with nothing left over:
$$ ½mv² − [[GMm|R]] = 0   ⇒   v_{esc} = √{[[2GM|R]]} $$
>! mgh is the near-surface approximation of this. For altitudes comparable to Earth's radius, use −GMm/r.`),
      EX('Escape from Earth', 'Find Earth\'s escape speed. (M = 5.97×10²⁴ kg, R = 6.37×10⁶ m)', ['v = √(2GM/R) = √(2 × 6.674×10⁻¹¹ × 5.97×10²⁴ / 6.37×10⁶)', 'v = **1.12×10⁴ m/s ≈ 11.2 km/s** (about 40,000 km/h)']),
      MC('Escape speed from a planet depends on…', ['the planet\'s mass and radius only', 'the rocket\'s mass', 'the launch direction', 'the rocket\'s fuel type'], 'v = √(2GM/R). The rocket\'s mass cancels.'),
      G('p.escape'),
      TF('Gravitational potential energy U = −GMm/r is always negative for finite r.', true, 'With U = 0 at infinity, every bound position has U < 0.'),
      G('p.gravU'),
      G('p.escape'),
    ]),
    L('p12l3', 'Orbits & Kepler\'s Laws', {
      goal: 'Find orbital speed and period, and use Kepler\'s third law.',
      key: 'For a circular orbit, gravity supplies the centripetal force: $GMm/r² = mv²/r$, so $v = √{GM/r}$ and $T = 2πr^{3/2}/√{GM}$. Higher orbits are slower and have longer periods. The satellite\'s mass cancels. Kepler: (1) orbits are ellipses with the Sun at one focus, (2) equal areas in equal times, so planets move faster when closer, (3) $T² ∝ r³$. Geosynchronous orbit: T = 24 h, about 36,000 km up.',
      formulas: ['v = √{[[GM|r]]}', 'T = [[2πr^{3/2}|√{GM}]]', 'T² ∝ r³'],
    }, [
      T('Falling around the planet', `
In a circular orbit, gravity is the centripetal force:
$$ [[GMm|r²]] = [[mv²|r]]   ⇒   v = √{[[GM|r]]} $$
$$ T = [[2πr|v]] = [[2π r^{3/2}|√{GM}]] $$
**Kepler's laws:**
1. Orbits are ellipses with the Sun at a focus
2. A line from the Sun sweeps equal areas in equal times, so planets move faster near the Sun
3. $T² ∝ r³$
>* Higher orbit means **slower** speed and **longer** period. The Moon (384,000 km away) takes 27 days, while the ISS (6,770 km from Earth's center) takes 92 minutes.`, { fig: D.orbit() }),
      EX('ISS orbit', 'Find the speed and period of the ISS (r = 6.77×10⁶ m).', ['v = √(GM/r) = √(3.98×10¹⁴/6.77×10⁶) = 7.67 km/s', 'T = 2πr/v = 5546 s ≈ **92 minutes**']),
      G('p.orbit'),
      MC('A satellite moves to a higher circular orbit. Its orbital speed…', ['decreases', 'increases', 'stays the same', 'depends on its mass'], 'v = √(GM/r), so larger r means smaller v.'),
      G('p.kepler'),
      TF('According to Kepler\'s second law, a planet moves fastest when it is closest to the Sun.', true, 'Equal areas in equal times requires faster motion at smaller r.'),
      G('p.orbit'),
    ]),
  ]);

  /* ================= Unit 13 ================= */
  const u13 = U('p13', 'Periodic Motion', { sub: 'Springs, SHM & pendulums', ch: 'Ch 14' }, [
    L('p13l1', 'SHM Basics', {
      goal: 'Get ω, f and T for a mass on a spring.',
      key: 'Simple harmonic motion happens whenever the restoring force is proportional to displacement: $F = −kx$. For a mass on a spring, $ω = √{k/m}$, $f = ω/2π$ and $T = 1/f = 2π√{m/k}$. The period does NOT depend on amplitude. Stiffer springs oscillate faster, heavier masses slower.',
      formulas: ['ω = √{[[k|m]]}', 'f = [[ω|2π]]   ·   T = [[1|f]] = 2π√{[[m|k]]}'],
    }, [
      T('Restoring force ∝ displacement', `
If the force always pulls back toward equilibrium in proportion to how far you are from it,
$$ F = −kx $$
you get **simple harmonic motion (SHM)**. For a mass on a spring:
$$ ω = √{[[k|m]]}   ·   f = [[ω|2π]]   ·   T = 2π√{[[m|k]]} $$
>* The period doesn't depend on the amplitude. Pull it farther and it moves faster, taking the same time per cycle.`, { fig: D.spring({ x: 160, eq: 200, label: 'k' }) }),
      MATCH('Match each quantity to its meaning.', [['T (period)', 'seconds per cycle'], ['f (frequency)', 'cycles per second (Hz)'], ['ω (angular frequency)', 'radians per second'], ['A (amplitude)', 'maximum displacement']]),
      G('p.shm.basic'),
      MC('You double the amplitude of a mass-spring oscillator. Its period…', ['stays the same', 'doubles', 'halves', 'increases by √2'], 'T = 2π√(m/k) has no A in it.'),
      G('p.shm.basic'),
      MC('You replace the mass with one **4 times** heavier. The period becomes…', ['2 times longer', '4 times longer', 'half as long', 'unchanged'], 'T ∝ √m → √4 = 2.', { lvl: 2 }),
      G('p.shm.basic'),
    ]),
    L('p13l2', 'x(t), v(t) and a(t)', {
      goal: 'Read and use the SHM equations of motion.',
      key: 'Position: $x(t) = A cos(ωt + φ)$. Velocity: $v = −Aω sin(ωt + φ)$, so $v_{max} = Aω$ at x = 0. Acceleration: $a = −ω²x$, so $a_{max} = ω²A$ at x = ±A. At the turning points v = 0 and |a| is maximum, and at equilibrium |v| is maximum and a = 0. Always use radians for ωt.',
      formulas: ['x = A cos(ωt + φ)', 'v_{max} = ωA   ·   a_{max} = ω²A', 'a = −ω²x'],
    }, [
      T('Cosines all the way down', `
$$ x(t) = A cos(ωt + φ) $$
$$ v(t) = −ωA sin(ωt + φ)   ·   a(t) = −ω² x $$
| Where | x | v | a |
|---|---|---|---|
| turning point | ±A | 0 | max: ∓ω²A |
| equilibrium | 0 | max: ±ωA | 0 |
>! ωt is in **radians**. Switch your calculator to RAD for every SHM problem.`),
      EX('Reading x(t)', 'x(t) = (0.10 m) cos(4.0t). Find v_max, a_max, and x at t = 0.50 s.', ['A = 0.10 m, ω = 4.0 rad/s', 'v_max = ωA = 0.40 m/s, a_max = ω²A = 1.6 m/s²', 'x(0.50) = 0.10 cos(2.0 rad) = 0.10(−0.416) = **−0.042 m**']),
      MC('Where is the speed of a mass in SHM greatest?', ['At equilibrium (x = 0)', 'At the turning points', 'Halfway to the turning point', 'It is constant'], 'All the energy is kinetic at x = 0.'),
      G('p.shm.max'),
      MC('Where is the magnitude of the acceleration greatest?', ['At the turning points (x = ±A)', 'At equilibrium', 'It is constant', 'It is always zero'], 'a = −ω²x, which is largest where |x| is largest.'),
      G('p.shm.x'),
      G('p.shm.max'),
    ]),
    L('p13l3', 'Energy in SHM', {
      goal: 'Use energy conservation to find speeds at any position.',
      key: 'Total energy in SHM: $E = ½kA² = ½mv_{max}²$, constant. At any position: $½mv² + ½kx² = ½kA²$, so $v = ω√{A² − x²}$. Energy sloshes between kinetic (max at x = 0) and potential (max at x = ±A). At x = A/2, ¾ of the energy is kinetic.',
      formulas: ['E = ½kA²', '½mv² + ½kx² = ½kA²', 'v = ω√{A² − x²}'],
    }, [
      T('Energy sloshes back and forth', `
$$ E = ½mv² + ½kx² = ½kA² :: constant $$
- At x = ±A: all potential, $E = ½kA²$
- At x = 0: all kinetic, $E = ½mv_{max}²$
- In between: $v = ω√{A² − x²}$
>* Energy is the fastest way to get a speed at a given position. No trig and no time needed.`, { fig: D.bars({ items: [['x = A', 1, 'c4', 'U'], ['x = A/2', 0.25, 'c4', 'U'], ['x = 0', 0.01, 'c4', 'U']], max: 1, alt: 'Potential energy is maximum at the amplitude and zero at equilibrium' }) }),
      EX('Halfway out', 'A 0.50 kg mass on a k = 200 N/m spring has A = 0.10 m. Find E and the speed at x = 0.05 m.', ['E = ½(200)(0.10)² = **1.0 J**', 'ω = √(200/0.50) = 20 rad/s', 'v = 20√(0.10² − 0.05²) = **1.73 m/s**']),
      G('p.shm.E'),
      MC('At x = A/2, what fraction of the total energy is kinetic?', ['¾', '½', '¼', '0'], 'U = ½k(A/2)² = ¼E, so K = ¾E.', { lvl: 3 }),
      G('p.shm.E'),
      TF('In SHM, kinetic energy is maximum at the turning points.', false, 'v = 0 at the turning points, so K = 0 there.'),
      G('p.shm.E'),
    ]),
    L('p13l4', 'Pendulums', {
      goal: 'Compute periods of simple and physical pendulums, and know damping and resonance.',
      key: 'Simple pendulum (small angles): $T = 2π√{L/g}$. It is independent of mass and (for small swings) of amplitude. Physical pendulum: $T = 2π√{I/(mgd)}$, where d is the distance from the pivot to the center of mass (a rod pivoted at its end gives $T = 2π√{2L/3g}$). Damping makes the amplitude die out. Driving a system at its natural frequency causes resonance, a huge amplitude.',
      formulas: ['simple: T = 2π√{[[L|g]]}', 'physical: T = 2π√{[[I|mgd]]}'],
    }, [
      T('Pendulum clocks', `
For small swings (under about 15°), a simple pendulum is SHM with
$$ T = 2π√{[[L|g]]} $$
No mass, no amplitude. Only length and g.
A **physical pendulum** (any rigid swinging body) uses its moment of inertia:
$$ T = 2π√{[[I|mgd]]} :: d = pivot-to-CM distance $$
>> **Damping and resonance:** friction slowly drains the energy (damping). Pushing at the natural frequency builds up a huge amplitude (resonance), the same reason you pump a swing in rhythm.`, { fig: D.pendulum({ deg: 25 }) }),
      EX('A 1-second tick', 'How long is a pendulum with T = 2.0 s (one tick per second)?', ['L = g(T/2π)² = 9.8 × (2.0/6.283)²', 'L = **0.993 m**, almost exactly a meter']),
      G('p.pend'),
      MC('A pendulum clock is taken to the Moon (g is ⅙ as large). Its period…', ['increases by a factor of √6', 'decreases by a factor of √6', 'stays the same', 'increases by a factor of 6'], 'T ∝ 1/√g.'),
      G('p.pend'),
      TF('A heavier pendulum bob swings with a shorter period.', false, 'T = 2π√(L/g) doesn\'t depend on mass.'),
      MC('Soldiers break step when crossing a bridge mainly to avoid…', ['resonance', 'damping', 'friction', 'interference'], 'Marching in step at the bridge\'s natural frequency could drive large oscillations.'),
      G('p.pend'),
    ]),
  ]);

  /* ================= Unit 14 ================= */
  const u14 = U('p14', 'Mechanical Waves', { sub: 'Wave speed, wave functions & standing waves', ch: 'Ch 15' }, [
    L('p14l1', 'Wave Basics', {
      goal: 'Use v = fλ and tell transverse from longitudinal waves.',
      key: 'A wave carries energy, not matter. Transverse waves have the medium moving perpendicular to the wave (a string). Longitudinal waves have the medium moving along it (sound). $v = fλ = λ/T$. The **medium** sets the speed, and the **source** sets the frequency. When a wave passes into a new medium, f stays the same while v and λ change.',
      formulas: ['v = fλ', 'T = [[1|f]]'],
    }, [
      T('Waves move energy, not stuff', `
A wave is a disturbance that travels. The material just oscillates in place.
- **Transverse:** particles move ⊥ to the wave (a wave on a string, the stadium wave)
- **Longitudinal:** particles move ∥ to the wave (sound, a Slinky push)
$$ v = fλ :: speed = frequency × wavelength $$
>* The **medium** sets v and the **source** sets f. Change f and λ adjusts to keep v the same.`, { fig: D.wave({ dir: true }) }),
      G('p.wave.v'),
      MC('Sound passes from air into water, where it travels faster. Which stays the same?', ['frequency', 'wavelength', 'speed', 'all of them change'], 'The source sets f. v increases in water, so λ increases too.'),
      G('p.wave.v'),
      MATCH('Classify each wave.', [['Sound in air', 'longitudinal'], ['Wave on a guitar string', 'transverse'], ['Compression pulse on a Slinky', 'longitudinal (also)'], ['Stadium "wave"', 'transverse (also)']]),
      G('p.wave.v'),
    ]),
    L('p14l2', 'Wave Functions', {
      goal: 'Read A, k, ω, λ, f and v straight off y(x,t).',
      key: 'A sinusoidal wave moving toward +x: $y(x,t) = A cos(kx − ωt)$. (kx + ωt means it moves toward −x.) Wave number $k = 2π/λ$, angular frequency $ω = 2πf$, and the speed is $v = ω/k = fλ$. Each particle of the medium moves in SHM with the same ω. Don\'t confuse wave speed (v = ω/k) with particle speed ($∂y/∂t$, at most ωA).',
      formulas: ['y = A cos(kx − ωt)', 'k = [[2π|λ]]   ·   ω = 2πf', 'v = [[ω|k]]'],
    }, [
      T('Decoding y(x, t)', `
$$ y(x,t) = A cos(kx − ωt) $$
| Symbol | Meaning |
|---|---|
| A | amplitude |
| k = 2π/λ | wave number (rad/m) |
| ω = 2πf | angular frequency (rad/s) |
| v = ω/k | wave speed |
**−ωt** means the wave moves toward +x, and **+ωt** means toward −x.
>! The **wave** moves at v = ω/k. Each **particle** of the string just bobs up and down, with max speed ωA. Those are different speeds.`),
      EX('Read it off', 'y = 0.02 cos(4x − 20t) (SI). Find λ, f and v.', ['k = 4 rad/m → λ = 2π/4 = **1.57 m**', 'ω = 20 rad/s → f = 20/2π = **3.18 Hz**', 'v = ω/k = 20/4 = **5.0 m/s**, toward +x']),
      G('p.wave.fn'),
      MC('Which wave travels in the **−x** direction?', ['y = A cos(kx + ωt)', 'y = A cos(kx − ωt)', 'y = A sin(kx − ωt)', 'y = −A cos(kx − ωt)'], 'kx + ωt stays constant as t increases only if x decreases.'),
      G('p.wave.fn'),
      TF('The transverse speed of a particle on a string equals the wave speed.', false, 'The particle speed is ∂y/∂t (max ωA). The wave speed is ω/k.'),
      G('p.wave.fn'),
    ]),
    L('p14l3', 'Waves on a String', {
      goal: 'Compute wave speed from tension and mass density.',
      key: 'Wave speed on a string: $v = √{F/μ}$, where F is the tension and μ = mass/length (kg/m). Tighter string → faster waves; heavier string → slower waves. Quadrupling the tension doubles the speed. Waves carry power proportional to A² and ω² ($P_{av} = ½√{μF}ω²A²$).',
      formulas: ['v = √{[[F|μ]]}', 'μ = [[m|L]]', 'P_{av} = ½√{μF} ω²A²'],
    }, [
      T('Tension and inertia set the speed', `
$$ v = √{[[F_T|μ]]} :: μ = mass per unit length (kg/m) $$
The tension pulls the string back (restoring force) and μ resists it (inertia), just like k and m in a spring.
>* Guitar tuning: tighten a string → higher v → higher pitch. Thicker (bass) strings have bigger μ → lower pitch.
>! Energy carried goes as **A²** and **ω²**. Double the amplitude → 4× the power.`),
      EX('Piano wire', 'A 0.80 m wire of mass 4.0 g is under 500 N of tension. Find the wave speed.', ['μ = 0.0040/0.80 = 0.0050 kg/m', 'v = √(500/0.0050) = **316 m/s**']),
      G('p.wave.string'),
      MC('Two strings have the same tension, but string B has 4× the mass per length. Waves on B travel…', ['half as fast', 'twice as fast', '4 times slower', 'at the same speed'], 'v ∝ 1/√μ → 1/√4 = ½.'),
      G('p.wave.string'),
      TF('Doubling a wave\'s amplitude doubles the power it carries.', false, 'Power ∝ A², so it quadruples.'),
      NUM('A **2.0 m** rope has a mass of **0.50 kg** and is under **50 N** of tension. How long does a pulse take to travel its length?', 2 / Math.sqrt(50 / 0.25), 's', 'μ = 0.50/2.0 = 0.25 kg/m, v = √(50/0.25) = 14.1 m/s, t = 2.0/14.1 = 0.141 s.', { lvl: 4, steps: ['μ = m/L = 0.25 kg/m', 'v = √(F/μ) = √(50/0.25) = 14.1 m/s', 't = L/v = **0.141 s**'] }),
    ]),
    L('p14l4', 'Superposition & Standing Waves', {
      goal: 'Find harmonics on a string fixed at both ends.',
      key: 'Superposition: overlapping waves simply add (constructive or destructive interference). A string fixed at both ends supports standing waves with nodes at the ends: $λₙ = 2L/n$ and $fₙ = n·v/2L = n f₁$, for n = 1, 2, 3, … Nodes don\'t move, and antinodes oscillate the most. Adjacent harmonics differ by f₁. Harmonic n has n antinodes (n "loops").',
      formulas: ['λₙ = [[2L|n]]', 'fₙ = n[[v|2L]] = n f₁', 'f₁ = [[1|2L]]√{[[F|μ]]}'],
    }, [
      T('Waves that stand still', `
When two identical waves travel in opposite directions, they make a **standing wave**: fixed **nodes** (no motion) and **antinodes** (maximum motion).
A string fixed at both ends must have nodes at both ends, so only certain wavelengths fit:
$$ λₙ = [[2L|n]]   ·   fₙ = n [[v|2L]] = n f₁ $$
>* n = number of "loops". The fundamental (n = 1) is one loop, the 2nd harmonic is two loops, and so on.
>> Pressing a guitar fret shortens L, which raises every harmonic.`, { fig: D.standing({ n: 3, all: true }) }),
      EX('Guitar string', 'A 0.65 m string has v = 260 m/s. Find f₁ and f₃.', ['f₁ = v/2L = 260/1.30 = **200 Hz**', 'f₃ = 3f₁ = **600 Hz**']),
      G('p.standing'),
      MC('How many antinodes does the 4th harmonic on a string fixed at both ends have?', ['4', '3', '5', '8'], 'Harmonic n has n loops, and each loop has one antinode.'),
      G('p.standing'),
      MC('Two waves of equal amplitude A meet in phase. The resulting amplitude is…', ['2A', 'A', '0', 'A²'], 'Constructive interference: amplitudes add.'),
      G('p.standing'),
    ]),
  ]);

  CQ.addUnits('phys', [u12, u13, u14]);
})();
