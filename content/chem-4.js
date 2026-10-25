/* CHEM 1311 · Units 11–12: thermochemistry and gases (Burdge Ch 10–11) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const ch = CQ.chem;
  const { molarMass } = CQ.chemkit;
  const Rg = 0.08206, R8 = 8.314;

  /* ================= data ================= */
  const CS = { water: 4.184, aluminum: 0.900, copper: 0.385, iron: 0.444, glass: 0.84, ethanol: 2.46, lead: 0.129 };
  const HF = { 'CO2(g)': -393.5, 'H2O(l)': -285.8, 'H2O(g)': -241.8, 'CH4(g)': -74.8, 'C2H6(g)': -84.7, 'C3H8(g)': -103.9, 'C2H5OH(l)': -277.0, 'C6H12O6(s)': -1274.5, 'NH3(g)': -46.1,
    'NO(g)': 90.4, 'NO2(g)': 33.9, 'CaCO3(s)': -1206.9, 'CaO(s)': -635.6, 'SO2(g)': -296.8, 'SO3(g)': -395.7, 'Fe2O3(s)': -822.2, 'Al2O3(s)': -1669.8, 'CO(g)': -110.5, 'C2H2(g)': 226.6, 'HCl(g)': -92.3,
    'O2(g)': 0, 'N2(g)': 0, 'H2(g)': 0, 'Fe(s)': 0, 'Al(s)': 0, 'Cl2(g)': 0 };
  // reactions for ΔH°f problems: [[coef, species]...] → [[coef, species]...]
  const HRX = [
    [[[1, 'CH4(g)'], [2, 'O2(g)']], [[1, 'CO2(g)'], [2, 'H2O(l)']]], [[[1, 'C3H8(g)'], [5, 'O2(g)']], [[3, 'CO2(g)'], [4, 'H2O(l)']]],
    [[[1, 'C2H5OH(l)'], [3, 'O2(g)']], [[2, 'CO2(g)'], [3, 'H2O(l)']]], [[[1, 'CaCO3(s)']], [[1, 'CaO(s)'], [1, 'CO2(g)']]],
    [[[4, 'NH3(g)'], [5, 'O2(g)']], [[4, 'NO(g)'], [6, 'H2O(g)']]], [[[2, 'SO2(g)'], [1, 'O2(g)']], [[2, 'SO3(g)']]],
    [[[1, 'Fe2O3(s)'], [3, 'CO(g)']], [[2, 'Fe(s)'], [3, 'CO2(g)']]], [[[2, 'Al(s)'], [1, 'Fe2O3(s)']], [[1, 'Al2O3(s)'], [2, 'Fe(s)']]],
    [[[2, 'NO(g)'], [1, 'O2(g)']], [[2, 'NO2(g)']]], [[[1, 'C6H12O6(s)'], [6, 'O2(g)']], [[6, 'CO2(g)'], [6, 'H2O(l)']]],
    [[[2, 'C2H2(g)'], [5, 'O2(g)']], [[4, 'CO2(g)'], [2, 'H2O(l)']]],
  ];
  const sp = (s) => ch(s.replace(/\(.*\)/, '')) + s.match(/\(.*\)/)[0];
  const sideStr = (side) => side.map(([c, s]) => (c > 1 ? c + ' ' : '') + sp(s)).join(' + ');

  /* ================= generators: Unit 11 ================= */
  CQ.gen('c.firstlaw', (R) => {
    const q = R.pick([-250, -120, 85, 150, 320]), w = R.pick([-90, -40, 30, 75, 110]);
    const qd = q > 0 ? 'absorbs **' + q + ' J** of heat' : 'releases **' + -q + ' J** of heat';
    const wd = w > 0 ? 'has **' + w + ' J** of work done on it' : 'does **' + -w + ' J** of work on the surroundings';
    return { t: 'num', lvl: 3, q: 'A system ' + qd + ' and ' + wd + '. What is ΔU of the system?', a: q + w, unit: 'J', abs: 0.5,
      hint: 'ΔU = q + w. Heat in is +q. Work done ON the system is +w.',
      steps: ['q = ' + (q > 0 ? '+' : '') + q + ' J (' + (q > 0 ? 'heat in' : 'heat out') + ')', 'w = ' + (w > 0 ? '+' : '') + w + ' J (' + (w > 0 ? 'work done on the system' : 'work done by the system') + ')', 'ΔU = q + w = **' + (q + w) + ' J**'] };
  });

  CQ.gen('c.pv', (R) => {
    const P = R.pick([1.00, 1.50, 2.00, 3.00]), V1 = R.pick([2.0, 5.0, 10.0]), dV = R.pick([1.5, 3.0, 4.0, 8.0]);
    const w = -P * dV * 101.3;
    return { t: 'num', lvl: 3, q: 'A gas expands from **' + V1 + ' L** to **' + (V1 + dV) + ' L** against a constant external pressure of **' + P + ' atm**. How much work is done **on** the gas? (1 L·atm = 101.3 J)', a: w, unit: 'J',
      steps: ['w = −P_ext ΔV = −(' + P + ' atm)(' + dV + ' L) = ' + F(-P * dV) + ' L·atm', '× 101.3 J/(L·atm) = **' + F(w) + ' J**', 'Negative: an expanding gas does work on its surroundings.'] };
  });

  CQ.gen('c.thermostoich', (R) => {
    const opts = [['CH4', -890.4, 'methane'], ['C3H8', -2220, 'propane'], ['C2H5OH', -1367, 'ethanol'], ['C8H18', -5471, 'octane'], ['C6H12O6', -2803, 'glucose']];
    const [f, dH, name] = R.pick(opts);
    const g = R.pick([5.00, 10.0, 25.0, 50.0, 100.]);
    const q = (g / molarMass(f)) * dH;
    return { t: 'num', lvl: 3, q: 'Burning ' + name + ' has **ΔH = ' + dH + ' kJ per mole of ' + ch(f) + '**. How much heat is released when **' + g + ' g** of ' + ch(f) + ' burns? (Give a positive number in kJ.)', a: -q, unit: 'kJ',
      steps: ['mol = ' + g + '/' + F(molarMass(f), 4) + ' = ' + F(g / molarMass(f)) + ' mol', 'q = mol × ΔH = ' + F(g / molarMass(f)) + ' × (' + dH + ') = ' + F(q) + ' kJ', 'Heat released = **' + F(-q) + ' kJ**'] };
  });

  CQ.gen('c.dHscale', (R) => {
    const base = R.pick([[[[2, 'H2(g)'], [1, 'O2(g)']], [[2, 'H2O(l)']], -571.6], [[[1, 'N2(g)'], [3, 'H2(g)']], [[2, 'NH3(g)']], -92.2], [[[1, 'CaCO3(s)']], [[1, 'CaO(s)'], [1, 'CO2(g)']], 178.3]]);
    const op = R.pick(['rev', 'half', 'double', 'revhalf']);
    const k = { rev: -1, half: 0.5, double: 2, revhalf: -0.5 }[op];
    const desc = { rev: 'the reverse reaction', half: 'the reaction with every coefficient halved', double: 'the reaction with every coefficient doubled', revhalf: 'the reverse reaction with every coefficient halved' }[op];
    return { t: 'num', lvl: 2, q: '**' + sideStr(base[0]) + ' → ' + sideStr(base[1]) + '**, ΔH = ' + base[2] + ' kJ.\n\nWhat is ΔH for ' + desc + '?', a: base[2] * k, unit: 'kJ',
      steps: ['Reversing a reaction flips the sign of ΔH', 'Multiplying the coefficients by n multiplies ΔH by n', 'ΔH = ' + base[2] + ' × (' + k + ') = **' + F(base[2] * k, 4) + ' kJ**'] };
  });

  CQ.gen('c.qmct', (R) => {
    const [mat, c] = R.pick(Object.entries(CS));
    const m = R.pick([25.0, 50.0, 100., 150., 250.]), dT = R.pick([5.0, 12.5, 20.0, 35.0, 60.0]);
    const k = R.int(0, 2);
    if (k === 0) return { t: 'num', q: 'How much heat (in J) is needed to warm **' + m + ' g** of ' + mat + ' (c = ' + c + ' J/g·°C) by **' + dT + ' °C**?', a: m * c * dT, unit: 'J', steps: ['q = mcΔT', '= ' + m + ' × ' + c + ' × ' + dT + ' = **' + F(m * c * dT) + ' J**'] };
    if (k === 1) { const q = m * c * dT; return { t: 'num', q: 'A **' + m + ' g** piece of ' + mat + ' (c = ' + c + ' J/g·°C) absorbs **' + F(q) + ' J**. By how much does its temperature rise?', a: dT, unit: '°C', steps: ['ΔT = [[q|mc]] = [[' + F(q) + '|' + m + ' × ' + c + ']] = **' + F(dT) + ' °C**'] }; }
    const q = m * c * dT;
    return { t: 'num', lvl: 3, q: 'It takes **' + F(q) + ' J** to raise the temperature of **' + m + ' g** of an unknown metal by **' + dT + ' °C**. What is its specific heat?', a: c, unit: 'J/g·°C', steps: ['c = [[q|mΔT]] = [[' + F(q) + '|' + m + ' × ' + dT + ']] = **' + F(c) + ' J/g·°C** (' + mat + ')'] };
  });

  CQ.gen('c.mix', (R) => {
    const [mat, c] = R.pick(Object.entries(CS).filter(([k]) => k !== 'water' && k !== 'ethanol'));
    const mm = R.pick([25.0, 50.0, 75.0, 100.]), Tm = R.pick([80.0, 95.0, 100.]), mw = R.pick([50.0, 100., 150., 200.]), Tw = R.pick([20.0, 22.0, 25.0]);
    const Tf = (mm * c * Tm + mw * 4.184 * Tw) / (mm * c + mw * 4.184);
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + mm + ' g** block of ' + mat + ' (c = ' + c + ' J/g·°C) at **' + Tm + ' °C** is dropped into **' + mw + ' g** of water (c = 4.184 J/g·°C) at **' + Tw + ' °C** in an insulated cup. What is the final temperature?', a: Tf, unit: '°C', tol: 0.005,
      hint: 'Heat lost by the metal = heat gained by the water: −m_m c_m(T_f − T_m) = m_w c_w(T_f − T_w).',
      steps: ['q_metal + q_water = 0', mm + '(' + c + ')(T_f − ' + Tm + ') + ' + mw + '(4.184)(T_f − ' + Tw + ') = 0', 'T_f = [[' + F(mm * c, 4) + '(' + Tm + ') + ' + F(mw * 4.184, 4) + '(' + Tw + ')|' + F(mm * c + mw * 4.184, 4) + ']]', 'T_f = **' + F(Tf, 3) + ' °C**'] };
  });

  CQ.gen('c.coffee', (R) => {
    const V = R.pick([50.0, 100.]), M = R.pick([0.500, 1.00]), dT = R.pick([3.4, 4.5, 6.7, 6.8]);
    const mass = 2 * V, q = mass * 4.184 * dT, n = M * V / 1000;
    const dH = -q / n / 1000;
    return { t: 'num', lvl: 4, exam: true, q: 'In a coffee-cup calorimeter, **' + V + ' mL of ' + M + ' M HCl** is mixed with **' + V + ' mL of ' + M + ' M NaOH**. The temperature rises by **' + dT + ' °C**. Assuming the solution has the density (1.00 g/mL) and specific heat (4.184 J/g·°C) of water, what is ΔH for the neutralization, in kJ per mole of H₂O formed?', a: dH, unit: 'kJ/mol',
      steps: ['Mass of solution = ' + mass + ' g', 'q_soln = mcΔT = ' + mass + ' × 4.184 × ' + dT + ' = ' + F(q) + ' J', 'q_rxn = −q_soln = ' + F(-q) + ' J', 'mol H₂O = ' + M + ' × ' + V / 1000 + ' = ' + F(n) + ' mol', 'ΔH = ' + F(-q / 1000) + ' kJ / ' + F(n) + ' mol = **' + F(dH) + ' kJ/mol**'] };
  });

  const HESS = [
    { target: 'C(graphite) + ½O₂(g) → CO(g)', given: ['C(graphite) + O₂(g) → CO₂(g)   ΔH = −393.5 kJ', 'CO(g) + ½O₂(g) → CO₂(g)   ΔH = −283.0 kJ'], ans: -110.5, steps: ['Keep eq. 1 as written: −393.5', 'Reverse eq. 2: CO₂ → CO + ½O₂, +283.0', 'Add: −393.5 + 283.0 = **−110.5 kJ**'] },
    { target: 'N₂(g) + 2O₂(g) → 2NO₂(g)', given: ['N₂(g) + O₂(g) → 2NO(g)   ΔH = +180.6 kJ', '2NO(g) + O₂(g) → 2NO₂(g)   ΔH = −113.1 kJ'], ans: 67.5, steps: ['Both equations are already in the right direction', '2NO cancels', 'ΔH = 180.6 + (−113.1) = **+67.5 kJ**'] },
    { target: 'S(s) + 3/2 O₂(g) → SO₃(g)', given: ['S(s) + O₂(g) → SO₂(g)   ΔH = −296.8 kJ', '2SO₂(g) + O₂(g) → 2SO₃(g)   ΔH = −197.8 kJ'], ans: -395.7, steps: ['Keep eq. 1: −296.8', 'Halve eq. 2: SO₂ + ½O₂ → SO₃, −98.9', 'Add: **−395.7 kJ**'] },
    { target: 'C(graphite) → C(diamond)', given: ['C(graphite) + O₂(g) → CO₂(g)   ΔH = −393.5 kJ', 'C(diamond) + O₂(g) → CO₂(g)   ΔH = −395.4 kJ'], ans: 1.9, steps: ['Keep eq. 1: −393.5', 'Reverse eq. 2: CO₂ → C(diamond) + O₂, +395.4', 'Add: **+1.9 kJ**'] },
    { target: '2C(graphite) + H₂(g) → C₂H₂(g)', given: ['C(graphite) + O₂(g) → CO₂(g)   ΔH = −393.5 kJ', 'H₂(g) + ½O₂(g) → H₂O(l)   ΔH = −285.8 kJ', '2C₂H₂(g) + 5O₂(g) → 4CO₂(g) + 2H₂O(l)   ΔH = −2598.8 kJ'], ans: 226.6, steps: ['×2 eq. 1: −787.0', 'Keep eq. 2: −285.8', 'Reverse and halve eq. 3: +1299.4', 'Sum: **+226.6 kJ**'] },
  ];
  CQ.gen('c.hess', (R) => {
    const h = R.pick(HESS);
    return { t: 'num', lvl: 4, exam: true, q: 'Use Hess\'s law to find ΔH for\n\n**' + h.target + '**\n\nGiven:\n' + h.given.map((x, i) => (i + 1) + '. ' + x).join('\n'), a: h.ans, unit: 'kJ',
      hint: 'Line each given equation up so its species land on the correct side of the target, scale it, then add. Flip the sign when you reverse.', steps: h.steps };
  });

  CQ.gen('c.dHf', (R) => {
    const [re, pr] = R.pick(HRX);
    const sum = (side) => side.reduce((a, [c, s]) => a + c * HF[s], 0);
    const dH = sum(pr) - sum(re);
    const listed = [...new Set(re.concat(pr).map((x) => x[1]))].filter((s) => HF[s] !== 0);
    return { t: 'num', lvl: 4, q: 'Using standard enthalpies of formation, find ΔH°rxn for\n\n**' + sideStr(re) + ' → ' + sideStr(pr) + '**\n\nΔH°f (kJ/mol): ' + listed.map((s) => sp(s) + ' ' + HF[s]).join(', ') + '. Elements in their standard states are 0.', a: dH, unit: 'kJ', tol: 0.005,
      steps: ['ΔH°rxn = ΣnΔH°f(products) − ΣmΔH°f(reactants)', 'Products: ' + pr.map(([c, s]) => c + '(' + HF[s] + ')').join(' + ') + ' = ' + F(sum(pr), 5), 'Reactants: ' + re.map(([c, s]) => c + '(' + HF[s] + ')').join(' + ') + ' = ' + F(sum(re), 5), 'ΔH° = **' + F(dH, 5) + ' kJ**'] };
  });

  /* ================= generators: Unit 12 ================= */
  CQ.gen('c.pconv', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const mm = R.pick([380, 645, 720, 755, 1520]); return { t: 'num', q: 'Convert **' + mm + ' mmHg** to atm.', a: mm / 760, unit: 'atm', steps: ['1 atm = 760 mmHg', mm + '/760 = **' + F(mm / 760) + ' atm**'] }; }
    if (k === 1) { const atm = R.pick([0.500, 1.25, 2.00, 3.50]); return { t: 'num', q: 'Convert **' + atm + ' atm** to kPa.', a: atm * 101.325, unit: 'kPa', steps: ['1 atm = 101.325 kPa', atm + ' × 101.325 = **' + F(atm * 101.325) + ' kPa**'] }; }
    const kpa = R.pick([85.0, 95.5, 120., 250.]); return { t: 'num', q: 'Convert **' + kpa + ' kPa** to torr.', a: (kpa / 101.325) * 760, unit: 'torr', steps: [kpa + ' kPa × [[760 torr|101.325 kPa]] = **' + F((kpa / 101.325) * 760) + ' torr**'] };
  });

  CQ.gen('c.gaslaw', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const P1 = R.pick([1.00, 1.50, 2.00]), V1 = R.pick([4.0, 6.0, 10.0]), P2 = R.pick([0.50, 3.00, 4.00]); return { t: 'num', q: 'A gas occupies **' + V1 + ' L** at **' + P1 + ' atm**. At constant temperature, what is its volume at **' + P2 + ' atm**?', a: (P1 * V1) / P2, unit: 'L', steps: ['Boyle: P₁V₁ = P₂V₂', 'V₂ = ' + P1 + ' × ' + V1 + '/' + P2 + ' = **' + F((P1 * V1) / P2) + ' L**'] }; }
    if (k === 1) { const V1 = R.pick([2.00, 3.50, 5.00]), T1 = R.pick([0, 25, 27]), T2 = R.pick([100, 127, 200, -50]); const V2 = (V1 * (T2 + 273.15)) / (T1 + 273.15); return { t: 'num', q: 'A balloon holds **' + V1 + ' L** at **' + T1 + ' °C**. At constant pressure, what is its volume at **' + T2 + ' °C**?', a: V2, unit: 'L',
      steps: ['Charles: V₁/T₁ = V₂/T₂ with T in **kelvin**', 'T₁ = ' + F(T1 + 273.15, 5) + ' K, T₂ = ' + F(T2 + 273.15, 5) + ' K', 'V₂ = ' + V1 + ' × ' + F(T2 + 273.15, 5) + '/' + F(T1 + 273.15, 5) + ' = **' + F(V2) + ' L**'], why: 'Using °C directly is the classic gas-law mistake.' }; }
    const P1 = R.pick([1.00, 0.950, 1.20]), V1 = R.pick([5.00, 12.0, 20.0]), T1 = R.pick([25, 30]), P2 = R.pick([2.50, 0.500, 3.00]), T2 = R.pick([100, 0, 60]);
    const V2 = (P1 * V1 * (T2 + 273.15)) / ((T1 + 273.15) * P2);
    return { t: 'num', lvl: 3, q: 'A gas sample is at **' + P1 + ' atm**, **' + V1 + ' L** and **' + T1 + ' °C**. What is its volume at **' + P2 + ' atm** and **' + T2 + ' °C**?', a: V2, unit: 'L',
      steps: ['Combined: [[P₁V₁|T₁]] = [[P₂V₂|T₂]] (kelvin)', 'V₂ = V₁ × [[P₁|P₂]] × [[T₂|T₁]] = ' + V1 + ' × ' + F(P1 / P2) + ' × ' + F((T2 + 273.15) / (T1 + 273.15)), 'V₂ = **' + F(V2) + ' L**'] };
  });

  CQ.gen('c.ideal', (R) => {
    const gas = R.pick(['O2', 'N2', 'CO2', 'CH4', 'He', 'Ar', 'NH3']);
    const M = molarMass(gas);
    const k = R.int(0, 3);
    if (k === 0) { const n = R.pick([0.250, 0.500, 1.50, 2.00]), T = R.pick([273, 298, 350, 400]), P = R.pick([1.00, 2.00, 0.750]); return { t: 'num', q: 'What volume do **' + n + ' mol** of ' + ch(gas) + ' occupy at **' + P + ' atm** and **' + T + ' K**?', a: (n * Rg * T) / P, unit: 'L', steps: ['V = nRT/P', '= (' + n + ')(0.08206)(' + T + ')/' + P, 'V = **' + F((n * Rg * T) / P) + ' L**'] }; }
    if (k === 1) { const g = R.pick([4.00, 8.00, 16.0, 32.0]), V = R.pick([5.00, 10.0, 15.0]), T = R.pick([25, 50, 100]); const P = ((g / M) * Rg * (T + 273.15)) / V; return { t: 'num', lvl: 3, q: '**' + g + ' g** of ' + ch(gas) + ' is placed in a **' + V + ' L** container at **' + T + ' °C**. What is the pressure?', a: P, unit: 'atm', steps: ['n = ' + g + '/' + F(M, 4) + ' = ' + F(g / M) + ' mol', 'T = ' + F(T + 273.15, 5) + ' K', 'P = nRT/V = **' + F(P) + ' atm**'] }; }
    if (k === 2) { const P = R.pick([1.00, 1.50, 0.900]), T = R.pick([273.15, 298]); const d = (P * M) / (Rg * T); return { t: 'num', lvl: 3, q: 'What is the density (g/L) of ' + ch(gas) + ' gas at **' + P + ' atm** and **' + T + ' K**?', a: d, unit: 'g/L', steps: ['d = [[PM|RT]]', '= (' + P + ')(' + F(M, 4) + ')/((0.08206)(' + T + '))', 'd = **' + F(d) + ' g/L**'] }; }
    const P = R.pick([1.00, 0.968]), T = R.pick([298, 373]); const d = (P * M) / (Rg * T);
    return { t: 'num', lvl: 4, q: 'An unknown gas has a density of **' + F(d) + ' g/L** at **' + P + ' atm** and **' + T + ' K**. What is its molar mass?', a: M, unit: 'g/mol', steps: ['M = [[dRT|P]]', '= (' + F(d) + ')(0.08206)(' + T + ')/' + P, 'M = **' + F(M) + ' g/mol** (probably ' + ch(gas) + ')'] };
  });

  CQ.gen('c.dalton', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const n1 = R.pick([0.20, 0.50, 1.0]), n2 = R.pick([0.30, 0.80, 1.5]), Pt = R.pick([1.00, 2.00, 3.50]); const x = n1 / (n1 + n2); return { t: 'num', q: 'A mixture contains **' + n1 + ' mol N₂** and **' + n2 + ' mol O₂** at a total pressure of **' + Pt + ' atm**. What is the partial pressure of N₂?', a: x * Pt, unit: 'atm', steps: ['χ(N₂) = ' + n1 + '/' + F(n1 + n2) + ' = ' + F(x), 'P(N₂) = χ × P_total = **' + F(x * Pt) + ' atm**'] }; }
    if (k === 1) { const p = [R.pick([120, 250, 300]), R.pick([180, 340, 400]), R.pick([60, 110, 210])]; return { t: 'num', q: 'A flask holds He at **' + p[0] + ' torr**, Ne at **' + p[1] + ' torr** and Ar at **' + p[2] + ' torr**. What is the total pressure in atm?', a: (p[0] + p[1] + p[2]) / 760, unit: 'atm', steps: ['Dalton: P_total = ΣP = ' + (p[0] + p[1] + p[2]) + ' torr', '÷ 760 = **' + F((p[0] + p[1] + p[2]) / 760) + ' atm**'] }; }
    const Pt = R.pick([745, 752, 760, 768]), T = R.pick([[20, 17.5], [22, 19.8], [25, 23.8], [30, 31.8]]);
    return { t: 'num', lvl: 3, q: 'H₂ is collected over water at **' + T[0] + ' °C** with a total pressure of **' + Pt + ' torr**. The vapor pressure of water at this temperature is **' + T[1] + ' torr**. What is the partial pressure of the dry H₂?', a: Pt - T[1], unit: 'torr', steps: ['P_total = P(H₂) + P(H₂O)', 'P(H₂) = ' + Pt + ' − ' + T[1] + ' = **' + F(Pt - T[1], 4) + ' torr**'] };
  });

  CQ.gen('c.gasstoich', (R) => {
    const cases = [['2KClO3(s) → 2KCl(s) + 3O2(g)', 'KClO3', 'O2', 3 / 2], ['Zn(s) + 2HCl(aq) → ZnCl2(aq) + H2(g)', 'Zn', 'H2', 1], ['CaCO3(s) → CaO(s) + CO2(g)', 'CaCO3', 'CO2', 1], ['2NaN3(s) → 2Na(s) + 3N2(g)', 'NaN3', 'N2', 3 / 2]];
    const [eq, A, B, ratio] = R.pick(cases);
    const g = R.pick([5.00, 10.0, 25.0, 65.0]), T = R.pick([273.15, 298, 310]), P = R.pick([1.00, 0.980, 1.25]);
    const nB = (g / molarMass(A)) * ratio, V = (nB * Rg * T) / P;
    return { t: 'num', lvl: 4, exam: true, q: 'For **' + eq.replace(/([A-Z][a-z]?\d*[A-Za-z\d]*)/g, (m) => ch(m)) + '**, what volume of ' + ch(B) + ' (in L) is produced from **' + g + ' g ' + ch(A) + '** at **' + T + ' K** and **' + P + ' atm**?', a: V, unit: 'L',
      steps: ['mol ' + ch(A) + ' = ' + g + '/' + F(molarMass(A), 4) + ' = ' + F(g / molarMass(A)) + ' mol', 'mol ' + ch(B) + ' = × ' + F(ratio, 3) + ' = ' + F(nB) + ' mol', 'V = nRT/P = **' + F(V) + ' L**'] };
  });

  CQ.gen('c.rms', (R) => {
    const gas = R.pick(['H2', 'He', 'N2', 'O2', 'CO2', 'Ar']), T = R.pick([273, 298, 350, 500]);
    const M = molarMass(gas) / 1000;
    const u = Math.sqrt((3 * R8 * T) / M);
    return { t: 'num', lvl: 3, q: 'What is the root-mean-square speed of ' + ch(gas) + ' molecules at **' + T + ' K**?', a: u, unit: 'm/s',
      steps: ['u_rms = √{3RT/M} with R = 8.314 J/mol·K and M in **kg/mol**', 'M = ' + F(M, 4) + ' kg/mol', 'u_rms = √{3(8.314)(' + T + ')/' + F(M, 4) + '} = **' + F(u) + ' m/s**'] };
  });

  CQ.gen('c.graham', (R) => {
    const pairs = [['H2', 'O2'], ['He', 'CH4'], ['NH3', 'HCl'], ['CH4', 'SO2'], ['N2', 'CO2'], ['He', 'Ar']];
    const [a, b] = R.pick(pairs);
    const r = Math.sqrt(molarMass(b) / molarMass(a));
    return { t: 'num', lvl: 3, q: 'How many times faster does **' + ch(a) + '** effuse than **' + ch(b) + '** at the same temperature?', a: r, unit: '×',
      steps: ['Graham: [[rate₁|rate₂]] = √{[[M₂|M₁]]}', '= √{' + F(molarMass(b), 4) + '/' + F(molarMass(a), 4) + '} = **' + F(r) + '**'] };
  });

  /* ================= Unit 11 ================= */
  const u11 = U('c11', 'Thermochemistry', { sub: 'Energy, enthalpy, calorimetry & Hess\'s law', ch: 'Ch 10' }, [
    L('c11l1', 'Energy & the First Law', {
      goal: 'Apply ΔU = q + w with the correct sign conventions.',
      key: 'First law: energy is conserved, so ΔU_system = q + w. Signs are from the system\'s point of view: q > 0 means heat flows INTO the system (endothermic), q < 0 means heat flows out (exothermic). w > 0 means work is done ON the system (compression), w < 0 means the system does work (expansion). Pressure–volume work: $w = −P_{ext}ΔV$, with 1 L·atm = 101.3 J. U and H are state functions (path doesn\'t matter). q and w are not.',
      formulas: ['ΔU = q + w', 'w = −P_{ext}ΔV', '1 L·atm = 101.3 J'],
    }, [
      T('Energy bookkeeping', `
Split the universe into the **system** (the reaction) and the **surroundings** (everything else).
$$ ΔU = q + w $$
| Sign | Meaning |
|---|---|
| q > 0 | heat flows into the system (endothermic) |
| q < 0 | heat flows out (exothermic) |
| w > 0 | surroundings do work on the system (compression) |
| w < 0 | system does work (expansion) |
$$ w = −P_{ext} ΔV :: expansion: ΔV > 0 → w < 0 $$
>* Everything is from the **system's** point of view. Energy in is positive.`, { fig: D.enthalpy({ exo: true }) }),
      MC('An ice pack gets cold when activated. The process inside is…', ['endothermic: it absorbs heat from its surroundings', 'exothermic: it releases heat', 'neither', 'both'], 'Heat flows from your hand into the system.'),
      G('c.firstlaw'),
      G('c.pv'),
      TF('Enthalpy (H) is a state function.', true, 'ΔH depends only on the initial and final states, not the path.'),
      G('c.firstlaw'),
    ]),
    L('c11l2', 'Enthalpy', {
      goal: 'Use thermochemical equations and scale ΔH with the reaction.',
      key: 'Enthalpy change ΔH = heat flow at constant pressure (q_p). Exothermic: ΔH < 0. Endothermic: ΔH > 0. ΔH is extensive and belongs to the equation as written. Multiply the coefficients by n and ΔH is multiplied by n. Reverse the reaction and the sign of ΔH flips. The physical states matter, since H₂O(l) and H₂O(g) differ. Heat for a given amount: q = (mol) × (ΔH per mol of reaction).',
      formulas: ['ΔH = q_p', 'reverse → −ΔH · × n → nΔH', 'q = n × ΔH'],
    }, [
      T('Heat at constant pressure', `
$$ CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)   ΔH = −890.4 kJ $$
That means 890.4 kJ is **released** per mole of CH₄ burned (per mole of reaction as written).
- **Double** the equation → ΔH doubles (−1780.8 kJ)
- **Reverse** it → the sign flips (+890.4 kJ)
>* ΔH is a conversion factor: −890.4 kJ per 1 mol CH₄. Use it like any other stoichiometric ratio.`, { fig: D.enthalpy({ exo: true, r: 'CH₄ + 2O₂', p: 'CO₂ + 2H₂O' }) }),
      G('c.dHscale'),
      G('c.thermostoich'),
      MC('For an exothermic reaction, ΔH is…', ['negative', 'positive', 'zero', 'undefined'], 'Heat leaves the system.'),
      G('c.dHscale'),
      G('c.thermostoich'),
      TF('2H₂O(l) → 2H₂(g) + O₂(g) has ΔH = +571.6 kJ if 2H₂ + O₂ → 2H₂O(l) has ΔH = −571.6 kJ.', true, 'Reversing flips the sign.'),
    ]),
    L('c11l3', 'Calorimetry', {
      goal: 'Measure heat with q = mcΔT and coffee-cup calorimeters.',
      key: 'Heat absorbed or released by a substance: $q = mcΔT$ (c = specific heat; water is 4.184 J/g·°C) or $q = CΔT$ (C = heat capacity). Constant-pressure (coffee-cup) calorimeter: q_rxn = −q_solution, which gives ΔH. Constant-volume (bomb) calorimeter: q_rxn = −C_cal ΔT, which gives ΔU. When a hot object and cold water mix: heat lost + heat gained = 0. Divide q by moles to get kJ/mol, and watch the sign.',
      formulas: ['q = mcΔT', 'q_{rxn} = −q_{soln}', 'mixing: Σq = 0', 'c_water = 4.184 J/g·°C'],
    }, [
      T('Measuring heat', `
$$ q = m c ΔT :: c = specific heat (J/g·°C) $$
Water's c = 4.184 J/g·°C is large, which is why water heats up slowly.
**Coffee-cup calorimeter** (constant P): the reaction's heat goes into the solution:
$$ q_{rxn} = −q_{solution} = −m_{soln} c ΔT $$
>! If the solution warms up (ΔT > 0), the **reaction** is exothermic: q_rxn < 0.
>* Mixing hot and cold: heat lost by the hot object = heat gained by the cold one. Write q_hot + q_cold = 0 and solve for T_f.`),
      EX('Hot copper in water', '100. g of Cu (c = 0.385) at 95.0 °C goes into 200. g of water at 22.0 °C. Find T_f.', ['100(0.385)(T_f − 95.0) + 200(4.184)(T_f − 22.0) = 0', '38.5T_f − 3657.5 + 836.8T_f − 18,409.6 = 0', 'T_f = 22,067/875.3 = **25.2 °C**']),
      G('c.qmct'),
      G('c.qmct'),
      MC('In a coffee-cup calorimeter the solution\'s temperature drops. The reaction is…', ['endothermic', 'exothermic', 'at equilibrium', 'impossible to tell'], 'The reaction absorbed heat from the solution.'),
      G('c.mix'),
      G('c.coffee'),
    ]),
    L('c11l4', 'Hess\'s Law', {
      goal: 'Combine thermochemical equations to find an unknown ΔH.',
      key: 'Because H is a state function, ΔH for an overall reaction = the sum of ΔH for any set of steps that add up to it. Recipe: for each given equation, (1) flip it if needed so its species are on the target\'s side, flipping the sign of ΔH, (2) multiply it so the coefficients match, multiplying ΔH too, (3) add the equations and cancel intermediates, (4) add the ΔH values.',
      formulas: ['ΔH_{total} = ΣΔH_{steps}', 'flip → −ΔH · × n → nΔH'],
    }, [
      T('Any path, same destination', `
Enthalpy is a **state function**, so the route doesn't matter. Build the target equation out of given ones:
1. Find each target species in the given equations
2. **Reverse** an equation if the species is on the wrong side (flip the sign of ΔH)
3. **Multiply** to match coefficients (multiply ΔH)
4. **Add**: intermediates cancel, and the ΔHs add up
>* Start with a species that appears in only one given equation. That equation's orientation and multiplier are then forced.`),
      EX('Carbon monoxide', 'Find ΔH for C + ½O₂ → CO, given (1) C + O₂ → CO₂, ΔH = −393.5 kJ, and (2) CO + ½O₂ → CO₂, ΔH = −283.0 kJ.', ['Need C as a reactant: keep (1), −393.5', 'Need CO as a product: reverse (2), CO₂ → CO + ½O₂, +283.0', 'Add: CO₂ cancels, ½O₂ is left → C + ½O₂ → CO', 'ΔH = −393.5 + 283.0 = **−110.5 kJ**']),
      G('c.hess'),
      MC('If you reverse an equation and double it, its ΔH becomes…', ['−2 × the original', '2 × the original', '−½ × the original', 'unchanged'], 'Reverse → sign flip. Double → ×2.'),
      G('c.hess'),
      TF('Hess\'s law works because enthalpy is a state function.', true, 'ΔH depends only on the start and end states.'),
      G('c.hess'),
    ]),
    L('c11l5', 'Standard Enthalpies of Formation', {
      goal: 'Calculate ΔH°rxn from ΔH°f values.',
      key: 'ΔH°f is the enthalpy change to form 1 mol of a compound from its elements in their standard states (25 °C, 1 atm). Elements in their standard states (O₂(g), N₂(g), C(graphite), Fe(s)) have ΔH°f = 0. $ΔH°_{rxn} = ΣnΔH°_f(products) − ΣmΔH°_f(reactants)$. Multiply each by its coefficient, and watch the physical states.',
      formulas: ['ΔH°_{rxn} = ΣnΔH°_f(prod) − ΣmΔH°_f(react)', 'ΔH°_f(element, standard state) = 0'],
    }, [
      T('Products minus reactants', `
**Standard enthalpy of formation** ΔH°f: the ΔH to make **1 mol** of a substance from its elements in their standard states.
Examples: C(graphite) + O₂(g) → CO₂(g), ΔH°f = −393.5 kJ/mol. ΔH°f of O₂(g) = **0**.
$$ ΔH°_{rxn} = Σ n ΔH°_f(products) − Σ m ΔH°_f(reactants) $$
>! Don't forget the coefficients, and use the right state: H₂O(l) is −285.8 and H₂O(g) is −241.8.`),
      EX('Burning methane', 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l). ΔH°f: CH₄ −74.8, CO₂ −393.5, H₂O(l) −285.8.', ['Products: −393.5 + 2(−285.8) = −965.1', 'Reactants: −74.8 + 2(0) = −74.8', 'ΔH° = −965.1 − (−74.8) = **−890.3 kJ**']),
      MC('Which has ΔH°f = 0?', ['O₂(g)', 'O₃(g)', 'H₂O(l)', 'CO₂(g)'], 'O₂ gas is oxygen\'s standard state. Ozone is not.'),
      G('c.dHf'),
      G('c.dHf'),
      TF('ΔH°f of liquid water and of water vapor are the same.', false, '−285.8 vs −241.8 kJ/mol. The difference is the heat of vaporization.'),
      G('c.dHf'),
    ]),
  ]);

  /* ================= Unit 12 ================= */
  const u12 = U('c12', 'Gases', { sub: 'Gas laws, ideal gas, mixtures & kinetic theory', ch: 'Ch 11' }, [
    L('c12l1', 'Pressure & the Gas Laws', {
      goal: 'Convert pressure units and use Boyle\'s, Charles\'s and the combined gas law.',
      key: '1 atm = 760 mmHg = 760 torr = 101.325 kPa. Boyle: $P₁V₁ = P₂V₂$ (constant T, n). Charles: $V₁/T₁ = V₂/T₂$ (constant P, n). Avogadro: V ∝ n. Combined: $P₁V₁/T₁ = P₂V₂/T₂$. ALWAYS use kelvin for T.',
      formulas: ['1 atm = 760 mmHg = 101.325 kPa', 'P₁V₁ = P₂V₂', '[[V₁|T₁]] = [[V₂|T₂]]', '[[P₁V₁|T₁]] = [[P₂V₂|T₂]]'],
    }, [
      T('Squeeze it, heat it', `
**Pressure** = force per area. 1 atm = 760 mmHg = 760 torr = 101.325 kPa.
| Law | Holds constant | Relationship |
|---|---|---|
| Boyle | T, n | P₁V₁ = P₂V₂ |
| Charles | P, n | V₁/T₁ = V₂/T₂ |
| Avogadro | P, T | V₁/n₁ = V₂/n₂ |
| Combined | n | P₁V₁/T₁ = P₂V₂/T₂ |
>! Temperatures must be in **kelvin**. Doubling from 10 °C to 20 °C does NOT double the volume.`),
      G('c.pconv'),
      G('c.gaslaw'),
      MC('At constant temperature, if you halve a gas\'s volume, its pressure…', ['doubles', 'halves', 'stays the same', 'quadruples'], 'Boyle: P ∝ 1/V.'),
      G('c.gaslaw'),
      G('c.pconv'),
      G('c.gaslaw'),
    ]),
    L('c12l2', 'Ideal Gas Law', {
      goal: 'Use PV = nRT in every form, including density and molar mass.',
      key: '$PV = nRT$ with R = 0.08206 L·atm/(mol·K) (P in atm, V in L, T in K). STP = 0 °C (273.15 K) and 1 atm, where 1 mol of ideal gas occupies 22.41 L. Rearranged: density $d = PM/RT$, and molar mass $M = dRT/P$. Heavier gases are denser at the same P and T.',
      formulas: ['PV = nRT', 'R = 0.08206 L·atm/mol·K', 'd = [[PM|RT]]   ·   M = [[dRT|P]]', 'STP: 22.41 L/mol'],
    }, [
      T('One equation to rule them all', `
$$ PV = nRT :: R = 0.08206 L·atm/(mol·K) $$
Units must match R: **atm, L, mol, K**.
At **STP** (273.15 K, 1 atm), 1 mol of any ideal gas fills **22.41 L**.
**Density and molar mass** (substitute n = m/M):
$$ d = [[PM|RT]]   ·   M = [[dRT|P]] $$`),
      EX('Molar mass from density', 'A gas has d = 1.96 g/L at STP. Find M.', ['M = dRT/P = (1.96)(0.08206)(273.15)/1.00', 'M = **43.9 g/mol**, probably CO₂']),
      G('c.ideal'),
      G('c.ideal'),
      MC('At the same temperature and pressure, which gas is the **densest**?', ['CO₂', 'N₂', 'He', 'CH₄'], 'd ∝ M. CO₂ (44 g/mol) is the heaviest.'),
      G('c.ideal'),
      G('c.ideal'),
    ]),
    L('c12l3', 'Partial Pressures & Gas Stoichiometry', {
      goal: 'Use Dalton\'s law and connect gas volumes to stoichiometry.',
      key: 'Dalton: each gas in a mixture behaves independently, so $P_{total} = P_A + P_B + …$ and $P_A = χ_A P_{total}$, where χ_A = n_A/n_total. Gas collected over water: $P_{gas} = P_{total} − P_{H₂O}$. Gas stoichiometry: grams → mol (via the equation\'s ratios) → V = nRT/P, or the reverse.',
      formulas: ['P_{total} = ΣPᵢ', 'Pᵢ = χᵢP_{total}', 'over water: P_{gas} = P_{total} − P_{H₂O}'],
    }, [
      T('Gases share a container, not a pressure', `
**Dalton's law:** each gas pushes as if it were alone:
$$ P_{total} = P_A + P_B + …   ·   P_A = χ_A P_{total} $$
where $χ_A = n_A / n_{total}$ is the mole fraction.
**Collecting over water:** the gas is mixed with water vapor, so subtract it: $P_{gas} = P_{total} − P_{H₂O}$.
**Gas stoichiometry:** use PV = nRT to switch between liters and moles, then use the balanced equation as usual.`),
      G('c.dalton'),
      G('c.dalton'),
      G('c.gasstoich'),
      TF('The mole fraction of a gas equals its fraction of the total pressure.', true, 'P_A/P_total = n_A/n_total.'),
      G('c.gasstoich'),
    ]),
    L('c12l4', 'Kinetic Theory, Speed & Effusion', {
      goal: 'Explain gas behavior with kinetic molecular theory and compute speeds and effusion rates.',
      key: 'KMT: gas particles have negligible volume, no attractions, elastic collisions, and an average kinetic energy ∝ absolute temperature (all gases have the same average KE at the same T). $u_{rms} = √{3RT/M}$ (R = 8.314 J/mol·K, M in kg/mol), so lighter means faster. Graham\'s law: $rate₁/rate₂ = √{M₂/M₁}$. Real gases deviate from ideal behavior at high pressure (particle volume matters) and low temperature (attractions matter). The van der Waals equation corrects for both.',
      formulas: ['u_{rms} = √{[[3RT|M]]} (M in kg/mol)', '[[rate₁|rate₂]] = √{[[M₂|M₁]]}', 'ideal: low P, high T'],
    }, [
      T('Why gases behave the way they do', `
**Kinetic molecular theory:**
1. Particles are tiny compared with the space between them
2. No attractions or repulsions
3. Collisions are perfectly elastic
4. Average kinetic energy ∝ **absolute temperature**
$$ u_{rms} = √{[[3RT|M]]} :: R = 8.314 J/(mol·K), M in kg/mol $$
$$ [[rate₁|rate₂]] = √{[[M₂|M₁]]} :: Graham's law of effusion $$
>! Use **kg/mol** in u_rms, so O₂ is 0.03200 kg/mol, not 32.00.
>* **Real gases** misbehave at **high pressure** (molecules take up space) and **low temperature** (attractions kick in).`),
      G('c.rms'),
      G('c.graham'),
      MC('At the same temperature, H₂ and O₂ molecules have the same…', ['average kinetic energy', 'average speed', 'mass', 'rms speed'], 'KE depends only on T. The lighter H₂ moves faster.'),
      MC('Under which conditions does a real gas behave most ideally?', ['high temperature, low pressure', 'low temperature, high pressure', 'low temperature, low pressure', 'high temperature, high pressure'], 'Fast, far-apart particles act like ideal points.'),
      G('c.rms'),
      G('c.graham'),
    ]),
  ]);

  CQ.addUnits('chem', [u11, u12]);
})();
