/* MECH 1208 · Intro to Mechanical Engineering II — course definition and Units 1–4
   (Wickert & Lewis, An Introduction to Mechanical Engineering, Ch 1–4, plus the truss labs) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const PI = Math.PI;
  const rad = (d) => (d * PI) / 180, deg = (r) => (r * 180) / PI;
  const sin = (d) => Math.sin(rad(d)), cos = (d) => Math.cos(rad(d));

  CQ.defineCourse({
    id: 'mech', code: 'MECH 1208', name: 'Intro to Mechanical Engineering II', icon: 'gear', color: '#c2255c', dark: '#8c1a43',
    book: 'Wickert & Lewis, An Introduction to Mechanical Engineering · plus CAD and truss labs',
    exams: [
      { id: 'mech-mid', name: 'Midterm', units: ['m1', 'm2', 'm3', 'm4'], n: 20, mins: 50, note: 'Units 1–4' },
      { id: 'mech-fin', name: 'Final', units: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'], n: 25, mins: 75, note: 'Cumulative' },
    ],
  });

  /* ================= generators: Unit 1 ================= */
  CQ.gen('m.uconv', (R) => {
    const k = R.int(0, 6);
    const c = [
      () => { const v = R.pick([50, 100, 225, 500, 1200]); return ['A load of **' + v + ' lbf** is how many newtons? (1 lbf = 4.448 N)', v * 4.448, 'N', [v + ' lbf × [[4.448 N|1 lbf]] = **' + F(v * 4.448) + ' N**']]; },
      () => { const v = R.pick([0.25, 0.5, 1.5, 3.75]); return ['Convert **' + v + ' in** to millimeters. (1 in = 25.4 mm)', v * 25.4, 'mm', [v + ' × 25.4 = **' + F(v * 25.4) + ' mm**']]; },
      () => { const v = R.pick([30, 45, 100, 150, 3000]); return ['A tire pressure of **' + v + ' psi** is how many kPa? (1 psi = 6.895 kPa)', v * 6.895, 'kPa', [v + ' × 6.895 = **' + F(v * 6.895) + ' kPa**']]; },
      () => { const v = R.pick([5, 25, 150, 300, 500]); return ['A **' + v + ' hp** engine produces how many kW? (1 hp = 0.7457 kW)', v * 0.7457, 'kW', [v + ' × 0.7457 = **' + F(v * 0.7457) + ' kW**']]; },
      () => { const v = R.pick([20, 50, 120, 250]); return ['A bolt is tightened to **' + v + ' ft·lbf**. Express that torque in N·m. (1 ft = 0.3048 m, 1 lbf = 4.448 N)', v * 0.3048 * 4.448, 'N·m', ['1 ft·lbf = 0.3048 × 4.448 = 1.356 N·m', v + ' × 1.356 = **' + F(v * 1.3558) + ' N·m**']]; },
      () => { const v = R.pick([10, 60, 200]); return ['Convert **' + v + ' MPa** to ksi. (1 ksi = 6.895 MPa)', v / 6.895, 'ksi', [v + '/6.895 = **' + F(v / 6.895) + ' ksi**']]; },
      () => { const v = R.pick([5, 12, 30, 65]); return ['Convert **' + v + ' mi/h** to ft/s. (1 mi = 5280 ft)', (v * 5280) / 3600, 'ft/s', [v + ' × 5280/3600 = **' + F((v * 5280) / 3600) + ' ft/s**']]; },
    ][k]();
    return { t: 'num', q: c[0], a: c[1], unit: c[2], steps: c[3] };
  });

  CQ.gen('m.lbm', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const m = R.pick([10, 50, 150, 3000]); return { t: 'num', q: 'What is the mass in **slugs** of an object with a mass of **' + m + ' lbm**? (1 slug = 32.174 lbm)', a: m / 32.174, unit: 'slug', steps: [m + ' lbm × [[1 slug|32.174 lbm]] = **' + F(m / 32.174) + ' slug**'] }; }
    if (k === 1) { const m = R.pick([2, 5, 10, 25]); return { t: 'num', q: 'What is the weight (in lbf) of a **' + m + ' slug** object on Earth? (g = 32.2 ft/s²)', a: m * 32.174, unit: 'lbf', steps: ['w = mg = ' + m + ' slug × 32.174 ft/s²', '1 slug·ft/s² = 1 lbf → **' + F(m * 32.174) + ' lbf**'] }; }
    const kg = R.pick([1, 5, 20, 70, 1500]); return { t: 'num', q: 'A **' + kg + ' kg** object has a mass of how many lbm? (1 lbm = 0.4536 kg)', a: kg / 0.4536, unit: 'lbm', steps: [kg + '/0.4536 = **' + F(kg / 0.4536) + ' lbm**'] };
  });

  /* ================= generators: Unit 2 ================= */
  CQ.gen('m.comp', (R) => {
    const Fm = R.pick([100, 250, 400, 650, 800, 1200]), th = R.pick([20, 30, 35, 45, 60, 70, 120, 150]);
    const want = R.pick(['x', 'y']);
    const v = want === 'x' ? Fm * cos(th) : Fm * sin(th);
    return { t: 'num', q: 'A cable pulls on a bracket with **' + Fm + ' N** at **' + th + '°** above the +x axis. What is its **' + want + '-component**?', a: v, unit: 'N', abs: 0.5,
      steps: ['F' + (want === 'x' ? 'ₓ = F cos θ' : 'ᵧ = F sin θ'), '= ' + Fm + ' × ' + (want === 'x' ? 'cos' : 'sin') + ' ' + th + '° = **' + F(v) + ' N**'] };
  });

  CQ.gen('m.resultant', (R) => {
    const f = [[R.pick([200, 300, 400]), R.pick([0, 15, 30])], [R.pick([150, 250, 350]), R.pick([60, 75, 90, 120])], [R.pick([100, 200]), R.pick([200, 225, 250, 300])]];
    const n = R.pick([2, 3]);
    const fs = f.slice(0, n);
    const rx = fs.reduce((a, [m, t]) => a + m * cos(t), 0), ry = fs.reduce((a, [m, t]) => a + m * sin(t), 0);
    const want = R.pick(['mag', 'mag', 'ang']);
    let ang = deg(Math.atan2(ry, rx)); if (ang < 0) ang += 360;
    return { t: 'num', lvl: 4, q: n + ' forces act on an eyebolt: ' + fs.map(([m, t]) => '**' + m + ' N at ' + t + '°**').join(', ') + ' (angles from +x). Find the ' + (want === 'mag' ? '**magnitude** of the resultant.' : '**direction** of the resultant (degrees from +x, 0–360).'), a: want === 'mag' ? Math.hypot(rx, ry) : ang, unit: want === 'mag' ? 'N' : '°', abs: want === 'mag' ? 0.5 : 0.6,
      fig: D.fbd({ forces: fs.map(([m, t], i) => ({ a: t, len: 40 + m / 10, label: m + ' N', cls: ['c1', 'c2', 'c4'][i] })) }),
      steps: ['Rₓ = Σ F cos θ = ' + F(rx) + ' N', 'Rᵧ = Σ F sin θ = ' + F(ry) + ' N', want === 'mag' ? 'R = √(Rₓ² + Rᵧ²) = **' + F(Math.hypot(rx, ry)) + ' N**' : 'θ = atan2(Rᵧ, Rₓ) = **' + F(ang) + '°**'] };
  });

  CQ.gen('m.moment', (R) => {
    const Fm = R.pick([50, 80, 120, 200, 450]), d = R.pick([0.15, 0.25, 0.3, 0.4, 0.6]), th = R.pick([90, 60, 45, 30]);
    const M = Fm * d * sin(th);
    return { t: 'num', q: 'A **' + Fm + ' N** force is applied to a wrench **' + d * 100 + ' cm** from the bolt, at **' + th + '°** to the handle. What moment does it create about the bolt?', a: M, unit: 'N·m', fig: D.torque({ deg: th }),
      steps: ['Perpendicular distance (lever arm) = d sin θ = ' + d + ' × sin ' + th + '° = ' + F(d * sin(th)) + ' m', 'M = F × d⊥ = ' + Fm + ' × ' + F(d * sin(th)) + ' = **' + F(M) + ' N·m**'] };
  });

  CQ.gen('m.momentcomp', (R) => {
    const x = R.pick([0.2, 0.3, 0.5, 0.8]), y = R.pick([0.1, 0.25, 0.4]), Fx = R.pick([-150, -80, 60, 120]), Fy = R.pick([-200, -100, 90, 250]);
    const M = x * Fy - y * Fx;
    return { t: 'num', lvl: 4, q: 'A force **F = (' + Fx + ' N) î + (' + Fy + ' N) ĵ** acts at point **(' + x + ' m, ' + y + ' m)**. Find its moment about the origin (counterclockwise +).', a: M, unit: 'N·m', abs: 0.2,
      hint: 'Moment components method: M = x·Fᵧ − y·Fₓ.',
      steps: ['M = x·Fᵧ − y·Fₓ', '= (' + x + ')(' + Fy + ') − (' + y + ')(' + Fx + ')', 'M = **' + F(M) + ' N·m** ' + (M >= 0 ? '(counterclockwise)' : '(clockwise)')] };
  });

  CQ.gen('m.equil', (R) => {
    const W = R.pick([200, 400, 600, 900]), th = R.pick([30, 40, 45, 60]);
    const want = R.pick(['T', 'H']);
    const Tc = W / sin(th), H = W / Math.tan(rad(th));
    return { t: 'num', lvl: 3, q: 'A **' + W + ' N** sign hangs from the end of a light horizontal boom held by a cable at **' + th + '°** above the boom. Find the ' + (want === 'T' ? '**cable tension**.' : '**horizontal compressive force in the boom**.'), a: want === 'T' ? Tc : H, unit: 'N',
      steps: ['At the end joint: ΣFᵧ = 0 → T sin ' + th + '° = ' + W, 'T = ' + F(Tc) + ' N', 'ΣFₓ = 0 → boom force = T cos ' + th + '° = ' + F(H) + ' N', 'Answer: **' + F(want === 'T' ? Tc : H) + ' N**'] };
  });

  /* ================= generators: Unit 3 ================= */
  CQ.gen('m.reactions', (R) => {
    const L2 = R.pick([2, 3, 4, 5, 6]), P = R.pick([500, 800, 1200, 2000]), a = R.pick([0.5, 1, 1.5, 2].filter((x) => x < L2));
    const RB = (P * a) / L2, RA = P - RB;
    const want = R.pick(['A', 'B']);
    return { t: 'num', q: 'A **' + L2 + ' m** simply supported beam (pin at A, roller at B) carries a **' + P + ' N** load **' + a + ' m** from A. Find the reaction at **' + want + '**.', a: want === 'A' ? RA : RB, unit: 'N',
      fig: D.beam({ supports: [{ x: 0, type: 'pin', label: 'R_A' }, { x: 1, type: 'roller', label: 'R_B' }], loads: [{ x: a / L2, label: P + ' N' }], dims: [[0, a / L2, a + ' m']] }),
      hint: 'Sum moments about the support you are NOT solving for.',
      steps: ['ΣM_A = 0: R_B(' + L2 + ') − ' + P + '(' + a + ') = 0 → R_B = ' + F(RB) + ' N', 'ΣFᵧ = 0: R_A = ' + P + ' − ' + F(RB) + ' = ' + F(RA) + ' N', 'R_' + want + ' = **' + F(want === 'A' ? RA : RB) + ' N**'] };
  });

  CQ.gen('m.reactions2', (R) => {
    const L2 = R.pick([4, 5, 6, 8]), P1 = R.pick([400, 600, 1000]), a1 = R.pick([1, 1.5]), P2 = R.pick([300, 500, 800]), a2 = R.pick([3, 3.5]);
    if (a2 >= L2) return CQ.gens['m.reactions2'](R);
    const RB = (P1 * a1 + P2 * a2) / L2, RA = P1 + P2 - RB;
    const want = R.pick(['A', 'B']);
    return { t: 'num', lvl: 4, q: 'A **' + L2 + ' m** beam is pinned at A (left end) and on a roller at B (right end). It carries **' + P1 + ' N** at **' + a1 + ' m** and **' + P2 + ' N** at **' + a2 + ' m** from A. Find R_' + want + '.', a: want === 'A' ? RA : RB, unit: 'N',
      fig: D.beam({ supports: [{ x: 0, type: 'pin', label: 'R_A' }, { x: 1, type: 'roller', label: 'R_B' }], loads: [{ x: a1 / L2, label: P1 + ' N' }, { x: a2 / L2, label: P2 + ' N', cls: 'c4' }] }),
      steps: ['ΣM_A = 0: R_B(' + L2 + ') = ' + P1 + '(' + a1 + ') + ' + P2 + '(' + a2 + ')', 'R_B = ' + F(RB) + ' N', 'R_A = ' + (P1 + P2) + ' − ' + F(RB) + ' = ' + F(RA) + ' N', 'R_' + want + ' = **' + F(want === 'A' ? RA : RB) + ' N**'] };
  });

  CQ.gen('m.truss', (R) => {
    const P = R.pick([1000, 2000, 3000, 5000]), th = R.pick([30, 40, 45, 50, 60]);
    const fAC = P / (2 * sin(th)), fAB = fAC * cos(th);
    const want = R.pick(['AC', 'AB']);
    return { t: 'num', lvl: 4, exam: true, q: 'A symmetric triangular truss has supports at A and B and a **' + P + ' N** downward load at apex C. Members AC and BC make **' + th + '°** with the bottom chord AB. Find the force in member **' + want + '** (magnitude), and decide whether it\'s in tension or compression.', a: want === 'AC' ? fAC : fAB, unit: 'N',
      fig: D.truss({ deg: th, P: P + ' N' }),
      hint: 'Reactions are P/2 each by symmetry. Then do joint A: ΣFᵧ gives AC, ΣFₓ gives AB.',
      steps: ['By symmetry R_A = R_B = ' + P / 2 + ' N (up)', 'Joint A, ΣFᵧ = 0: F_AC sin ' + th + '° = ' + P / 2 + ' → F_AC = ' + F(fAC) + ' N (pushes on the joint, so **compression**)', 'Joint A, ΣFₓ = 0: F_AB = F_AC cos ' + th + '° = ' + F(fAB) + ' N (pulls on the joint, so **tension**)', want + ': **' + F(want === 'AC' ? fAC : fAB) + ' N**, ' + (want === 'AC' ? 'compression' : 'tension')] };
  });

  CQ.gen('m.lever', (R) => {
    const din = R.pick([0.2, 0.3, 0.45, 0.6]), dout = R.pick([0.02, 0.03, 0.05, 0.08]), Fin = R.pick([40, 60, 100, 150]);
    const MA = din / dout;
    const want = R.pick(['MA', 'Fout']);
    return { t: 'num', q: 'Bolt cutters: you squeeze **' + din * 100 + ' cm** from the pivot, and the jaws cut **' + dout * 100 + ' cm** from the pivot. ' + (want === 'MA' ? 'What is the mechanical advantage?' : 'If you squeeze with **' + Fin + ' N**, what force do the jaws apply?'), a: want === 'MA' ? MA : MA * Fin, unit: want === 'MA' ? '' : 'N',
      steps: ['Moment balance about the pivot: F_in·d_in = F_out·d_out', 'MA = d_in/d_out = ' + din + '/' + dout + ' = ' + F(MA), ...(want === 'Fout' ? ['F_out = MA × F_in = **' + F(MA * Fin) + ' N**'] : ['MA = **' + F(MA) + '**'])] };
  });

  /* ================= generators: Unit 4 ================= */
  const MATL = [['1020 steel', 200e9, 350e6, 30e6, 51e3], ['6061-T6 aluminum', 70e9, 275e6, 10e6, 40e3], ['Ti-6Al-4V titanium', 114e9, 880e6, 16.5e6, 128e3], ['brass', 100e9, 200e6, 15e6, 29e3]];
  CQ.gen('m.stress', (R) => {
    const d = R.pick([5, 8, 10, 12, 20]) / 1000, Fp = R.pick([2000, 5000, 10000, 25000]);
    const A = (PI * d * d) / 4, s = Fp / A;
    const comp = R.chance(0.3);
    return { t: 'num', q: 'A **' + d * 1000 + ' mm** diameter rod carries a **' + Fp + ' N** ' + (comp ? 'compressive' : 'tensile') + ' load. What is the normal stress, in MPa?', a: s / 1e6, unit: 'MPa',
      steps: ['A = πd²/4 = π(' + d + ')²/4 = ' + F(A) + ' m²', 'σ = F/A = ' + Fp + '/' + F(A) + ' = ' + F(s) + ' Pa', '= **' + F(s / 1e6) + ' MPa** (' + (comp ? 'compression' : 'tension') + ')'] };
  });

  CQ.gen('m.elong', (R) => {
    const [mat, E] = R.pick(MATL);
    const d = R.pick([6, 10, 12, 16]) / 1000, L2 = R.pick([0.5, 1, 1.5, 2]), Fp = R.pick([5000, 10000, 20000]);
    const A = (PI * d * d) / 4, dL = (Fp * L2) / (E * A);
    const want = R.pick(['dL', 'eps']);
    return { t: 'num', lvl: 3, q: 'A **' + mat + '** rod (E = ' + E / 1e9 + ' GPa), **' + L2 + ' m** long and **' + d * 1000 + ' mm** in diameter, carries **' + Fp + ' N** of tension. ' + (want === 'dL' ? 'How much does it stretch, in mm?' : 'What is the strain?'), a: want === 'dL' ? dL * 1000 : dL / L2, unit: want === 'dL' ? 'mm' : '',
      steps: ['A = πd²/4 = ' + F(A) + ' m²', 'σ = F/A = ' + F(Fp / A / 1e6) + ' MPa', 'ε = σ/E = ' + F(dL / L2), ...(want === 'dL' ? ['ΔL = εL = [[FL|EA]] = ' + F(dL) + ' m = **' + F(dL * 1000) + ' mm**'] : ['ε = **' + F(dL / L2) + '** (dimensionless)'])] };
  });

  CQ.gen('m.shear', (R) => {
    const dbl = R.chance(0.5), d = R.pick([6, 8, 10, 12, 16]) / 1000, Fp = R.pick([3000, 5000, 8000, 12000]);
    const A = (PI * d * d) / 4, tau = Fp / ((dbl ? 2 : 1) * A);
    return { t: 'num', lvl: 3, q: 'A **' + d * 1000 + ' mm** diameter pin connects two parts in **' + (dbl ? 'double' : 'single') + ' shear** and carries **' + Fp + ' N**. What is the average shear stress in the pin, in MPa?', a: tau / 1e6, unit: 'MPa',
      fig: D.shear({ double: dbl }),
      steps: ['Shear area per plane: A = πd²/4 = ' + F(A) + ' m²', dbl ? 'Double shear: two planes share the load, so τ = F/(2A)' : 'Single shear: τ = F/A', 'τ = **' + F(tau / 1e6) + ' MPa**'] };
  });

  CQ.gen('m.fs', (R) => {
    const [mat, , Sy] = R.pick(MATL);
    const k = R.int(0, 1);
    if (k === 0) { const d = R.pick([8, 10, 12, 16]) / 1000, Fp = R.pick([5000, 10000, 15000]); const s = Fp / ((PI * d * d) / 4); return { t: 'num', lvl: 3, q: 'A **' + mat + '** rod (S_y = ' + Sy / 1e6 + ' MPa), **' + d * 1000 + ' mm** in diameter, carries **' + Fp + ' N** in tension. What is its factor of safety against yielding?', a: Sy / s, unit: '', steps: ['σ = F/A = ' + F(s / 1e6) + ' MPa', 'FS = S_y/σ = ' + Sy / 1e6 + '/' + F(s / 1e6) + ' = **' + F(Sy / s) + '**'] }; }
    const Fp = R.pick([10000, 20000, 40000]), FS = R.pick([2, 2.5, 3]);
    const sAllow = Sy / FS, A = Fp / sAllow, d = Math.sqrt((4 * A) / PI);
    return { t: 'num', lvl: 4, exam: true, q: 'Size a **' + mat + '** rod (S_y = ' + Sy / 1e6 + ' MPa) to carry **' + Fp + ' N** in tension with a factor of safety of **' + FS + '**. What is the minimum diameter, in mm?', a: d * 1000, unit: 'mm',
      steps: ['Allowable stress = S_y/FS = ' + F(sAllow / 1e6) + ' MPa', 'A = F/σ_allow = ' + F(A) + ' m²', 'd = √(4A/π) = ' + F(d) + ' m = **' + F(d * 1000) + ' mm** (round up to the next standard size)'] };
  });

  CQ.gen('m.poisson', (R) => {
    const nu = R.pick([0.29, 0.3, 0.33, 0.34]), eps = R.pick([0.001, 0.0015, 0.002]), d = R.pick([10, 20, 25]);
    const dd = -nu * eps * d;
    return { t: 'num', lvl: 3, q: 'A rod of diameter **' + d + ' mm** is stretched to an axial strain of **' + eps + '**. Its Poisson\'s ratio is **' + nu + '**. By how much does the diameter change, in mm? (negative = shrinks)', a: dd, unit: 'mm', abs: 0.0002,
      steps: ['ε_lateral = −ν ε_axial = −' + nu + ' × ' + eps + ' = ' + F(-nu * eps), 'Δd = ε_lateral × d = **' + F(dd) + ' mm**'] };
  });

  /* ================= Unit 1 ================= */
  const u1 = U('m1', 'The Engineer\'s Method', { sub: 'The profession, units & problem solving', ch: 'Ch 1–2' }, [
    L('m1l1', 'What MEs Do & Engineering Ethics', {
      goal: 'Describe the scope of mechanical engineering and apply the core ethics canons.',
      key: 'Mechanical engineers design, analyze and build machines and energy systems: engines, robots, HVAC, power plants, vehicles, manufacturing equipment and medical devices. Core skills: forces and structures, materials, fluids, thermal systems, motion and power transmission, and design. Engineering ethics (NSPE code): hold the safety, health and welfare of the public **paramount**, work only within your competence, be objective and truthful in public statements, act as a faithful agent for employers and clients, and avoid deceptive acts and conflicts of interest.',
      formulas: ['NSPE canon #1: public safety, health and welfare are paramount'],
    }, [
      T('The broadest engineering field', `
Mechanical engineers turn energy into motion and ideas into hardware. The **ASME/NAE top-10 achievements** of the profession include the automobile, the Apollo program, power generation, agricultural mechanization, air conditioning and refrigeration, CAD/CAM, and bioengineering.
**Core technical areas** (the units of this course):
- forces and structures, materials and stresses
- fluids, thermal and energy systems
- motion and power transmission
- mechanical design and manufacturing`),
      T('Engineering ethics', `
The NSPE Code of Ethics says engineers shall:
1. Hold paramount the **safety, health and welfare of the public**
2. Perform services only in areas of their **competence**
3. Issue public statements only in an **objective and truthful** manner
4. Act for each employer or client as **faithful agents or trustees**
5. Avoid **deceptive acts**
>! When an employer's request conflicts with public safety, safety wins. Every time.`),
      MC('According to the NSPE code, an engineer\'s highest obligation is to…', ['the safety, health and welfare of the public', 'the employer\'s profits', 'meeting the project deadline', 'their professional reputation'], 'Canon #1: the public is paramount.'),
      MULTI('Which are **core technical areas** of mechanical engineering?', [['thermal and energy systems', 1], ['motion and power transmission', 1], ['materials and stresses', 1], ['fluids engineering', 1], ['corporate tax law', 0]], 'All except tax law.'),
      MC('Your manager asks you to sign off on a design calculation you didn\'t check and don\'t fully understand. The ethical response is to…', ['decline to sign until you can verify it or it is reviewed by someone competent', 'sign it because your manager is responsible', 'sign it and add a note in the file', 'ask a coworker to sign instead'], 'Engineers only approve work within their competence that they have verified.', { lvl: 2 }),
      TF('Engineers may accept a gift from a supplier whose parts they are evaluating, as long as it is small.', false, 'Accepting gifts from parties you are evaluating creates a conflict of interest. Disclose and avoid it.'),
      MATCH('Match each situation to the ethics principle it tests.', [['Stopping a launch over a safety concern', 'public safety is paramount'], ['Declining a structural design outside your expertise', 'competence'], ['Reporting test data that hurts your project', 'honesty and objectivity'], ['Not sharing a client\'s confidential data', 'faithful agent']]),
    ]),
    L('m1l2', 'SI & USCS Units', {
      goal: 'Work in both unit systems and avoid the lbm/lbf trap.',
      key: 'SI: meter, kilogram, second, and the derived newton (1 N = 1 kg·m/s²). USCS: foot, second, pound-force (lbf), slug (mass). 1 slug = 32.174 lbm, and 1 lbf = 1 slug·ft/s². A 1 lbm object weighs 1 lbf in standard gravity, but lbm and lbf are different quantities. Key conversions: 1 in = 25.4 mm, 1 lbf = 4.448 N, 1 psi = 6.895 kPa, 1 hp = 746 W = 550 ft·lbf/s, 1 ft·lbf = 1.356 N·m, 1 slug = 14.59 kg, 1 lbm = 0.4536 kg.',
      formulas: ['1 N = 1 kg·m/s²', '1 lbf = 1 slug·ft/s² = 4.448 N', '1 slug = 32.174 lbm', '1 hp = 746 W = 550 ft·lbf/s'],
    }, [
      T('Two systems, one set of physics', `
| Quantity | SI | USCS |
|---|---|---|
| length | m | ft, in |
| mass | kg | slug (or lbm) |
| force | N = kg·m/s² | lbf = slug·ft/s² |
| pressure | Pa = N/m² | psi = lbf/in² |
| power | W | hp, ft·lbf/s |
>! **lbm vs lbf**: pound-mass measures stuff, pound-force measures force. 1 lbm weighs 1 lbf on Earth, but F = ma only works with **slugs**: 1 slug = 32.174 lbm.`),
      T('Conversions you\'ll use constantly', `
| Unit | Equals |
|---|---|
| 1 in | 25.4 mm (exact) |
| 1 ft | 0.3048 m |
| 1 lbf | 4.448 N |
| 1 psi | 6.895 kPa |
| 1 ksi | 6.895 MPa |
| 1 hp | 0.7457 kW |
| 1 ft·lbf | 1.356 N·m |`),
      EX('F = ma in USCS', 'A 3220 lbm car accelerates at 10 ft/s². What net force (lbf) is needed?', ['Convert mass to slugs: 3220/32.174 = 100 slug', 'F = ma = 100 × 10 = **1000 lbf**', 'Using lbm directly would give 32,200: off by a factor of g.']),
      G('m.uconv'),
      G('m.lbm'),
      MC('Which unit is a unit of **mass**?', ['slug', 'lbf', 'newton', 'psi'], 'The slug is the USCS mass unit for F = ma.'),
      G('m.uconv'),
      TF('In the USCS system, F = ma works directly with mass in lbm and acceleration in ft/s² to give lbf.', false, 'You must convert lbm to slugs (÷32.174) first.'),
      G('m.uconv'),
    ]),
    L('m1l3', 'Dimensional Consistency & Estimation', {
      goal: 'Check equations for dimensional consistency and make order-of-magnitude estimates.',
      key: 'Every term in a valid equation has the same dimensions (and you can only add quantities with the same dimensions). Use the dimensions [M], [L], [T] to check formulas and catch algebra mistakes. Keep units attached through every calculation. Report results to about 3 significant figures, not every calculator digit. Order-of-magnitude estimates (within a factor of 10) are a sanity check before and after detailed analysis.',
      formulas: ['all terms share dimensions', 'N = [M][L][T]⁻²', 'J = [M][L]²[T]⁻²'],
    }, [
      T('If the units don\'t match, it\'s wrong', `
Write each quantity in base dimensions: mass [M], length [L], time [T].
- force: [M][L][T]⁻²
- energy: [M][L]²[T]⁻²
- power: [M][L]²[T]⁻³
- pressure: [M][L]⁻¹[T]⁻²
>* Before solving, check that every term in your equation has the same dimensions. It's a 10-second test that catches most algebra mistakes.
>> **Estimation:** a car's kinetic energy at highway speed is about ½(1500)(30)² ≈ 7 × 10⁵ J. If your detailed answer is 7 J or 7 × 10⁹ J, something went wrong.`),
      MC('Which equation is dimensionally consistent? (v = speed, a = acceleration, x = distance, t = time)', ['v² = 2ax', 'v = ax²', 'x = vt²', 'a = v·t'], '[L/T]² = [L/T²][L] ✓'),
      MC('What are the base dimensions of power?', ['[M][L]²[T]⁻³', '[M][L][T]⁻²', '[M][L]²[T]⁻²', '[M][L]⁻¹[T]⁻²'], 'Power = energy/time = [M][L]²[T]⁻² ÷ [T].'),
      MC('Roughly how much does a typical passenger car weigh?', ['about 15,000 N', 'about 150 N', 'about 1,500,000 N', 'about 1,500 N'], '1500 kg × 9.8 m/s² ≈ 1.5 × 10⁴ N.', { lvl: 2 }),
      TF('Reporting an answer as 1243.587921 N shows good engineering precision.', false, 'Report a sensible number of sig figs (usually 3) that matches your input data.'),
      MC('The drag force on a car is F = ½ρv²AC_D. If ρ is in kg/m³, v in m/s and A in m², what are the units of C_D?', ['none (dimensionless)', 'm', 'N', 'kg'], 'ρv²A already has units of kg·m/s² = N, so C_D must be dimensionless.', { lvl: 3 }),
    ]),
    L('m1l4', 'The Problem-Solving Method', {
      goal: 'Structure every analysis as Approach → Solution → Discussion.',
      key: 'Wickert & Lewis\'s method: **Approach**: state what is known and what is to be found, sketch the system, list assumptions, and identify the governing equations. **Solution**: solve symbolically first, then substitute numbers with units, keeping track of units. **Discussion**: check whether the answer is reasonable (magnitude, sign, units, limiting cases) and interpret what it means for the design. Box the final answer with units.',
      formulas: ['Approach → Solution → Discussion'],
    }, [
      T('Approach · Solution · Discussion', `
1. **Approach:** What's given? What's asked? Draw a sketch or FBD. State assumptions (rigid body, no friction, steady state…). Pick the governing principles.
2. **Solution:** Work symbolically, then plug in numbers **with units**. Carry units through every step.
3. **Discussion:** Is it reasonable? Check units, order of magnitude, sign, and limiting cases. What does it mean for the design?
>* Most points are lost to skipped steps, not hard math. A clear sketch and a units check earn partial credit even when the arithmetic slips.`),
      ORDER('Put the problem-solving steps in order.', ['Identify knowns and unknowns', 'Sketch the system and list assumptions', 'Write the governing equations', 'Solve symbolically, then substitute numbers with units', 'Check units, magnitude and reasonableness']),
      MC('Which belongs in the **Discussion** step?', ['Checking whether the answer\'s magnitude makes physical sense', 'Listing the given values', 'Drawing a free-body diagram', 'Choosing the governing equations'], 'Discussion means interpreting and sanity-checking the result.'),
      MC('Why solve symbolically before plugging in numbers?', ['It shows how the answer depends on each variable and makes errors easier to catch', 'It\'s faster on a calculator', 'Numbers aren\'t allowed in engineering', 'Units cancel automatically'], 'A symbolic answer can be checked for units and limiting cases.'),
      TF('Stating assumptions (like "neglect friction") is optional if the answer comes out right.', false, 'Assumptions define when the result is valid. Always state them.'),
      G('m.uconv'),
    ]),
  ]);

  /* ================= Unit 2 ================= */
  const u2 = U('m2', 'Forces & Moments', { sub: 'Components, resultants, moments & equilibrium', ch: 'Ch 3' }, [
    L('m2l1', 'Force Components', {
      goal: 'Resolve forces into rectangular components and back to polar form.',
      key: 'A force has magnitude and direction. Rectangular components: $Fₓ = F cos θ$, $Fᵧ = F sin θ$ (θ from +x). Polar form: $F = √{Fₓ² + Fᵧ²}$, $θ = tan⁻¹(Fᵧ/Fₓ)$, then check the quadrant. Wickert & Lewis also write F = Fₓi + Fᵧj. When the angle is given from the y-axis or as a slope (3-4-5 triangle), draw it first. Sine and cosine may swap.',
      formulas: ['Fₓ = F cos θ, Fᵧ = F sin θ', 'F = √{Fₓ² + Fᵧ²}', 'θ = tan⁻¹(Fᵧ/Fₓ)'],
    }, [
      T('Every force is two simpler forces', `
$$ Fₓ = F cos θ   ·   Fᵧ = F sin θ :: θ measured from the +x axis $$
$$ F = √{Fₓ² + Fᵧ²}   ·   θ = tan⁻¹([[Fᵧ|Fₓ]]) $$
>! Slope notation: a force along a 3-4-5 slope has components (4/5)F and (3/5)F. No angle needed.
>* Same skill as PHYS vectors, now applied to brackets, cables and machine parts.`, { fig: D.vector({ deg: 40, label: 'F' }) }),
      G('m.comp'),
      MC('A 500 N force acts along a line with slope 3 (vertical) to 4 (horizontal), up and to the right. Its x-component is…', ['400 N', '300 N', '500 N', '375 N'], 'Hypotenuse 5 → Fₓ = (4/5)(500) = 400 N.', { lvl: 2 }),
      G('m.comp'),
      TF('The components of a force can be larger than the force itself.', false, 'Each component is F times a sine or cosine, so its magnitude is ≤ F.'),
      G('m.comp'),
    ]),
    L('m2l2', 'Resultants', {
      goal: 'Combine several forces into a single resultant.',
      key: 'The resultant of several concurrent forces is their vector sum: $Rₓ = ΣFₓ$, $Rᵧ = ΣFᵧ$, then $R = √{Rₓ² + Rᵧ²}$ and $θ = tan⁻¹(Rᵧ/Rₓ)$ with a quadrant check. Graphically: put the forces tip to tail (the polygon rule). A tabulated component sheet (force | Fₓ | Fᵧ) keeps the signs organized.',
      formulas: ['Rₓ = ΣFₓ, Rᵧ = ΣFᵧ', 'R = √{Rₓ² + Rᵧ²}'],
    }, [
      T('Add components in a table', `
| Force | Fₓ | Fᵧ |
|---|---|---|
| F₁ | F₁ cos θ₁ | F₁ sin θ₁ |
| F₂ | F₂ cos θ₂ | F₂ sin θ₂ |
| **R** | **ΣFₓ** | **ΣFᵧ** |
Then $R = √{Rₓ² + Rᵧ²}$ and $θ = tan⁻¹(Rᵧ/Rₓ)$.
>* The table approach keeps the signs straight, and on exams it earns partial credit even when one number is off.`),
      EX('Two cables on an eyebolt', 'Cables pull with 300 N at 0° and 400 N at 90°. Find R.', ['Rₓ = 300 N, Rᵧ = 400 N', 'R = √(300² + 400²) = **500 N**', 'θ = tan⁻¹(400/300) = **53.1°**']),
      G('m.resultant'),
      MC('Two forces of 100 N act on a point in opposite directions. The resultant is…', ['0 N', '200 N', '100 N', '141 N'], 'Equal and opposite forces cancel.'),
      TF('The resultant of a 300 N and a 400 N force can be anywhere from 100 N to 700 N, depending on the angle between them.', true, 'Opposite → 100 N, perpendicular → 500 N, parallel → 700 N.'),
      G('m.resultant'),
      G('m.resultant'),
    ]),
    L('m2l3', 'Moment of a Force', {
      goal: 'Compute moments with the perpendicular-distance and components methods.',
      key: 'Moment (torque) = the tendency of a force to rotate an object about a point: $M = F·d$, where d is the PERPENDICULAR distance from the point to the force\'s line of action. Sign convention: counterclockwise +. Moment components method: $M = xFᵧ − yFₓ$, where (x, y) is where the force acts relative to the pivot. Units: N·m or ft·lbf. A force whose line of action passes through the point has zero moment.',
      formulas: ['M = F·d⊥', 'M = xFᵧ − yFₓ', 'CCW +'],
    }, [
      T('Perpendicular distance is everything', `
$$ M_O = F · d :: d = perpendicular distance from O to the line of action $$
**Components method:** break F into Fₓ and Fᵧ, and each makes its own moment:
$$ M_O = x Fᵧ − y Fₓ :: (x, y) = where F acts, relative to O $$
>! The distance has to be **perpendicular** to the force. Using the full wrench length with an angled push overestimates the moment.
>* CCW = + and CW = −. Pick the convention once and stick to it.`, { fig: D.torque({ deg: 60 }) }),
      EX('Angled push on a wrench', 'You push with 200 N at 60° to a 0.25 m wrench. Find the moment about the bolt.', ['d⊥ = 0.25 sin 60° = 0.217 m', 'M = 200 × 0.217 = **43.3 N·m**', 'Pushing at 90° would give 50 N·m, the maximum.']),
      G('m.moment'),
      MC('A force\'s line of action passes directly through point O. Its moment about O is…', ['zero', 'maximum', 'equal to F times its distance from O', 'undefined'], 'Perpendicular distance = 0.'),
      G('m.momentcomp'),
      G('m.moment'),
      TF('Moment has the same units as energy (N·m), but it is a different physical quantity.', true, 'Torque is N·m. Energy in N·m is called the joule.'),
      G('m.momentcomp'),
    ]),
    L('m2l4', 'Equilibrium & Free-Body Diagrams', {
      goal: 'Draw FBDs with correct support reactions and solve equilibrium problems.',
      key: 'A rigid body in equilibrium satisfies $ΣFₓ = 0$, $ΣFᵧ = 0$ and $ΣM = 0$ (about ANY point). That\'s three equations, so at most three unknowns in 2D. Supports: a roller (or smooth surface) gives 1 force perpendicular to the surface. A pin gives 2 forces (x and y). A fixed support gives 2 forces + 1 moment. A cable pulls along itself. Take moments about the point where the most unknowns act.',
      formulas: ['ΣFₓ = 0, ΣFᵧ = 0, ΣM = 0', 'roller: 1 · pin: 2 · fixed: 2 + M'],
    }, [
      T('Supports and their reactions', `
| Support | Reactions |
|---|---|
| roller / smooth surface | 1 force, perpendicular to the surface |
| pin (hinge) | 2 forces: Rₓ and Rᵧ |
| fixed (welded, built-in) | Rₓ, Rᵧ and a moment M |
| cable / rope | 1 tension along the cable |
**Equilibrium:** ΣFₓ = 0, ΣFᵧ = 0, ΣM = 0 → solve for up to **3 unknowns** in 2D.
>* Take moments about a pin where two unknown forces act. Both drop out, leaving one equation with one unknown.`, { fig: D.beam({ supports: [{ x: 0, type: 'pin', label: 'R_A' }, { x: 1, type: 'roller', label: 'R_B' }], loads: [{ x: 0.4, label: 'P' }] }) }),
      MATCH('Match each support to its reactions.', [['roller', '1 perpendicular force'], ['pin', '2 force components'], ['fixed support', '2 forces + 1 moment'], ['cable', '1 tension along the cable']]),
      G('m.equil'),
      MC('How many independent equilibrium equations are available for a rigid body in 2D?', ['3', '2', '6', '1'], 'ΣFₓ, ΣFᵧ, ΣM.'),
      G('m.equil'),
      TF('A roller support can resist a force parallel to the surface it rolls on.', false, 'It rolls freely in that direction, so it only pushes perpendicular to the surface.'),
      G('m.reactions'),
    ]),
  ]);

  /* ================= Unit 3 ================= */
  const u3 = U('m3', 'Structures & Trusses', { sub: 'Reactions, method of joints & levers', ch: 'Ch 3 · truss lab' }, [
    L('m3l1', 'Trusses & Two-Force Members', {
      goal: 'State truss assumptions and recognize tension, compression and zero-force members.',
      key: 'A truss is slender members pinned together at joints into triangles, with loads applied only at the joints. Every member is then a two-force member: equal and opposite forces along its own axis, either tension (pulling on the joints) or compression (pushing on them). Zero-force members: at a joint with two non-collinear members and no load, both are zero. At a joint where two members are collinear and a third joins with no load, the third is zero. Triangles make trusses rigid.',
      formulas: ['two-force member: force along its axis', 'T pulls on joints · C pushes on joints'],
    }, [
      T('Why triangles?', `
A triangle can't change shape without changing a side length, so trusses (bridges, roofs, cranes, the truss lab) are built from triangles.
**Truss assumptions:**
1. Members are connected by frictionless **pins**
2. Loads are applied only at **joints**
3. Member weights are neglected
So every member is a **two-force member**, with its force along the member's axis:
- **Tension (T):** the member pulls on its joints (it is being stretched)
- **Compression (C):** the member pushes on its joints (it is being squeezed)`, { fig: D.truss({ deg: 40 }) }),
      T('Zero-force members', `
Spot these before calculating:
1. A joint with **two non-collinear members** and no external load or support: **both** are zero
2. A joint with **two collinear members** plus a third member, and no load: the **third** is zero
>* Zero-force members still matter. They brace long members against buckling and carry loads when the loading changes.`),
      MC('In an ideal truss, members carry forces…', ['only along their own axes (tension or compression)', 'in any direction', 'only perpendicular to their axes', 'only as bending moments'], 'Pinned, joint-loaded members are two-force members.'),
      MC('A member that is being stretched is in…', ['tension', 'compression', 'shear', 'torsion'], 'Stretching means tension. It pulls inward on the joints at its ends.'),
      TF('In a truss, external loads are assumed to act only at the joints.', true, 'That assumption is what makes every member a two-force member.'),
      MC('At an unloaded joint where only two non-collinear members meet, the member forces are…', ['both zero', 'equal and opposite', 'one tension and one compression', 'impossible to find'], 'No other force could balance either one.'),
      G('m.truss'),
    ]),
    L('m3l2', 'Support Reactions', {
      goal: 'Find beam and truss support reactions with moment equations.',
      key: 'Before analyzing members, find the reactions from the whole structure\'s FBD. Take ΣM about one support to get the other support\'s vertical reaction directly, then use ΣFᵧ = 0 for the first. For a simply supported beam with load P at distance a from A (span L): $R_B = Pa/L$, $R_A = P(L − a)/L$. The support nearer the load carries more.',
      formulas: ['R_B = [[Pa|L]], R_A = [[P(L − a)|L]]', 'ΣM about a support → the other reaction'],
    }, [
      T('Whole-structure first', `
1. FBD of the entire truss or beam: loads plus support reactions
2. **ΣM about support A** → gives R_B
3. **ΣFᵧ = 0** → gives R_A
4. ΣFₓ = 0 → horizontal reaction at the pin (often zero)
$$ R_B = [[P·a|L]]   ·   R_A = P − R_B $$`, { fig: D.beam({ supports: [{ x: 0, type: 'pin', label: 'R_A' }, { x: 1, type: 'roller', label: 'R_B' }], loads: [{ x: 0.3, label: 'P' }], dims: [[0, 0.3, 'a'], [0.3, 1, 'L − a']] }) }),
      G('m.reactions'),
      G('m.reactions'),
      MC('A load sits closer to support A than to support B. Which support carries more of the load?', ['A', 'B', 'They share equally', 'Neither, the beam carries it'], 'R_A = P(L − a)/L is larger when a is small.'),
      G('m.reactions2'),
      G('m.reactions2'),
    ]),
    L('m3l3', 'Method of Joints', {
      goal: 'Solve a truss for member forces, joint by joint.',
      key: 'Method of joints: 1) find the support reactions, 2) start at a joint with no more than 2 unknown member forces, 3) assume every unknown member is in tension (force arrow pointing away from the joint), 4) apply ΣFₓ = 0 and ΣFᵧ = 0 at the joint, 5) a negative answer means compression, 6) move on to the next joint with ≤ 2 unknowns. For a symmetric triangle with apex load P and base angle θ: the inclined members carry $P/(2 sin θ)$ in compression, and the bottom chord carries $P/(2 tan θ)$ in tension.',
      formulas: ['joint: ΣFₓ = 0, ΣFᵧ = 0', 'assume tension; negative → compression', 'apex-loaded triangle: F_{side} = [[P|2 sin θ]] (C)'],
    }, [
      T('Joint by joint', `
Each pin is a tiny particle in equilibrium, so it gets **two** equations: ΣFₓ = 0 and ΣFᵧ = 0.
1. Solve the support reactions first
2. Start at a joint with **≤ 2 unknowns** (usually a support)
3. Draw member forces pointing **away** from the joint (assume tension)
4. Solve. **Positive = tension, negative = compression**
5. Carry the known forces to the next joint
>! Steep members carry less force. Shallow trusses (small θ) see huge member forces, which is why bridge trusses are tall.`, { fig: D.truss({ deg: 45, P: 'P' }) }),
      EX('Apex-loaded triangle', 'A 2000 N load sits at the apex of a symmetric truss with 45° sides. Find F_AC and F_AB.', ['Reactions: R_A = R_B = 1000 N', 'Joint A, ΣFᵧ: F_AC sin 45° = 1000 → F_AC = 1414 N, pushing → **compression**', 'Joint A, ΣFₓ: F_AB = 1414 cos 45° = **1000 N tension**']),
      G('m.truss'),
      ORDER('Order the method-of-joints steps.', ['Solve the support reactions', 'Pick a joint with at most two unknown member forces', 'Draw unknowns as tension (away from the joint)', 'Apply ΣFₓ = 0 and ΣFᵧ = 0', 'Move to the next joint using the forces just found']),
      G('m.truss'),
      MC('Your joint equation gives a member force of −850 N, with tension assumed. The member is…', ['in compression, 850 N', 'in tension, 850 N', 'a zero-force member', 'overloaded'], 'Negative means the assumed direction was wrong: compression.'),
      G('m.truss'),
    ]),
    L('m3l4', 'Levers & Mechanical Advantage', {
      goal: 'Analyze levers, pliers and other simple machines with moment balance.',
      key: 'Moment balance about the pivot gives $F_{in}·d_{in} = F_{out}·d_{out}$, so the mechanical advantage is $MA = F_{out}/F_{in} = d_{in}/d_{out}$. Long handles and short jaws (pliers, bolt cutters) give a large force. The trade-off: the output moves a shorter distance (work in = work out, ideally). Lever classes: 1st (pivot between, like a seesaw or pliers), 2nd (load between, like a wheelbarrow), 3rd (effort between, like tweezers or your forearm).',
      formulas: ['MA = [[F_{out}|F_{in}]] = [[d_{in}|d_{out}]]', 'F_{in}d_{in} = F_{out}d_{out}'],
    }, [
      T('Trading distance for force', `
$$ F_{in} d_{in} = F_{out} d_{out}   ⇒   MA = [[d_{in}|d_{out}]] $$
| Class | Arrangement | Example |
|---|---|---|
| 1st | pivot between effort and load | pliers, seesaw |
| 2nd | load between pivot and effort | wheelbarrow, nutcracker |
| 3rd | effort between pivot and load | tweezers, your forearm |
>* There's no free lunch: a large MA means the output moves a short distance. Ideally the work in equals the work out.`),
      G('m.lever'),
      MC('Which lever class is a wheelbarrow?', ['2nd class', '1st class', '3rd class', 'not a lever'], 'Wheel = pivot, the load sits in the middle, you lift the handles.'),
      G('m.lever'),
      TF('A 3rd-class lever (like tweezers) has a mechanical advantage less than 1.', true, 'Effort is closer to the pivot than the load, so you trade force for motion.'),
      G('m.lever'),
    ]),
  ]);

  /* ================= Unit 4 ================= */
  const u4 = U('m4', 'Materials & Stresses', { sub: 'Stress, strain, shear & safety factor', ch: 'Ch 4' }, [
    L('m4l1', 'Tension & Compression Stress', {
      goal: 'Compute normal stress in rods and bars.',
      key: 'Normal stress = internal force per cross-sectional area: $σ = F/A$. Tension is positive and compression negative. Units: Pa = N/m² (often MPa = N/mm²) or psi = lbf/in² (ksi = 1000 psi). For a round rod, $A = πd²/4$. Stress, not force, decides whether a part fails, so a thin rod and a thick rod with the same load have very different stresses.',
      formulas: ['σ = [[F|A]]', 'A_{circle} = [[πd²|4]]', '1 MPa = 1 N/mm² · 1 ksi = 6.895 MPa'],
    }, [
      T('Force spread over area', `
$$ σ = [[F|A]] :: normal stress $$
- **Tension** (+): the member is pulled
- **Compression** (−): the member is pushed
Units: **MPa = N/mm²** is handy, because you can use forces in N and areas in mm² directly.
>! Use the **diameter** correctly: A = πd²/4, not πd². A wrong area is the most common stress mistake.`),
      EX('Hanging load', 'A 10 mm diameter steel rod holds 8.0 kN. Find σ.', ['A = π(10)²/4 = 78.5 mm²', 'σ = 8000 N / 78.5 mm² = **102 MPa** (tension)']),
      G('m.stress'),
      MC('If you double the diameter of a rod under the same load, the stress becomes…', ['¼ as large', '½ as large', 'the same', '2 times larger'], 'Area ∝ d², so 4× the area means ¼ the stress.'),
      G('m.stress'),
      TF('1 MPa equals 1 N/mm².', true, '10⁶ N/m² = 1 N/(10⁻³ m)².'),
      G('m.stress'),
    ]),
    L('m4l2', 'Strain & Hooke\'s Law', {
      goal: 'Relate stress, strain and elongation with the elastic modulus.',
      key: 'Strain is the fractional elongation: $ε = ΔL/L$ (dimensionless). In the elastic region, Hooke\'s law gives $σ = Eε$, where E is the elastic (Young\'s) modulus: steel ≈ 200 GPa (30 Mpsi), aluminum ≈ 70 GPa (10 Mpsi), titanium ≈ 114 GPa. Combined: $ΔL = FL/(EA)$. Stiffness (E) is not the same as strength (S_y): aluminum alloys can be strong but are still only ⅓ as stiff as steel.',
      formulas: ['ε = [[ΔL|L]]', 'σ = Eε', 'ΔL = [[FL|EA]]'],
    }, [
      T('Stretchiness and stiffness', `
$$ ε = [[ΔL|L]]   ·   σ = Eε   ⇒   ΔL = [[F L|E A]] $$
| Material | E (GPa) | E (Mpsi) |
|---|---|---|
| steel | 200 | 30 |
| titanium | 114 | 16.5 |
| aluminum | 70 | 10 |
| polymers | 1–3 | 0.2–0.5 |
>! **Stiffness ≠ strength.** E tells you how much it stretches. Yield strength tells you when it permanently deforms.`),
      G('m.elong'),
      MC('An aluminum rod and a steel rod are identical in size and load. Which stretches more?', ['aluminum, by about 3×', 'steel', 'they stretch equally', 'neither stretches'], 'ΔL ∝ 1/E, and E_Al ≈ ⅓ E_steel.'),
      G('m.elong'),
      TF('Strain has units of millimeters.', false, 'Strain is length/length: dimensionless.'),
      G('m.elong'),
    ]),
    L('m4l3', 'Stress–Strain Curve & Material Behavior', {
      goal: 'Read a stress–strain curve and tell ductile from brittle behavior.',
      key: 'Tensile-test curve: a linear elastic region (slope E) up to the proportional/elastic limit. Unloading in this region returns the part to its original length. The **yield strength** S_y is where permanent (plastic) deformation begins, and it is the usual design limit. The **ultimate strength** S_u is the maximum stress. Then necking and fracture. Ductile materials (steel, aluminum) deform a lot before fracture, giving a visible warning. Brittle materials (cast iron, glass, ceramics) fracture with little deformation. Poisson\'s ratio $ν = −ε_{lateral}/ε_{axial}$ (about 0.3 for metals): stretching makes a bar thinner.',
      formulas: ['S_y: yield (design limit)', 'S_u: ultimate (maximum)', 'ν = −[[ε_{lat}|ε_{axial}]] ≈ 0.3'],
    }, [
      T('Reading the curve', `
Pull a sample until it breaks:
1. **Elastic region:** straight line, slope = E. Release the load and it springs back.
2. **Yield point (S_y):** permanent deformation starts. **Design to stay below this.**
3. **Plastic region:** strain hardening up to **ultimate strength (S_u)**
4. **Necking and fracture**
**Ductile** (steel, aluminum, copper): big plastic region, bends before breaking.
**Brittle** (glass, cast iron, ceramics): breaks with almost no plastic strain.`, { fig: D.stressStrain() }),
      MATCH('Match each point on the stress–strain curve to its meaning.', [['slope of the linear region', 'elastic modulus E'], ['yield strength', 'start of permanent deformation'], ['ultimate strength', 'maximum stress'], ['fracture', 'the sample breaks']]),
      MC('Which stress do designers usually keep parts below?', ['the yield strength', 'the ultimate strength', 'the fracture stress', 'the elastic modulus'], 'Above yield, parts permanently deform, which counts as failure in most designs.'),
      MC('Which material is **brittle**?', ['glass', 'mild steel', 'copper', 'aluminum'], 'Glass fractures with almost no plastic deformation.'),
      G('m.poisson'),
      TF('A ductile material gives visible warning (stretching or bending) before it fractures.', true, 'Its large plastic region shows up as obvious deformation.'),
    ]),
    L('m4l4', 'Shear Stress', {
      goal: 'Compute shear stress in pins and bolts in single and double shear.',
      key: 'Shear stress = force parallel to a surface divided by that area: $τ = V/A$. For a pin or bolt, the shear area is its cross-section, $A = πd²/4$, at each shear plane. **Single shear** (two overlapping plates): 1 plane, $τ = F/A$. **Double shear** (clevis, 3 plates): 2 planes share the load, $τ = F/(2A)$, so the same pin carries twice the load. Shear strength is roughly 0.5–0.6 × S_y for ductile metals.',
      formulas: ['τ = [[V|A]]', 'single: τ = [[F|A]] · double: τ = [[F|2A]]'],
    }, [
      T('Slicing forces', `
When forces try to slide one part of a material past another, they create **shear stress**:
$$ τ = [[V|A]] $$
**Pins and bolts:** count the planes where the pin could be cut.
- **Single shear** (two plates overlap): 1 plane → $τ = F/A$
- **Double shear** (a clevis, 3 plates): 2 planes → $τ = F/(2A)$
>* Same pin, same load: double shear halves the stress. That's why clevis joints are everywhere.`, { fig: D.shear({ double: true }) }),
      G('m.shear'),
      MC('A clevis joint puts its pin in double shear. Compared with single shear, the pin\'s shear stress for the same load is…', ['half', 'double', 'the same', 'a quarter'], 'Two planes share the load.'),
      G('m.shear'),
      TF('In shear, the force is perpendicular to the area that resists it.', false, 'Shear forces act parallel to the area. Normal stresses are perpendicular.'),
      G('m.shear'),
    ]),
    L('m4l5', 'Materials Selection & Factor of Safety', {
      goal: 'Choose material families and design with a factor of safety.',
      key: 'Material families: metals (strong, stiff, ductile, conduct: steel, aluminum, titanium), polymers (light, cheap, low E, temperature-limited), ceramics (hard, heat-resistant, brittle), composites (fibers in a matrix, high strength-to-weight: carbon fiber, fiberglass). Selection weighs strength, stiffness, density, cost, manufacturability and environment. Factor of safety: $FS = S_y/σ_{actual}$ (failure stress ÷ working stress). Design: allowable stress = S_y/FS, and required area = F/σ_allow. Typical FS is 1.5–4, higher for uncertain loads or materials or for life-safety parts.',
      formulas: ['FS = [[S_y|σ]]', 'σ_{allow} = [[S_y|FS]]', 'A_{req} = [[F|σ_{allow}]]'],
    }, [
      T('Pick the right stuff', `
| Family | Strengths | Weaknesses | Examples |
|---|---|---|---|
| metals | strong, stiff, ductile | heavy (steel), corrosion | steel, Al, Ti |
| polymers | light, cheap, easy to mold | low stiffness, heat limits | ABS, nylon |
| ceramics | hard, heat- and wear-resistant | brittle | alumina, SiC |
| composites | high strength/weight | cost, hard to repair | carbon fiber |`),
      T('Factor of safety', `
$$ FS = [[S_y|σ_{working}]] $$
FS = 2 means the part could take twice the expected stress before yielding.
**Sizing a part:** $σ_{allow} = S_y/FS$, then $A = F/σ_{allow}$, then pick the next standard size up.
>! FS < 1 means the part is predicted to yield. Higher FS is chosen when loads are uncertain or a failure would hurt people.`),
      G('m.fs'),
      MC('Which material family gives the best strength-to-weight ratio for a race-car body?', ['composites (carbon fiber)', 'ceramics', 'cast iron', 'unreinforced polymers'], 'Carbon-fiber composites are extremely strong for their weight.'),
      G('m.fs'),
      MC('A part has S_y = 300 MPa and a working stress of 100 MPa. Its factor of safety is…', ['3', '0.33', '200', '30'], 'FS = 300/100.'),
      G('m.fs'),
      TF('A factor of safety of 0.8 means the part is expected to yield.', true, 'The working stress exceeds the yield strength.'),
    ]),
  ]);

  CQ.addUnits('mech', [u1, u2, u3, u4]);
})();
