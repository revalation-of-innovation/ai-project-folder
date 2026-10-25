/* MECH 1208 · Units 5–8: fluids, thermal & energy systems, motion & power transmission,
   design / drawings / CAD (Wickert & Lewis Ch 5–8, plus SolidWorks) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const PI = Math.PI;
  const g = 9.81;

  /* ================= generators: Unit 5 ================= */
  CQ.gen('m.hydro', (R) => {
    const k = R.int(0, 1);
    if (k === 0) { const h = R.pick([2, 5, 10, 25, 50, 100]); const p = 1000 * g * h; return { t: 'num', q: 'What is the **gauge** pressure at a depth of **' + h + ' m** in fresh water (ρ = 1000 kg/m³)? Answer in kPa.', a: p / 1000, unit: 'kPa', steps: ['p_gauge = ρgh = 1000 × 9.81 × ' + h, '= ' + F(p) + ' Pa = **' + F(p / 1000) + ' kPa**'] }; }
    const h = R.pick([3, 10, 30]); const p = 101.3 + (1025 * g * h) / 1000;
    return { t: 'num', lvl: 3, q: 'A diver is **' + h + ' m** below the surface of seawater (ρ = 1025 kg/m³). What is the **absolute** pressure on her, in kPa? (atmospheric = 101.3 kPa)', a: p, unit: 'kPa', steps: ['p_abs = p_atm + ρgh', '= 101.3 + 1025(9.81)(' + h + ')/1000', '= **' + F(p) + ' kPa**'], why: 'Every 10 m of water adds about one atmosphere.' };
  });

  CQ.gen('m.buoy', (R) => {
    const k = R.int(0, 1);
    if (k === 0) { const V = R.pick([0.002, 0.01, 0.05, 0.2]); return { t: 'num', q: 'A sealed **' + V * 1000 + ' L** container is held completely under fresh water. What buoyant force acts on it?', a: 1000 * g * V, unit: 'N', fig: D.buoy(), steps: ['F_B = ρ_fluid g V_displaced', '= 1000 × 9.81 × ' + V + ' = **' + F(1000 * g * V) + ' N**'] }; }
    const rho = R.pick([600, 700, 850, 920]), fl = R.pick([['fresh water', 1000], ['seawater', 1025]]);
    return { t: 'num', lvl: 3, q: 'A block with density **' + rho + ' kg/m³** floats in ' + fl[0] + ' (ρ = ' + fl[1] + ' kg/m³). What fraction of its volume is submerged? (decimal)', a: rho / fl[1], unit: '', fig: D.buoy(),
      steps: ['Floating: F_B = W → ρ_fluid g V_sub = ρ_block g V', 'V_sub/V = ρ_block/ρ_fluid = **' + F(rho / fl[1]) + '**'], why: rho === 920 ? 'That\'s why about 90% of an iceberg is underwater.' : '' };
  });

  CQ.gen('m.re', (R) => {
    const fl = R.pick([['water', 1000, 1.0e-3], ['air', 1.2, 1.8e-5], ['SAE 30 oil', 917, 0.26]]);
    const v = R.pick([0.1, 0.5, 1, 2, 5]), d = R.pick([0.01, 0.025, 0.05, 0.1]);
    const Re = (fl[1] * v * d) / fl[2];
    const regime = Re < 2000 ? 'laminar' : Re > 4000 ? 'turbulent' : 'transitional';
    if (R.chance(0.5)) return { t: 'num', lvl: 3, q: fl[0][0].toUpperCase() + fl[0].slice(1) + ' (ρ = ' + fl[1] + ' kg/m³, μ = ' + F(fl[2], 2) + ' kg/(m·s)) flows at **' + v + ' m/s** through a pipe of diameter **' + d * 100 + ' cm**. What is the Reynolds number?', a: Re, unit: '',
      steps: ['Re = [[ρvd|μ]]', '= (' + fl[1] + ')(' + v + ')(' + d + ')/' + F(fl[2], 2), 'Re = **' + F(Re) + '** → ' + regime] };
    return { t: 'mc', lvl: 3, q: fl[0][0].toUpperCase() + fl[0].slice(1) + ' (ρ = ' + fl[1] + ', μ = ' + F(fl[2], 2) + ' SI) flows at **' + v + ' m/s** in a **' + d * 100 + ' cm** pipe. The flow is…', opts: [regime].concat(['laminar', 'turbulent', 'transitional'].filter((x) => x !== regime)),
      steps: ['Re = ρvd/μ = ' + F(Re), 'Pipe flow: Re < ~2000 laminar, > ~4000 turbulent'] };
  });

  CQ.gen('m.drag', (R) => {
    const v = R.pick([15, 20, 25, 30, 35]), A = R.pick([1.8, 2.0, 2.2, 2.5]), Cd = R.pick([0.25, 0.3, 0.35, 0.45]);
    const Fd = 0.5 * 1.2 * v * v * A * Cd;
    const want = R.pick(['F', 'P']);
    return { t: 'num', lvl: want === 'P' ? 4 : 3, q: 'A car with frontal area **' + A + ' m²** and drag coefficient **C_D = ' + Cd + '** drives at **' + v + ' m/s** through air (ρ = 1.2 kg/m³). ' + (want === 'F' ? 'What is the drag force?' : 'How much power (kW) goes into overcoming drag?'), a: want === 'F' ? Fd : (Fd * v) / 1000, unit: want === 'F' ? 'N' : 'kW',
      steps: ['F_D = ½ρv²AC_D = ½(1.2)(' + v + ')²(' + A + ')(' + Cd + ') = ' + F(Fd) + ' N', ...(want === 'P' ? ['P = F_D v = ' + F(Fd) + ' × ' + v + ' = ' + F(Fd * v) + ' W = **' + F((Fd * v) / 1000) + ' kW**'] : ['F_D = **' + F(Fd) + ' N**'])],
      why: 'Drag grows with v², and drag power with v³. That\'s why highway speed costs so much fuel.' };
  });

  CQ.gen('m.flow', (R) => {
    const d1 = R.pick([4, 5, 6, 8, 10]) / 100, d2r = R.pick([0.5, 0.4, 0.6]), v1 = R.pick([0.5, 1, 1.5, 2]);
    const d2 = d1 * d2r;
    const want = R.pick(['v2', 'Q']);
    const A1 = (PI * d1 * d1) / 4, Q = A1 * v1, v2 = v1 / (d2r * d2r);
    if (want === 'Q') return { t: 'num', q: 'Water flows at **' + v1 + ' m/s** in a pipe with inner diameter **' + d1 * 100 + ' cm**. What is the volumetric flow rate in liters per second?', a: Q * 1000, unit: 'L/s', steps: ['A = πd²/4 = ' + F(A1) + ' m²', 'Q = Av = ' + F(Q) + ' m³/s = **' + F(Q * 1000) + ' L/s**'] };
    return { t: 'num', lvl: 3, q: 'Water flows at **' + v1 + ' m/s** in a **' + d1 * 100 + ' cm** pipe, which narrows to **' + F(d2 * 100) + ' cm**. How fast does it flow in the narrow section?', a: v2, unit: 'm/s', fig: D.pipe(),
      steps: ['Continuity: A₁v₁ = A₂v₂', 'v₂ = v₁(d₁/d₂)² = ' + v1 + ' × (' + F(1 / d2r) + ')² = **' + F(v2) + ' m/s**'] };
  });

  /* ================= generators: Unit 6 ================= */
  CQ.gen('m.energy', (R) => {
    const k = R.int(0, 3);
    if (k === 0) { const kwh = R.pick([1, 2.5, 10, 30]); return { t: 'num', q: 'How many megajoules are in **' + kwh + ' kWh**?', a: kwh * 3.6, unit: 'MJ', steps: ['1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J', kwh + ' × 3.6 = **' + F(kwh * 3.6) + ' MJ**'] }; }
    if (k === 1) { const btu = R.pick([1000, 5000, 12000, 100000]); return { t: 'num', q: 'An air conditioner is rated at **' + btu + ' Btu**. How many kJ is that? (1 Btu = 1.055 kJ)', a: btu * 1.055, unit: 'kJ', steps: [btu + ' × 1.055 = **' + F(btu * 1.055) + ' kJ**'] }; }
    if (k === 2) { const P = R.pick([60, 100, 1200, 1500]), h = R.pick([2, 5, 8, 24]); return { t: 'num', q: 'A **' + P + ' W** device runs for **' + h + ' h**. How much energy does it use, in kWh?', a: (P * h) / 1000, unit: 'kWh', steps: ['E = Pt = ' + P / 1000 + ' kW × ' + h + ' h = **' + F((P * h) / 1000) + ' kWh**'] }; }
    const m = R.pick([1, 5, 20, 50]), dT = R.pick([10, 25, 50, 80]); return { t: 'num', lvl: 3, q: 'How much heat (kJ) raises **' + m + ' kg** of water by **' + dT + ' °C**? (c = 4.19 kJ/kg·°C)', a: m * 4.19 * dT, unit: 'kJ', steps: ['Q = mcΔT = ' + m + ' × 4.19 × ' + dT + ' = **' + F(m * 4.19 * dT) + ' kJ**'] };
  });

  CQ.gen('m.eff', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const e = [R.pick([0.35, 0.4, 0.45]), R.pick([0.9, 0.95]), R.pick([0.85, 0.9])]; const tot = e[0] * e[1] * e[2]; return { t: 'num', lvl: 3, q: 'A power plant converts fuel energy with **' + e[0] * 100 + '%** efficiency, its generator is **' + e[1] * 100 + '%** efficient, and transmission loses enough to be **' + e[2] * 100 + '%** efficient. What is the overall efficiency (%)?', a: tot * 100, unit: '%', steps: ['Efficiencies in series multiply', 'η = ' + e.join(' × ') + ' = **' + F(tot * 100) + '%**'] }; }
    if (k === 1) { const P = R.pick([50, 100, 150]), eta = R.pick([0.25, 0.3, 0.35]), HV = 45; const fuel = (P / eta / (HV * 1000)) * 3600; return { t: 'num', lvl: 4, exam: true, q: 'An engine with **' + eta * 100 + '%** efficiency delivers **' + P + ' kW** of shaft power. Gasoline has a heating value of **45 MJ/kg**. How many kg of fuel does it burn per hour?', a: fuel, unit: 'kg/h', steps: ['Fuel power needed = ' + P + '/' + eta + ' = ' + F(P / eta) + ' kW', 'Fuel rate = ' + F(P / eta) + ' kJ/s ÷ 45,000 kJ/kg = ' + F(P / eta / 45000) + ' kg/s', '× 3600 = **' + F(fuel) + ' kg/h**'] }; }
    const In = R.pick([500, 1000, 1500]), Out = In * R.pick([0.6, 0.75, 0.85]); return { t: 'num', q: 'An electric motor draws **' + In + ' W** and delivers **' + F(Out) + ' W** of mechanical power. What is its efficiency (%)?', a: (100 * Out) / In, unit: '%', steps: ['η = output/input = ' + F(Out) + '/' + In + ' = **' + F((100 * Out) / In) + '%**'] };
  });

  CQ.gen('m.cond', (R) => {
    const mats = [['brick', 0.7], ['glass', 0.8], ['concrete', 1.4], ['fiberglass insulation', 0.04], ['wood', 0.15], ['steel', 50]];
    const [mat, k] = R.pick(mats);
    const A = R.pick([1, 2, 5, 10]), Lw = R.pick([0.005, 0.01, 0.05, 0.1, 0.2]), dT = R.pick([10, 20, 30]);
    const q = (k * A * dT) / Lw;
    return { t: 'num', lvl: 3, q: 'Heat conducts through a **' + mat + '** panel (κ = ' + k + ' W/m·°C), **' + A + ' m²** in area and **' + Lw * 100 + ' cm** thick, with a **' + dT + ' °C** temperature difference across it. What is the heat flow rate?', a: q, unit: 'W', fig: D.wall(),
      steps: ['Fourier\'s law: q = [[κAΔT|L]]', '= (' + k + ')(' + A + ')(' + dT + ')/' + Lw, 'q = **' + F(q) + ' W**'] };
  });

  CQ.gen('m.carnot', (R) => {
    const Th = R.pick([400, 500, 600, 800, 1000]), Tl = R.pick([20, 25, 30]);
    const eta = 1 - (Tl + 273) / (Th + 273);
    return { t: 'num', lvl: 3, q: 'A heat engine runs between a hot source at **' + Th + ' °C** and the environment at **' + Tl + ' °C**. What is its maximum (Carnot) efficiency, in %?', a: eta * 100, unit: '%',
      steps: ['Convert to kelvin: T_h = ' + (Th + 273) + ' K, T_l = ' + (Tl + 273) + ' K', 'η_Carnot = 1 − T_l/T_h = 1 − ' + (Tl + 273) + '/' + (Th + 273), 'η = **' + F(eta * 100) + '%**'], why: 'Real engines reach only a fraction of the Carnot limit.' };
  });

  CQ.gen('m.engine', (R) => {
    const Qh = R.pick([1000, 2000, 5000, 8000]), eta = R.pick([0.2, 0.25, 0.3, 0.4]);
    const W = Qh * eta;
    const want = R.pick(['W', 'Ql']);
    return { t: 'num', q: 'A heat engine absorbs **' + Qh + ' kJ** from its hot source each cycle and is **' + eta * 100 + '%** efficient. How much ' + (want === 'W' ? 'work does it produce' : 'heat does it reject to the cold side') + ' per cycle?', a: want === 'W' ? W : Qh - W, unit: 'kJ',
      steps: ['W = ηQ_h = ' + eta + ' × ' + Qh + ' = ' + F(W) + ' kJ', 'Energy balance: Q_l = Q_h − W = ' + F(Qh - W) + ' kJ', 'Answer: **' + F(want === 'W' ? W : Qh - W) + ' kJ**'] };
  });

  /* ================= generators: Unit 7 ================= */
  CQ.gen('m.rpm', (R) => {
    const rpm = R.pick([300, 600, 1200, 1800, 3600]), r = R.pick([0.05, 0.1, 0.15, 0.25]);
    const w = (rpm * 2 * PI) / 60;
    if (R.chance(0.5)) return { t: 'num', q: 'A shaft turns at **' + rpm + ' rpm**. What is its angular velocity in rad/s?', a: w, unit: 'rad/s', steps: ['ω = rpm × 2π/60 = **' + F(w) + ' rad/s**'] };
    return { t: 'num', q: 'A **' + r * 200 + ' cm** diameter pulley turns at **' + rpm + ' rpm**. What is the speed of a point on its rim?', a: r * w, unit: 'm/s', steps: ['ω = ' + F(w) + ' rad/s', 'v = rω = ' + r + ' × ' + F(w) + ' = **' + F(r * w) + ' m/s**'] };
  });

  CQ.gen('m.power', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const T = R.pick([50, 150, 250, 400]), rpm = R.pick([1500, 2500, 3500, 5000]); const P = (T * rpm * 2 * PI) / 60; return { t: 'num', q: 'An engine produces **' + T + ' N·m** of torque at **' + rpm + ' rpm**. What is its power in kW?', a: P / 1000, unit: 'kW', steps: ['ω = ' + rpm + ' × 2π/60 = ' + F((rpm * 2 * PI) / 60) + ' rad/s', 'P = Tω = **' + F(P / 1000) + ' kW**'] }; }
    if (k === 1) { const T = R.pick([200, 300, 400]), rpm = R.pick([2000, 3000, 5252, 6000]); return { t: 'num', q: 'An engine makes **' + T + ' ft·lbf** of torque at **' + rpm + ' rpm**. How much horsepower is that?', a: (T * rpm) / 5252, unit: 'hp', steps: ['P(hp) = [[T(ft·lbf) × rpm|5252]]', '= ' + T + ' × ' + rpm + '/5252 = **' + F((T * rpm) / 5252) + ' hp**'] }; }
    const P = R.pick([1, 2, 5, 10]), rpm = R.pick([900, 1200, 1800]); const T = (P * 1000) / ((rpm * 2 * PI) / 60);
    return { t: 'num', lvl: 3, q: 'A **' + P + ' kW** motor runs at **' + rpm + ' rpm**. What torque does it deliver?', a: T, unit: 'N·m', steps: ['ω = ' + F((rpm * 2 * PI) / 60) + ' rad/s', 'T = P/ω = ' + P * 1000 + '/' + F((rpm * 2 * PI) / 60) + ' = **' + F(T) + ' N·m**'] };
  });

  CQ.gen('m.gear', (R) => {
    const N1 = R.pick([12, 15, 16, 20, 24]), N2 = R.pick([36, 40, 45, 48, 60, 72]);
    const w1 = R.pick([600, 900, 1200, 1800]), T1 = R.pick([10, 20, 30, 50]);
    const want = R.pick(['w', 'T', 'VR']);
    const vr = N2 / N1;
    return { t: 'num', lvl: 3, q: 'A **' + N1 + '-tooth** pinion driven at **' + w1 + ' rpm** with **' + T1 + ' N·m** meshes with a **' + N2 + '-tooth** gear. ' + { w: 'What is the output speed (rpm)?', T: 'What is the output torque (ideal, no losses)?', VR: 'What is the velocity ratio (input speed ÷ output speed)?' }[want], a: want === 'w' ? w1 / vr : want === 'T' ? T1 * vr : vr, unit: want === 'w' ? 'rpm' : want === 'T' ? 'N·m' : '',
      fig: D.gears({ n1: N1, n2: N2 }),
      steps: ['Velocity ratio VR = N_out/N_in = ' + N2 + '/' + N1 + ' = ' + F(vr), 'ω_out = ω_in/VR = ' + F(w1 / vr) + ' rpm (opposite direction)', 'T_out = T_in × VR = ' + F(T1 * vr) + ' N·m', 'Answer: **' + F(want === 'w' ? w1 / vr : want === 'T' ? T1 * vr : vr) + '**'],
      why: 'Gears trade speed for torque. Power stays (ideally) the same: T₁ω₁ = T₂ω₂.' };
  });

  CQ.gen('m.train', (R) => {
    const N = [R.pick([12, 15, 18]), R.pick([36, 45, 54]), R.pick([12, 16, 20]), R.pick([40, 48, 60])];
    const w1 = R.pick([1200, 1800, 3600]);
    const vr = (N[1] / N[0]) * (N[3] / N[2]);
    const want = R.pick(['w', 'VR']);
    return { t: 'num', lvl: 4, exam: true, q: 'Compound gear train: gear 1 (**' + N[0] + ' T**, input at **' + w1 + ' rpm**) drives gear 2 (**' + N[1] + ' T**). Gear 3 (**' + N[2] + ' T**) is on the same shaft as gear 2 and drives gear 4 (**' + N[3] + ' T**, output). ' + (want === 'w' ? 'What is the output speed in rpm?' : 'What is the overall velocity ratio?'), a: want === 'w' ? w1 / vr : vr, unit: want === 'w' ? 'rpm' : '',
      fig: D.train(),
      steps: ['Stage 1: N₂/N₁ = ' + F(N[1] / N[0]), 'Stage 2: N₄/N₃ = ' + F(N[3] / N[2]), 'Overall VR = product = ' + F(vr), ...(want === 'w' ? ['ω₄ = ' + w1 + '/' + F(vr) + ' = **' + F(w1 / vr) + ' rpm**'] : ['VR = **' + F(vr) + '**'])],
      why: 'Gears on a common shaft turn at the same speed, so the stage ratios multiply. Two external meshes mean the output turns the same direction as the input.' };
  });

  CQ.gen('m.rack', (R) => {
    const d = R.pick([40, 50, 60, 80]) / 1000, rpm = R.pick([30, 60, 100, 120]);
    const v = (d / 2) * ((rpm * 2 * PI) / 60);
    return { t: 'num', q: 'A rack-and-pinion has a pinion with pitch diameter **' + d * 1000 + ' mm** turning at **' + rpm + ' rpm**. How fast does the rack move?', a: v, unit: 'm/s', steps: ['ω = ' + F((rpm * 2 * PI) / 60) + ' rad/s', 'v_rack = rω = ' + d / 2 + ' × ' + F((rpm * 2 * PI) / 60) + ' = **' + F(v) + ' m/s**'] };
  });

  CQ.gen('m.belt', (R) => {
    const d1 = R.pick([60, 80, 100]), d2 = R.pick([150, 200, 250, 300]), w1 = R.pick([1750, 1150, 3450]);
    return { t: 'num', q: 'A **' + d1 + ' mm** motor pulley turning at **' + w1 + ' rpm** drives a **' + d2 + ' mm** pulley with a belt (no slip). How fast does the driven pulley turn?', a: (w1 * d1) / d2, unit: 'rpm', steps: ['Same belt speed: ω₁d₁ = ω₂d₂', 'ω₂ = ' + w1 + ' × ' + d1 + '/' + d2 + ' = **' + F((w1 * d1) / d2) + ' rpm** (same direction as the driver)'] };
  });

  /* ================= generators: Unit 8 ================= */
  CQ.gen('m.tol', (R) => {
    const nom = R.pick([10, 12, 20, 25, 40]), th = R.pick([0.02, 0.05, 0.1]), sh = R.pick([0.02, 0.05]);
    const holeMin = nom, holeMax = nom + th, shaftMax = nom - sh, shaftMin = nom - sh - th;
    const want = R.pick(['min', 'max']);
    return { t: 'num', lvl: 3, q: 'A hole is dimensioned **' + nom.toFixed(2) + ' +' + th.toFixed(2) + '/−0.00 mm** and the mating shaft **' + shaftMax.toFixed(2) + ' +0.00/−' + th.toFixed(2) + ' mm**. What is the **' + (want === 'min' ? 'minimum' : 'maximum') + ' clearance** between them?', a: want === 'min' ? holeMin - shaftMax : holeMax - shaftMin, unit: 'mm', abs: 0.0005,
      steps: ['Hole: ' + holeMin.toFixed(2) + ' to ' + holeMax.toFixed(2) + ' mm', 'Shaft: ' + shaftMin.toFixed(2) + ' to ' + shaftMax.toFixed(2) + ' mm', want === 'min' ? 'Min clearance = smallest hole − largest shaft = **' + (holeMin - shaftMax).toFixed(2) + ' mm**' : 'Max clearance = largest hole − smallest shaft = **' + (holeMax - shaftMin).toFixed(2) + ' mm**'] };
  });

  CQ.gen('m.decision', (R) => {
    const w = R.pick([[0.4, 0.3, 0.3], [0.5, 0.3, 0.2], [0.3, 0.4, 0.3]]);
    const A = [R.int(5, 9), R.int(4, 9), R.int(3, 8)], B = [R.int(4, 9), R.int(5, 9), R.int(4, 9)];
    const sa = A.reduce((s, x, i) => s + x * w[i], 0), sb = B.reduce((s, x, i) => s + x * w[i], 0);
    if (Math.abs(sa - sb) < 0.05) return CQ.gens['m.decision'](R);
    return { t: 'num', lvl: 3, q: 'Decision matrix (scores 1–10). Criteria weights: **cost ' + w[0] + ', weight ' + w[1] + ', durability ' + w[2] + '**. Concept A scores **' + A.join(', ') + '**. Concept B scores **' + B.join(', ') + '**. What is the weighted score of the **winning** concept?', a: Math.max(sa, sb), unit: '', abs: 0.01,
      steps: ['A: ' + A.map((x, i) => x + '×' + w[i]).join(' + ') + ' = ' + F(sa), 'B: ' + B.map((x, i) => x + '×' + w[i]).join(' + ') + ' = ' + F(sb), 'Winner: concept ' + (sa > sb ? 'A' : 'B') + ' with **' + F(Math.max(sa, sb)) + '**'] };
  });

  /* ================= Unit 5 ================= */
  const u5 = U('m5', 'Fluids Engineering', { sub: 'Pressure, buoyancy, Reynolds number, drag & flow', ch: 'Ch 5' }, [
    L('m5l1', 'Fluid Properties & Pressure', {
      goal: 'Use density, viscosity and hydrostatic pressure.',
      key: 'A fluid deforms continuously under shear. Density ρ = m/V (water 1000 kg/m³, air ≈ 1.2 kg/m³). Viscosity μ measures resistance to flow: shear stress τ = μv/h between plates (honey has high μ, air low). Hydrostatic pressure grows with depth: $p = p_0 + ρgh$. Gauge pressure is measured relative to the atmosphere, and absolute = gauge + atmospheric (101.3 kPa). Pressure at a given depth acts equally in all directions and doesn\'t depend on the container\'s shape.',
      formulas: ['p = p_0 + ρgh', 'p_{abs} = p_{gauge} + p_{atm}', 'τ = μ[[v|h]]'],
    }, [
      T('Pressure grows with depth', `
$$ p = p_0 + ρ g h $$
- **Gauge pressure** is relative to the atmosphere (tire gauges read this)
- **Absolute** = gauge + 101.3 kPa
Every ~10 m of water adds about 1 atm.
**Viscosity** μ: a fluid's internal friction. Between two plates, $τ = μv/h$. Motor oil has a high μ, and water's is about 1/260 of SAE 30 oil's.
>! Pressure depends on **depth only**, not the shape or width of the container (the "hydrostatic paradox").`),
      G('m.hydro'),
      MC('Two tanks hold water to the same depth. One is wide, one is narrow. The pressure at the bottom is…', ['the same in both', 'greater in the wide tank', 'greater in the narrow tank', 'depends on the total volume'], 'p = ρgh depends only on depth.'),
      G('m.hydro'),
      TF('Gauge pressure can be negative (a partial vacuum).', true, 'Below atmospheric pressure, gauge pressure is negative.'),
      MC('Which fluid property describes resistance to flowing (internal friction)?', ['viscosity', 'density', 'specific heat', 'compressibility'], 'High viscosity means thick and slow, like honey.'),
      G('m.hydro'),
    ]),
    L('m5l2', 'Buoyancy', {
      goal: 'Compute buoyant forces and floating depths.',
      key: 'Archimedes: the buoyant force equals the weight of the fluid displaced: $F_B = ρ_{fluid} g V_{displaced}$. An object floats if its average density is less than the fluid\'s, and then F_B = W, so the submerged fraction = ρ_object/ρ_fluid. Fully submerged objects get the full $ρ_{fluid} g V$, whatever their own material. Steel ships float because their average density (steel + air inside) is less than water\'s.',
      formulas: ['F_B = ρ_{fluid} g V_{disp}', 'floating: [[V_{sub}|V]] = [[ρ_{obj}|ρ_{fluid}]]'],
    }, [
      T('Archimedes\' principle', `
$$ F_B = ρ_{fluid} · g · V_{displaced} $$
A floating object sinks until the water it pushes aside weighs as much as it does:
$$ [[V_{submerged}|V]] = [[ρ_{object}|ρ_{fluid}]] $$
>> Ice (920 kg/m³) in seawater (1025 kg/m³): about 90% below the surface.
>* A steel ship floats because its **average** density, counting all the air inside the hull, is less than water's.`, { fig: D.buoy() }),
      G('m.buoy'),
      MC('A solid steel ball and a solid aluminum ball of the **same volume** are fully submerged in water. Which has the larger buoyant force?', ['They are equal', 'steel', 'aluminum', 'depends on depth'], 'F_B depends on the displaced volume, not the object\'s material.'),
      G('m.buoy'),
      TF('An object floats when its average density is greater than the fluid\'s density.', false, 'It floats when its average density is LESS than the fluid\'s.'),
      G('m.buoy'),
    ]),
    L('m5l3', 'Reynolds Number & Flow Regimes', {
      goal: 'Compute Re and predict laminar or turbulent flow.',
      key: 'The Reynolds number compares inertial to viscous effects: $Re = ρvl/μ$, where l is a characteristic length (pipe diameter, object size). It is dimensionless. Low Re means smooth, orderly **laminar** flow. High Re means chaotic, mixing **turbulent** flow. Pipe flow: Re < ~2000 laminar, > ~4000 turbulent, in between transitional. Most everyday flows of air and water are turbulent. Thick oils and tiny scales are laminar.',
      formulas: ['Re = [[ρvl|μ]]', 'pipe: < 2000 laminar · > 4000 turbulent'],
    }, [
      T('Smooth or chaotic?', `
$$ Re = [[ρ v l|μ]] :: dimensionless $$
- **Laminar** (low Re): smooth layers, like syrup poured slowly or blood in capillaries
- **Turbulent** (high Re): eddies and mixing, like a river or the air behind a car
For flow in a pipe, l = the diameter: **Re < ~2000 laminar**, **Re > ~4000 turbulent**.
>* Re tells you which formulas apply. Laminar and turbulent flows have very different friction and drag.`),
      G('m.re'),
      MC('Doubling the flow speed in a pipe (same fluid, same pipe) makes Re…', ['double', 'halve', 'quadruple', 'stay the same'], 'Re ∝ v.'),
      G('m.re'),
      TF('The Reynolds number has units of m/s.', false, 'It is dimensionless.'),
      G('m.re'),
    ]),
    L('m5l4', 'Drag, Lift & Flow Rate', {
      goal: 'Compute drag and lift forces and use continuity for pipe flow.',
      key: 'Drag: $F_D = ½ρv²AC_D$ (A = frontal area, C_D from shape: a streamlined car ≈ 0.3, a flat plate ≈ 1.2). Lift: $F_L = ½ρv²AC_L$ (A = wing planform area). Both scale with v². Power to overcome drag = F_D·v, which scales with v³. Volumetric flow rate: Q = Av (m³/s). Continuity (incompressible): $A₁v₁ = A₂v₂$, so a fluid speeds up where a pipe narrows: half the diameter means 4× the speed.',
      formulas: ['F_D = ½ρv²AC_D', 'F_L = ½ρv²AC_L', 'Q = Av', 'A₁v₁ = A₂v₂'],
    }, [
      T('Air pushes back', `
$$ F_D = ½ ρ v² A C_D   ·   F_L = ½ ρ v² A C_L $$
- **C_D** depends on shape: sphere ≈ 0.5, car ≈ 0.25–0.35, flat plate ≈ 1.2
- Drag ∝ v², and drag **power** ∝ v³
**Flow rate and continuity:**
$$ Q = A v   ·   A₁v₁ = A₂v₂ $$
>* Put your thumb over a garden hose: smaller area, faster water.`, { fig: D.pipe() }),
      G('m.drag'),
      MC('If a car doubles its speed, the drag force becomes…', ['4 times larger', '2 times larger', '8 times larger', 'unchanged'], 'F_D ∝ v².'),
      G('m.flow'),
      G('m.drag'),
      G('m.flow'),
    ]),
  ]);

  /* ================= Unit 6 ================= */
  const u6 = U('m6', 'Thermal & Energy Systems', { sub: 'Energy units, efficiency, heat transfer & engines', ch: 'Ch 6' }, [
    L('m6l1', 'Energy, Work & Power', {
      goal: 'Convert energy and power units and do basic energy bookkeeping.',
      key: 'Energy: joule (J), kilowatt-hour (1 kWh = 3.6 MJ), British thermal unit (1 Btu = 1.055 kJ), calorie (1 cal = 4.184 J). Power is the rate of energy use: watt (1 W = 1 J/s), horsepower (1 hp = 746 W). Energy = power × time. Sensible heat: Q = mcΔT (water c = 4.19 kJ/kg·°C). Your electric bill charges for energy (kWh), not power.',
      formulas: ['1 kWh = 3.6 MJ', '1 Btu = 1.055 kJ', 'E = P·t', 'Q = mcΔT'],
    }, [
      T('Energy vs power', `
**Energy** is a quantity. **Power** is a rate.
| Energy unit | in joules |
|---|---|
| 1 kWh | 3.6 × 10⁶ J |
| 1 Btu | 1055 J |
| 1 cal | 4.184 J |
| Power unit | in watts |
|---|---|
| 1 hp | 746 W |
| 1 Btu/h | 0.293 W |
$$ E = P · t   ·   Q = m c ΔT $$`),
      G('m.energy'),
      G('m.energy'),
      MC('Your electricity bill charges by the…', ['kilowatt-hour (energy)', 'kilowatt (power)', 'volt', 'ampere'], 'kWh is energy: power × time.'),
      G('m.energy'),
      TF('A 100 W bulb running for 10 hours uses 1 kWh of energy.', true, '0.1 kW × 10 h = 1 kWh.'),
    ]),
    L('m6l2', 'Fuels, Heating Value & Efficiency', {
      goal: 'Compute efficiencies, including chains of devices, and fuel use.',
      key: 'Efficiency η = useful output ÷ input (always < 100%). Devices in series multiply their efficiencies: η_total = η₁ × η₂ × η₃. Heating value is the energy released per kg of fuel burned (gasoline ≈ 45 MJ/kg, natural gas ≈ 50 MJ/kg, coal ≈ 25–30 MJ/kg). Fuel rate = useful power ÷ (η × heating value).',
      formulas: ['η = [[P_{out}|P_{in}]]', 'η_{total} = η₁η₂η₃…', 'ṁ_{fuel} = [[P_{out}|η · HV]]'],
    }, [
      T('Where the energy goes', `
$$ η = [[useful output|input]] $$
**Chains multiply.** Power plant (40%) × generator (95%) × transmission (90%) = **34%** of the fuel's energy reaches your outlet.
**Heating value** (HV): energy per kg of fuel. Gasoline ≈ 45 MJ/kg.
$$ fuel rate = [[P_{useful}|η × HV]] $$
>* Most car engines are only about 25–30% efficient. The rest leaves as heat in the exhaust and the radiator.`),
      G('m.eff'),
      G('m.eff'),
      MC('Three devices with efficiencies 0.9, 0.8 and 0.5 operate in series. The overall efficiency is…', ['0.36', '0.73', '2.2', '0.5'], '0.9 × 0.8 × 0.5 = 0.36.'),
      G('m.eff'),
      TF('A machine can have an efficiency greater than 100% if it is very well designed.', false, 'That would create energy, which violates the first law.'),
    ]),
    L('m6l3', 'Heat Transfer', {
      goal: 'Identify conduction, convection and radiation and compute conduction through a wall.',
      key: 'Conduction: heat flows through a solid. Fourier\'s law: $q = κAΔT/L$ (κ = thermal conductivity: metals high, insulation low). Convection: heat is carried by a moving fluid, $q = hAΔT$ (h = heat transfer coefficient; forced convection like a fan has a higher h than natural convection). Radiation: electromagnetic emission that needs no medium, ∝ T⁴. Insulation works by having a low κ and a large thickness L.',
      formulas: ['conduction: q = [[κAΔT|L]]', 'convection: q = hAΔT', 'radiation ∝ T⁴'],
    }, [
      T('Three ways heat moves', `
| Mode | How | Example |
|---|---|---|
| conduction | through a solid, molecule to molecule | a pan handle getting hot |
| convection | carried by a moving fluid | a fan cooling a CPU |
| radiation | electromagnetic waves, no medium needed | sunlight, a campfire |
$$ q = [[κ A ΔT|L]] :: Fourier's law of conduction $$
| Material | κ (W/m·°C) |
|---|---|
| copper | 400 |
| steel | 50 |
| glass | 0.8 |
| wood | 0.15 |
| fiberglass insulation | 0.04 |`, { fig: D.wall() }),
      G('m.cond'),
      MATCH('Match each scenario to its heat-transfer mode.', [['Sun warming your face', 'radiation'], ['Heat sink fan cooling a chip', 'convection'], ['Hot coffee warming the mug handle', 'conduction'], ['Warm air rising from a heater', 'convection (natural)']]),
      G('m.cond'),
      MC('Doubling the thickness of a wall\'s insulation changes the conduction heat loss by a factor of…', ['½', '2', '¼', '1'], 'q ∝ 1/L.'),
      G('m.cond'),
    ]),
    L('m6l4', 'Heat Engines & the Carnot Limit', {
      goal: 'Analyze heat engines with energy balance and the Carnot efficiency.',
      key: 'A heat engine takes heat Q_h from a hot source, produces work W, and rejects Q_l to a cold sink. First law: $W = Q_h − Q_l$, efficiency $η = W/Q_h$. Second law: no engine can beat the Carnot limit $η_{Carnot} = 1 − T_l/T_h$ (temperatures in KELVIN). Raising T_h or lowering T_l raises the limit. Four-stroke (Otto) engine: intake, compression, power, exhaust. Power plants run a Rankine steam cycle.',
      formulas: ['W = Q_h − Q_l', 'η = [[W|Q_h]]', 'η_{Carnot} = 1 − [[T_l|T_h]] (K)'],
    }, [
      T('Turning heat into work', `
$$ W = Q_h − Q_l   ·   η = [[W|Q_h]] $$
The **second law** caps every heat engine:
$$ η_{Carnot} = 1 − [[T_l|T_h]] :: kelvin only $$
**Four-stroke (Otto) cycle:** ① intake ② compression ③ power (spark, combustion) ④ exhaust.
>! You can't avoid rejecting heat. Even a perfect engine must dump Q_l to the cold side.
>! Forgetting to convert °C to K is the classic Carnot mistake.`),
      G('m.carnot'),
      G('m.engine'),
      ORDER('Put the four strokes of an Otto-cycle engine in order.', ['intake', 'compression', 'power', 'exhaust']),
      G('m.carnot'),
      TF('A heat engine operating between 500 K and 300 K can be 50% efficient.', false, 'Carnot limit = 1 − 300/500 = 40%.'),
      G('m.engine'),
    ]),
  ]);

  /* ================= Unit 7 ================= */
  const u7 = U('m7', 'Motion & Power Transmission', { sub: 'Speed, torque, power, gears & belts', ch: 'Ch 7' }, [
    L('m7l1', 'Rotational Speed & Velocity', {
      goal: 'Convert rpm and relate shaft speed to surface speed.',
      key: 'Shaft speeds are usually given in rpm. Convert with ω (rad/s) = rpm × 2π/60. A point at radius r moves at v = rω. Rolling and belt contact: the surface speeds match. Linear speed at the rim grows with radius even though every point on the part turns at the same ω.',
      formulas: ['ω = rpm × [[2π|60]]', 'v = rω'],
    }, [
      T('rpm, rad/s and rim speed', `
$$ ω (rad/s) = rpm × [[2π|60]]   ·   v = r ω $$
>* Same physics as PHYS 2325 Unit 9, now on machines: shafts, pulleys, wheels and cutting tools. In machining, the cutting speed is the rim speed of the tool or the workpiece.`, { fig: D.disk() }),
      G('m.rpm'),
      G('m.rpm'),
      MC('Two points on the same spinning disk, one at r and one at 2r. The outer point has…', ['twice the linear speed, same ω', 'twice the ω', 'the same linear speed', 'half the linear speed'], 'v = rω with ω shared.'),
      G('m.rpm'),
      TF('1 rpm equals about 0.105 rad/s.', true, '2π/60 = 0.1047.'),
    ]),
    L('m7l2', 'Torque & Power', {
      goal: 'Use P = Tω in SI and the 5252 rule in USCS.',
      key: 'Power transmitted by a rotating shaft: $P = Tω$ (W = N·m × rad/s). In USCS: P(hp) = T(ft·lbf) × rpm / 5252, which is why torque and horsepower curves cross at 5252 rpm. At a fixed power, lower speed means higher torque. That\'s the whole reason gearboxes exist.',
      formulas: ['P = Tω', 'P(hp) = [[T(ft·lbf) × rpm|5252]]'],
    }, [
      T('Power = torque × speed', `
$$ P = T ω :: watts = N·m × rad/s $$
$$ P (hp) = [[T (ft·lbf) × rpm|5252]] $$
>* For the same power, you can have high speed and low torque (a drill motor) or low speed and high torque (a winch). Gears convert between them.`),
      EX('Electric motor', 'A 5.0 kW motor runs at 1800 rpm. Find its torque.', ['ω = 1800 × 2π/60 = 188.5 rad/s', 'T = P/ω = 5000/188.5 = **26.5 N·m**']),
      G('m.power'),
      G('m.power'),
      MC('At constant power, if a shaft\'s speed is cut in half, its torque…', ['doubles', 'halves', 'stays the same', 'quadruples'], 'T = P/ω.'),
      TF('An engine\'s torque and horsepower curves (in ft·lbf and hp) always cross at 5252 rpm.', true, 'P(hp) = T × rpm/5252, so P = T exactly when rpm = 5252.'),
      G('m.power'),
    ]),
    L('m7l3', 'Gear Types & Gear Ratio', {
      goal: 'Name gear types and compute speed and torque through a gear pair.',
      key: 'Gear types: spur (parallel shafts, straight teeth), helical (parallel shafts, angled teeth, quieter), bevel (intersecting shafts, usually 90°), worm (perpendicular shafts, high reduction, often self-locking), rack and pinion (rotation ↔ translation). For a meshing pair: velocity ratio $VR = ω_{in}/ω_{out} = N_{out}/N_{in}$. The output turns in the opposite direction (external mesh). Ideal torque: $T_{out} = T_{in} × VR$ (power is conserved). Rack speed: v = r_pinion × ω.',
      formulas: ['VR = [[ω_{in}|ω_{out}]] = [[N_{out}|N_{in}]]', 'T_{out} = T_{in} × VR', 'rack: v = rω'],
    }, [
      T('Meet the gears', `
| Type | Shafts | Notes |
|---|---|---|
| spur | parallel | simplest, can be noisy |
| helical | parallel | angled teeth, smoother and quieter |
| bevel | intersecting (usually 90°) | cone-shaped, car differentials |
| worm | perpendicular, offset | huge reduction, often self-locking |
| rack & pinion | rotation ↔ translation | car steering |`),
      T('Teeth set the ratio', `
Meshing teeth move at the same pitch-line speed, so the gear with **more teeth turns slower**:
$$ VR = [[ω_{in}|ω_{out}]] = [[N_{out}|N_{in}]] $$
$$ T_{out} = T_{in} × VR :: ideal, no friction $$
>* A small pinion driving a big gear is a **speed reducer**: slower, but more torque.
>! Two external gears turn in **opposite** directions.`, { fig: D.gears({ n1: 12, n2: 30 }) }),
      MATCH('Match the gear type to its use.', [['bevel', 'turns power 90° (differentials)'], ['worm', 'big reduction, self-locking'], ['rack and pinion', 'rotation to straight-line motion'], ['helical', 'quiet, parallel shafts']]),
      G('m.gear'),
      G('m.gear'),
      G('m.rack'),
      TF('In a two-gear external mesh, both gears turn in the same direction.', false, 'They turn in opposite directions.'),
      G('m.gear'),
    ]),
    L('m7l4', 'Gear Trains', {
      goal: 'Analyze simple and compound gear trains.',
      key: 'Simple train (each shaft has one gear): VR = N_last/N_first. Idler gears in between don\'t change the ratio, they only reverse the direction. Compound train (two gears share a shaft and turn together): the overall VR = product of each stage\'s (N_driven/N_driver). Large reductions in a small space need compound trains. Direction: each external mesh reverses rotation.',
      formulas: ['simple: VR = [[N_{last}|N_{first}]]', 'compound: VR = Π [[N_{driven}|N_{driver}]]'],
    }, [
      T('Stacking reductions', `
**Simple train:** idler gears only flip the direction. The ratio depends on the first and last gears alone.
**Compound train:** two gears on one shaft turn at the **same speed**, so stage ratios **multiply**:
$$ VR = [[N₂|N₁]] × [[N₄|N₃]] $$
>* Two 3:1 stages give 9:1 in a compact package. A single 9:1 pair would need a huge gear.`, { fig: D.train() }),
      EX('Two-stage reducer', 'Gear 1 (15 T) drives gear 2 (45 T). Gear 3 (12 T) shares gear 2\'s shaft and drives gear 4 (48 T). Input is 1800 rpm. Find the output speed.', ['Stage 1: 45/15 = 3', 'Stage 2: 48/12 = 4', 'VR = 12 → output = 1800/12 = **150 rpm**, with 12× the torque (ideal)']),
      G('m.train'),
      MC('Adding an idler gear between a driver and a driven gear…', ['reverses the output direction but doesn\'t change the ratio', 'doubles the ratio', 'halves the output torque', 'has no effect at all'], 'Its teeth cancel out of the ratio.'),
      G('m.train'),
      TF('In a compound gear train, gears on the same shaft rotate at the same speed.', true, 'They are locked together.'),
      MC('A simple train has three gears in a row: 20 T → 40 T (idler) → 60 T. The overall velocity ratio is…', ['3', '6', '2', '1.5'], 'The idler cancels: VR = N_last/N_first = 60/20 = 3.', { lvl: 2 }),
      G('m.train'),
    ]),
    L('m7l5', 'Belts, Chains & Machine Elements', {
      goal: 'Analyze belt drives and recognize common machine elements.',
      key: 'Belt and chain drives transmit power between distant parallel shafts. With no slip, the belt speed is the same on both pulleys: $ω₁d₁ = ω₂d₂$, and both turn the same direction (open belt). V-belts grip by wedging, timing belts and chains don\'t slip. Machine elements: bearings (rolling-element ball/roller bearings or sliding journal bearings) support rotating shafts. Fasteners (bolts, screws, rivets). Springs store energy. Keys and couplings connect shafts to hubs or to other shafts. Shafts carry torque.',
      formulas: ['ω₁d₁ = ω₂d₂', 'belt: same direction'],
    }, [
      T('Belts, chains and the parts that hold machines together', `
**Belt drive:** belt speed is shared, so $ω₁ d₁ = ω₂ d₂$. Bigger pulley, slower shaft.
| Element | Job |
|---|---|
| ball / roller bearing | supports a spinning shaft with low friction |
| journal bearing | shaft rides on a fluid film |
| key | locks a gear or pulley to a shaft |
| coupling | joins two shafts end to end |
| bolt / screw | clamps parts together |
| spring | stores energy, provides force |
>* Chains and timing belts can't slip, so they keep shafts synchronized (like an engine's camshaft).`),
      G('m.belt'),
      MATCH('Match the machine element to its job.', [['bearing', 'supports a rotating shaft'], ['key', 'locks a pulley to its shaft'], ['coupling', 'connects two shafts end-to-end'], ['spring', 'stores mechanical energy']]),
      G('m.belt'),
      MC('Why use a timing belt or chain instead of a flat belt to drive an engine\'s camshaft?', ['They can\'t slip, so they keep the shafts in sync', 'They are always cheaper', 'They need no maintenance', 'They reverse the direction of rotation'], 'Positive engagement means no slip.'),
      TF('In an open belt drive, both pulleys rotate in the same direction.', true, 'Only a crossed belt reverses the direction.'),
    ]),
  ]);

  /* ================= Unit 8 ================= */
  const u8 = U('m8', 'Design, Drawings & CAD', { sub: 'Design process, multiview drawings, SolidWorks & manufacturing', ch: 'Ch 2 & 8 · SolidWorks' }, [
    L('m8l1', 'The Design Process', {
      goal: 'Walk a project from need to product and pick concepts with a decision matrix.',
      key: 'Design process: (1) recognize the need and define the problem, (2) research background (existing products, patents, standards), (3) set requirements (functional, measurable targets) and constraints (limits such as budget, size, regulations), (4) generate concepts (brainstorming, sketches, many ideas before judging), (5) evaluate and select (weighted decision matrix), (6) detailed design (analysis, CAD, materials, drawings), (7) prototype and test, (8) production, documentation and communication. It is iterative: testing sends you back to earlier steps.',
      formulas: ['need → research → requirements → concepts → select → detail → prototype → production', 'weighted score = Σ(weight × score)'],
    }, [
      T('From "we need…" to a real product', `
1. **Define the problem.** What's the need, and who's the user?
2. **Research.** Existing solutions, patents, standards
3. **Requirements & constraints.** Measurable goals (lift 50 kg) and hard limits (under 200 dollars, under 2 kg)
4. **Conceptual design.** Brainstorm many concepts and sketch them
5. **Evaluate & select.** Decision matrix
6. **Detailed design.** Analysis, CAD, material choice, drawings
7. **Prototype & test.** Does it meet the requirements?
8. **Production & documentation**
>* It's a **loop**, not a line. Failed tests send you back to concepts or details.`),
      T('Decision matrix', `
Score each concept on each criterion, multiply by the criterion's weight, and add:
| Criterion (weight) | Concept A | Concept B |
|---|---|---|
| cost (0.4) | 8 | 6 |
| weight (0.3) | 5 | 9 |
| durability (0.3) | 7 | 7 |
| **weighted total** | **6.8** | **7.2** |
>! Weights must reflect what the customer cares about, and they should add to 1.`),
      ORDER('Put the design-process stages in order.', ['Define the problem and need', 'Research background and existing solutions', 'Set requirements and constraints', 'Generate and evaluate concepts', 'Detailed design', 'Prototype and test']),
      G('m.decision'),
      MC('"The device must weigh less than 2 kg" is best described as a…', ['constraint', 'concept', 'prototype', 'test result'], 'A hard limit the design must satisfy.'),
      TF('In brainstorming, you should criticize weak ideas immediately to save time.', false, 'Defer judgment and generate many ideas first. Evaluate later.'),
      G('m.decision'),
      MC('Why is the design process called iterative?', ['Testing and analysis often send you back to earlier steps to improve the design', 'Every step is done exactly once in order', 'Designs are copied from previous products', 'Only the final step matters'], 'Each loop refines the design.'),
    ]),
    L('m8l2', 'Sketching & Orthographic Views', {
      goal: 'Read and create multiview (orthographic) drawings and isometric sketches.',
      key: 'Orthographic projection shows true-size 2D views looking straight at each face. US standard (third-angle projection): the front view is in the center, the top view directly ABOVE it, and the right-side view directly to its RIGHT. Views line up: width is shared by front and top, height by front and right. Line types: visible edges are thick solid, hidden edges are dashed, center lines are long-short-long dashes (axes of holes and cylinders). Isometric views show three faces at once, with the axes 120° apart.',
      formulas: ['third-angle: top above front, right to the right', 'visible: solid · hidden: dashed · center: long-short'],
    }, [
      T('Three views tell the whole story', `
**Third-angle projection** (US standard):
- **Front view**: the most descriptive view, placed in the center
- **Top view**: directly **above** the front view
- **Right-side view**: directly **to the right** of the front view
Views are **aligned**: front and top share width, front and right share height.
| Line | Looks like | Means |
|---|---|---|
| visible | thick solid | edge you can see |
| hidden | short dashes | edge behind material |
| center | long–short–long | axis of a hole or cylinder |`, { fig: D.ortho() }),
      MC('In a third-angle (US) multiview drawing, where is the top view placed?', ['directly above the front view', 'directly below the front view', 'to the left of the front view', 'anywhere convenient'], 'Top above, right side to the right.'),
      MATCH('Match the line type to its meaning.', [['thick solid line', 'visible edge'], ['dashed line', 'hidden edge'], ['long–short–long dash', 'center line / axis'], ['thin line with arrows', 'dimension line']]),
      MC('Which two views share the object\'s **height** dimension?', ['front and right side', 'front and top', 'top and right side', 'all three equally'], 'Height runs vertically in both the front and side views.'),
      TF('A hidden line represents an edge that is behind visible material in that view.', true, 'Drawn dashed.'),
      MC('An isometric drawing shows…', ['three faces of an object at once, axes 120° apart', 'only one face at true size', 'a cross-section', 'the object from directly above'], 'Pictorial view for quick visualization.'),
    ]),
    L('m8l3', 'CAD Modeling Workflow', {
      goal: 'Know the SolidWorks workflow from sketch to assembly and drawing.',
      key: 'Parametric solid modeling (SolidWorks): (1) choose a plane (Front/Top/Right), (2) sketch a 2D profile, (3) fully define it with dimensions and geometric relations (horizontal, coincident, tangent, equal). A fully defined sketch turns black, an under-defined one stays blue. (4) Add features: Extruded Boss/Base, Extruded Cut, Revolve, Sweep, Loft, Fillet (round edge), Chamfer (beveled edge), Shell, Hole Wizard, linear/circular Pattern, Mirror. (5) Build assemblies with mates (coincident, concentric, parallel, distance), (6) generate drawings automatically. Design intent: dimension so that changes behave the way you want.',
      formulas: ['plane → sketch → fully define → feature → assembly (mates) → drawing'],
    }, [
      T('Sketch, constrain, feature', `
1. **Pick a plane** (Front, Top or Right)
2. **Sketch** a 2D profile: lines, arcs, circles
3. **Fully define** with dimensions and **relations** (horizontal, vertical, coincident, tangent, equal, concentric). In SolidWorks, blue = under-defined, **black = fully defined**, red = over-defined.
4. **Feature** it into 3D:
| Feature | Does |
|---|---|
| Extruded Boss/Base | pulls a sketch straight out to add material |
| Extruded Cut | removes material |
| Revolve | spins a profile around an axis (shafts, bottles) |
| Fillet | rounds an edge |
| Chamfer | bevels an edge |
| Shell | hollows out a part |
| Pattern / Mirror | repeats features |`),
      T('Assemblies and design intent', `
**Assemblies** combine parts with **mates**: coincident (faces touch), concentric (shaft in hole), parallel, distance, angle.
**Drawings** are generated from the model and update automatically when it changes.
>* **Design intent:** dimension the sketch the way the part should behave when it changes. If a hole must stay centered, dimension it from the centerline, not from an edge.`),
      ORDER('Order the basic SolidWorks part workflow.', ['Select a sketch plane', 'Sketch the 2D profile', 'Add dimensions and relations until fully defined', 'Apply a feature such as Extruded Boss', 'Add finishing features such as fillets']),
      MATCH('Match the SolidWorks feature to what it makes.', [['Revolve', 'a shaft from a half-profile'], ['Fillet', 'a rounded edge'], ['Extruded Cut', 'a pocket or through-hole'], ['Shell', 'a hollow, thin-walled part']]),
      MC('In SolidWorks, a sketch whose lines are all **black** is…', ['fully defined', 'under-defined', 'over-defined', 'suppressed'], 'Blue means still free to move. Red means conflicting.'),
      MC('Which mate puts a shaft inside a hole on the same axis?', ['concentric', 'coincident', 'parallel', 'tangent'], 'Concentric aligns the cylinder axes.'),
      TF('Dimensioning a sketch in a way that captures design intent makes later changes behave predictably.', true, 'That\'s the core idea of parametric modeling.'),
    ]),
    L('m8l4', 'Dimensioning, Tolerances & Manufacturing', {
      goal: 'Apply dimensioning rules, compute fits from tolerances, and pick manufacturing processes.',
      key: 'Dimensioning rules: dimension each feature once (no redundant dimensions), place dimensions in the view where the feature is most clearly seen, avoid dimensioning to hidden lines, and give holes a diameter (Ø) with their centers located. Tolerances give the allowed variation: limits (25.00–25.05), bilateral ±, or unilateral. Fits: clearance (the shaft is always smaller than the hole), interference/press (always larger), or transition. Min clearance = smallest hole − largest shaft. Max clearance = largest hole − smallest shaft. Processes: casting (molten metal into a mold), forging, machining (milling, turning on a lathe, drilling), sheet-metal forming, injection molding (high-volume plastics), additive manufacturing / 3D printing (FDM, SLA: complex shapes, prototypes) and laser cutting (flat profiles). Choose by material, geometry, quantity and cost.',
      formulas: ['min clearance = hole_{min} − shaft_{max}', 'max clearance = hole_{max} − shaft_{min}'],
    }, [
      T('Telling the shop exactly what you want', `
**Dimensioning rules:**
- Each feature dimensioned **once**, so there are no redundant (double) dimensions
- Dimension where the feature is **most clearly seen**
- **Don't** dimension to hidden lines
- Holes: diameter (Ø) plus the location of the center
**Tolerances**: nothing is made exactly. 25.00 ± 0.05 allows 24.95–25.05.
**Fits:** clearance (always slides), interference (pressed together), transition (could be either).
>* Tighter tolerances cost more. Only specify precision where the function needs it.`),
      T('How parts get made', `
| Process | Best for |
|---|---|
| casting | complex metal shapes, many parts |
| forging | strong metal parts (wrenches, crankshafts) |
| milling / turning / drilling | precise metal parts, low–medium volume |
| sheet-metal forming | enclosures, brackets |
| injection molding | huge volumes of plastic parts |
| 3D printing (FDM, SLA) | prototypes, complex one-offs |
| laser cutting | flat profiles from sheet (truss lab!) |`),
      G('m.tol'),
      MC('Which process is best for making 100,000 identical plastic phone cases?', ['injection molding', '3D printing', 'CNC milling', 'hand carving'], 'High tooling cost, but very cheap per part at volume.'),
      G('m.tol'),
      MC('Which drawing practice is **wrong**?', ['Dimensioning the same feature in two different views', 'Locating hole centers', 'Placing dimensions where the feature is clearly visible', 'Using Ø for diameters'], 'Redundant dimensions can conflict. Dimension each feature once.'),
      MATCH('Match each part to a sensible manufacturing process.', [['custom prototype bracket (1 piece)', '3D printing'], ['flat acrylic truss members', 'laser cutting'], ['precision steel shaft', 'turning on a lathe'], ['engine block', 'casting']]),
      TF('An interference fit means the shaft is always larger than the hole.', true, 'They have to be pressed together.'),
    ]),
  ]);

  CQ.addUnits('mech', [u5, u6, u7, u8]);
})();
