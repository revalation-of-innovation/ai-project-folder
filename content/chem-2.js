/* CHEM 1311 · Units 5–7: periodic trends, compounds & formulas, Lewis structures (Burdge Ch 4–6) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const ch = CQ.chem;
  const { EL, parse, molarMass } = CQ.chemkit;
  const uniq = (a) => [...new Set(a)];

  /* ================= data ================= */
  // [period, group, radius pm, IE1 kJ/mol, EN]
  const P = {
    Li: [2, 1, 152, 520, 1.0], Be: [2, 2, 112, 899, 1.5], B: [2, 13, 85, 801, 2.0], C: [2, 14, 77, 1086, 2.5], N: [2, 15, 75, 1402, 3.0], O: [2, 16, 73, 1314, 3.5], F: [2, 17, 72, 1681, 4.0],
    Na: [3, 1, 186, 496, 0.9], Mg: [3, 2, 160, 738, 1.2], Al: [3, 13, 143, 578, 1.5], Si: [3, 14, 118, 786, 1.8], P: [3, 15, 110, 1012, 2.1], S: [3, 16, 103, 1000, 2.5], Cl: [3, 17, 99, 1251, 3.0],
    K: [4, 1, 227, 419, 0.8], Ca: [4, 2, 197, 590, 1.0], Ga: [4, 13, 135, 579, 1.6], Ge: [4, 14, 122, 762, 1.8], As: [4, 15, 120, 947, 2.0], Se: [4, 16, 117, 941, 2.4], Br: [4, 17, 114, 1140, 2.8],
    Rb: [5, 1, 248, 403, 0.8], Sr: [5, 2, 215, 549, 1.0], I: [5, 17, 133, 1008, 2.5], Cs: [6, 1, 265, 376, 0.7], Ba: [6, 2, 222, 503, 0.9],
  };
  const ENV = Object.assign({ H: 2.1 }, Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v[4]])));
  const VAL = { H: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Si: 4, P: 5, S: 6, Cl: 7, Br: 7, I: 7, Xe: 8, Se: 6, Al: 3 };

  // ions: [formula, charge, name, polyatomic?]
  const CATS = [['Na', 1, 'sodium'], ['K', 1, 'potassium'], ['Li', 1, 'lithium'], ['Mg', 2, 'magnesium'], ['Ca', 2, 'calcium'], ['Ba', 2, 'barium'], ['Al', 3, 'aluminum'], ['NH4', 1, 'ammonium', 1], ['Zn', 2, 'zinc'], ['Ag', 1, 'silver'],
    ['Fe', 2, 'iron(II)'], ['Fe', 3, 'iron(III)'], ['Cu', 1, 'copper(I)'], ['Cu', 2, 'copper(II)'], ['Cr', 3, 'chromium(III)'], ['Co', 2, 'cobalt(II)'], ['Pb', 2, 'lead(II)'], ['Sn', 4, 'tin(IV)']];
  const ANS = [['F', -1, 'fluoride'], ['Cl', -1, 'chloride'], ['Br', -1, 'bromide'], ['I', -1, 'iodide'], ['O', -2, 'oxide'], ['S', -2, 'sulfide'], ['N', -3, 'nitride'], ['P', -3, 'phosphide'],
    ['OH', -1, 'hydroxide', 1], ['NO3', -1, 'nitrate', 1], ['NO2', -1, 'nitrite', 1], ['SO4', -2, 'sulfate', 1], ['SO3', -2, 'sulfite', 1], ['PO4', -3, 'phosphate', 1], ['CO3', -2, 'carbonate', 1],
    ['HCO3', -1, 'hydrogen carbonate', 1], ['C2H3O2', -1, 'acetate', 1], ['ClO4', -1, 'perchlorate', 1], ['ClO3', -1, 'chlorate', 1], ['MnO4', -1, 'permanganate', 1], ['CN', -1, 'cyanide', 1], ['Cr2O7', -2, 'dichromate', 1]];
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const part = (f, n, poly) => (n === 1 ? f : poly ? '(' + f + ')' + n : f + n);
  function ionic(cat, an) {
    const qc = cat[1], qa = -an[1], d = gcd(qc, qa);
    const nc = qa / d, na = qc / d;
    return { f: part(cat[0], nc, cat[3]) + part(an[0], na, an[3]), nc, na, name: cat[2] + ' ' + an[2] };
  }
  const chg = (q) => (Math.abs(q) > 1 ? CQ.supNum(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻');
  const ionStr = (ion) => ch(ion[0]) + chg(ion[1]);
  CQ.chemkit.ions = { CATS, ANS, ionic, ionStr };

  /* ================= generators: Unit 5 ================= */
  const PROP = {
    radius: { col: 2, label: 'largest atomic radius', small: 'smallest atomic radius', why: 'Radius grows down a group (more shells) and shrinks across a period (higher Z_eff pulls electrons in).' },
    ie: { col: 3, label: 'highest first ionization energy', small: 'lowest first ionization energy', why: 'IE₁ rises across a period and falls down a group. Watch the dips at group 13 (after 2) and group 16 (after 15).' },
    en: { col: 4, label: 'highest electronegativity', small: 'lowest electronegativity', why: 'Electronegativity rises toward the upper right (fluorine is 4.0).' },
  };
  CQ.gen('c.trend', (R) => {
    const prop = R.pick(Object.keys(PROP)), big = R.chance(0.5);
    const keys = Object.keys(P);
    let set;
    if (R.chance(0.5)) { const per = R.pick([2, 3, 4]); set = R.sample(keys.filter((k) => P[k][0] === per), 3); }
    else { const grp = R.pick([1, 2, 17]); set = R.sample(keys.filter((k) => P[k][1] === grp), 3); }
    const col = PROP[prop].col;
    const vals = set.map((k) => P[k][col]);
    if (new Set(vals).size < 3) return CQ.gens['c.trend'](R);
    const best = set[vals.indexOf(big ? Math.max(...vals) : Math.min(...vals))];
    return { t: 'mc', lvl: 2, q: 'Which element has the **' + (big ? PROP[prop].label : PROP[prop].small) + '**?', opts: [best].concat(set.filter((k) => k !== best)), why: PROP[prop].why + ' Values: ' + set.map((k) => k + ' ' + P[k][col]).join(', ') + '.',
      fig: D.ptable({ hl: Object.fromEntries(set.map((k) => [k, 'c2'])), trend: prop === 'radius' ? 'radius' : prop }) };
  });

  CQ.gen('c.isoseries', (R) => {
    const series = R.pick([[['N³⁻', 7], ['O²⁻', 8], ['F⁻', 9], ['Na⁺', 11], ['Mg²⁺', 12], ['Al³⁺', 13]], [['P³⁻', 15], ['S²⁻', 16], ['Cl⁻', 17], ['K⁺', 19], ['Ca²⁺', 20]], [['Se²⁻', 34], ['Br⁻', 35], ['Rb⁺', 37], ['Sr²⁺', 38]]]);
    const pick = R.sample(series, 4).sort((a, b) => a[1] - b[1]);
    const big = R.chance(0.5);
    const ans = big ? pick[0] : pick[pick.length - 1];
    return { t: 'mc', lvl: 3, q: 'These ions are isoelectronic. Which is the **' + (big ? 'largest' : 'smallest') + '**?', opts: [ans[0]].concat(pick.filter((x) => x !== ans).map((x) => x[0])), why: 'Same number of electrons, so more protons pull them in tighter. Fewest protons → largest; most protons → smallest.' };
  });

  CQ.gen('c.iejump', (R) => {
    const data = [['Na', 1, [496, 4562, 6910, 9543]], ['Mg', 2, [738, 1451, 7733, 10540]], ['Al', 13, [578, 1817, 2745, 11577]], ['Si', 14, [786, 1577, 3232, 4356, 16091]], ['Ca', 2, [590, 1145, 4912, 6491]], ['K', 1, [419, 3052, 4420, 5877]]];
    const [s, grp, ies] = R.pick(data);
    const opts = ['group ' + grp].concat(['group 1', 'group 2', 'group 13', 'group 14'].filter((o) => o !== 'group ' + grp)).slice(0, 4);
    return { t: 'mc', lvl: 3, q: 'An element has successive ionization energies (kJ/mol): **' + ies.join(', ') + '**. Which group is it most likely in?', opts,
      why: 'The huge jump comes right after the valence electrons are gone and you start pulling core electrons. The jump after electron #' + grp % 10 + ' means ' + (grp % 10) + ' valence electrons (' + s + ').' };
  });

  CQ.gen('c.zeff', (R) => {
    const s = R.pick(['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Li', 'C', 'N', 'O', 'F', 'K']);
    const Z = EL[s].z, core = Z <= 2 ? 0 : Z <= 10 ? 2 : Z <= 18 ? 10 : 18;
    return { t: 'num', lvl: 2, q: 'Using Z_eff ≈ Z − (core electrons), estimate the effective nuclear charge felt by a valence electron of **' + s + '**.', a: Z - core, unit: '', abs: 0.01,
      steps: ['Z = ' + Z + ', core electrons = ' + core, 'Z_eff ≈ ' + Z + ' − ' + core + ' = **' + (Z - core) + '**'] };
  });

  /* ================= generators: Unit 6 ================= */
  CQ.gen('c.ionformula', (R) => {
    const cat = R.pick(CATS), an = R.pick(ANS);
    const r = ionic(cat, an);
    const acc = [r.f];
    // also accept the formula with parentheses around a lone polyatomic ion, e.g. Na(NO3)
    if (an[3] && r.na === 1) acc.push(part(cat[0], r.nc, cat[3]) + '(' + an[0] + ')');
    if (cat[3] && r.nc === 1) acc.push('(' + cat[0] + ')' + part(an[0], r.na, an[3]));
    return { t: 'txt', lvl: 3, cs: true, chemPreview: true, ph: 'e.g. Ca(NO3)2', q: 'Write the formula of the ionic compound formed from **' + ionStr(cat) + '** and **' + ionStr(an) + '**. (Type subscripts as plain numbers.)', a: acc,
      steps: ['Charges: +' + cat[1] + ' and ' + an[1], 'Balance: ' + r.nc + ' × (+' + cat[1] + ') + ' + r.na + ' × (' + an[1] + ') = 0', 'Formula: **' + ch(r.f) + '**' + (an[3] && r.na > 1 ? ' (parentheses around the polyatomic ion)' : '')] };
  });

  CQ.gen('c.ionname', (R) => {
    const cat = R.pick(CATS), an = R.pick(ANS);
    const r = ionic(cat, an);
    const wrong = [];
    const roman = { 'iron(II)': 'iron(III)', 'iron(III)': 'iron(II)', 'copper(I)': 'copper(II)', 'copper(II)': 'copper(I)', 'tin(IV)': 'tin(II)', 'lead(II)': 'lead(IV)', 'chromium(III)': 'chromium(II)', 'cobalt(II)': 'cobalt(III)' };
    if (roman[cat[2]]) wrong.push(roman[cat[2]] + ' ' + an[2]);
    const swap = { nitrate: 'nitrite', nitrite: 'nitrate', sulfate: 'sulfite', sulfite: 'sulfate', chlorate: 'chlorite', perchlorate: 'chlorate', sulfide: 'sulfate', oxide: 'oxygen', chloride: 'chlorine', phosphate: 'phosphide', carbonate: 'carbide', hydroxide: 'hydride', fluoride: 'fluorine', bromide: 'bromine', iodide: 'iodine' };
    if (swap[an[2]]) wrong.push(cat[2] + ' ' + swap[an[2]]);
    const pre = ['', '', 'di', 'tri'];
    if (r.na > 1 && !an[3]) wrong.push(cat[2].replace(/\(.*\)/, '') + ' ' + pre[r.na] + an[2]);
    wrong.push(cat[2].includes('(') ? cat[2].replace(/\(.*\)/, '') + ' ' + an[2] : cat[2] + '(' + ['I', 'II', 'III'][cat[1] - 1] + ') ' + an[2]);
    return { t: 'mc', lvl: 2, q: 'What is the name of **' + ch(r.f) + '**?', opts: uniq([r.name].concat(wrong)).slice(0, 4), why: 'Ionic: cation name, then anion name. Metals with variable charge get a Roman numeral equal to their charge. Greek prefixes are only for molecular compounds.' };
  });

  CQ.gen('c.namebuild', (R) => {
    const cat = R.pick(CATS), an = R.pick(ANS.filter((a) => a[1] !== -1 || R.chance(0.4)));
    const r = ionic(cat, an);
    const w1 = cat[0] + an[0];
    const w2 = part(cat[0], -an[1], cat[3]) + part(an[0], cat[1], an[3]);
    const w3 = cat[0] + (r.na > 1 ? an[0] + r.na : an[0] + '2');
    const opts = uniq([r.f, w1, w2, w3].map(ch));
    if (opts.length < 3) opts.push(ch(cat[0] + '2' + an[0] + '3'));
    return { t: 'mc', lvl: 2, q: 'What is the formula of **' + r.name + '**?', opts: uniq(opts), why: 'Cation ' + ionStr(cat) + ', anion ' + ionStr(an) + '. Choose subscripts so the charges cancel: ' + ch(r.f) + '.' };
  });

  const MOLS = [['N2O5', 'dinitrogen pentoxide'], ['CCl4', 'carbon tetrachloride'], ['SF6', 'sulfur hexafluoride'], ['P4O10', 'tetraphosphorus decoxide'], ['CO', 'carbon monoxide'], ['NO2', 'nitrogen dioxide'], ['N2O', 'dinitrogen monoxide'], ['PCl3', 'phosphorus trichloride'], ['SO3', 'sulfur trioxide'], ['Cl2O7', 'dichlorine heptoxide'], ['BF3', 'boron trifluoride'], ['SiO2', 'silicon dioxide'], ['N2O4', 'dinitrogen tetroxide'], ['PCl5', 'phosphorus pentachloride'], ['IF7', 'iodine heptafluoride']];
  CQ.gen('c.molname', (R) => {
    const [f, n] = R.pick(MOLS);
    if (R.chance(0.5)) {
      const others = R.sample(MOLS.filter((m) => m[0] !== f), 3).map((m) => m[1]);
      const bad = n.replace(/^mono/, '').replace('dinitrogen', 'nitrogen');
      return { t: 'mc', lvl: 2, q: 'Name the molecular compound **' + ch(f) + '**.', opts: uniq([n, bad !== n ? bad : others[0]].concat(others)).slice(0, 4), why: 'Molecular compounds use Greek prefixes (mono-, di-, tri-, tetra-, penta-, hexa-, hepta-, octa-, nona-, deca-). Never "mono" on the first element.' };
    }
    return { t: 'txt', lvl: 3, cs: true, chemPreview: true, ph: 'e.g. N2O5', q: 'Write the formula of **' + n + '**.', a: [f], why: 'The prefixes give the subscripts directly.' };
  });

  CQ.gen('c.acid', (R) => {
    const A = [['HCl', 'hydrochloric acid'], ['HBr', 'hydrobromic acid'], ['HF', 'hydrofluoric acid'], ['HNO3', 'nitric acid'], ['HNO2', 'nitrous acid'], ['H2SO4', 'sulfuric acid'], ['H2SO3', 'sulfurous acid'], ['H3PO4', 'phosphoric acid'], ['HClO4', 'perchloric acid'], ['HClO3', 'chloric acid'], ['HClO2', 'chlorous acid'], ['HClO', 'hypochlorous acid'], ['H2CO3', 'carbonic acid'], ['HC2H3O2', 'acetic acid']];
    const [f, n] = R.pick(A);
    const others = R.sample(A.filter((a) => a[0] !== f), 3).map((a) => a[1]);
    return { t: 'mc', lvl: 2, q: 'Name the acid **' + ch(f) + '** (dissolved in water).', opts: [n].concat(others), why: 'Binary: hydro-…-ic acid. Oxoacids: -ate anion → -ic acid, -ite anion → -ous acid.' };
  });

  const COMPS = ['H2O', 'CO2', 'NaCl', 'C6H12O6', 'CaCO3', 'NH3', 'H2SO4', 'Fe2O3', 'C2H6O', 'KMnO4', 'Al2(SO4)3', 'Ca(NO3)2', 'C8H18', 'Mg(OH)2', 'NaHCO3', 'C12H22O11'];
  CQ.gen('c.molarmass', (R) => {
    const f = R.pick(COMPS);
    const c = parse(f), M = molarMass(f);
    return { t: 'num', q: 'What is the molar mass of **' + ch(f) + '**?', a: M, unit: 'g/mol', tol: 0.005,
      steps: Object.keys(c).map((k) => k + ': ' + c[k] + ' × ' + EL[k].m + ' = ' + F(c[k] * EL[k].m, 5)).concat(['Total = **' + F(M, 5) + ' g/mol**']) };
  });

  CQ.gen('c.percent', (R) => {
    const f = R.pick(COMPS);
    const c = parse(f), M = molarMass(f);
    const el = R.pick(Object.keys(c));
    const pct = (100 * c[el] * EL[el].m) / M;
    return { t: 'num', q: 'What is the mass percent of **' + EL[el].name + '** in **' + ch(f) + '**?', a: pct, unit: '%', tol: 0.01,
      steps: ['Molar mass of ' + ch(f) + ' = ' + F(M, 5) + ' g/mol', 'Mass of ' + el + ' per mole = ' + c[el] + ' × ' + EL[el].m + ' = ' + F(c[el] * EL[el].m, 5) + ' g', '% ' + el + ' = ' + F(c[el] * EL[el].m, 5) + '/' + F(M, 5) + ' × 100 = **' + F(pct, 3) + '%**'] };
  });

  const EMP = [['CH2O', ['CHO', 'C2HO', 'CH2O2'], 'glucose (C₆H₁₂O₆)'], ['CH', ['CH2', 'C2H', 'CH3'], 'benzene'], ['NO2', ['N2O', 'NO', 'N2O5'], ''], ['P2O5', ['PO2', 'P2O3', 'PO3'], ''], ['CH2', ['CH', 'CH3', 'C2H'], ''], ['Fe2O3', ['FeO', 'Fe3O4', 'FeO2'], ''], ['C2H5', ['CH2', 'CH3', 'C3H8'], 'butane (C₄H₁₀)'], ['K2Cr2O7', ['KCrO4', 'K2CrO4', 'KCr2O7'], ''], ['C3H4O3', ['CH2O', 'C2H2O2', 'C3H3O3'], 'vitamin C'], ['Na2SO4', ['NaSO4', 'Na2SO3', 'NaSO3'], '']];
  CQ.gen('c.empirical', (R) => {
    const [f, wrong, note] = R.pick(EMP);
    const c = parse(f), M = molarMass(f);
    const pcts = Object.keys(c).map((k) => [k, (100 * c[k] * EL[k].m) / M]);
    const mol = pcts.map(([k, p]) => [k, p / EL[k].m]);
    const mn = Math.min(...mol.map((x) => x[1]));
    return { t: 'mc', lvl: 4, exam: true, q: 'A compound' + (note ? ' (found in ' + note + ')' : '') + ' is ' + pcts.map(([k, p]) => '**' + F(p, 3) + '% ' + k + '**').join(', ') + ' by mass. What is its empirical formula?', opts: [ch(f)].concat(wrong.map(ch)),
      hint: 'Assume 100 g, so each percent becomes grams. Convert to moles, then divide by the smallest.',
      steps: ['Assume 100 g → ' + pcts.map(([k, p]) => F(p, 3) + ' g ' + k).join(', '), 'Moles: ' + mol.map(([k, n]) => k + ' ' + F(n, 3)).join(', '), '÷ smallest (' + F(mn, 3) + '): ' + mol.map(([k, n]) => k + ' ' + F(n / mn, 3)).join(', '), 'Scale to whole numbers if needed → **' + ch(f) + '**'] };
  });

  CQ.gen('c.molecular', (R) => {
    const opts = [['CH2O', 6, 'C6H12O6'], ['CH', 6, 'C6H6'], ['CH2', 4, 'C4H8'], ['NO2', 2, 'N2O4'], ['P2O5', 2, 'P4O10'], ['C2H5', 2, 'C4H10'], ['CH2', 3, 'C3H6'], ['HO', 2, 'H2O2'], ['C3H4O3', 2, 'C6H8O6']];
    const [emp, n, mol] = R.pick(opts);
    const Me = molarMass(emp), M = n * Me;
    const scale = (k) => { const c = parse(emp); return Object.keys(c).map((e) => e + (c[e] * k > 1 ? c[e] * k : '')).join(''); };
    return { t: 'mc', lvl: 3, q: 'A compound has the empirical formula **' + ch(emp) + '** and a molar mass of about **' + F(M, 3) + ' g/mol**. What is its molecular formula?', opts: uniq([ch(mol), ch(emp), ch(scale(n + 1)), ch(scale(Math.max(2, n - 1) === n ? n + 2 : Math.max(2, n - 1)))]),
      steps: ['Empirical formula mass = ' + F(Me, 4) + ' g/mol', 'n = ' + F(M, 3) + '/' + F(Me, 4) + ' ≈ ' + n, 'Multiply every subscript by ' + n + ' → **' + ch(mol) + '**'] };
  });

  CQ.gen('c.lattice', (R) => {
    const pairs = [['MgO', 'NaF', 'Both ions in MgO have charges of ±2, vs ±1 in NaF. Lattice energy ∝ Q₁Q₂/d.'], ['NaCl', 'KCl', 'Same charges, but Na⁺ is smaller than K⁺, so the ions sit closer.'], ['LiF', 'CsI', 'Same charges, but Li⁺ and F⁻ are much smaller.'], ['CaO', 'KBr', 'CaO has 2+/2− ions versus 1+/1−.'], ['Al2O3', 'MgO', 'Al³⁺ has a higher charge than Mg²⁺.'], ['NaF', 'NaBr', 'F⁻ is smaller than Br⁻.']];
    const [hi, lo, why] = R.pick(pairs);
    return { t: 'mc', lvl: 2, q: 'Which compound has the **larger lattice energy**?', opts: [ch(hi), ch(lo)], why: why + ' (Coulomb\'s law: E ∝ Q₁Q₂/d.)' };
  });

  /* ================= generators: Unit 7 ================= */
  CQ.gen('c.bondtype', (R) => {
    const pairs = [['H', 'H'], ['C', 'H'], ['H', 'Cl'], ['O', 'H'], ['Na', 'Cl'], ['K', 'F'], ['C', 'O'], ['N', 'H'], ['C', 'Cl'], ['Mg', 'O'], ['S', 'O'], ['Cl', 'Cl'], ['Li', 'F'], ['C', 'N'], ['Ca', 'O'], ['P', 'H'], ['Al', 'Cl']];
    const [a, b] = R.pick(pairs);
    const d = Math.abs(ENV[a] - ENV[b]);
    const type = d < 0.5 ? 'nonpolar covalent' : d < 2.0 ? 'polar covalent' : 'ionic';
    return { t: 'mc', lvl: 2, q: 'Classify the bond between **' + a + '** (EN ' + ENV[a] + ') and **' + b + '** (EN ' + ENV[b] + ').', opts: ['nonpolar covalent', 'polar covalent', 'ionic'].sort((x, y) => (x === type ? -1 : y === type ? 1 : 0)), why: 'ΔEN = ' + F(d, 2) + '. Rule of thumb: ΔEN < 0.5 nonpolar, 0.5–2.0 polar covalent, ≥ 2.0 ionic.' };
  });

  CQ.gen('c.mostpolar', (R) => {
    const bonds = R.sample([['C', 'H'], ['O', 'H'], ['N', 'H'], ['H', 'F'], ['C', 'O'], ['S', 'H'], ['C', 'Cl'], ['H', 'Br'], ['P', 'H']], 4);
    const d = bonds.map(([a, b]) => Math.abs(ENV[a] - ENV[b]));
    if (new Set(d.map((x) => x.toFixed(1))).size < 4) return CQ.gens['c.mostpolar'](R);
    const i = d.indexOf(Math.max(...d));
    const lab = (x) => x[0] + '–' + x[1];
    return { t: 'mc', lvl: 2, q: 'Which bond is the **most polar**?', opts: [lab(bonds[i])].concat(bonds.filter((x, k) => k !== i).map(lab)), why: 'Largest ΔEN: ' + bonds.map((x, k) => lab(x) + ' ' + F(d[k], 2)).join(', ') + '.' };
  });

  const SPECIES = [['CO2', 0], ['H2O', 0], ['NH3', 0], ['CH4', 0], ['SO2', 0], ['SO3', 0], ['NO3', -1], ['CO3', -2], ['SO4', -2], ['PO4', -3], ['NH4', 1], ['O3', 0], ['HCN', 0], ['CH2O', 0], ['ClO', -1], ['NO2', -1], ['CN', -1], ['PCl5', 0], ['SF6', 0], ['XeF4', 0], ['BF3', 0], ['H3O', 1], ['ClO4', -1], ['N2', 0]];
  CQ.gen('c.valcount', (R) => {
    const [f, q] = R.pick(SPECIES);
    const c = parse(f);
    const sum = Object.keys(c).reduce((a, k) => a + VAL[k] * c[k], 0);
    const tot = sum - q;
    return { t: 'num', lvl: 2, q: 'How many **valence electrons** go into the Lewis structure of **' + ch(f) + (q ? chg(q) : '') + '**?', a: tot, unit: 'e⁻', abs: 0.01,
      steps: [Object.keys(c).map((k) => c[k] + ' ' + k + ' × ' + VAL[k]).join(' + ') + ' = ' + sum, q ? (q < 0 ? 'Add ' + -q + ' for the negative charge' : 'Subtract ' + q + ' for the positive charge') : 'Neutral, so no adjustment', 'Total = **' + tot + '**'] };
  });

  CQ.gen('c.fc', (R) => {
    const cases = [['N', 4, 0, 'N with 4 bonds and no lone pairs (as in NH₄⁺)'], ['O', 3, 1, 'O with 3 bonds and 1 lone pair (as in H₃O⁺)'], ['O', 1, 3, 'O with 1 single bond and 3 lone pairs'], ['O', 2, 2, 'O with 2 bonds and 2 lone pairs'], ['C', 3, 1, 'C with a triple bond and 1 lone pair (as in CO)'], ['O', 3, 1, 'O with a triple bond and 1 lone pair (as in CO)'], ['S', 4, 0, 'S with 4 single bonds and no lone pairs'], ['N', 2, 2, 'N with 2 bonds and 2 lone pairs'], ['B', 4, 0, 'B with 4 bonds (as in BF₄⁻)'], ['C', 4, 0, 'C with 4 bonds'], ['N', 3, 1, 'N with 3 bonds and 1 lone pair'], ['Cl', 1, 3, 'Cl with 1 bond and 3 lone pairs'], ['S', 6, 0, 'S with 6 bonds (2 double, 2 single) and no lone pairs']];
    const [e, b, lp, desc] = R.pick(cases);
    const fc = VAL[e] - 2 * lp - b;
    return { t: 'num', lvl: 3, q: 'What is the formal charge on **' + desc + '**?', a: fc, unit: '', abs: 0.01,
      hint: 'FC = (valence e⁻) − (nonbonding e⁻) − (number of bonds)',
      steps: ['Valence electrons of ' + e + ' = ' + VAL[e], 'Nonbonding electrons = ' + 2 * lp + ', bonds = ' + b, 'FC = ' + VAL[e] + ' − ' + 2 * lp + ' − ' + b + ' = **' + (fc > 0 ? '+' : '') + fc + '**'] };
  });

  CQ.gen('c.resonance', (R) => {
    const data = [['NO3', -1, 3, 4 / 3], ['CO3', -2, 3, 4 / 3], ['O3', 0, 2, 1.5], ['SO2', 0, 2, 1.5], ['NO2', -1, 2, 1.5], ['HCO2', -1, 2, 1.5]];
    const [f, q, n, bo] = R.pick(data);
    if (R.chance(0.5)) return { t: 'mc', lvl: 2, q: 'How many equivalent resonance structures does **' + ch(f) + (q ? chg(q) : '') + '** have?', opts: [String(n), String(n === 3 ? 2 : 3), '1', '4'], why: 'The double bond can sit in ' + n + ' equivalent positions.' };
    return { t: 'num', lvl: 3, q: 'What is the average bond order of each ' + (f.startsWith('C') ? 'C–O' : f.startsWith('S') ? 'S–O' : f === 'O3' ? 'O–O' : 'N–O') + ' bond in **' + ch(f) + (q ? chg(q) : '') + '**?', a: bo, unit: '', tol: 0.02,
      steps: ['Total bonds to the outer atoms in one structure: ' + (n === 3 ? '4 (one double + two single)' : '3 (one double + one single)'), 'Shared by ' + n + ' equivalent bonds: ' + (n === 3 ? '4/3' : '3/2') + ' = **' + F(bo, 3) + '**'] };
  });

  CQ.gen('c.octet', (R) => {
    const cases = [['BF3', 'incomplete octet'], ['BeCl2', 'incomplete octet'], ['NO', 'odd number of electrons'], ['NO2', 'odd number of electrons'], ['ClO2', 'odd number of electrons'], ['PCl5', 'expanded octet'], ['SF6', 'expanded octet'], ['XeF4', 'expanded octet'], ['I3', 'expanded octet'], ['CH4', 'obeys the octet rule'], ['CO2', 'obeys the octet rule'], ['NH3', 'obeys the octet rule']];
    const [f, type] = R.pick(cases);
    return { t: 'mc', lvl: 2, q: 'Which best describes the central atom in **' + ch(f) + (f === 'I3' ? '⁻' : '') + '**?', opts: [type].concat(['incomplete octet', 'odd number of electrons', 'expanded octet', 'obeys the octet rule'].filter((x) => x !== type)),
      why: 'Incomplete: B and Be are happy with 6 or 4. Odd: an odd total electron count can\'t all pair. Expanded: period 3+ central atoms (P, S, Cl, Xe, I) can hold more than 8.' };
  });

  /* ================= Unit 5 ================= */
  const u5 = U('c5', 'Periodic Trends', { sub: 'Z_eff, size, ionization energy & electron affinity', ch: 'Ch 4' }, [
    L('c5l1', 'Effective Nuclear Charge', {
      goal: 'Explain every periodic trend with Z_eff and shielding.',
      key: 'Inner (core) electrons shield valence electrons from the full nuclear charge: $Z_{eff} = Z − σ$, roughly Z minus the core electrons. Across a period, Z rises while shielding barely changes, so Z_eff rises and valence electrons are held tighter. Down a group, valence electrons sit in higher shells, farther away and better shielded. Nearly every trend follows from these two facts.',
      formulas: ['Z_eff = Z − σ ≈ Z − (core e⁻)'],
    }, [
      T('Why the trends exist', `
Valence electrons don't feel the whole nucleus. Core electrons get in the way (**shielding**):
$$ Z_{eff} = Z − σ :: rough estimate: Z − core electrons $$
| Direction | What changes | Effect |
|---|---|---|
| across → | Z_eff ↑, same shell | electrons pulled in tighter |
| down ↓ | new shell, Z_eff ~ same | electrons farther away |
>* Learn these two rows and you can **derive** radius, ionization energy and electronegativity instead of memorizing them.`),
      G('c.zeff'),
      MC('Moving from Na to Cl across period 3, the effective nuclear charge on the valence electrons…', ['increases', 'decreases', 'stays the same', 'first increases then decreases'], 'Protons are added while the core (Ne) stays the same.'),
      G('c.zeff'),
      TF('Core electrons shield valence electrons more effectively than other valence electrons do.', true, 'Electrons in the same shell shield each other poorly.'),
      G('c.zeff'),
    ]),
    L('c5l2', 'Atomic & Ionic Radius', {
      goal: 'Rank atoms and ions by size.',
      key: 'Atomic radius increases down a group (more shells) and decreases across a period (higher Z_eff), so the largest atoms are at the lower left (Cs) and the smallest at the upper right (F, He). Cations are smaller than their parent atoms (they lose a shell or have less repulsion). Anions are larger (more repulsion). In an isoelectronic series, more protons means a smaller ion: O²⁻ > F⁻ > Na⁺ > Mg²⁺.',
      formulas: ['radius ↑ down, ↓ across', 'cation < atom < anion', 'isoelectronic: more p⁺ → smaller'],
    }, [
      T('Size trends', `
- **Down a group:** bigger, because each period adds a shell
- **Across a period:** smaller, because Z_eff grows and pulls the cloud in
- **Cations** are smaller than their atoms (often a whole shell is gone)
- **Anions** are larger (extra electron–electron repulsion)
>! **Isoelectronic ions** (same electron count): the one with **more protons is smaller**. O²⁻ (8 p⁺) > F⁻ (9) > Na⁺ (11) > Mg²⁺ (12), all with 10 electrons.`, { fig: D.ptable({ trend: 'radius' }) }),
      G('c.trend'),
      MC('Which is larger: Na or Na⁺?', ['Na', 'Na⁺', 'They\'re the same size', 'It depends on temperature'], 'Na⁺ has lost its entire 3s shell.'),
      G('c.isoseries'),
      MC('Which is larger: Cl or Cl⁻?', ['Cl⁻', 'Cl', 'Same size', 'Can\'t tell'], 'The extra electron adds repulsion with no extra protons.'),
      G('c.trend'),
      G('c.isoseries'),
    ]),
    L('c5l3', 'Ionization Energy', {
      goal: 'Predict ionization energies, including the exceptions and successive IEs.',
      key: 'IE₁ is the energy to remove the outermost electron. It increases across a period and decreases down a group (the opposite of radius). Two exceptions: group 13 < group 2 (Be > B, because the p electron is easier to remove) and group 16 < group 15 (N > O, because the paired p electron repels its partner). Successive IEs always increase, with a huge jump once core electrons are being removed. The position of the jump tells you the number of valence electrons.',
      formulas: ['IE₁ ↑ across, ↓ down', 'exceptions: Be > B, N > O', 'big jump after the last valence e⁻'],
    }, [
      T('Pulling electrons off', `
**Ionization energy** (IE₁) is the energy needed to remove the first electron from a gas-phase atom.
- **Across:** increases (higher Z_eff holds tighter)
- **Down:** decreases (electron is farther away)
>! **Dips:** B < Be (the 2p electron is higher in energy than 2s) and O < N (oxygen's 4th p electron is paired, and repulsion makes it easier to remove).
>* **Successive IEs:** each one is bigger, and there's a **huge jump** when you reach core electrons. Mg: 738, 1451, then **7733**. That means 2 valence electrons.`, { fig: D.ptable({ trend: 'ie' }) }),
      G('c.trend'),
      MC('Which has the higher first ionization energy?', ['N', 'O'], 'Exception: O\'s paired 2p electron is easier to remove.', { lvl: 2 }),
      G('c.iejump'),
      MC('Which has the higher first ionization energy?', ['Be', 'B'], 'Exception: B\'s lone 2p electron is easier to remove than Be\'s 2s.', { lvl: 2 }),
      G('c.trend'),
      G('c.iejump'),
    ]),
    L('c5l4', 'Electron Affinity & Metallic Character', {
      goal: 'Predict electron affinity and metallic character.',
      key: 'Electron affinity (EA) is the energy change when a gas atom gains an electron. Burdge reports EA as the energy released, so larger positive EA means a stronger attraction. Halogens have the largest EA. Noble gases, group 2 and nitrogen have little or no tendency to gain an electron. EA generally increases across a period. Metallic character (tendency to lose electrons) increases down and to the left, so Cs and Fr are the most metallic. Electronegativity (attraction for shared electrons in a bond) increases up and to the right, with F the highest at 4.0.',
      formulas: ['EA: halogens largest, noble gases ~none', 'metallic ↑ down & left', 'EN ↑ up & right (F = 4.0)'],
    }, [
      T('Gaining electrons and being metallic', `
**Electron affinity:** the energy change when an atom gains an electron. Halogens gain one eagerly (one away from a noble-gas configuration). Noble gases and group 2 metals don't want one.
**Metallic character:** how easily an atom gives up electrons. It increases **down and to the left**.
**Electronegativity:** how hard an atom pulls on **shared** electrons in a bond. It increases **up and to the right**. Fluorine is the champion (4.0).
>! Signs differ between textbooks. Some report EA as energy **released** (positive = favorable). Check your course's convention, but the trend is the same.`, { fig: D.ptable({ trend: 'en' }) }),
      MC('Which group has the most favorable (largest) electron affinities?', ['halogens (group 17)', 'noble gases (group 18)', 'alkali metals (group 1)', 'alkaline earth metals (group 2)'], 'One electron from a full shell, so they want it.'),
      G('c.trend'),
      MC('Which element is the most metallic?', ['Cs', 'Na', 'Mg', 'Al'], 'Metallic character increases down and to the left.'),
      TF('Electronegativity increases going down a group.', false, 'It decreases down a group and increases up and to the right.'),
      G('c.trend'),
    ]),
  ]);

  /* ================= Unit 6 ================= */
  const u6 = U('c6', 'Compounds & Formulas', { sub: 'Ionic vs molecular, naming, empirical formulas', ch: 'Ch 5' }, [
    L('c6l1', 'Ionic vs Molecular Compounds', {
      goal: 'Tell ionic from molecular compounds and write ionic formulas from charges.',
      key: 'A metal + a nonmetal makes an **ionic** compound: a lattice of cations and anions with no molecules. Nonmetals only make a **molecular** (covalent) compound. Main-group charges come from the group: 1 → +1, 2 → +2, Al → +3, 15 → −3, 16 → −2, 17 → −1. Write the formula so the charges cancel, using the lowest whole-number ratio (crisscross, then reduce). Lattice energy ∝ Q₁Q₂/d: bigger charges and smaller ions give a stronger lattice.',
      formulas: ['charges: G1 +1, G2 +2, Al +3, G15 −3, G16 −2, G17 −1', 'lattice energy ∝ [[Q₁Q₂|d]]'],
    }, [
      T('Two kinds of compounds', `
| | Ionic | Molecular |
|---|---|---|
| made of | metal + nonmetal | nonmetals only |
| particles | ions in a lattice | discrete molecules |
| example | NaCl, MgO | H₂O, CO₂ |
**Writing ionic formulas:** the total charge must be zero. Al³⁺ + O²⁻: crisscross the charges → Al₂O₃.
>! Always reduce: Mg²⁺ + O²⁻ is MgO, **not** Mg₂O₂.
>* **Lattice energy** follows Coulomb's law: $E ∝ Q₁Q₂/d$. MgO (2+, 2−) has a far larger lattice energy than NaF (1+, 1−).`),
      MC('Which compound is **ionic**?', ['CaCl₂', 'CO₂', 'NH₃', 'CH₄'], 'Calcium (metal) + chlorine (nonmetal).'),
      G('c.ionformula'),
      G('c.lattice'),
      MC('What charge does a sulfur ion usually have?', ['2−', '2+', '6+', '1−'], 'Group 16: gains 2 electrons to reach an octet.'),
      G('c.ionformula'),
      TF('Ionic compounds exist as discrete molecules.', false, 'They form extended lattices. The formula gives only the ratio of ions.'),
    ]),
    L('c6l2', 'Naming Ionic Compounds', {
      goal: 'Name ionic compounds, including metals with variable charges.',
      key: 'Cation name (unchanged) + anion name (-ide for a single-element anion). Metals that can have more than one charge (most transition metals, plus Sn and Pb) get a Roman numeral equal to the cation\'s charge: FeCl₃ = iron(III) chloride. Work the charge out backward from the anion. Never use Greek prefixes for ionic compounds. Fixed-charge metals (group 1, group 2, Al, Zn, Ag) get no numeral.',
      formulas: ['FeCl₃ → iron(III) chloride', 'CuO → copper(II) oxide'],
    }, [
      T('Cation first, anion second', `
- **Cation:** element name (sodium, calcium). Add a **Roman numeral** if the metal can take more than one charge.
- **Anion:** root + **-ide** for single atoms (chloride, oxide, nitride).
**Finding the numeral:** Fe₂O₃ has 3 O²⁻ = 6−, so 2 Fe = 6+ and each Fe is +3 → **iron(III) oxide**.
>! **No prefixes** in ionic names. CaCl₂ is "calcium chloride", never "calcium dichloride".
>* Group 1, group 2, Al³⁺, Zn²⁺ and Ag⁺ only have one charge, so they never get numerals.`),
      EX('Find the charge', 'Name CuCl₂ and Cu₂O.', ['CuCl₂: 2 Cl⁻ = 2−, so Cu is +2 → **copper(II) chloride**', 'Cu₂O: one O²⁻ = 2−, split over 2 Cu → each Cu is +1 → **copper(I) oxide**']),
      G('c.ionname'),
      G('c.namebuild'),
      MC('What is the name of **SnO₂**?', ['tin(IV) oxide', 'tin(II) oxide', 'tin dioxide', 'tin oxide'], 'Two O²⁻ = 4−, so Sn is +4.'),
      G('c.ionname'),
      TF('ZnCl₂ is named zinc(II) chloride.', false, 'Zinc only forms Zn²⁺, so no Roman numeral: zinc chloride.'),
      G('c.namebuild'),
    ]),
    L('c6l3', 'Polyatomic Ions', {
      goal: 'Know the common polyatomic ions cold.',
      key: 'Must-know ions: NH₄⁺ ammonium · OH⁻ hydroxide · NO₃⁻ nitrate / NO₂⁻ nitrite · SO₄²⁻ sulfate / SO₃²⁻ sulfite · PO₄³⁻ phosphate · CO₃²⁻ carbonate · HCO₃⁻ hydrogen carbonate (bicarbonate) · C₂H₃O₂⁻ acetate · ClO₄⁻ perchlorate, ClO₃⁻ chlorate, ClO₂⁻ chlorite, ClO⁻ hypochlorite · MnO₄⁻ permanganate · CrO₄²⁻ chromate · Cr₂O₇²⁻ dichromate · CN⁻ cyanide. Pattern: -ate has one more O than -ite (same charge). Per- adds an O, hypo- removes one. Use parentheses when you need more than one: Ca(NO₃)₂.',
      formulas: ['-ate: one more O than -ite', 'per-ate > -ate > -ite > hypo-ite', 'use ( ) for 2+ polyatomic ions'],
    }, [
      T('Ions that travel as a group', `
| Ion | Name | Ion | Name |
|---|---|---|---|
| NH₄⁺ | ammonium | OH⁻ | hydroxide |
| NO₃⁻ | nitrate | NO₂⁻ | nitrite |
| SO₄²⁻ | sulfate | SO₃²⁻ | sulfite |
| PO₄³⁻ | phosphate | CO₃²⁻ | carbonate |
| HCO₃⁻ | hydrogen carbonate | C₂H₃O₂⁻ | acetate |
| MnO₄⁻ | permanganate | CN⁻ | cyanide |
| CrO₄²⁻ | chromate | Cr₂O₇²⁻ | dichromate |
**Chlorine oxyanions:** ClO₄⁻ per**chlorate** · ClO₃⁻ chlor**ate** · ClO₂⁻ chlor**ite** · ClO⁻ **hypo**chlor**ite**
>! Need two? Wrap the ion in parentheses: Ca(OH)₂, Al₂(SO₄)₃.`),
      MATCH('Match each polyatomic ion to its name.', [['NO₃⁻', 'nitrate'], ['SO₄²⁻', 'sulfate'], ['PO₄³⁻', 'phosphate'], ['NH₄⁺', 'ammonium'], ['CO₃²⁻', 'carbonate']]),
      MATCH('Match each ion to its name.', [['NO₂⁻', 'nitrite'], ['SO₃²⁻', 'sulfite'], ['ClO⁻', 'hypochlorite'], ['C₂H₃O₂⁻', 'acetate'], ['MnO₄⁻', 'permanganate']]),
      G('c.ionformula'),
      MC('Which ion is **chlorite**?', ['ClO₂⁻', 'ClO₃⁻', 'ClO⁻', 'ClO₄⁻'], 'chlorate = ClO₃⁻, so chlorite has one fewer O.'),
      G('c.ionformula'),
      G('c.namebuild'),
    ]),
    L('c6l4', 'Molecular Compounds & Acids', {
      goal: 'Name binary molecular compounds and acids.',
      key: 'Molecular (two nonmetals): use Greek prefixes, 1 mono, 2 di, 3 tri, 4 tetra, 5 penta, 6 hexa, 7 hepta, 8 octa, 9 nona, 10 deca. Don\'t use "mono" on the first element, and drop the final a/o before "oxide" (pentoxide, monoxide). Acids: binary H–X becomes hydro-…-ic acid (HCl hydrochloric). Oxoacids: -ate → -ic acid (HNO₃ nitric, H₂SO₄ sulfuric), -ite → -ous acid (HNO₂ nitrous).',
      formulas: ['mono di tri tetra penta hexa hepta octa nona deca', 'HX → hydro-…-ic acid', '-ate → -ic acid · -ite → -ous acid'],
    }, [
      T('Prefixes for molecules', `
Two nonmetals → count the atoms with **Greek prefixes**:
| 1 mono | 2 di | 3 tri | 4 tetra | 5 penta |
|---|---|---|---|---|
| **6 hexa** | **7 hepta** | **8 octa** | **9 nona** | **10 deca** |
N₂O₅ = **di**nitrogen **pent**oxide · CO = carbon **mon**oxide · SF₆ = sulfur **hexa**fluoride
>! Never start with "mono": CO₂ is carbon dioxide, not monocarbon dioxide.`),
      T('Naming acids', `
| Anion ending | Acid name | Example |
|---|---|---|
| -ide | **hydro**-…-**ic** acid | HCl → hydrochloric acid |
| -ate | …-**ic** acid | HNO₃ → nitric acid |
| -ite | …-**ous** acid | HNO₂ → nitrous acid |
>* Memory hook: "I **ate** something **ic**ky" and "Sp**ite**ful and devi**ous**".`),
      G('c.molname'),
      G('c.acid'),
      MC('What is the formula of **sulfur trioxide**?', ['SO₃', 'S₃O', 'SO₂', 'S₂O₃'], 'tri = 3 oxygens.'),
      G('c.molname'),
      G('c.acid'),
      TF('H₂SO₃ is named sulfuric acid.', false, 'SO₃²⁻ is sulfite, so H₂SO₃ is sulfurous acid.'),
    ]),
    L('c6l5', 'Percent Composition & Empirical Formulas', {
      goal: 'Compute molar mass and % composition, and find empirical and molecular formulas.',
      key: 'Molar mass = Σ(atoms × atomic mass). Mass percent = (mass of element in 1 mol)/(molar mass) × 100. Empirical formula from percentages: assume 100 g so % becomes g, convert to moles, divide by the smallest, then multiply by a small integer if needed (×2 for .5, ×3 for .33 or .67). Molecular formula = empirical formula × n, where n = molar mass ÷ empirical-formula mass.',
      formulas: ['% = [[n × M_{el}|M_{compound}]] × 100', 'n = [[M_{molecular}|M_{empirical}]]'],
    }, [
      T('From percentages to formulas', `
**Empirical formula recipe** ("percent to mass, mass to mole, divide by small, multiply till whole"):
1. Assume 100 g, so each % becomes grams
2. Divide by atomic mass to get moles
3. Divide every value by the smallest
4. If you get x.5, x.33 or x.25, multiply everything by 2, 3 or 4
**Molecular formula:** $n = M/M_{emp}$, then multiply every subscript by n.
>! Don't round 1.5 to 2. A value like 1.5 means multiply everything by 2.`),
      EX('Glucose from scratch', 'A sugar is 40.0% C, 6.71% H, 53.3% O and has M = 180 g/mol. Find its empirical and molecular formulas.', ['Moles: C 40.0/12.01 = 3.33, H 6.71/1.008 = 6.66, O 53.3/16.00 = 3.33', '÷ 3.33: C 1, H 2, O 1 → **CH₂O** (30.03 g/mol)', 'n = 180/30.03 = 6 → **C₆H₁₂O₆**']),
      G('c.molarmass'),
      MC('When finding an empirical formula from mass percents, the convenient first step is to…', ['assume a 100 g sample so each percent becomes grams', 'assume 1 mol of compound', 'divide each percent by the molar mass of the compound', 'multiply each percent by Avogadro\'s number'], 'With 100 g, 40.0% C is simply 40.0 g C.'),
      G('c.percent'),
      TF('C₂H₄ and C₃H₆ have the same empirical formula.', true, 'Both reduce to CH₂.'),
      G('c.molarmass'),
      G('c.empirical'),
      G('c.molecular'),
      G('c.percent'),
    ]),
  ]);

  /* ================= Unit 7 ================= */
  const u7 = U('c7', 'Lewis Structures', { sub: 'Bond polarity, formal charge & resonance', ch: 'Ch 6' }, [
    L('c7l1', 'Electronegativity & Bond Polarity', {
      goal: 'Classify bonds as nonpolar covalent, polar covalent or ionic.',
      key: 'Electronegativity (EN) is an atom\'s pull on shared electrons, increasing toward fluorine (4.0). ΔEN sets the bond type: < 0.5 nonpolar covalent, 0.5–2.0 polar covalent (partial charges δ+ and δ−, with δ− on the more EN atom), ≥ 2.0 ionic. A bigger ΔEN means a more polar bond.',
      formulas: ['ΔEN < 0.5 nonpolar · 0.5–2.0 polar · ≥ 2.0 ionic'],
    }, [
      T('Tug-of-war for electrons', `
| ΔEN | Bond | Example |
|---|---|---|
| < 0.5 | nonpolar covalent | C–H (0.4), Cl–Cl (0) |
| 0.5 – 2.0 | polar covalent | O–H (1.4), H–Cl (0.9) |
| ≥ 2.0 | ionic | Na–Cl (2.1) |
In a polar bond, the more electronegative atom carries a partial negative charge: $^{δ+}H–Cl^{δ−}$
>* It's a continuum. The cutoffs are rules of thumb, and the larger the ΔEN, the more ionic the bond.`),
      G('c.bondtype'),
      G('c.mostpolar'),
      G('c.bondtype'),
      MC('In an H–F bond, which atom carries the partial negative charge?', ['F', 'H', 'neither', 'both'], 'F is far more electronegative.'),
      TF('A C–H bond is considered essentially nonpolar.', true, 'ΔEN = 0.4.'),
      G('c.mostpolar'),
    ]),
    L('c7l2', 'Drawing Lewis Structures', {
      goal: 'Draw a correct Lewis structure step by step.',
      key: '1) Count valence electrons (add one per negative charge, subtract one per positive charge). 2) Put the least electronegative atom in the center (never H; H and F are always terminal). 3) Connect with single bonds (2 e⁻ each). 4) Complete the outer atoms\' octets with lone pairs (H needs only 2). 5) Put leftover electrons on the central atom. 6) If the central atom is short of an octet, turn outer lone pairs into double or triple bonds.',
      formulas: ['total e⁻ = Σ valence − charge', 'central atom: least EN (not H)'],
    }, [
      T('The six-step recipe', `
1. **Count** valence electrons. Adjust: + for anion charge, − for cation charge
2. **Skeleton:** least electronegative atom in the center (never H)
3. **Single bonds** from the center to each outer atom
4. **Outer atoms:** complete octets with lone pairs (H gets only 2)
5. **Leftovers** go on the central atom as lone pairs
6. **Central atom short?** Move outer lone pairs in to make double or triple bonds
>* Check: count every electron in the drawing. It must equal your step 1 total.`, { fig: D.lewis({ w: 250, h: 110, atoms: [{ e: 'O', x: 50, y: 60, lp: [90, 180, 270] }, { e: 'C', x: 125, y: 60 }, { e: 'O', x: 200, y: 60, lp: [90, 0, 270] }], bonds: [[0, 1, 2], [1, 2, 2]], alt: 'Lewis structure of CO2: O=C=O' }) }),
      EX('Lewis structure of CO₂', 'Draw CO₂.', ['Valence e⁻: 4 + 2(6) = 16', 'Skeleton O–C–O uses 4 e⁻, leaving 12', 'Complete the O octets: 6 each, so 12 used, 0 left. But C has only 4 e⁻.', 'Move one lone pair from each O into a bond: **O=C=O**, each O with 2 lone pairs. All octets complete. ✓']),
      G('c.valcount'),
      G('c.valcount'),
      MC('Which atom is placed in the **center** of the Lewis structure of HCN?', ['C', 'H', 'N', 'any of them'], 'H is always terminal, and C is less electronegative than N.'),
      ORDER('Order the steps for drawing a Lewis structure.', ['Count total valence electrons', 'Choose the central atom and draw single bonds', 'Complete octets on the outer atoms', 'Place leftover electrons on the central atom', 'Form multiple bonds if the central atom lacks an octet']),
      MC('How many lone pairs are on the oxygen in H₂O?', ['2', '1', '3', '0'], '8 valence e⁻: 2 bonds use 4, which leaves 2 lone pairs on O.', { fig: D.lewis({ w: 200, h: 110, atoms: [{ e: 'H', x: 40, y: 80 }, { e: 'O', x: 100, y: 50 }, { e: 'H', x: 160, y: 80 }], bonds: [[0, 1, 1], [1, 2, 1]], alt: 'Water skeleton without lone pairs' }) }),
      G('c.valcount'),
    ]),
    L('c7l3', 'Formal Charge', {
      goal: 'Assign formal charges and pick the best Lewis structure.',
      key: 'Formal charge = (valence e⁻) − (nonbonding e⁻) − (number of bonds). Formal charges must add up to the overall charge. Best structure: formal charges as close to zero as possible, and any negative formal charge on the more electronegative atom. Avoid like charges on neighboring atoms.',
      formulas: ['FC = V − N − B', 'Σ FC = overall charge'],
    }, [
      T('Bookkeeping for electrons', `
$$ FC = V − N − B :: V valence, N nonbonding e⁻, B bonds $$
Count each lone-pair electron fully and each bond once (half of its 2 electrons).
**Choosing among valid structures:**
1. Formal charges closest to zero
2. Negative FC on the more electronegative atom
3. Sum of FCs = overall charge
>* In CO, carbon gets −1 and oxygen +1 (C≡O with a lone pair on each). Unusual, but it's the only way to give both atoms an octet.`, { fig: D.lewis({ w: 220, h: 100, atoms: [{ e: 'C', x: 70, y: 50, lp: [180], fc: '−1' }, { e: 'O', x: 150, y: 50, lp: [0], fc: '+1' }], bonds: [[0, 1, 3]], alt: 'Carbon monoxide with formal charges' }) }),
      EX('Formal charges in NO₃⁻', 'In one Lewis structure of nitrate, N has one double bond and two single bonds to O. Find each formal charge.', ['N: 5 − 0 − 4 = **+1**', 'Double-bonded O (2 lone pairs): 6 − 4 − 2 = **0**', 'Single-bonded O (3 lone pairs): 6 − 6 − 1 = **−1** each', 'Sum: +1 + 0 − 1 − 1 = −1 ✓ matches the ion\'s charge']),
      G('c.fc'),
      G('c.fc'),
      MC('Two valid Lewis structures differ only in formal charges. Which is preferred?', ['The one with formal charges closest to zero, and negative ones on the more electronegative atoms', 'The one with the most double bonds', 'The one with the most lone pairs', 'The one with positive charge on oxygen'], 'Minimize formal charge and put negative charge on electronegative atoms.'),
      G('c.fc'),
      TF('The formal charges in a neutral molecule must add up to zero.', true, 'Σ FC = overall charge.'),
    ]),
    L('c7l4', 'Resonance', {
      goal: 'Draw resonance structures and find average bond orders.',
      key: 'When more than one valid Lewis structure differs only in where the electrons sit (not the atoms), the real molecule is a resonance hybrid, an average of them. Examples: O₃ (2 structures), NO₃⁻ and CO₃²⁻ (3 each). All the equivalent bonds are identical and intermediate between single and double: bond order = total bonds ÷ number of positions (NO₃⁻: 4/3). Resonance structures never move atoms.',
      formulas: ['bond order = [[total bonds to outer atoms|number of outer atoms]]', 'NO₃⁻, CO₃²⁻: 4/3 · O₃, SO₂: 3/2'],
    }, [
      T('One molecule, several drawings', `
Ozone can be drawn with the double bond on the left **or** on the right. Neither is the real molecule. Experiments show **both O–O bonds are identical**, about 1.5 bonds each.
The real structure is a **resonance hybrid**, an average of the drawings, with electrons delocalized over the molecule.
>! Resonance structures move **electrons only**, never atoms. Moving an atom gives a different molecule (an isomer).
>* Average bond order = total bonds ÷ number of equivalent positions. CO₃²⁻: 4 bonds over 3 positions = **1.33**.`, { fig: D.lewis({ w: 330, h: 120, atoms: [{ e: 'O', x: 30, y: 80, lp: [90, 210] }, { e: 'O', x: 80, y: 45, lp: [90] }, { e: 'O', x: 130, y: 80, lp: [330, 270, 30] }, { e: '↔', x: 165, y: 62 }, { e: 'O', x: 200, y: 80, lp: [150, 270, 210] }, { e: 'O', x: 250, y: 45, lp: [90] }, { e: 'O', x: 300, y: 80, lp: [90, 330] }], bonds: [[0, 1, 2], [1, 2, 1], [4, 5, 1], [5, 6, 2]], alt: 'Two resonance structures of ozone' }) }),
      G('c.resonance'),
      MC('In the nitrate ion, the three N–O bonds are…', ['identical, each between a single and a double bond', 'one double and two single bonds', 'all double bonds', 'all single bonds'], 'Resonance spreads the double bond over all three positions.'),
      G('c.resonance'),
      TF('Resonance structures can differ in the arrangement of atoms.', false, 'Only electrons move. Atoms stay put.'),
      G('c.resonance'),
    ]),
    L('c7l5', 'Exceptions to the Octet Rule', {
      goal: 'Recognize incomplete octets, odd-electron molecules and expanded octets.',
      key: 'Three exceptions. **Incomplete octet:** Be (4 e⁻) and B (6 e⁻), as in BeCl₂ and BF₃. **Odd-electron** molecules (free radicals) have an odd total, so one electron is unpaired: NO, NO₂, ClO₂. **Expanded octet:** central atoms from period 3 or below (P, S, Cl, Xe, I) can hold more than 8 electrons because d orbitals are available: PCl₅ (10), SF₆ (12), XeF₄ (12). Period-2 atoms (C, N, O, F) can never exceed 8.',
      formulas: ['incomplete: Be, B', 'odd e⁻: NO, NO₂', 'expanded: period 3+ central atom'],
    }, [
      T('When eight isn\'t the rule', `
| Exception | Why | Examples |
|---|---|---|
| incomplete octet | Be and B are content with 4 or 6 | BeCl₂, BF₃ |
| odd-electron | odd total can't all pair | NO, NO₂ |
| expanded octet | period 3+ atoms have room | PCl₅, SF₆, XeF₄, I₃⁻ |
>! C, N, O and F **never** exceed an octet. Only period 3 and lower can expand.`, { fig: D.lewis({ w: 200, h: 160, atoms: [{ e: 'B', x: 100, y: 85 }, { e: 'F', x: 100, y: 25, lp: [0, 90, 180] }, { e: 'F', x: 45, y: 125, lp: [90, 180, 270] }, { e: 'F', x: 155, y: 125, lp: [0, 270, 90] }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], alt: 'BF3: boron with only six electrons' }) }),
      G('c.octet'),
      G('c.octet'),
      MC('Which central atom **cannot** have an expanded octet?', ['N', 'P', 'S', 'Xe'], 'Period-2 atoms have no d orbitals available.'),
      G('c.valcount'),
      TF('NO₂ has an odd number of valence electrons.', true, '5 + 2(6) = 17.'),
      G('c.octet'),
    ]),
  ]);

  CQ.addUnits('chem', [u5, u6, u7]);
})();
