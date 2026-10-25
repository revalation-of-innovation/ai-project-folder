/* CHEM 1311 · General Chemistry I — course definition, chemistry toolkit and Units 1–4
   (Burdge & Overby, Chemistry: Atoms First, Ch 1–3) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const ch = CQ.chem;
  const sup = CQ.supNum;

  CQ.defineCourse({
    id: 'chem', code: 'CHEM 1311', name: 'General Chemistry I', icon: 'flask', color: '#0fa985', dark: '#0a7a60',
    book: 'Burdge & Overby, Chemistry: Atoms First · Ch 1–11',
    exams: [
      { id: 'chem-e1', name: 'Exam 1', units: ['c1', 'c2', 'c3', 'c4'], n: 20, mins: 50, note: 'Ch 1–3' },
      { id: 'chem-e2', name: 'Exam 2', units: ['c5', 'c6', 'c7'], n: 20, mins: 50, note: 'Ch 4–6' },
      { id: 'chem-e3', name: 'Exam 3', units: ['c8', 'c9', 'c10'], n: 20, mins: 50, note: 'Ch 7–9' },
      { id: 'chem-fin', name: 'Final', units: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'], n: 30, mins: 110, note: 'Cumulative' },
    ],
  });

  /* ================= chemistry toolkit (shared by all chem files) ================= */
  const EL = {};
  [[1, 'H', 'hydrogen', 1.008], [2, 'He', 'helium', 4.003], [3, 'Li', 'lithium', 6.941], [4, 'Be', 'beryllium', 9.012], [5, 'B', 'boron', 10.81],
    [6, 'C', 'carbon', 12.01], [7, 'N', 'nitrogen', 14.01], [8, 'O', 'oxygen', 16.0], [9, 'F', 'fluorine', 19.0], [10, 'Ne', 'neon', 20.18],
    [11, 'Na', 'sodium', 22.99], [12, 'Mg', 'magnesium', 24.31], [13, 'Al', 'aluminum', 26.98], [14, 'Si', 'silicon', 28.09], [15, 'P', 'phosphorus', 30.97],
    [16, 'S', 'sulfur', 32.07], [17, 'Cl', 'chlorine', 35.45], [18, 'Ar', 'argon', 39.95], [19, 'K', 'potassium', 39.1], [20, 'Ca', 'calcium', 40.08],
    [21, 'Sc', 'scandium', 44.96], [22, 'Ti', 'titanium', 47.87], [23, 'V', 'vanadium', 50.94], [24, 'Cr', 'chromium', 52.0], [25, 'Mn', 'manganese', 54.94],
    [26, 'Fe', 'iron', 55.85], [27, 'Co', 'cobalt', 58.93], [28, 'Ni', 'nickel', 58.69], [29, 'Cu', 'copper', 63.55], [30, 'Zn', 'zinc', 65.38],
    [31, 'Ga', 'gallium', 69.72], [32, 'Ge', 'germanium', 72.63], [33, 'As', 'arsenic', 74.92], [34, 'Se', 'selenium', 78.97], [35, 'Br', 'bromine', 79.9],
    [36, 'Kr', 'krypton', 83.8], [37, 'Rb', 'rubidium', 85.47], [38, 'Sr', 'strontium', 87.62], [47, 'Ag', 'silver', 107.9], [50, 'Sn', 'tin', 118.7],
    [53, 'I', 'iodine', 126.9], [55, 'Cs', 'cesium', 132.9], [56, 'Ba', 'barium', 137.3], [79, 'Au', 'gold', 197.0], [80, 'Hg', 'mercury', 200.6], [82, 'Pb', 'lead', 207.2],
  ].forEach(([z, s, n, m]) => { EL[s] = { z, s, name: n, m }; });
  const BYZ = {};
  Object.values(EL).forEach((e) => { BYZ[e.z] = e; });

  // "Ca(NO3)2" → { Ca: 1, N: 2, O: 6 }
  function parse(f) {
    let i = 0;
    const num = () => { const m = f.slice(i).match(/^\d+/); if (m) { i += m[0].length; return +m[0]; } return 1; };
    const group = () => {
      const out = {};
      while (i < f.length && f[i] !== ')') {
        if (f[i] === '(') { i++; const inner = group(); i++; const n = num(); for (const k in inner) out[k] = (out[k] || 0) + inner[k] * n; }
        else { const m = f.slice(i).match(/^[A-Z][a-z]?/); if (!m) throw new Error('bad formula ' + f); i += m[0].length; const n = num(); out[m[0]] = (out[m[0]] || 0) + n; }
      }
      return out;
    };
    return group();
  }
  const molarMass = (f) => { const c = parse(f); return Object.keys(c).reduce((a, k) => a + EL[k].m * c[k], 0); };

  // electron configurations (Aufbau with the Cr/Cu/Mo/Ag exceptions)
  const ORDER_ = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6]];
  function fill(Z) {
    let left = Z;
    const out = [];
    for (const [o, cap] of ORDER_) { if (left <= 0) break; const n = Math.min(cap, left); out.push([o, n]); left -= n; }
    const fix = { 24: ['4s', 1, '3d', 5], 29: ['4s', 1, '3d', 10], 42: ['5s', 1, '4d', 5], 47: ['5s', 1, '4d', 10] }[Z];
    if (fix) { out.find((x) => x[0] === fix[0])[1] = fix[1]; out.find((x) => x[0] === fix[2])[1] = fix[3]; }
    return out;
  }
  const CORES = [[36, 'Kr', 8], [18, 'Ar', 5], [10, 'Ne', 3], [2, 'He', 1]];
  const cfgStr = (subs, Z) => {
    const core = CORES.find((c) => c[0] < Z);
    const body = (core ? subs.slice(core[2]) : subs).filter((x) => x[1] > 0).map(([o, n]) => o + sup(n)).join(' ');
    return core ? '[' + core[1] + '] ' + body : body;
  };
  const cfg = (Z) => cfgStr(fill(Z), Z);
  const cfgFull = (Z) => fill(Z).filter((x) => x[1] > 0).map(([o, n]) => o + sup(n)).join(' ');
  const unpaired = (subs) => subs.reduce((a, [o, n]) => { const k = { s: 1, p: 3, d: 5, f: 7 }[o.slice(-1)]; return a + (n <= k ? n : 2 * k - n); }, 0);
  // configuration of an ion: cations lose the highest-n electrons first (4s before 3d)
  function ionSubs(Z, q) {
    const subs = fill(Z).map((x) => x.slice());
    if (q > 0) {
      let k = q;
      while (k > 0) {
        const maxN = Math.max(...subs.filter((x) => x[1] > 0).map((x) => +x[0][0]));
        // highest n first; within that shell, highest ℓ first (so Fe³⁺ loses 4s, 4s, then 3d)
        const cands = subs.filter((x) => x[1] > 0 && +x[0][0] === maxN).sort((a, b) => 'spdf'.indexOf(b[0][1]) - 'spdf'.indexOf(a[0][1]));
        cands[0][1]--; k--;
      }
    } else if (q < 0) {
      return fill(Z - q);
    }
    return subs;
  }
  CQ.chemkit = { EL, BYZ, parse, molarMass, fill, cfg, cfgFull, cfgStr, unpaired, ionSubs };
  const NA = 6.022e23, h = 6.626e-34, c = 2.998e8;

  /* ================= generators: Unit 1 ================= */
  CQ.gen('c.temp', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const C = R.pick([-40, -10, 0, 25, 37, 100, 350]); return { t: 'num', q: 'Convert **' + C + ' °C** to kelvin.', a: C + 273.15, unit: 'K', tol: 0.001, abs: 0.2, steps: ['K = °C + 273.15', '= ' + C + ' + 273.15 = **' + F(C + 273.15, 5) + ' K**'] }; }
    if (k === 1) { const Fh = R.pick([-40, 32, 68, 98.6, 212, 350, 451]); const C = ((Fh - 32) * 5) / 9; return { t: 'num', q: 'Convert **' + Fh + ' °F** to °C.', a: C, unit: '°C', abs: 0.2, steps: ['°C = (°F − 32) × [[5|9]]', '= (' + Fh + ' − 32) × 5/9 = **' + F(C) + ' °C**'] }; }
    const Kv = R.pick([77, 195, 300, 373, 500]); return { t: 'num', q: 'Liquid in a lab is at **' + Kv + ' K**. What is that in °F?', a: ((Kv - 273.15) * 9) / 5 + 32, unit: '°F', abs: 0.3, steps: ['°C = ' + Kv + ' − 273.15 = ' + F(Kv - 273.15) + ' °C', '°F = [[9|5]](°C) + 32 = **' + F(((Kv - 273.15) * 9) / 5 + 32) + ' °F**'] };
  });

  CQ.gen('c.density', (R) => {
    const k = R.int(0, 2);
    const d = R.pick([0.789, 1.0, 2.70, 7.87, 8.96, 11.3, 13.6, 19.3]);
    if (k === 0) { const m = R.pick([12.5, 25.0, 48.6, 105]); const V = m / d; return { t: 'num', q: 'A sample has a mass of **' + m + ' g** and a volume of **' + F(V) + ' mL**. What is its density?', a: d, unit: 'g/mL', steps: ['d = m/V = ' + m + '/' + F(V) + ' = **' + F(d) + ' g/mL**'] }; }
    if (k === 1) { const V = R.pick([5.0, 12.0, 25.0, 50.0]); return { t: 'num', q: 'What is the mass of **' + V + ' mL** of a liquid with density **' + d + ' g/mL**?', a: V * d, unit: 'g', steps: ['m = d × V = ' + d + ' × ' + V + ' = **' + F(V * d) + ' g**'] }; }
    const m = R.pick([27.0, 54.0, 81.0, 135]); const v1 = R.pick([20.0, 25.0, 30.0]);
    return { t: 'num', lvl: 4, q: 'A **' + m + ' g** metal cube is dropped into a graduated cylinder, and the water level rises from **' + v1 + ' mL** to **' + F(v1 + m / d) + ' mL**. What is the metal\'s density?', a: d, unit: 'g/mL',
      steps: ['Volume of metal = ' + F(v1 + m / d) + ' − ' + v1 + ' = ' + F(m / d) + ' mL', 'd = ' + m + '/' + F(m / d) + ' = **' + F(d) + ' g/mL**'] };
  });

  CQ.gen('c.sigcalc', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const a = R.pick(['4.56', '12.3', '0.0250', '6.022', '3.0']), b = R.pick(['2.1', '1.234', '45.0', '0.50']); const v = parseFloat(a) * parseFloat(b); const sf = Math.min(sigOf(a), sigOf(b)); return { t: 'mc', lvl: 2, q: 'Calculate **' + a + ' × ' + b + '** to the correct number of significant figures.', opts: uniq([F(v, sf), F(v, sf + 1), F(v, sf + 2), F(v, Math.max(1, sf - 1))]), why: 'Multiplication: the answer keeps the fewest sig figs of the inputs (' + sf + ').' }; }
    if (k === 1) { const a = R.pick(['15.02', '7.6', '102.35', '0.553']), b = R.pick(['3.1', '12.004', '0.89', '45']); const v = parseFloat(a) + parseFloat(b); const dp = Math.min(dps(a), dps(b)); return { t: 'mc', lvl: 2, q: 'Calculate **' + a + ' + ' + b + '** to the correct precision.', opts: uniq([v.toFixed(dp), v.toFixed(dp + 1), v.toFixed(dp + 2), dp > 0 ? String(Math.round(v)) : v.toFixed(dp + 3)]), why: 'Addition: the answer keeps the fewest decimal places (' + dp + ').' }; }
    const a = R.pick(['25.0', '8.314', '0.08206', '1.50']), b = R.pick(['3.0', '22.4', '298', '0.0100']); const v = parseFloat(a) / parseFloat(b); const sf = Math.min(sigOf(a), sigOf(b));
    return { t: 'mc', lvl: 2, q: 'Calculate **' + a + ' ÷ ' + b + '** with correct sig figs.', opts: uniq([F(v, sf), F(v, sf + 1), F(v, sf + 2), F(v, Math.max(1, sf - 1))]), why: 'Division: keep the fewest sig figs (' + sf + ').' };
  });
  function sigOf(s) { const t = s.replace('.', '').replace(/^0+/, ''); return s.includes('.') ? t.length : t.replace(/0+$/, '').length; }
  function dps(s) { return s.includes('.') ? s.split('.')[1].length : 0; }
  function uniq(a) { return [...new Set(a)]; }

  CQ.gen('c.dimanal', (R) => {
    const k = R.int(0, 4);
    if (k === 0) { const L2 = R.pick([0.250, 1.75, 2.50, 3.785]); return { t: 'num', q: 'How many **cubic centimeters** are in **' + L2 + ' L**?', a: L2 * 1000, unit: 'cm³', steps: ['1 L = 1000 mL and 1 mL = 1 cm³', L2 + ' L × [[1000 cm³|1 L]] = **' + F(L2 * 1000) + ' cm³**'] }; }
    if (k === 1) { const mgdl = R.pick([85, 99, 120, 180]); return { t: 'num', q: 'A blood glucose level is **' + mgdl + ' mg/dL**. Express it in g/L.', a: mgdl / 100, unit: 'g/L', steps: [mgdl + ' [[mg|dL]] × [[1 g|1000 mg]] × [[10 dL|1 L]]', '= **' + F(mgdl / 100) + ' g/L**'] }; }
    if (k === 2) { const in3 = R.pick([10.0, 25.0, 61.0, 100.]); return { t: 'num', q: 'Convert **' + in3 + ' in³** to cm³. (1 in = 2.54 cm, exactly)', a: in3 * 2.54 ** 3, unit: 'cm³', hint: 'Cube the conversion factor.', steps: ['1 in³ = (2.54 cm)³ = 16.39 cm³', in3 + ' × 16.39 = **' + F(in3 * 2.54 ** 3) + ' cm³**'] }; }
    if (k === 3) { const gal = R.pick([2.0, 5.0, 12.0, 15.5]), d = 0.74; return { t: 'num', lvl: 4, q: 'Gasoline has a density of **0.74 g/mL**. What is the mass in kilograms of **' + gal + ' gal** of gasoline? (1 gal = 3.785 L)', a: (gal * 3.785 * 1000 * d) / 1000, unit: 'kg', steps: [gal + ' gal × [[3.785 L|1 gal]] × [[1000 mL|1 L]] × [[0.74 g|1 mL]] × [[1 kg|1000 g]]', '= **' + F((gal * 3.785 * 1000 * d) / 1000) + ' kg**'] }; }
    const nm = R.pick([450, 589, 656, 700]); return { t: 'num', q: 'A wavelength of **' + nm + ' nm** is how many meters?', a: nm * 1e-9, unit: 'm', steps: ['1 nm = 10⁻⁹ m', nm + ' × 10⁻⁹ = **' + F(nm * 1e-9) + ' m**'] };
  });

  /* ================= generators: Unit 2 ================= */
  const ISO = [['C', 12, 0], ['C', 14, 0], ['O', 18, 0], ['O', 16, -2], ['Na', 23, 1], ['Mg', 24, 2], ['Al', 27, 3], ['Cl', 35, 0], ['Cl', 37, -1], ['Fe', 56, 3], ['Fe', 56, 2], ['Cu', 63, 2], ['Br', 81, -1], ['S', 32, -2], ['U', 238, 0], ['Ca', 40, 2], ['N', 15, -3], ['Zn', 65, 2], ['Ag', 107, 1], ['I', 127, -1]];
  CQ.gen('c.pne', (R) => {
    let [s, A, q] = R.pick(ISO);
    const Z = s === 'U' ? 92 : EL[s].z;
    const want = R.pick(['p', 'n', 'e']);
    const vals = { p: Z, n: A - Z, e: Z - q };
    const qs = q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻');
    const charge = q === 0 ? '' : sup(Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻');
    return { t: 'num', q: 'How many **' + { p: 'protons', n: 'neutrons', e: 'electrons' }[want] + '** are in **' + sup(A) + s + charge + '**?', a: vals[want], unit: '', abs: 0.01, lvl: 2,
      steps: ['Atomic number of ' + s + ': Z = ' + Z + ' → ' + Z + ' protons', 'Neutrons = A − Z = ' + A + ' − ' + Z + ' = ' + (A - Z), 'Electrons = Z − charge = ' + Z + ' − (' + q + ') = ' + (Z - q), 'Answer: **' + vals[want] + '**'] };
  });

  CQ.gen('c.avgmass', (R) => {
    const sets = [['Cl', 34.969, 36.966, 75.78], ['B', 10.013, 11.009, 19.9], ['Cu', 62.930, 64.928, 69.15], ['Ga', 68.926, 70.925, 60.11], ['Br', 78.918, 80.916, 50.69], ['Li', 6.0151, 7.016, 7.59]];
    const [s, m1, m2, p1] = R.pick(sets);
    const avg = (m1 * p1 + m2 * (100 - p1)) / 100;
    if (R.chance(0.65)) return { t: 'num', q: 'Naturally occurring ' + EL[s].name + ' is **' + p1 + '%** ' + s + '-' + Math.round(m1) + ' (' + m1 + ' amu) and **' + F(100 - p1, 4) + '%** ' + s + '-' + Math.round(m2) + ' (' + m2 + ' amu). What is its average atomic mass?', a: avg, unit: 'amu', tol: 0.002,
      steps: ['Weighted average: Σ(fraction × mass)', '(' + p1 / 100 + ')(' + m1 + ') + (' + F((100 - p1) / 100, 4) + ')(' + m2 + ')', '= **' + F(avg, 4) + ' amu**'] };
    return { t: 'num', lvl: 4, q: s + ' has two isotopes: ' + m1 + ' amu and ' + m2 + ' amu. Its average atomic mass is **' + F(avg, 5) + ' amu**. What is the percent abundance of the **lighter** isotope?', a: p1, unit: '%', tol: 0.01,
      hint: 'Let x = fraction of the lighter isotope. Then x·m₁ + (1 − x)·m₂ = average.',
      steps: ['x(' + m1 + ') + (1 − x)(' + m2 + ') = ' + F(avg, 5), 'x = [[' + m2 + ' − ' + F(avg, 5) + '|' + m2 + ' − ' + m1 + ']] = ' + F(p1 / 100, 4), '**' + F(p1, 4) + '%**'] };
  });

  CQ.gen('c.mole', (R) => {
    const e = EL[R.pick(['C', 'Na', 'Mg', 'Al', 'S', 'Fe', 'Cu', 'Ca', 'Ag', 'Au', 'Zn'])];
    const k = R.int(0, 3);
    if (k === 0) { const g = R.pick([5.00, 10.0, 25.0, 50.0, 100.]); return { t: 'num', q: 'How many **moles** are in **' + g + ' g** of ' + e.name + ' (' + e.s + ', ' + e.m + ' g/mol)?', a: g / e.m, unit: 'mol', steps: ['n = mass ÷ molar mass', '= ' + g + ' g ÷ ' + e.m + ' g/mol = **' + F(g / e.m) + ' mol**'] }; }
    if (k === 1) { const n = R.pick([0.250, 0.500, 1.25, 2.00, 3.50]); return { t: 'num', q: 'What is the mass of **' + n + ' mol** of ' + e.name + ' (' + e.m + ' g/mol)?', a: n * e.m, unit: 'g', steps: ['mass = n × M = ' + n + ' × ' + e.m + ' = **' + F(n * e.m) + ' g**'] }; }
    if (k === 2) { const g = R.pick([1.00, 5.00, 12.0, 20.0]); return { t: 'num', q: 'How many **atoms** are in **' + g + ' g** of ' + e.name + ' (' + e.m + ' g/mol)?', a: (g / e.m) * NA, unit: 'atoms', steps: ['n = ' + g + '/' + e.m + ' = ' + F(g / e.m) + ' mol', 'atoms = n × N_A = ' + F(g / e.m) + ' × 6.022×10²³ = **' + F((g / e.m) * NA) + ' atoms**'] }; }
    const atoms = R.pick([1e22, 3.01e23, 1.5e24, 5e20]);
    return { t: 'num', lvl: 3, q: 'What is the mass of **' + F(atoms) + ' atoms** of ' + e.name + ' (' + e.m + ' g/mol)?', a: (atoms / NA) * e.m, unit: 'g', steps: ['n = ' + F(atoms) + ' ÷ 6.022×10²³ = ' + F(atoms / NA) + ' mol', 'mass = n × M = **' + F((atoms / NA) * e.m) + ' g**'] };
  });

  /* ================= generators: Unit 3 ================= */
  CQ.gen('c.light', (R) => {
    if (R.chance(0.5)) { const nm = R.pick([410, 486, 589, 656, 700, 254, 1064]); const nu = c / (nm * 1e-9); return { t: 'num', q: 'What is the frequency of light with a wavelength of **' + nm + ' nm**?', a: nu, unit: 's⁻¹ (Hz)', steps: ['ν = c/λ', 'λ = ' + nm + ' × 10⁻⁹ m', 'ν = [[2.998×10⁸ m/s|' + F(nm * 1e-9) + ' m]] = **' + F(nu) + ' s⁻¹**'] }; }
    const nu = R.pick([9.8e7, 2.45e9, 5.0e14, 6.0e14, 1.2e15]); const lam = c / nu;
    return { t: 'num', q: 'Radiation has a frequency of **' + F(nu) + ' s⁻¹**. What is its wavelength in meters?', a: lam, unit: 'm', steps: ['λ = c/ν = [[2.998×10⁸|' + F(nu) + ']]', 'λ = **' + F(lam) + ' m**'] };
  });

  CQ.gen('c.photon', (R) => {
    const nm = R.pick([254, 400, 450, 532, 589, 650, 700]);
    const E = (h * c) / (nm * 1e-9);
    const k = R.int(0, 2);
    if (k === 0) return { t: 'num', q: 'What is the energy of **one photon** of **' + nm + ' nm** light?', a: E, unit: 'J', steps: ['E = hν = [[hc|λ]]', '= [[(6.626×10⁻³⁴)(2.998×10⁸)|' + nm + '×10⁻⁹]]', 'E = **' + F(E) + ' J**'] };
    if (k === 1) return { t: 'num', q: 'What is the energy of **one mole** of **' + nm + ' nm** photons, in kJ/mol?', a: (E * NA) / 1000, unit: 'kJ/mol', steps: ['One photon: E = hc/λ = ' + F(E) + ' J', '× N_A: ' + F(E) + ' × 6.022×10²³ = ' + F(E * NA) + ' J/mol', '= **' + F((E * NA) / 1000) + ' kJ/mol**'] };
    const Et = R.pick([1e-3, 5e-3, 1.0, 2.5]);
    return { t: 'num', lvl: 4, q: 'A laser pulse at **' + nm + ' nm** delivers **' + F(Et) + ' J**. How many photons is that?', a: Et / E, unit: 'photons', steps: ['E per photon = hc/λ = ' + F(E) + ' J', 'N = ' + F(Et) + ' / ' + F(E) + ' = **' + F(Et / E) + ' photons**'] };
  });

  CQ.gen('c.photoelectric', (R) => {
    const metals = [['sodium', 3.65e-19], ['potassium', 3.68e-19], ['cesium', 3.43e-19], ['calcium', 4.6e-19]];
    const [m, W] = R.pick(metals);
    const nm = R.pick([250, 300, 350, 400]);
    const E = (h * c) / (nm * 1e-9);
    return { t: 'num', lvl: 4, q: 'Light of wavelength **' + nm + ' nm** shines on ' + m + ' (work function **' + F(W) + ' J**). What is the maximum kinetic energy of the ejected electrons?', a: E - W, unit: 'J',
      steps: ['Photon energy: E = hc/λ = ' + F(E) + ' J', 'KE = hν − Φ = ' + F(E) + ' − ' + F(W), 'KE = **' + F(E - W) + ' J**'] };
  });

  const RH = 2.18e-18;
  CQ.gen('c.bohr', (R) => {
    const pairs = [[3, 2], [4, 2], [5, 2], [6, 2], [2, 1], [3, 1], [4, 3], [5, 3]];
    const [ni, nf] = R.pick(pairs);
    const dE = RH * (1 / (nf * nf) - 1 / (ni * ni));
    const lam = (h * c) / dE;
    const want = R.pick(['lam', 'E']);
    return { t: 'num', q: 'An electron in a hydrogen atom drops from **n = ' + ni + '** to **n = ' + nf + '**. ' + (want === 'lam' ? 'What is the wavelength of the emitted photon, in nm?' : 'How much energy does the emitted photon carry?'), a: want === 'lam' ? lam * 1e9 : dE, unit: want === 'lam' ? 'nm' : 'J',
      fig: D.levels({ trans: [[ni, nf]] }),
      steps: ['ΔE = 2.18×10⁻¹⁸ J ([[1|n_f²]] − [[1|n_i²]]) = 2.18×10⁻¹⁸ ([[1|' + nf * nf + ']] − [[1|' + ni * ni + ']])', '|ΔE| = ' + F(dE) + ' J (emitted)', ...(want === 'lam' ? ['λ = hc/ΔE = ' + F(lam) + ' m = **' + F(lam * 1e9) + ' nm**'] : ['E_photon = **' + F(dE) + ' J**'])],
      why: nf === 2 ? 'Drops to n = 2 make the visible Balmer series.' : nf === 1 ? 'Drops to n = 1 (Lyman series) are in the ultraviolet.' : 'Drops to n = 3 (Paschen series) are in the infrared.' };
  });

  CQ.gen('c.debroglie', (R) => {
    if (R.chance(0.5)) { const v = R.pick([1e5, 5e5, 1e6, 3e6]); const lam = h / (9.109e-31 * v); return { t: 'num', q: 'What is the de Broglie wavelength of an electron (m = 9.109 × 10⁻³¹ kg) moving at **' + F(v) + ' m/s**? Answer in nm.', a: lam * 1e9, unit: 'nm', steps: ['λ = h/(mu)', '= [[6.626×10⁻³⁴|(9.109×10⁻³¹)(' + F(v) + ')]] = ' + F(lam) + ' m', '= **' + F(lam * 1e9) + ' nm**'] }; }
    const m = R.pick([0.145, 0.057, 0.0459]), v = R.pick([20, 35, 45]); const lam = h / (m * v);
    return { t: 'num', q: 'What is the de Broglie wavelength of a **' + m * 1000 + ' g** ball moving at **' + v + ' m/s**?', a: lam, unit: 'm', steps: ['λ = h/(mu) = [[6.626×10⁻³⁴|(' + m + ')(' + v + ')]]', 'λ = **' + F(lam) + ' m**, far too small to ever detect'] };
  });

  CQ.gen('c.qn', (R) => {
    const valid = [[2, 1, -1, '+½'], [3, 2, 2, '−½'], [4, 0, 0, '+½'], [3, 1, 0, '−½'], [4, 3, -3, '+½'], [1, 0, 0, '−½'], [5, 2, -1, '+½']];
    const invalid = [[[2, 2, 0, '+½'], 'ℓ must be less than n'], [[3, 1, 2, '−½'], '|mℓ| cannot exceed ℓ'], [[1, 1, 0, '+½'], 'ℓ must be less than n'], [[3, 0, 1, '+½'], 'mℓ must be 0 when ℓ = 0'], [[0, 0, 0, '+½'], 'n starts at 1'], [[4, 2, -3, '−½'], '|mℓ| cannot exceed ℓ']];
    const [bad, reason] = R.pick(invalid);
    const fmt = (s) => '(' + s.join(', ') + ')';
    return { t: 'mc', lvl: 2, q: 'Which set of quantum numbers **(n, ℓ, mℓ, mₛ)** is **not** allowed?', opts: [fmt(bad)].concat(R.sample(valid, 3).map(fmt)), why: fmt(bad) + ' fails because ' + reason + '. Rules: n ≥ 1, 0 ≤ ℓ ≤ n − 1, −ℓ ≤ mℓ ≤ +ℓ, mₛ = ±½.' };
  });

  CQ.gen('c.orbcount', (R) => {
    const k = R.int(0, 2);
    if (k === 0) { const sub = R.pick([['s', 0], ['p', 1], ['d', 2], ['f', 3]]); const n = sub[1] + R.int(1, 3); return { t: 'num', q: 'How many **orbitals** are in a **' + n + sub[0] + '** subshell?', a: 2 * sub[1] + 1, unit: '', abs: 0.01, lvl: 2, steps: [sub[0] + ' → ℓ = ' + sub[1], 'orbitals = 2ℓ + 1 = **' + (2 * sub[1] + 1) + '**'] }; }
    if (k === 1) { const n = R.int(2, 5); return { t: 'num', q: 'What is the maximum number of **electrons** in the **n = ' + n + '** shell?', a: 2 * n * n, unit: '', abs: 0.01, lvl: 2, steps: ['n² = ' + n * n + ' orbitals, 2 electrons each', '2n² = **' + 2 * n * n + '**'] }; }
    const n = R.int(2, 5); return { t: 'num', q: 'How many **orbitals** are in the **n = ' + n + '** shell (all subshells)?', a: n * n, unit: '', abs: 0.01, lvl: 2, steps: ['Subshells ℓ = 0 … ' + (n - 1) + ' with 1, 3, 5, … orbitals', 'Total = n² = **' + n * n + '**'] };
  });

  /* ================= generators: Unit 4 ================= */
  const CFG_POOL = [3, 6, 7, 8, 11, 13, 15, 16, 17, 19, 20, 22, 25, 26, 27, 28, 30, 31, 33, 34, 35];
  CQ.gen('c.config', (R) => {
    const Z = R.pick(CFG_POOL);
    const e = BYZ[Z];
    const right = cfg(Z);
    const wrong = new Set();
    const subs = fill(Z);
    // distractors: shift an electron, forget 4s, wrong core, too many/few electrons
    wrong.add(cfgStr(fill(Z + 1), Z));
    wrong.add(cfgStr(fill(Z - 1), Z));
    if (subs.some((x) => x[0] === '3d' && x[1] > 0)) { const s2 = subs.map((x) => x.slice()); const four = s2.find((x) => x[0] === '4s'); const d3 = s2.find((x) => x[0] === '3d'); if (four[1] === 2 && d3[1] < 10) { four[1] = 0; d3[1] += 2; wrong.add(cfgStr(s2, Z)); } }
    const lastP = subs[subs.length - 1];
    if (lastP[0].endsWith('p') && lastP[1] > 1) { const s3 = subs.map((x) => x.slice()); s3[s3.length - 1][1]--; s3[s3.length - 2][1]++; wrong.add(cfgStr(s3, Z)); }
    const opts = [right].concat([...wrong].filter((w) => w !== right)).slice(0, 4);
    return { t: 'mc', lvl: 3, q: 'Which is the ground-state electron configuration of **' + e.name + ' (' + e.s + ', Z = ' + Z + ')**?', opts, why: 'Fill in order 1s 2s 2p 3s 3p 4s 3d 4p, using exactly ' + Z + ' electrons. Full form: ' + cfgFull(Z) + '.' };
  });

  CQ.gen('c.valence', (R) => {
    const pool = [['Li', 1], ['Na', 1], ['K', 1], ['Mg', 2], ['Ca', 2], ['B', 3], ['Al', 3], ['C', 4], ['Si', 4], ['N', 5], ['P', 5], ['O', 6], ['S', 6], ['F', 7], ['Cl', 7], ['Br', 7], ['Ne', 8], ['Ar', 8], ['Se', 6], ['As', 5], ['Ga', 3]];
    const [s, v] = R.pick(pool);
    return { t: 'num', q: 'How many **valence electrons** does **' + EL[s].name + ' (' + s + ')** have?', a: v, unit: '', abs: 0.01, lvl: 2, steps: ['Configuration: ' + cfg(EL[s].z), 'Valence = electrons in the highest-n s and p subshells = **' + v + '**', 'For main-group elements, that\'s the last digit of the group number.'] };
  });

  CQ.gen('c.unpaired', (R) => {
    const pool = [[6, 0], [7, 0], [8, 0], [15, 0], [16, 0], [26, 0], [24, 0], [25, 0], [29, 0], [26, 3], [26, 2], [25, 2], [27, 2], [28, 2], [29, 1], [30, 2], [22, 0], [23, 0]];
    const [Z, q] = R.pick(pool);
    const subs = ionSubs(Z, q);
    const u = unpaired(subs);
    const nm = BYZ[Z].s + (q ? (q > 1 ? sup(q) : '') + '⁺' : '');
    return { t: 'num', lvl: 3, q: 'How many **unpaired electrons** does **' + nm + '** have in its ground state?', a: u, unit: '', abs: 0.01,
      steps: ['Configuration: ' + cfgStr(subs, Z), 'Apply Hund\'s rule to the partly filled subshell', 'Unpaired electrons: **' + u + '** → ' + (u ? 'paramagnetic' : 'diamagnetic')] };
  });

  CQ.gen('c.ionconfig', (R) => {
    const pool = [[26, 2], [26, 3], [25, 2], [29, 2], [29, 1], [30, 2], [24, 3], [27, 2], [28, 2], [22, 2]];
    const [Z, q] = R.pick(pool);
    const right = cfgStr(ionSubs(Z, q), Z);
    // classic mistake: remove 3d electrons before 4s
    const s2 = fill(Z).map((x) => x.slice());
    let k = q;
    const d3 = s2.find((x) => x[0] === '3d');
    while (k > 0 && d3[1] > 0) { d3[1]--; k--; }
    const wrong1 = cfgStr(s2, Z);
    const wrong2 = cfgStr(fill(Z - q), Z);
    const wrong3 = cfgStr(fill(Z + q), Z);
    const nm = BYZ[Z].s + (q > 1 ? sup(q) : '') + '⁺';
    const opts = [right];
    const add = (o) => { const t = Array.isArray(o) ? o[0] : o; if (!opts.some((x) => (Array.isArray(x) ? x[0] : x) === t)) opts.push(o); };
    add([wrong1, 'Transition metals lose their 4s electrons before 3d.']); add(wrong2); add(wrong3);
    return { t: 'mc', lvl: 3, q: 'What is the ground-state electron configuration of **' + nm + '**?', opts,
      why: 'Write the neutral atom (' + cfg(Z) + '), then remove electrons from the highest n first: 4s before 3d.' };
  });

  CQ.gen('c.iso', (R) => {
    const sets = [['Ne', ['F⁻', 'O²⁻', 'Na⁺', 'Mg²⁺', 'Al³⁺', 'N³⁻'], ['Cl⁻', 'K⁺', 'Ca²⁺', 'S²⁻', 'Li⁺']], ['Ar', ['Cl⁻', 'S²⁻', 'K⁺', 'Ca²⁺', 'P³⁻'], ['F⁻', 'Na⁺', 'Mg²⁺', 'Br⁻', 'Rb⁺']], ['Kr', ['Br⁻', 'Rb⁺', 'Sr²⁺', 'Se²⁻'], ['Cl⁻', 'K⁺', 'I⁻', 'Cs⁺']]];
    const [ng, yes, no] = R.pick(sets);
    return { t: 'mc', lvl: 2, q: 'Which ion is **isoelectronic** with **' + ng + '**?', opts: [R.pick(yes)].concat(R.sample(no, 3)), why: 'Isoelectronic means the same number of electrons. ' + ng + ' has ' + EL[ng].z + ' electrons.' };
  });

  /* ================= Unit 1 ================= */
  const u1 = U('c1', 'Measurement Toolkit', { sub: 'Matter, units, sig figs & conversions', ch: 'Ch 1' }, [
    L('c1l1', 'Classifying Matter', {
      goal: 'Sort matter into elements, compounds and mixtures, and properties into physical/chemical and intensive/extensive.',
      key: 'Pure substances have a fixed composition: **elements** (one kind of atom) and **compounds** (elements chemically combined in fixed ratios, separable only by chemical means). **Mixtures** are physically combined and can be separated physically. Homogeneous mixtures (solutions, like salt water or air) are uniform. Heterogeneous mixtures (granite, salad) are not. A chemical change makes a new substance (burning, rusting). A physical change doesn\'t (melting, dissolving, cutting). Intensive properties don\'t depend on amount (density, temperature, boiling point). Extensive ones do (mass, volume).',
      formulas: ['element · compound · homogeneous mixture · heterogeneous mixture', 'intensive: density, T, b.p.  ·  extensive: mass, V'],
    }, [
      T('What is it made of?', `
| Type | Example | Separate by |
|---|---|---|
| **element** | gold, O₂ | can't be broken down |
| **compound** | water, NaCl | chemical reaction |
| **homogeneous mixture** (solution) | salt water, air, brass | physical means |
| **heterogeneous mixture** | granite, sand + water | physical means |
>* Ask two questions. Does it have a fixed composition? (pure substance vs mixture). Is it uniform throughout? (homogeneous vs heterogeneous).`),
      T('Properties and changes', `
**Physical change:** same substance, new form (melting, boiling, dissolving, cutting).
**Chemical change:** a new substance forms (burning, rusting, cooking, a gas or precipitate forming).
**Intensive** properties don't depend on how much you have: density, temperature, melting point, color.
**Extensive** properties do: mass, volume, total energy.
>! Dissolving sugar in water is **physical**: evaporate the water and the sugar comes back unchanged.`),
      MATCH('Classify each sample.', [['gold', 'element'], ['water', 'compound'], ['salt water', 'homogeneous mixture'], ['granite', 'heterogeneous mixture']]),
      MC('Which is a **chemical** change?', ['Iron rusting', 'Ice melting', 'Sugar dissolving in tea', 'Paper being cut'], 'Rust (iron oxide) is a new substance.'),
      MULTI('Select all the **intensive** properties.', [['density', 1], ['boiling point', 1], ['temperature', 1], ['mass', 0], ['volume', 0]], 'Intensive properties don\'t change with sample size.'),
      TF('A compound can be separated into its elements by filtration or distillation.', false, 'Compounds require chemical reactions to break apart. Physical methods only separate mixtures.'),
      MC('Air is best classified as…', ['a homogeneous mixture', 'a compound', 'an element', 'a heterogeneous mixture'], 'Air is a uniform blend of N₂, O₂, Ar, CO₂…, and its composition can vary.'),
      MC('Which is a **physical property** of copper?', ['It conducts electricity', 'It turns green when exposed to air over time', 'It reacts with nitric acid', 'It forms copper oxide when heated'], 'Conductivity can be measured without changing the substance. The others describe reactions.'),
    ]),
    L('c1l2', 'SI Units, Temperature & Density', {
      goal: 'Use SI units, convert temperatures, and work density problems.',
      key: 'SI base units: kg, m, s, K, mol. Volume: 1 L = 1000 mL = 1 dm³, and **1 mL = 1 cm³**. Temperature: $K = °C + 273.15$ (Kelvin has no negatives and no degree sign) and $°F = [[9|5]]°C + 32$. Density $d = m/V$ is intensive, usually in g/mL or g/cm³ for liquids and solids. It can be used as a conversion factor between mass and volume.',
      formulas: ['K = °C + 273.15', '°F = [[9|5]]°C + 32', 'd = [[m|V]]', '1 mL = 1 cm³'],
    }, [
      T('Measuring in chemistry', `
SI base units you'll use: **kilogram** (mass), **meter** (length), **second**, **kelvin** (temperature), **mole** (amount).
Volume is derived: $1 L = 1 dm³ = 1000 cm³$ and $1 mL = 1 cm³$.
$$ K = °C + 273.15   ·   °F = [[9|5]](°C) + 32 $$
$$ d = [[m|V]] :: density (g/mL or g/cm³) $$
>! 0 K is absolute zero, so Kelvin temperatures are never negative. Write "300 K", not "300 °K".`),
      EX('Density by displacement', 'A 52.0 g stone raises the water in a graduated cylinder from 25.0 mL to 44.5 mL. Find its density.', ['V = 44.5 − 25.0 = 19.5 mL', 'd = 52.0 g / 19.5 mL = **2.67 g/mL**']),
      G('c.temp'),
      G('c.density'),
      MC('Which temperature scale never has negative values?', ['Kelvin', 'Celsius', 'Fahrenheit', 'All can be negative'], '0 K is absolute zero.'),
      TF('1 mL is exactly equal to 1 cm³.', true, '1 L = 1 dm³ = 1000 cm³, so 1 mL = 1 cm³.'),
      G('c.temp'),
      G('c.density'),
    ]),
    L('c1l3', 'Significant Figures', {
      goal: 'Count sig figs and carry them through calculations.',
      key: 'Nonzero digits count. Captive zeros (between nonzeros) count. Leading zeros never count. Trailing zeros count only with a decimal point. Exact numbers (counted items, defined conversions like 1 in = 2.54 cm) have unlimited sig figs. × ÷ → fewest sig figs. + − → fewest decimal places. Round only at the end. Accuracy = closeness to the true value. Precision = closeness of repeated measurements to each other.',
      formulas: ['× ÷ → fewest sig figs', '+ − → fewest decimal places', 'exact numbers: infinite sig figs'],
    }, [
      T('The rules in one place', `
- **Nonzero digits:** always count (3.14 → 3)
- **Captive zeros:** count (1.05 → 3)
- **Leading zeros:** never count (0.0025 → 2)
- **Trailing zeros:** count only with a decimal point (2.50 → 3, 250 → 2, 250. → 3)
- **Exact numbers:** counted things and defined conversions have unlimited sig figs
$$ × ÷ → fewest sig figs   ·   + − → fewest decimal places $$`),
      T('Accuracy vs precision', `
**Accuracy:** how close a measurement is to the true value.
**Precision:** how close repeated measurements are to each other.
>* Darts all clustered far from the bullseye: **precise but not accurate**. Darts spread evenly around the bullseye: accurate on average but **not precise**.`),
      G('p.sigcount'),
      G('c.sigcalc'),
      MC('Three measurements of a 10.00 g mass read 11.52, 11.50 and 11.51 g. They are…', ['precise but not accurate', 'accurate but not precise', 'accurate and precise', 'neither'], 'Tightly clustered (precise) but far from 10.00 (not accurate).'),
      TF('The "12" in "12 eggs" limits the number of significant figures in a calculation.', false, 'Counted numbers are exact.'),
      G('c.sigcalc'),
      G('p.sigcount'),
    ]),
    L('c1l4', 'Dimensional Analysis', {
      goal: 'Chain conversion factors to solve any unit problem.',
      key: 'Write the given quantity, then multiply by conversion factors (fractions equal to 1) arranged so the unwanted units cancel. When the unit is squared or cubed, the factor is too: 1 in³ = (2.54 cm)³. Density, molar mass and concentration are conversion factors too. Check that the units cancel to exactly what you want before you calculate.',
      formulas: ['given × [[wanted unit|given unit]] = wanted', '1 in = 2.54 cm (exact)', '1 gal = 3.785 L'],
    }, [
      T('Let the units do the thinking', `
Start with what you're given and multiply by **conversion factors**, fractions equal to 1:
$$ 1.50 L × [[1000 mL|1 L]] × [[1.00 g|1 mL]] = 1.50 × 10³ g :: water, d = 1.00 g/mL $$
>* Set up the whole chain **before** touching the calculator. If the units don't cancel to the answer's units, the setup is wrong.
>! Cubed units cube the factor: $1 m³ = (100 cm)³ = 10⁶ cm³$.`),
      EX('A tank of gasoline', 'Gasoline has d = 0.74 g/mL. What is the mass, in kg, of 12.0 gal? (1 gal = 3.785 L)', ['12.0 gal × [[3.785 L|1 gal]] = 45.4 L', '45.4 L × [[1000 mL|1 L]] × [[0.74 g|1 mL]] = 33,600 g', '= **33.6 kg** (2 sig figs from the density: 34 kg)']),
      G('c.dimanal'),
      MC('How many cm³ are in 1 m³?', ['1,000,000', '100', '1,000', '10,000'], '(100 cm)³ = 10⁶ cm³.'),
      G('c.dimanal'),
      ORDER('Put the dimensional-analysis steps in order.', ['Write down the given quantity with units', 'Write the units you want', 'Chain conversion factors so the unwanted units cancel', 'Multiply and divide the numbers', 'Round to the correct sig figs']),
      G('c.dimanal'),
      G('c.dimanal'),
    ]),
  ]);

  /* ================= Unit 2 ================= */
  const u2 = U('c2', 'Atoms & the Periodic Table', { sub: 'Particles, isotopes, the mole', ch: 'Ch 2' }, [
    L('c2l1', 'Atomic Theory & Subatomic Particles', {
      goal: 'Explain the experiments that revealed the atom\'s structure.',
      key: 'Dalton: matter is made of atoms, atoms of one element are identical, compounds combine atoms in whole-number ratios, and reactions rearrange atoms (law of conservation of mass, law of definite proportions, law of multiple proportions). Thomson\'s cathode rays → the electron. Millikan\'s oil drop → the electron\'s charge. Rutherford\'s gold foil → a tiny, dense, positive nucleus with mostly empty space around it. Proton: +1, about 1 amu. Neutron: 0, about 1 amu. Electron: −1, about 1/1836 amu.',
      formulas: ['p⁺: +1, 1.0073 amu', 'n: 0, 1.0087 amu', 'e⁻: −1, 0.00055 amu'],
    }, [
      T('From Dalton to the nucleus', `
**Dalton's atomic theory (1808):** elements are made of identical atoms, compounds combine atoms in **whole-number ratios**, and reactions rearrange atoms without creating or destroying them.
**Experiments that opened the atom:**
| Who | Experiment | Discovery |
|---|---|---|
| Thomson | cathode rays | electron (e/m ratio) |
| Millikan | oil drops | electron's charge |
| Rutherford | gold foil | small, dense, + nucleus |
| Chadwick | beryllium radiation | neutron |
>* Gold foil: most α particles passed straight through (the atom is mostly empty space). A few bounced back (they hit a tiny, dense, positive nucleus).`),
      T('The three particles', `
| Particle | Charge | Mass (amu) | Where |
|---|---|---|---|
| proton | +1 | 1.0073 | nucleus |
| neutron | 0 | 1.0087 | nucleus |
| electron | −1 | 0.00055 | around the nucleus |
>! Almost all of an atom's **mass** is in the nucleus, but almost all of its **volume** is the electron cloud.`),
      MC('In Rutherford\'s experiment, most α particles passed straight through the gold foil. This showed that…', ['atoms are mostly empty space', 'electrons are negatively charged', 'atoms are indivisible', 'the nucleus is negatively charged'], 'A rare few bounced back, which revealed the small dense nucleus.'),
      MATCH('Match the scientist to the discovery.', [['Thomson', 'the electron'], ['Millikan', 'charge of the electron'], ['Rutherford', 'the nucleus'], ['Chadwick', 'the neutron']]),
      MC('Which subatomic particle has the smallest mass?', ['electron', 'proton', 'neutron', 'they are equal'], 'About 1/1836 of a proton\'s mass.'),
      TF('According to the law of definite proportions, a pure compound always contains the same elements in the same mass ratio.', true, 'Water is always 11.2% H and 88.8% O by mass.'),
      MC('Carbon forms CO and CO₂. The masses of oxygen that combine with a fixed mass of carbon are in a 1 : 2 ratio. This illustrates the law of…', ['multiple proportions', 'definite proportions', 'conservation of mass', 'conservation of energy'], 'Different compounds of the same two elements give small whole-number mass ratios.', { lvl: 2 }),
    ]),
    L('c2l2', 'Isotopes & Ions', {
      goal: 'Read isotope symbols and count protons, neutrons and electrons.',
      key: 'Atomic number Z = number of protons, and it defines the element. Mass number A = protons + neutrons. Neutrons = A − Z. Isotopes have the same Z but a different A (different numbers of neutrons). Ions: electrons = Z − charge. Cations (+) lost electrons, anions (−) gained them. Notation: ᴬ_ZX^{charge}.',
      formulas: ['neutrons = A − Z', 'electrons = Z − (charge)'],
    }, [
      T('Reading the nuclear symbol', `
$$ ᴬ_Z X^{charge} $$
- **Z** (atomic number) = protons, and it decides what element it is
- **A** (mass number) = protons + neutrons
- neutrons = **A − Z**
- electrons = **Z − charge**
**Isotopes** share Z but differ in neutrons: ¹²C, ¹³C and ¹⁴C are all carbon.
>! A **positive** ion has **fewer** electrons than protons (it lost them). Fe³⁺ has 26 − 3 = 23 electrons.`),
      EX('Counting particles', 'How many protons, neutrons and electrons are in ⁵⁶Fe³⁺?', ['Fe: Z = 26 → **26 protons**', 'Neutrons = 56 − 26 = **30**', 'Electrons = 26 − 3 = **23**']),
      G('c.pne'),
      MC('Isotopes of an element differ in their number of…', ['neutrons', 'protons', 'electrons (as neutral atoms)', 'chemical properties'], 'Same Z (protons), different neutrons.'),
      G('c.pne'),
      TF('An anion has more electrons than protons.', true, 'Anions gained electrons, which gives the negative charge.'),
      G('c.pne'),
      FILL('Chlorine-37 has ___ protons and ___ neutrons.', ['17', '20'], ['37', '18', '35'], 'Z = 17, so neutrons = 37 − 17 = 20.'),
    ]),
    L('c2l3', 'Average Atomic Mass', {
      goal: 'Compute weighted average atomic masses and isotope abundances.',
      key: 'The atomic mass on the periodic table is a weighted average over the natural isotopes: $Σ(fractional abundance × isotope mass)$. Convert percentages to fractions (75.78% → 0.7578). The average lies closer to the more abundant isotope. To find an unknown abundance, let x be one fraction and 1 − x the other, then solve.',
      formulas: ['avg = Σ (fraction)ᵢ × (mass)ᵢ', 'x·m₁ + (1 − x)·m₂ = avg'],
    }, [
      T('Weighted, not simple, averages', `
Chlorine is 75.78% ³⁵Cl (34.969 amu) and 24.22% ³⁷Cl (36.966 amu):
$$ (0.7578)(34.969) + (0.2422)(36.966) = 35.45 amu $$
>* The average always lands **closer to the more abundant isotope**. Boron is 10.81 amu, so ¹¹B must be more common than ¹⁰B.`),
      G('c.avgmass'),
      MC('Boron\'s average atomic mass is 10.81 amu. Its isotopes are ¹⁰B and ¹¹B. Which is more abundant?', ['¹¹B', '¹⁰B', 'They are equally abundant', 'Can\'t tell'], '10.81 is much closer to 11 than to 10.'),
      G('c.avgmass'),
      TF('No individual chlorine atom has a mass of exactly 35.45 amu.', true, 'Each atom is either about 35 or about 37 amu. 35.45 is the average.'),
      G('c.avgmass'),
    ]),
    L('c2l4', 'The Periodic Table', {
      goal: 'Navigate groups, periods and element families.',
      key: 'Columns are groups (families with similar chemistry). Rows are periods. Metals are on the left and center, nonmetals at the upper right, and metalloids along the staircase (B, Si, Ge, As, Sb, Te). Named groups: 1 alkali metals, 2 alkaline earth metals, 16 chalcogens, 17 halogens, 18 noble gases. Groups 3–12 are transition metals. Diatomic elements: H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂.',
      formulas: ['diatomic: H₂ N₂ O₂ F₂ Cl₂ Br₂ I₂'],
    }, [
      T('A map of chemical behavior', `
- **Groups** (columns) share chemistry, because they have the same number of valence electrons
- **Periods** (rows) fill the same shell
- **Metals** (left, shiny, conduct) · **nonmetals** (upper right) · **metalloids** on the staircase: B, Si, Ge, As, Sb, Te
| Group | Name |
|---|---|
| 1 | alkali metals |
| 2 | alkaline earth metals |
| 3–12 | transition metals |
| 16 | chalcogens |
| 17 | halogens |
| 18 | noble gases |
>! The **seven diatomic elements** (H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂) never appear as single atoms in equations.`, { fig: D.ptable({ hl: { B: 'c4', Si: 'c4', Ge: 'c4', As: 'c4', Sb: 'c4', Te: 'c4' } }) }),
      MATCH('Match the group to its family name.', [['Group 1', 'alkali metals'], ['Group 2', 'alkaline earth metals'], ['Group 17', 'halogens'], ['Group 18', 'noble gases']]),
      MC('Which element is a **metalloid**?', ['Si', 'Mg', 'S', 'Fe'], 'Silicon sits on the metal/nonmetal staircase.'),
      MC('Which element is in **period 3, group 2**?', ['Mg', 'Ca', 'Be', 'Al'], 'Period 3 starts with Na; group 2 is next: Mg.'),
      TF('Elements in the same period have very similar chemical properties.', false, 'Same group (column) means similar chemistry.'),
      MULTI('Which elements exist as **diatomic molecules** in nature?', [['N', 1], ['Cl', 1], ['H', 1], ['He', 0], ['S', 0], ['Na', 0]], 'H, N, O, F, Cl, Br, I. Helium is monatomic.'),
    ]),
    L('c2l5', 'The Mole & Molar Mass', {
      goal: 'Convert between grams, moles and number of atoms.',
      key: '1 mole = 6.022 × 10²³ particles (Avogadro\'s number, N_A). The molar mass of an element in g/mol equals its atomic mass in amu. The roadmap is grams ⇄ (÷ or × molar mass) ⇄ moles ⇄ (× or ÷ N_A) ⇄ particles. Always go through moles.',
      formulas: ['N_A = 6.022 × 10²³ mol⁻¹', 'n = [[mass|M]]', 'N = n × N_A'],
    }, [
      T('A chemist\'s dozen', `
Atoms are too small to count one by one, so chemists count in **moles**:
$$ 1 mol = 6.022 × 10²³ particles :: Avogadro's number, N_A $$
The **molar mass** (g/mol) has the same number as the atomic mass (amu): carbon is 12.01 amu, so 12.01 g/mol.
$$ grams ⇄ moles ⇄ particles :: ÷ M,  then × N_A $$
>* Moles are the hub. You can never go straight from grams to atoms.`),
      EX('Atoms in a coin', 'How many atoms are in 10.0 g of calcium (40.08 g/mol)?', ['n = 10.0 g ÷ 40.08 g/mol = 0.2495 mol', 'N = 0.2495 × 6.022×10²³ = **1.50 × 10²³ atoms**']),
      G('c.mole'),
      MC('Which contains the **most atoms**?', ['1.0 g of hydrogen', '1.0 g of carbon', '1.0 g of iron', '1.0 g of lead'], 'Lightest atoms → most moles per gram → most atoms.'),
      G('c.mole'),
      TF('One mole of carbon atoms and one mole of lead atoms contain the same number of atoms.', true, 'A mole is always 6.022 × 10²³, whatever the substance.'),
      G('c.mole'),
      G('c.mole'),
    ]),
  ]);

  /* ================= Unit 3 ================= */
  const u3 = U('c3', 'Light & Quantum Theory', { sub: 'Photons, Bohr & quantum numbers', ch: 'Ch 3' }, [
    L('c3l1', 'Light as a Wave', {
      goal: 'Use c = λν and order the electromagnetic spectrum.',
      key: 'All electromagnetic radiation travels at $c = 3.00 × 10⁸ m/s$ in a vacuum: $c = λν$. Wavelength and frequency are inversely related. Spectrum from high energy (short λ) to low energy (long λ): gamma, X-ray, UV, visible (violet ≈ 400 nm → red ≈ 700 nm), IR, microwave, radio. 1 nm = 10⁻⁹ m. Frequency is in s⁻¹ (Hz).',
      formulas: ['c = λν', 'c = 2.998 × 10⁸ m/s', '1 nm = 10⁻⁹ m'],
    }, [
      T('Light is an electromagnetic wave', `
$$ c = λ ν :: c = 3.00 × 10⁸ m/s,  λ in m,  ν in s⁻¹ $$
Long wavelength means low frequency. Short wavelength means high frequency.
>* Visible light is a sliver: **violet ≈ 400 nm** to **red ≈ 700 nm**. UV is just past violet (shorter, more dangerous), and IR is just past red.
>! Convert nm to m before using c = λν.`, { fig: D.spectrum() }),
      G('c.light'),
      MC('Which type of radiation has the **longest** wavelength?', ['radio waves', 'X-rays', 'ultraviolet', 'visible light'], 'Radio waves can be meters to kilometers long.'),
      MC('Compared with red light, blue light has…', ['higher frequency and shorter wavelength', 'lower frequency and longer wavelength', 'higher frequency and longer wavelength', 'the same frequency'], 'Blue (~450 nm) is shorter than red (~700 nm), so ν is higher.'),
      G('c.light'),
      TF('In a vacuum, all colors of light travel at the same speed.', true, 'All EM radiation travels at c.'),
      G('c.light'),
    ]),
    L('c3l2', 'Photons & the Photoelectric Effect', {
      goal: 'Compute photon energies and explain the photoelectric effect.',
      key: 'Energy comes in packets (photons): $E = hν = hc/λ$, with h = 6.626 × 10⁻³⁴ J·s. Per mole, multiply by N_A. Photoelectric effect: electrons are ejected only if hν exceeds the metal\'s work function Φ (the threshold frequency). Extra energy becomes kinetic energy: $KE = hν − Φ$. Brighter light (more photons) ejects MORE electrons, but not faster ones. Below the threshold, no amount of brightness works.',
      formulas: ['E = hν = [[hc|λ]]', 'h = 6.626 × 10⁻³⁴ J·s', 'KE = hν − Φ'],
    }, [
      T('Light comes in packets', `
Planck and Einstein: light energy is **quantized** into photons:
$$ E = hν = [[hc|λ]] :: h = 6.626 × 10⁻³⁴ J·s $$
Shorter wavelength → higher-energy photons. That's why UV gives sunburns and visible light doesn't.
**Photoelectric effect:** shining light on a metal ejects electrons only if each photon has enough energy:
$$ KE_{electron} = hν − Φ :: Φ = work function $$
>! Turning up the **brightness** of red light below the threshold does nothing. More photons, but each one is still too weak. Frequency matters, not intensity.`),
      EX('A green photon', 'Find the energy of one 532 nm photon, and of a mole of them.', ['E = hc/λ = (6.626×10⁻³⁴)(2.998×10⁸)/(532×10⁻⁹)', 'E = **3.73 × 10⁻¹⁹ J** per photon', '× 6.022×10²³ = 2.25 × 10⁵ J = **225 kJ/mol**']),
      G('c.photon'),
      MC('Light below a metal\'s threshold frequency is made much brighter. What happens?', ['Still no electrons are ejected', 'More electrons are ejected', 'Faster electrons are ejected', 'Electrons are ejected after a delay'], 'Each photon still lacks the energy. Intensity doesn\'t help.'),
      G('c.photon'),
      TF('A photon of UV light has more energy than a photon of infrared light.', true, 'UV has a shorter wavelength, so a higher hν.'),
      G('c.photoelectric'),
    ]),
    L('c3l3', 'Bohr Model & the Hydrogen Spectrum', {
      goal: 'Calculate the energy and wavelength of hydrogen\'s spectral lines.',
      key: 'Bohr: the electron in H occupies quantized energy levels $Eₙ = −2.18 × 10⁻¹⁸ J (1/n²)$. A jump down (emission) releases a photon with $|ΔE| = 2.18 × 10⁻¹⁸ J |1/n_f² − 1/n_i²|$ and $λ = hc/|ΔE|$. A jump up requires absorbing exactly that energy. Drops to n = 1 are UV (Lyman), to n = 2 visible (Balmer), to n = 3 IR (Paschen). Bigger gaps mean higher energy and shorter λ.',
      formulas: ['Eₙ = −2.18 × 10⁻¹⁸ J ([[1|n²]])', 'ΔE = 2.18 × 10⁻¹⁸ J ([[1|n_f²]] − [[1|n_i²]])', 'λ = [[hc|ΔE]]'],
    }, [
      T('Energy ladders', `
In the Bohr model, hydrogen's electron can only have certain energies:
$$ Eₙ = −2.18 × 10⁻¹⁸ J × [[1|n²]] $$
Levels crowd together at the top. When the electron **drops**, it emits a photon carrying exactly the energy difference. When it absorbs exactly that much, it **jumps up**.
| Series | Ends at | Region |
|---|---|---|
| Lyman | n = 1 | UV |
| Balmer | n = 2 | visible |
| Paschen | n = 3 | IR |
>! Moving **up** (n increases) **absorbs** light. Moving **down emits** light.`, { fig: D.levels({ trans: [[3, 2], [4, 2], [2, 1]] }) }),
      EX('The red line of hydrogen', 'Find λ for n = 3 → n = 2.', ['ΔE = 2.18×10⁻¹⁸ (1/4 − 1/9) = 3.03 × 10⁻¹⁹ J', 'λ = hc/ΔE = (1.986×10⁻²⁵)/(3.03×10⁻¹⁹) = 6.56 × 10⁻⁷ m', '= **656 nm**, the red Balmer line']),
      G('c.bohr'),
      MC('Which transition emits the **highest-energy** photon?', ['n = 4 → n = 1', 'n = 4 → n = 2', 'n = 3 → n = 2', 'n = 6 → n = 5'], 'Dropping all the way to n = 1 covers the biggest energy gap.', { lvl: 2 }),
      TF('An electron moving from n = 2 to n = 4 emits a photon.', false, 'Going up to a higher level requires absorbing energy.'),
      G('c.bohr'),
      G('c.bohr'),
    ]),
    L('c3l4', 'Matter Waves & Uncertainty', {
      goal: 'Use the de Broglie relation and explain why electrons need orbitals.',
      key: 'De Broglie: moving matter has a wavelength $λ = h/(mu)$, which is significant only for tiny masses like electrons. Heisenberg: you can\'t know both position and momentum exactly, $Δx·mΔu ≥ h/4π$, so electrons don\'t have exact orbits. Schrödinger\'s wave function ψ gives the probability of finding the electron: ψ² is the electron density. An orbital is the region where the electron is likely to be found.',
      formulas: ['λ = [[h|mu]]', 'Δx·mΔu ≥ [[h|4π]]'],
    }, [
      T('Electrons are waves too', `
**De Broglie:** anything moving has a wavelength:
$$ λ = [[h|mu]] $$
For a baseball, λ is about 10⁻³⁴ m, far too small to matter. For an electron, λ is about the size of an atom, so its wave nature dominates.
**Heisenberg uncertainty:** $Δx · mΔu ≥ h/4π$. Pin down the position and the momentum becomes fuzzy.
>* That's why the Bohr model's neat circular orbits fail for atoms other than hydrogen. Quantum mechanics gives **orbitals**, probability clouds described by ψ², instead.`),
      G('c.debroglie'),
      MC('Why don\'t we notice the wave nature of a thrown baseball?', ['Its de Broglie wavelength is far too small', 'Baseballs have no momentum', 'Only charged particles have wavelengths', 'Baseballs move too slowly'], 'λ = h/mu, and with a large m, λ is negligible.'),
      G('c.debroglie'),
      TF('An orbital is a fixed circular path that an electron follows around the nucleus.', false, 'An orbital is a probability region (ψ²), not a path.'),
      MC('According to the uncertainty principle, it is impossible to know an electron\'s exact…', ['position and momentum at the same time', 'charge', 'mass', 'energy level in hydrogen'], 'Δx·mΔu ≥ h/4π.'),
    ]),
    L('c3l5', 'Quantum Numbers & Orbitals', {
      goal: 'Assign and check quantum numbers and count orbitals and electrons.',
      key: 'n = 1, 2, 3, … (shell and size). ℓ = 0 to n − 1 (subshell shape: 0 = s, 1 = p, 2 = d, 3 = f). mℓ = −ℓ … +ℓ (orientation, giving 2ℓ + 1 orbitals per subshell). mₛ = +½ or −½ (spin). Each shell has n² orbitals and holds 2n² electrons. s orbitals are spherical, p orbitals dumbbell-shaped (px, py, pz). An orbital has ℓ angular nodes and n − 1 nodes in total.',
      formulas: ['ℓ = 0 … n−1', 'mℓ = −ℓ … +ℓ', 'orbitals per subshell = 2ℓ + 1', 'per shell: n² orbitals, 2n² e⁻'],
    }, [
      T('Every electron\'s address', `
| Quantum number | Allowed values | Describes |
|---|---|---|
| n | 1, 2, 3, … | shell (size, energy) |
| ℓ | 0 … n − 1 | subshell shape (s p d f) |
| mℓ | −ℓ … +ℓ | orientation |
| mₛ | +½ or −½ | spin |
| ℓ | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| letter | s | p | d | f |
| orbitals | 1 | 3 | 5 | 7 |
>! A 2d subshell doesn't exist: for n = 2, ℓ can only be 0 or 1.`),
      MATCH('Match each ℓ value to its subshell letter.', [['ℓ = 0', 's'], ['ℓ = 1', 'p'], ['ℓ = 2', 'd'], ['ℓ = 3', 'f']]),
      G('c.qn'),
      G('c.orbcount'),
      MC('Which subshell does **not** exist?', ['3f', '4f', '2p', '3d'], 'For n = 3, ℓ ≤ 2, so no f (ℓ = 3).'),
      G('c.orbcount'),
      G('c.qn'),
      TF('The 3p subshell contains 3 orbitals that can hold 6 electrons.', true, 'ℓ = 1 → 3 orbitals × 2 electrons.'),
    ]),
  ]);

  /* ================= Unit 4 ================= */
  const u4 = U('c4', 'Electron Configurations', { sub: 'Aufbau, Hund, ions & magnetism', ch: 'Ch 3' }, [
    L('c4l1', 'Aufbau, Pauli & Hund', {
      goal: 'Fill orbital diagrams using the three rules.',
      key: '**Aufbau:** fill the lowest-energy subshells first: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p. **Pauli exclusion:** no two electrons share all four quantum numbers, so each orbital holds at most 2, with opposite spins. **Hund\'s rule:** within a subshell, put one electron in each orbital (same spin) before pairing any. Example: N is 1s² 2s² 2p³ with three unpaired 2p electrons.',
      formulas: ['1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p'],
    }, [
      T('Three rules for filling', `
1. **Aufbau:** lowest energy first. Note **4s fills before 3d**.
2. **Pauli exclusion:** at most 2 electrons per orbital, with opposite spins (↑↓)
3. **Hund's rule:** spread out across equal-energy orbitals before pairing up (like people taking empty bus seats first)
>* Nitrogen: three 2p electrons go into three **separate** 2p orbitals, all spin-up.`, { fig: D.orbBoxes([['1s', 2], ['2s', 2], ['2p', 3]], { alt: 'Orbital diagram of nitrogen: 1s², 2s², and three unpaired 2p electrons' }) }),
      ORDER('Put these subshells in filling (Aufbau) order.', ['3s', '3p', '4s', '3d', '4p']),
      MC('Which rule says the three 2p electrons of nitrogen occupy separate orbitals?', ['Hund\'s rule', 'Pauli exclusion principle', 'Aufbau principle', 'Heisenberg principle'], 'Hund: maximize unpaired electrons in a subshell.'),
      MC('The Pauli exclusion principle limits each orbital to…', ['2 electrons with opposite spins', '2 electrons with the same spin', '8 electrons', '1 electron'], 'No two electrons can share all four quantum numbers.'),
      TF('The 4s subshell fills before the 3d subshell.', true, 'For neutral atoms, 4s is slightly lower in energy when filling.'),
      FILL('Oxygen has ___ electrons in its 2p subshell, which gives ___ unpaired electrons.', ['4', '2'], ['6', '3', '0'], '2p⁴: three orbitals fill singly, then one pairs, which leaves 2 unpaired.'),
    ]),
    L('c4l2', 'Writing Electron Configurations', {
      goal: 'Write full and noble-gas (condensed) configurations.',
      key: 'Count the electrons (Z for a neutral atom) and fill subshells in Aufbau order, writing each as $nℓ^{electrons}$. Condensed form: write the previous noble gas in brackets, then the rest: S = [Ne] 3s² 3p⁴, Fe = [Ar] 4s² 3d⁶. The superscripts should add up to Z.',
      formulas: ['S: 1s² 2s² 2p⁶ 3s² 3p⁴ = [Ne] 3s² 3p⁴', 'Fe: [Ar] 4s² 3d⁶'],
    }, [
      T('Spelling out the configuration', `
Full: list every subshell. Condensed: start from the previous noble gas.
| Element | Full | Condensed |
|---|---|---|
| Na (11) | 1s² 2s² 2p⁶ 3s¹ | [Ne] 3s¹ |
| S (16) | 1s² 2s² 2p⁶ 3s² 3p⁴ | [Ne] 3s² 3p⁴ |
| Fe (26) | 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ | [Ar] 4s² 3d⁶ |
| Br (35) | … 4s² 3d¹⁰ 4p⁵ | [Ar] 4s² 3d¹⁰ 4p⁵ |
>* Check: the superscripts must add up to the number of electrons.`),
      G('c.config'),
      G('c.config'),
      MC('What is the condensed configuration of phosphorus (Z = 15)?', ['[Ne] 3s² 3p³', '[Ne] 3s² 3p⁵', '[Ar] 3s² 3p³', '[Ne] 3p⁵'], '15 − 10 (Ne core) = 5 electrons: 3s² 3p³.'),
      G('c.config'),
      TF('The configuration [Ar] 4s² 3d¹⁰ 4p² belongs to germanium (Z = 32).', true, '18 + 2 + 10 + 2 = 32.'),
      G('c.config'),
    ]),
    L('c4l3', 'Blocks, Valence & Exceptions', {
      goal: 'Read configurations off the periodic table, count valence electrons, and know Cr and Cu.',
      key: 'The table is organized by the last subshell filled: s block (groups 1–2), p block (13–18), d block (3–12), f block. Valence electrons are those in the highest n shell: for main-group elements, the last digit of the group number (Cl: 7, O: 6). Exceptions: Cr = [Ar] 4s¹ 3d⁵ and Cu = [Ar] 4s¹ 3d¹⁰. Half-filled and filled d subshells are extra stable.',
      formulas: ['Cr: [Ar] 4s¹ 3d⁵', 'Cu: [Ar] 4s¹ 3d¹⁰'],
    }, [
      T('The table is a configuration map', `
- **s block:** groups 1–2
- **p block:** groups 13–18
- **d block:** transition metals, groups 3–12 (fill (n−1)d)
**Valence electrons** are in the outermost shell, and they drive chemistry. Main-group shortcut: the group's last digit.
>! **Exceptions** you have to know: chromium is [Ar] 4s¹ 3d⁵ and copper is [Ar] 4s¹ 3d¹⁰. One 4s electron moves to make a half-filled or full d subshell, which is extra stable.`, { fig: D.ptable({ hl: { Cr: 'c6', Cu: 'c6' } }) }),
      G('c.valence'),
      MC('What is the ground-state configuration of **copper** (Z = 29)?', ['[Ar] 4s¹ 3d¹⁰', ['[Ar] 4s² 3d⁹', 'That\'s what Aufbau predicts. Copper is an exception: a full 3d¹⁰ is more stable.'], '[Ar] 3d¹¹', '[Kr] 4s¹'], 'A filled 3d¹⁰ subshell is extra stable.'),
      MC('Which block of the periodic table is bromine in?', ['p block', 's block', 'd block', 'f block'], 'Br is in group 17, so its last electron enters 4p.'),
      G('c.valence'),
      MC('What is the ground-state configuration of **chromium** (Z = 24)?', ['[Ar] 4s¹ 3d⁵', ['[Ar] 4s² 3d⁴', 'Expected by Aufbau, but a half-filled 3d⁵ wins.'], '[Ar] 3d⁶', '[Ar] 4s² 4p⁴'], 'Half-filled 3d⁵ is extra stable.'),
      TF('All elements in group 17 have 7 valence electrons.', true, 'ns² np⁵.'),
    ]),
    L('c4l4', 'Ions & Magnetism', {
      goal: 'Write configurations for ions and predict paramagnetism.',
      key: 'Anions: add electrons to the next open orbital (Cl⁻ = [Ar]). Main-group cations lose their outermost electrons (Na⁺ = [Ne]). **Transition-metal cations lose ns electrons BEFORE (n−1)d**: Fe²⁺ = [Ar] 3d⁶ and Fe³⁺ = [Ar] 3d⁵. Paramagnetic means there are unpaired electrons (attracted to a magnet). Diamagnetic means all are paired. Isoelectronic species have the same number of electrons (N³⁻, O²⁻, F⁻, Ne, Na⁺, Mg²⁺, Al³⁺).',
      formulas: ['Fe²⁺: [Ar] 3d⁶ (4s lost first)', 'paramagnetic ⇔ unpaired e⁻'],
    }, [
      T('Ions: last in, first out? Not quite', `
**Anions** gain electrons into the next empty spot: O²⁻ = 1s² 2s² 2p⁶ = [Ne].
**Main-group cations** lose valence electrons: Mg²⁺ = [Ne].
**Transition-metal cations** lose **4s before 3d**, even though 4s filled first:
$$ Fe = [Ar] 4s² 3d⁶ → Fe²⁺ = [Ar] 3d⁶ → Fe³⁺ = [Ar] 3d⁵ $$
**Magnetism:** any unpaired electron makes the species **paramagnetic** (attracted to a magnet). All electrons paired makes it **diamagnetic**.`, { fig: D.orbBoxes([['3d', 5]], { alt: 'Fe3+ has five unpaired 3d electrons' }) }),
      G('c.ionconfig'),
      G('c.unpaired'),
      G('c.iso'),
      MC('Zn²⁺ ([Ar] 3d¹⁰) is…', ['diamagnetic', 'paramagnetic', 'ferromagnetic', 'impossible to determine'], 'A full 3d¹⁰ has every electron paired.'),
      G('c.unpaired'),
      TF('Fe²⁺ has the configuration [Ar] 4s² 3d⁴.', false, 'Iron loses its two 4s electrons: [Ar] 3d⁶.'),
      G('c.ionconfig'),
    ]),
  ]);

  CQ.addUnits('chem', [u1, u2, u3, u4]);
})();
