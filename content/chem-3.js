/* CHEM 1311 · Units 8–10: molecular shape & bonding theories, stoichiometry, aqueous reactions (Burdge Ch 7–9) */
(function () {
  const CQ = window.CQ;
  const { L, U, T, EX, MC, MULTI, TF, NUM, TXT, FILL, MATCH, ORDER, G } = CQ.dsl;
  const F = (x, s = 3) => CQ.fmt(x, s);
  const D = CQ.dg;
  const ch = CQ.chem;
  const { EL, parse, molarMass } = CQ.chemkit;
  const uniq = (a) => [...new Set(a)];

  /* ================= molecular geometry data =================
     [formula, charge, domains, lone pairs on central, electron geometry, molecular geometry, angle, hybridization, polar(null for ions)] */
  const MOL = [
    ['CH4', 0, 4, 0, 'tetrahedral', 'tetrahedral', '109.5°', 'sp³', false], ['NH3', 0, 4, 1, 'tetrahedral', 'trigonal pyramidal', 'about 107°', 'sp³', true],
    ['H2O', 0, 4, 2, 'tetrahedral', 'bent', 'about 104.5°', 'sp³', true], ['CO2', 0, 2, 0, 'linear', 'linear', '180°', 'sp', false],
    ['BF3', 0, 3, 0, 'trigonal planar', 'trigonal planar', '120°', 'sp²', false], ['SO2', 0, 3, 1, 'trigonal planar', 'bent', 'slightly less than 120°', 'sp²', true],
    ['CH2O', 0, 3, 0, 'trigonal planar', 'trigonal planar', 'about 120°', 'sp²', true], ['BeCl2', 0, 2, 0, 'linear', 'linear', '180°', 'sp', false],
    ['PCl5', 0, 5, 0, 'trigonal bipyramidal', 'trigonal bipyramidal', '90° and 120°', 'sp³d', false], ['SF4', 0, 5, 1, 'trigonal bipyramidal', 'seesaw', 'less than 90° and 120°', 'sp³d', true],
    ['ClF3', 0, 5, 2, 'trigonal bipyramidal', 'T-shaped', 'slightly less than 90°', 'sp³d', true], ['XeF2', 0, 5, 3, 'trigonal bipyramidal', 'linear', '180°', 'sp³d', false],
    ['SF6', 0, 6, 0, 'octahedral', 'octahedral', '90°', 'sp³d²', false], ['BrF5', 0, 6, 1, 'octahedral', 'square pyramidal', 'slightly less than 90°', 'sp³d²', true],
    ['XeF4', 0, 6, 2, 'octahedral', 'square planar', '90°', 'sp³d²', false], ['CCl4', 0, 4, 0, 'tetrahedral', 'tetrahedral', '109.5°', 'sp³', false],
    ['CHCl3', 0, 4, 0, 'tetrahedral', 'tetrahedral', 'about 109.5°', 'sp³', true], ['PCl3', 0, 4, 1, 'tetrahedral', 'trigonal pyramidal', 'about 107°', 'sp³', true],
    ['H2S', 0, 4, 2, 'tetrahedral', 'bent', 'about 92–104°', 'sp³', true], ['HCN', 0, 2, 0, 'linear', 'linear', '180°', 'sp', true],
    ['SO3', 0, 3, 0, 'trigonal planar', 'trigonal planar', '120°', 'sp²', false], ['O3', 0, 3, 1, 'trigonal planar', 'bent', 'about 117°', 'sp²', true],
    ['NH4', 1, 4, 0, 'tetrahedral', 'tetrahedral', '109.5°', 'sp³', null], ['NO3', -1, 3, 0, 'trigonal planar', 'trigonal planar', '120°', 'sp²', null],
    ['ICl4', -1, 6, 2, 'octahedral', 'square planar', '90°', 'sp³d²', null], ['I3', -1, 5, 3, 'trigonal bipyramidal', 'linear', '180°', 'sp³d', null],
  ];
  const chg = (q) => (q === 0 ? '' : (Math.abs(q) > 1 ? CQ.supNum(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻'));
  const nm = (m) => ch(m[0]) + chg(m[1]);
  const GEOMS = ['linear', 'trigonal planar', 'bent', 'tetrahedral', 'trigonal pyramidal', 'trigonal bipyramidal', 'seesaw', 'T-shaped', 'octahedral', 'square pyramidal', 'square planar'];

  CQ.gen('c.vsepr', (R) => {
    const m = R.pick(MOL);
    const want = R.pick(['mol', 'mol', 'e']);
    const ans = want === 'mol' ? m[5] : m[4];
    const others = R.sample(GEOMS.filter((g) => g !== ans), 3);
    if (want === 'mol' && m[4] !== m[5] && !others.includes(m[4])) others[0] = m[4];
    return { t: 'mc', lvl: 3, q: 'What is the **' + (want === 'mol' ? 'molecular geometry (shape)' : 'electron-domain geometry') + '** of **' + nm(m) + '**?', opts: [want === 'mol' && m[4] !== m[5] ? ans : ans].concat(others).map((o) => (o === m[4] && want === 'mol' && m[4] !== m[5] ? [o, 'That\'s the electron-domain geometry. The shape only counts atoms, not lone pairs.'] : o)),
      steps: ['Central atom: ' + m[2] + ' electron domains (' + (m[2] - m[3]) + ' bonding, ' + m[3] + ' lone pair' + (m[3] === 1 ? '' : 's') + ')', 'Electron-domain geometry: ' + m[4], 'Molecular geometry (atoms only): **' + m[5] + '**'] };
  });

  CQ.gen('c.angle', (R) => {
    const m = R.pick(MOL.filter((x) => x[2] <= 4 || x[3] === 0));
    const all = uniq(MOL.map((x) => x[6]));
    return { t: 'mc', lvl: 3, q: 'What is the approximate bond angle in **' + nm(m) + '**?', opts: [m[6]].concat(R.sample(all.filter((a) => a !== m[6]), 3)),
      why: m[3] ? 'Lone pairs take up more room than bonding pairs, so they squeeze the bond angles below the ideal ' + { 3: '120°', 4: '109.5°', 5: '90°/120°', 6: '90°' }[m[2]] + '.' : 'No lone pairs on the central atom, so you get the ideal angle for ' + m[2] + ' domains.' };
  });

  CQ.gen('c.hybrid', (R) => {
    const m = R.pick(MOL);
    return { t: 'mc', lvl: 3, q: 'What is the hybridization of the central atom in **' + nm(m) + '**?', opts: [m[7]].concat(R.sample(['sp', 'sp²', 'sp³', 'sp³d', 'sp³d²'].filter((x) => x !== m[7]), 3)),
      why: 'Hybrid orbitals = electron domains: 2 → sp, 3 → sp², 4 → sp³, 5 → sp³d, 6 → sp³d². ' + nm(m) + ' has ' + m[2] + ' domains.' };
  });

  CQ.gen('c.polarity', (R) => {
    const m = R.pick(MOL.filter((x) => x[8] !== null));
    return { t: 'mc', lvl: 3, q: 'Is **' + nm(m) + '** polar or nonpolar?', opts: m[8] ? ['polar', 'nonpolar'] : ['nonpolar', 'polar'],
      why: m[8] ? 'Its shape (' + m[5] + ') doesn\'t let the bond dipoles cancel' + (m[0] === 'CHCl3' || m[0] === 'CH2O' || m[0] === 'HCN' ? ', because the outer atoms are not all the same.' : '.') : 'The ' + m[5] + ' shape is symmetric with identical outer atoms, so the bond dipoles cancel.' };
  });

  CQ.gen('c.sigmapi', (R) => {
    const data = [['C2H4', 5, 1, 'H₂C=CH₂'], ['C2H2', 3, 2, 'HC≡CH'], ['CO2', 2, 2, 'O=C=O'], ['HCN', 2, 2, 'H–C≡N'], ['CH2O', 3, 1, 'H₂C=O'], ['N2', 1, 2, 'N≡N'], ['C2H6', 7, 0, 'H₃C–CH₃'], ['C3H4', 6, 2, 'H₂C=C=CH₂'], ['CH3CN', 5, 2, 'H₃C–C≡N'], ['C6H6', 12, 3, 'benzene (alternating C=C in the ring)']];
    const [f, s, p, str] = R.pick(data);
    const want = R.pick(['σ', 'π']);
    return { t: 'num', lvl: 3, q: 'How many **' + want + ' bonds** are in **' + ch(f) + '** (' + str + ')?', a: want === 'σ' ? s : p, unit: '', abs: 0.01,
      steps: ['Every single bond = 1 σ. A double bond = 1 σ + 1 π. A triple bond = 1 σ + 2 π.', 'Total: ' + s + ' σ and ' + p + ' π', 'Answer: **' + (want === 'σ' ? s : p) + '**'] };
  });

  // molecular orbital filling for homonuclear diatomics of the first two periods
  function mo(nVal, heavy) {
    const order = heavy
      ? [['σ2s', 1, 1], ['σ*2s', 1, 0], ['σ2p', 1, 1], ['π2p', 2, 1], ['π*2p', 2, 0], ['σ*2p', 1, 0]]
      : [['σ2s', 1, 1], ['σ*2s', 1, 0], ['π2p', 2, 1], ['σ2p', 1, 1], ['π*2p', 2, 0], ['σ*2p', 1, 0]];
    let left = nVal, b = 0, a = 0, unp = 0;
    for (const [, deg, bond] of order) {
      const n = Math.min(left, 2 * deg);
      left -= n;
      if (bond) b += n; else a += n;
      unp += n <= deg ? n : 2 * deg - n;
    }
    return { bo: (b - a) / 2, unp };
  }
  CQ.gen('c.mo', (R) => {
    const sp = R.pick([['B2', 6, 0], ['C2', 8, 0], ['N2', 10, 0], ['O2', 12, 1], ['F2', 14, 1], ['O2', 11, 1, '⁺'], ['O2', 13, 1, '⁻'], ['O2', 14, 1, '²⁻'], ['N2', 9, 0, '⁺'], ['C2', 10, 0, '²⁻'], ['Ne2', 16, 1]]);
    const r = mo(sp[1], sp[2]);
    const label = ch(sp[0]) + (sp[3] || '');
    if (R.chance(0.55)) return { t: 'num', lvl: 3, q: 'Using molecular orbital theory, what is the **bond order** of **' + label + '**?', a: r.bo, unit: '', abs: 0.01,
      steps: ['Valence electrons: ' + sp[1], 'Fill: σ2s, σ*2s, ' + (sp[2] ? 'σ2p, π2p' : 'π2p, σ2p') + ', π*2p, σ*2p', 'Bond order = ½(bonding − antibonding) = **' + r.bo + '**'] };
    return { t: 'mc', lvl: 3, q: 'According to MO theory, is **' + label + '** paramagnetic or diamagnetic?', opts: r.unp ? ['paramagnetic', 'diamagnetic'] : ['diamagnetic', 'paramagnetic'],
      why: label + ' has ' + r.unp + ' unpaired electron' + (r.unp === 1 ? '' : 's') + ' in its MOs.' + (sp[0] === 'O2' && sp[1] === 12 ? ' O₂\'s two unpaired π* electrons explain why liquid oxygen sticks to a magnet, which Lewis structures can\'t predict.' : '') };
  });

  /* ================= reactions library ================= */
  // [[coef, formula], ...] reactants, products, type
  const RX = [
    [[[2, 'H2'], [1, 'O2']], [[2, 'H2O']], 'combination'], [[[1, 'N2'], [3, 'H2']], [[2, 'NH3']], 'combination'],
    [[[1, 'CH4'], [2, 'O2']], [[1, 'CO2'], [2, 'H2O']], 'combustion'], [[[1, 'C3H8'], [5, 'O2']], [[3, 'CO2'], [4, 'H2O']], 'combustion'],
    [[[2, 'C2H6'], [7, 'O2']], [[4, 'CO2'], [6, 'H2O']], 'combustion'], [[[4, 'Fe'], [3, 'O2']], [[2, 'Fe2O3']], 'combination'],
    [[[2, 'Al'], [3, 'Cl2']], [[2, 'AlCl3']], 'combination'], [[[2, 'KClO3']], [[2, 'KCl'], [3, 'O2']], 'decomposition'],
    [[[1, 'CaCO3']], [[1, 'CaO'], [1, 'CO2']], 'decomposition'], [[[2, 'Na'], [2, 'H2O']], [[2, 'NaOH'], [1, 'H2']], 'single displacement'],
    [[[1, 'C6H12O6'], [6, 'O2']], [[6, 'CO2'], [6, 'H2O']], 'combustion'], [[[2, 'C8H18'], [25, 'O2']], [[16, 'CO2'], [18, 'H2O']], 'combustion'],
    [[[1, 'Fe2O3'], [3, 'CO']], [[2, 'Fe'], [3, 'CO2']], 'other'], [[[4, 'NH3'], [5, 'O2']], [[4, 'NO'], [6, 'H2O']], 'other'],
    [[[2, 'Mg'], [1, 'O2']], [[2, 'MgO']], 'combination'], [[[2, 'H2O2']], [[2, 'H2O'], [1, 'O2']], 'decomposition'],
    [[[2, 'C2H2'], [5, 'O2']], [[4, 'CO2'], [2, 'H2O']], 'combustion'], [[[1, 'P4'], [5, 'O2']], [[1, 'P4O10']], 'combination'],
    [[[2, 'Al'], [1, 'Fe2O3']], [[1, 'Al2O3'], [2, 'Fe']], 'single displacement'], [[[1, 'Zn'], [2, 'HCl']], [[1, 'ZnCl2'], [1, 'H2']], 'single displacement'],
    [[[2, 'NaN3']], [[2, 'Na'], [3, 'N2']], 'decomposition'], [[[1, 'C2H5OH'], [3, 'O2']], [[2, 'CO2'], [3, 'H2O']], 'combustion'],
  ];
  // self-check: every reaction must balance
  RX.forEach(([re, pr]) => {
    const tally = (side) => side.reduce((acc, [c, f]) => { const p = parse(f); for (const k in p) acc[k] = (acc[k] || 0) + c * p[k]; return acc; }, {});
    const a = tally(re), b = tally(pr);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k]) throw new Error('Unbalanced reaction in library: ' + JSON.stringify(re) + ' → ' + JSON.stringify(pr));
  });
  const side = (s, coefs) => s.map(([c, f]) => (coefs && c > 1 ? c + ' ' : '') + ch(f)).join(' + ');
  const eqn = (r, coefs = true) => side(r[0], coefs) + ' → ' + side(r[1], coefs);
  CQ.chemkit.RX = RX;
  CQ.chemkit.eqn = eqn;

  CQ.gen('c.balance', (R) => {
    const r = R.pick(RX);
    const all = r[0].concat(r[1]);
    const [c, f] = R.pick(all.filter((x) => all.length > 2 || x[0] > 1));
    if (R.chance(0.5)) return { t: 'num', lvl: 3, q: 'Balance with the smallest whole-number coefficients:\n\n**' + eqn(r, false) + '**\n\nWhat is the coefficient of **' + ch(f) + '**?', a: c, unit: '', abs: 0.01,
      hint: r[2] === 'combustion' ? 'For combustion: balance C first, then H, then O last. If O needs a half, double everything.' : 'Balance the element that appears in the fewest formulas first. Leave H and O (or a lone element) for last.',
      steps: ['Balanced: **' + eqn(r) + '**', 'Coefficient of ' + ch(f) + ' = **' + c + '**'] };
    const coefs = all.map((x) => x[0]);
    const fmt = (cs) => cs.join(', ');
    const w1 = coefs.map((x) => x * 2), w2 = coefs.map((x, i) => (i === 0 ? x + 1 : x)), w3 = coefs.map((x, i) => (i === coefs.length - 1 ? Math.max(1, x - 1) : x)), w4 = coefs.map((x, i) => (i === 1 ? x + 2 : x));
    const opts = [fmt(coefs)];
    const add = (o) => { const t = Array.isArray(o) ? o[0] : o; if (opts.length < 4 && !opts.some((x) => (Array.isArray(x) ? x[0] : x) === t)) opts.push(o); };
    add([fmt(w1), 'Balanced, but not the smallest whole numbers. Divide by 2.']); add(fmt(w2)); add(fmt(w3)); add(fmt(w4));
    return { t: 'mc', lvl: 3, q: 'Which coefficients (in order) correctly balance **' + eqn(r, false) + '** with the smallest whole numbers?', opts,
      why: 'Balanced: ' + eqn(r) + '.' };
  });

  CQ.gen('c.rxtype', (R) => {
    const r = R.pick(RX.filter((x) => x[2] !== 'other'));
    return { t: 'mc', lvl: 1, q: 'What type of reaction is **' + eqn(r) + '**?', opts: [r[2]].concat(['combination', 'decomposition', 'combustion', 'single displacement'].filter((x) => x !== r[2])),
      why: { combination: 'Two or more reactants → one product.', decomposition: 'One reactant breaks into two or more products.', combustion: 'A fuel burns in O₂, giving CO₂ and H₂O for hydrocarbons.', 'single displacement': 'An element replaces another element in a compound.' }[r[2]] };
  });

  CQ.gen('c.stoich', (R) => {
    const r = R.pick(RX);
    const all = r[0].concat(r[1]);
    const A = R.pick(r[0]), B = R.pick(all.filter((x) => x !== A));
    const MA = molarMass(A[1]), MB = molarMass(B[1]);
    const gA = R.pick([5.00, 10.0, 12.5, 25.0, 50.0, 100.]);
    const molA = gA / MA, molB = (molA * B[0]) / A[0], gB = molB * MB;
    return { t: 'num', lvl: 3, q: 'For **' + eqn(r) + '**, how many grams of **' + ch(B[1]) + '** ' + (r[1].includes(B) ? 'form' : 'react') + ' from **' + gA + ' g** of **' + ch(A[1]) + '** (with the other reactants in excess)?', a: gB, unit: 'g',
      hint: 'grams A → moles A → (mole ratio) → moles B → grams B',
      steps: ['mol ' + ch(A[1]) + ' = ' + gA + ' g ÷ ' + F(MA, 4) + ' g/mol = ' + F(molA) + ' mol', 'mole ratio ' + B[0] + ' ' + ch(B[1]) + ' : ' + A[0] + ' ' + ch(A[1]) + ' → ' + F(molB) + ' mol ' + ch(B[1]), 'grams = ' + F(molB) + ' × ' + F(MB, 4) + ' = **' + F(gB) + ' g**'] };
  });

  CQ.gen('c.limiting', (R) => {
    const r = R.pick(RX.filter((x) => x[0].length === 2));
    const [A, B] = r[0];
    const P = R.pick(r[1]);
    const MA = molarMass(A[1]), MB = molarMass(B[1]), MP = molarMass(P[1]);
    const gA = R.pick([10.0, 20.0, 25.0, 40.0, 50.0]), gB = R.pick([10.0, 20.0, 30.0, 50.0, 64.0]);
    const nA = gA / MA, nB = gB / MB;
    const limA = nA / A[0] < nB / B[0];
    const lim = limA ? A : B, nLim = limA ? nA : nB;
    const gP = ((nLim * P[0]) / lim[0]) * MP;
    const want = R.pick(['lim', 'yield']);
    const head = 'For **' + eqn(r) + '**, you mix **' + gA + ' g ' + ch(A[1]) + '** with **' + gB + ' g ' + ch(B[1]) + '**. ';
    const steps = ['mol ' + ch(A[1]) + ' = ' + F(nA) + ', ÷ coefficient ' + A[0] + ' = ' + F(nA / A[0]), 'mol ' + ch(B[1]) + ' = ' + F(nB) + ', ÷ coefficient ' + B[0] + ' = ' + F(nB / B[0]), 'Smaller ratio → limiting reactant: **' + ch(lim[1]) + '**'];
    if (want === 'lim') return { t: 'mc', lvl: 3, q: head + 'Which is the limiting reactant?', opts: [ch(lim[1]), ch((limA ? B : A)[1])], steps, why: 'Compare moles ÷ coefficient, not grams.' };
    return { t: 'num', lvl: 4, exam: true, q: head + 'What is the theoretical yield of **' + ch(P[1]) + '** in grams?', a: gP, unit: 'g', steps: steps.concat(['mol ' + ch(P[1]) + ' = ' + F(nLim) + ' × ' + P[0] + '/' + lim[0] + ' = ' + F((nLim * P[0]) / lim[0]), 'mass = × ' + F(MP, 4) + ' = **' + F(gP) + ' g**']),
      hint: 'Find which reactant runs out first: compare mol ÷ coefficient for each.' };
  });

  CQ.gen('c.pyield', (R) => {
    const theo = R.pick([12.5, 25.0, 40.0, 56.8, 100.]), frac = R.pick([0.65, 0.72, 0.8, 0.88, 0.93]);
    const act = +(theo * frac).toFixed(2);
    return { t: 'num', q: 'A reaction has a theoretical yield of **' + theo + ' g**, but you collect only **' + act + ' g** of product. What is the percent yield?', a: (100 * act) / theo, unit: '%',
      steps: ['% yield = [[actual|theoretical]] × 100', '= ' + act + '/' + theo + ' × 100 = **' + F((100 * act) / theo) + '%**'] };
  });

  /* ================= aqueous data ================= */
  const SOL = [
    ['NaCl', true, 'Group 1 compounds are always soluble.'], ['KNO3', true, 'Nitrates are always soluble.'], ['AgCl', false, 'Chlorides are soluble except with Ag⁺, Hg₂²⁺ and Pb²⁺.'],
    ['BaSO4', false, 'Sulfates are soluble except with Ba²⁺, Sr²⁺, Ca²⁺, Pb²⁺, Hg₂²⁺ and Ag⁺.'], ['CaCO3', false, 'Carbonates are insoluble except with group 1 and NH₄⁺.'],
    ['(NH4)2CO3', true, 'Ammonium compounds are always soluble.'], ['PbI2', false, 'Iodides are soluble except with Ag⁺, Hg₂²⁺ and Pb²⁺.'], ['Fe(OH)3', false, 'Hydroxides are insoluble except with group 1, NH₄⁺ and Ba²⁺ (Ca/Sr slightly).'],
    ['NaOH', true, 'Group 1 hydroxides are soluble.'], ['CuSO4', true, 'Most sulfates are soluble. Cu²⁺ isn\'t one of the exceptions.'], ['Ca3(PO4)2', false, 'Phosphates are insoluble except with group 1 and NH₄⁺.'],
    ['ZnS', false, 'Sulfides are insoluble except with group 1, group 2 and NH₄⁺.'], ['Mg(C2H3O2)2', true, 'Acetates are always soluble.'], ['Ba(NO3)2', true, 'Nitrates are always soluble.'],
    ['K3PO4', true, 'Group 1 phosphates are soluble.'], ['Mg(OH)2', false, 'Hydroxides are mostly insoluble.'], ['PbCl2', false, 'Pb²⁺ chloride is an exception: insoluble.'], ['NH4Cl', true, 'Ammonium compounds are always soluble.'],
  ];
  CQ.gen('c.soluble', (R) => {
    const [f, s, why] = R.pick(SOL);
    return { t: 'mc', lvl: 2, q: 'Is **' + ch(f) + '** soluble or insoluble in water?', opts: s ? ['soluble', 'insoluble'] : ['insoluble', 'soluble'], why };
  });

  CQ.gen('c.electrolyte', (R) => {
    const items = [['HCl', 'strong electrolyte', 'strong acid'], ['NaCl', 'strong electrolyte', 'soluble ionic compound'], ['KOH', 'strong electrolyte', 'strong base'], ['HNO3', 'strong electrolyte', 'strong acid'], ['HC2H3O2', 'weak electrolyte', 'weak acid'], ['NH3', 'weak electrolyte', 'weak base'], ['HF', 'weak electrolyte', 'weak acid'], ['C6H12O6', 'nonelectrolyte', 'molecular, doesn\'t ionize'], ['C2H5OH', 'nonelectrolyte', 'molecular, doesn\'t ionize'], ['C12H22O11', 'nonelectrolyte', 'sugar, molecular']];
    const [f, ans, why] = R.pick(items);
    return { t: 'mc', lvl: 2, q: 'In water, **' + ch(f) + '** is a…', opts: [ans].concat(['strong electrolyte', 'weak electrolyte', 'nonelectrolyte'].filter((x) => x !== ans)), why: ch(f) + ' is a ' + why + '.' };
  });

  const PRECIP = [
    ['AgNO3', 'NaCl', 'AgCl', 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)', 'Na⁺, NO₃⁻'], ['BaCl2', 'Na2SO4', 'BaSO4', 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)', 'Na⁺, Cl⁻'],
    ['Pb(NO3)2', 'KI', 'PbI2', 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)', 'K⁺, NO₃⁻'], ['CaCl2', 'Na2CO3', 'CaCO3', 'Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)', 'Na⁺, Cl⁻'],
    ['FeCl3', 'NaOH', 'Fe(OH)3', 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)', 'Na⁺, Cl⁻'], ['CuSO4', 'Na2S', 'CuS', 'Cu²⁺(aq) + S²⁻(aq) → CuS(s)', 'Na⁺, SO₄²⁻'],
    ['MgCl2', 'KOH', 'Mg(OH)2', 'Mg²⁺(aq) + 2OH⁻(aq) → Mg(OH)₂(s)', 'K⁺, Cl⁻'], ['KNO3', 'NaCl', null, 'no reaction', 'all ions'],
  ];
  CQ.gen('c.precip', (R) => {
    const [a, b, p, net, spect] = R.pick(PRECIP);
    if (R.chance(0.5) || !p) {
      const opts = p ? [ch(p), 'No precipitate forms'].concat(R.sample(['NaNO3', 'KCl', 'NaCl', 'K2SO4', 'NaOH'].map(ch), 2)) : ['No precipitate forms', 'NaNO₃', 'KCl', 'KNO₃'];
      return { t: 'mc', lvl: 3, q: 'Aqueous **' + ch(a) + '** and **' + ch(b) + '** are mixed. What precipitate forms?', opts: uniq(opts), why: p ? 'Swap partners: the new pairs are ' + ch(p) + ' (insoluble) and a soluble salt. Spectator ions: ' + spect + '.' : 'Every possible combination is soluble, so all the ions stay in solution.' };
    }
    const wrongs = [net.replace('(s)', '(aq)'), 'Na⁺(aq) + Cl⁻(aq) → NaCl(s)', ch(a) + '(aq) + ' + ch(b) + '(aq) → ' + ch(p) + '(s) + spectators'];
    return { t: 'mc', lvl: 4, q: 'What is the **net ionic equation** when aqueous **' + ch(a) + '** and **' + ch(b) + '** are mixed?', opts: uniq([net].concat(wrongs)), why: 'Write all strong electrolytes as ions, cancel the spectators (' + spect + '), and keep only what forms the solid.' };
  });

  CQ.gen('c.neutral', (R) => {
    const items = [['HCl', 'NaOH', 'H⁺(aq) + OH⁻(aq) → H₂O(l)', 'NaCl'], ['HNO3', 'KOH', 'H⁺(aq) + OH⁻(aq) → H₂O(l)', 'KNO₃'], ['HC2H3O2', 'NaOH', 'HC₂H₃O₂(aq) + OH⁻(aq) → C₂H₃O₂⁻(aq) + H₂O(l)', 'NaC₂H₃O₂'], ['HCl', 'NH3', 'H⁺(aq) + NH₃(aq) → NH₄⁺(aq)', 'NH₄Cl'], ['HF', 'KOH', 'HF(aq) + OH⁻(aq) → F⁻(aq) + H₂O(l)', 'KF']];
    const [a, b, net, salt] = R.pick(items);
    return { t: 'mc', lvl: 3, q: 'What is the **net ionic equation** for the reaction of **' + ch(a) + '** with **' + ch(b) + '**?', opts: uniq([net, 'H⁺(aq) + OH⁻(aq) → H₂O(l)', ch(a) + '(aq) + ' + ch(b) + '(aq) → ' + salt + '(aq) + H₂O(l)', 'Na⁺(aq) + Cl⁻(aq) → NaCl(aq)']).slice(0, 4),
      why: (a === 'HCl' || a === 'HNO3') && b !== 'NH3' ? 'Strong acid + strong base: only H⁺ + OH⁻ → H₂O is left after the spectators cancel.' : 'Weak acids and weak bases are written as molecules, because they barely ionize.' };
  });

  const OX = [['H2SO4', 'S', 6], ['SO2', 'S', 4], ['H2S', 'S', -2], ['SO3²⁻', 'S', 4, 'SO3', -2], ['S2O3²⁻', 'S', 2, 'S2O3', -2], ['NO3⁻', 'N', 5, 'NO3', -1], ['NH3', 'N', -3], ['NO2', 'N', 4], ['N2O', 'N', 1], ['NH4⁺', 'N', -3, 'NH4', 1], ['HNO2', 'N', 3],
    ['MnO4⁻', 'Mn', 7, 'MnO4', -1], ['MnO2', 'Mn', 4], ['Cr2O7²⁻', 'Cr', 6, 'Cr2O7', -2], ['CrO4²⁻', 'Cr', 6, 'CrO4', -2], ['CO2', 'C', 4], ['CH4', 'C', -4], ['CO', 'C', 2], ['ClO4⁻', 'Cl', 7, 'ClO4', -1], ['ClO⁻', 'Cl', 1, 'ClO', -1], ['ClO3⁻', 'Cl', 5, 'ClO3', -1],
    ['PO4³⁻', 'P', 5, 'PO4', -3], ['Fe2O3', 'Fe', 3], ['NaH', 'H', -1], ['H2O2', 'O', -1], ['Cl2', 'Cl', 0], ['K2Cr2O7', 'Cr', 6], ['KMnO4', 'Mn', 7], ['Na2O2', 'O', -1]];
  CQ.gen('c.oxnum', (R) => {
    const [label, el, ans] = R.pick(OX);
    const disp = /[⁺⁻]/.test(label) ? ch(label.replace(/[²³⁺⁻]+$/, '')) + label.match(/[²³⁺⁻]+$/)[0] : ch(label);
    return { t: 'num', lvl: 3, q: 'What is the oxidation number of **' + el + '** in **' + disp + '**?', a: ans, unit: '', abs: 0.01,
      hint: 'Rules: O is usually −2 (−1 in peroxides), H is usually +1 (−1 with metals), group 1 metals +1, group 2 +2. Everything must add up to the overall charge.',
      steps: ['Assign the known atoms (O = ' + (label.includes('O2') && (label === 'H2O2' || label === 'Na2O2') ? '−1, peroxide' : '−2') + ', H = ' + (label === 'NaH' ? '−1 in a metal hydride' : '+1') + ', group 1 = +1)', 'Set the sum equal to the overall charge and solve', el + ' = **' + (ans > 0 ? '+' : '') + ans + '**'] };
  });

  CQ.gen('c.redox', (R) => {
    const items = [['Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)', 'Zn', 'Cu²⁺'], ['2Mg(s) + O₂(g) → 2MgO(s)', 'Mg', 'O₂'], ['Fe(s) + 2H⁺(aq) → Fe²⁺(aq) + H₂(g)', 'Fe', 'H⁺'], ['2Na(s) + Cl₂(g) → 2NaCl(s)', 'Na', 'Cl₂'], ['Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)', 'Cu', 'Ag⁺'], ['2Al(s) + 3Cl₂(g) → 2AlCl₃(s)', 'Al', 'Cl₂']];
    const [eq, red, ox] = R.pick(items);
    const want = R.pick(['oxidized', 'reducing', 'oxidizing', 'reduced']);
    const ans = want === 'oxidized' || want === 'reducing' ? red : ox;
    return { t: 'mc', lvl: 3, q: 'In **' + eq + '**, which species is ' + { oxidized: '**oxidized**', reduced: '**reduced**', reducing: 'the **reducing agent**', oxidizing: 'the **oxidizing agent**' }[want] + '?', opts: [ans, ans === red ? ox : red].concat(R.sample(['H₂O', 'the spectator ion', 'O²⁻', 'e⁻'], 2)),
      why: red + ' loses electrons (oxidized), so it is the reducing agent. ' + ox + ' gains electrons (reduced), so it is the oxidizing agent. "OIL RIG": Oxidation Is Loss, Reduction Is Gain.' };
  });

  const ACT = ['Li', 'K', 'Ba', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Cd', 'Co', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Hg', 'Pt', 'Au'];
  CQ.gen('c.activity', (R) => {
    const pairs = [['Zn', 'Cu²⁺', 'Cu'], ['Cu', 'Ag⁺', 'Ag'], ['Fe', 'Cu²⁺', 'Cu'], ['Cu', 'Zn²⁺', 'Zn'], ['Ag', 'Cu²⁺', 'Cu'], ['Mg', 'H⁺', 'H'], ['Cu', 'H⁺', 'H'], ['Al', 'Fe²⁺', 'Fe'], ['Pb', 'Zn²⁺', 'Zn'], ['Ni', 'Pb²⁺', 'Pb']];
    const [m, ion, ionEl] = R.pick(pairs);
    const yes = ACT.indexOf(m) < ACT.indexOf(ionEl);
    return { t: 'mc', lvl: 3, q: 'Will **' + m + '(s)** react with a solution containing **' + ion + '**?', opts: yes ? ['Yes, ' + m + ' displaces ' + ionEl, 'No reaction'] : ['No reaction', 'Yes, ' + m + ' displaces ' + ionEl],
      why: 'Activity series (most → least active): … ' + ACT.slice(ACT.indexOf('Mg'), ACT.indexOf('Au') + 1).join(' > ') + '. A metal only displaces ions of metals **below** it.' };
  });

  CQ.gen('c.molarity', (R) => {
    const k = R.int(0, 3);
    const solutes = ['NaCl', 'KCl', 'NaOH', 'C6H12O6', 'CuSO4', 'KMnO4', 'CaCl2'];
    const f = R.pick(solutes), M = molarMass(f);
    if (k === 0) { const g = R.pick([5.85, 10.0, 25.0, 40.0]), V = R.pick([250, 500, 750, 1000]); return { t: 'num', q: '**' + g + ' g** of **' + ch(f) + '** is dissolved to make **' + V + ' mL** of solution. What is the molarity?', a: g / M / (V / 1000), unit: 'M', steps: ['mol = ' + g + '/' + F(M, 4) + ' = ' + F(g / M) + ' mol', 'L = ' + V / 1000, 'M = mol/L = **' + F(g / M / (V / 1000)) + ' M**'] }; }
    if (k === 1) { const Mo = R.pick([0.100, 0.250, 0.500, 1.50]), V = R.pick([100, 250, 500]); return { t: 'num', q: 'How many grams of **' + ch(f) + '** are needed to make **' + V + ' mL** of a **' + Mo + ' M** solution?', a: Mo * (V / 1000) * M, unit: 'g', steps: ['mol = M × L = ' + Mo + ' × ' + V / 1000 + ' = ' + F(Mo * V / 1000) + ' mol', 'g = mol × ' + F(M, 4) + ' = **' + F(Mo * (V / 1000) * M) + ' g**'] }; }
    if (k === 2) { const M1 = R.pick([6.0, 12.0, 2.0, 1.0]), V2 = R.pick([250, 500, 1000]), M2 = R.pick([0.10, 0.25, 0.50]); return { t: 'num', q: 'What volume (in mL) of **' + M1 + ' M** stock solution is needed to make **' + V2 + ' mL** of **' + M2 + ' M** solution?', a: (M2 * V2) / M1, unit: 'mL', steps: ['M₁V₁ = M₂V₂', 'V₁ = ' + M2 + ' × ' + V2 + '/' + M1 + ' = **' + F((M2 * V2) / M1) + ' mL**'] }; }
    const M1 = R.pick([0.50, 1.20, 2.00]), V1 = R.pick([25.0, 50.0, 100.]), V2 = R.pick([250, 500]);
    return { t: 'num', q: '**' + V1 + ' mL** of **' + M1 + ' M** HCl is diluted to **' + V2 + ' mL**. What is the new concentration?', a: (M1 * V1) / V2, unit: 'M', steps: ['M₂ = M₁V₁/V₂ = ' + M1 + ' × ' + V1 + '/' + V2 + ' = **' + F((M1 * V1) / V2) + ' M**'] };
  });

  CQ.gen('c.titration', (R) => {
    const acid = R.pick([['HCl', 1], ['HNO3', 1], ['H2SO4', 2]]);
    const Ma = R.pick([0.100, 0.150, 0.200, 0.250]), Va = R.pick([20.0, 25.0, 30.0, 50.0]), Mb = R.pick([0.100, 0.125, 0.200]);
    const want = R.pick(['Vb', 'Ma']);
    const molA = Ma * Va / 1000, molB = molA * acid[1], Vb = (molB / Mb) * 1000;
    if (want === 'Vb') return { t: 'num', lvl: acid[1] > 1 ? 4 : 3, q: 'What volume of **' + Mb + ' M NaOH** is needed to neutralize **' + Va + ' mL** of **' + Ma + ' M ' + ch(acid[0]) + '**?', a: Vb, unit: 'mL',
      steps: ['mol ' + ch(acid[0]) + ' = ' + Ma + ' × ' + Va / 1000 + ' = ' + F(molA) + ' mol', 'Each ' + ch(acid[0]) + ' needs ' + acid[1] + ' OH⁻ → ' + F(molB) + ' mol NaOH', 'V = mol/M = ' + F(molB) + '/' + Mb + ' = ' + F(Vb / 1000) + ' L = **' + F(Vb) + ' mL**'],
      why: acid[1] > 1 ? 'H₂SO₄ is diprotic: each molecule supplies 2 H⁺. M₁V₁ = M₂V₂ only works for 1:1 reactions.' : '' };
    return { t: 'num', lvl: 4, exam: true, q: 'A **' + Va + ' mL** sample of ' + ch(acid[0]) + ' of unknown concentration is titrated to the endpoint with **' + F(Vb) + ' mL** of **' + Mb + ' M NaOH**. What is the acid\'s molarity?', a: Ma, unit: 'M',
      steps: ['mol NaOH = ' + Mb + ' × ' + F(Vb / 1000) + ' = ' + F(molB) + ' mol', 'mol acid = mol NaOH ÷ ' + acid[1] + ' = ' + F(molA) + ' mol', 'M = ' + F(molA) + '/' + Va / 1000 + ' L = **' + F(Ma) + ' M**'] };
  });

  /* ================= Unit 8 ================= */
  const u8 = U('c8', 'Shapes & Bonding Theories', { sub: 'VSEPR, polarity, hybridization & MO theory', ch: 'Ch 7' }, [
    L('c8l1', 'VSEPR: Electron-Domain Geometry', {
      goal: 'Count electron domains and assign the electron-domain geometry.',
      key: 'Electron domains around the central atom repel each other and spread out as far as possible (VSEPR). Each lone pair counts as one domain, and so does each bond, whether single, double or triple. 2 domains → linear (180°), 3 → trigonal planar (120°), 4 → tetrahedral (109.5°), 5 → trigonal bipyramidal (90° and 120°), 6 → octahedral (90°).',
      formulas: ['2 linear 180° · 3 trigonal planar 120° · 4 tetrahedral 109.5°', '5 trigonal bipyramidal 90°/120° · 6 octahedral 90°'],
    }, [
      T('Electrons push apart', `
**VSEPR** (valence-shell electron-pair repulsion): electron domains around the central atom spread out as far as they can.
**What counts as one domain:** each lone pair, and each bond. A double or triple bond still counts as **one** domain.
| Domains | Electron-domain geometry | Ideal angle |
|---|---|---|
| 2 | linear | 180° |
| 3 | trigonal planar | 120° |
| 4 | tetrahedral | 109.5° |
| 5 | trigonal bipyramidal | 90°, 120° |
| 6 | octahedral | 90° |`),
      EX('Count the domains in CO₂', 'Find the electron-domain geometry of CO₂.', ['Lewis structure: O=C=O, no lone pairs on C', 'Two double bonds = **2 domains**', 'Electron-domain geometry: **linear**, 180°']),
      MC('How many electron domains surround the central atom in CH₂O (formaldehyde)?', ['3', '4', '2', '5'], 'Two C–H bonds and one C=O. The double bond counts once.'),
      G('c.vsepr'),
      MATCH('Match the number of electron domains to the geometry.', [['2', 'linear'], ['3', 'trigonal planar'], ['4', 'tetrahedral'], ['6', 'octahedral']]),
      TF('A triple bond counts as three electron domains.', false, 'Any bond between the same two atoms is one domain.'),
      G('c.vsepr'),
    ]),
    L('c8l2', 'Molecular Shape & Bond Angles', {
      goal: 'Name the molecular geometry when lone pairs are present and predict angle distortions.',
      key: 'Molecular geometry describes only where the ATOMS are. Lone pairs shape it but aren\'t "seen". Tetrahedral family: 1 LP → trigonal pyramidal (NH₃, about 107°), 2 LP → bent (H₂O, about 104.5°). Trigonal planar with 1 LP → bent (SO₂). Trigonal bipyramidal: 1 LP seesaw, 2 LP T-shaped, 3 LP linear (lone pairs go equatorial). Octahedral: 1 LP square pyramidal, 2 LP square planar. Lone pairs repel more than bonding pairs, so the angles shrink.',
      formulas: ['4 domains: 0 LP tetrahedral · 1 LP trigonal pyramidal · 2 LP bent', '5: seesaw · T-shaped · linear', '6: square pyramidal · square planar'],
    }, [
      T('Lone pairs are invisible but pushy', `
| Domains | Lone pairs | Shape | Example |
|---|---|---|---|
| 3 | 1 | bent | SO₂ |
| 4 | 1 | trigonal pyramidal | NH₃ |
| 4 | 2 | bent | H₂O |
| 5 | 1 | seesaw | SF₄ |
| 5 | 2 | T-shaped | ClF₃ |
| 5 | 3 | linear | XeF₂ |
| 6 | 1 | square pyramidal | BrF₅ |
| 6 | 2 | square planar | XeF₄ |
>* Lone pairs take up more space than bonds and squeeze the angles: CH₄ 109.5° → NH₃ 107° → H₂O 104.5°.
>! The **shape** only describes the atoms. H₂O's electron geometry is tetrahedral, but its shape is **bent**.`),
      G('c.vsepr'),
      G('c.angle'),
      MC('Why is the H–O–H angle in water smaller than 109.5°?', ['Lone pairs repel more strongly than bonding pairs', 'Hydrogen atoms attract each other', 'Oxygen is sp² hybridized', 'The molecule is linear'], 'Two lone pairs compress the bonding pairs together.'),
      G('c.vsepr'),
      G('c.angle'),
      TF('XeF₄ has a square planar molecular geometry.', true, '6 domains with 2 lone pairs opposite each other → square planar.'),
      G('c.vsepr'),
    ]),
    L('c8l3', 'Molecular Polarity', {
      goal: 'Decide whether a molecule is polar from its bonds and shape.',
      key: 'A molecule is polar if it has polar bonds AND a shape in which the bond dipoles don\'t cancel. Symmetric shapes with identical outer atoms are nonpolar even if the bonds are polar: CO₂, BF₃, CCl₄, PCl₅, SF₆, XeF₄, XeF₂. Lone pairs on the central atom (NH₃, H₂O, SO₂, SF₄) or different outer atoms (CHCl₃, CH₂O, HCN) usually make a molecule polar.',
      formulas: ['polar bonds + asymmetric shape → polar', 'symmetric + identical outer atoms → nonpolar'],
    }, [
      T('Do the dipoles cancel?', `
Each polar bond is a little vector pointing toward the more electronegative atom. Add them up:
- **CO₂** (linear): two equal dipoles pointing opposite ways → cancel → **nonpolar**
- **H₂O** (bent): dipoles add up → **polar**
- **CCl₄** (tetrahedral, 4 identical): cancel → **nonpolar**
- **CHCl₃** (tetrahedral, not identical): don't cancel → **polar**
>* Quick test: lone pairs on the central atom, or mixed outer atoms → probably polar. Perfectly symmetric with identical outer atoms → nonpolar.`),
      G('c.polarity'),
      G('c.polarity'),
      MC('CO₂ has polar C=O bonds. Why is the molecule nonpolar?', ['Its linear shape makes the two bond dipoles cancel', 'C and O have the same electronegativity', 'It has no lone pairs anywhere', 'Double bonds are never polar'], 'Equal and opposite vectors add to zero.'),
      G('c.polarity'),
      TF('A molecule with polar bonds must be polar.', false, 'Symmetry can cancel the bond dipoles (CO₂, CCl₄, BF₃).'),
      G('c.polarity'),
    ]),
    L('c8l4', 'Hybridization & σ/π Bonds', {
      goal: 'Assign hybridization and count σ and π bonds.',
      key: 'Valence bond theory: atoms mix (hybridize) atomic orbitals to match the electron-domain geometry. Number of domains = number of hybrid orbitals: 2 sp (linear), 3 sp² (trigonal planar), 4 sp³ (tetrahedral), 5 sp³d, 6 sp³d². σ bonds are head-on overlap, and every bond has exactly one. π bonds are side-by-side overlap of unhybridized p orbitals. A double bond = 1σ + 1π, a triple bond = 1σ + 2π.',
      formulas: ['2 sp · 3 sp² · 4 sp³ · 5 sp³d · 6 sp³d²', 'single = σ · double = σ + π · triple = σ + 2π'],
    }, [
      T('Mixing orbitals to fit the shape', `
| Domains | Hybridization | Geometry |
|---|---|---|
| 2 | sp | linear |
| 3 | sp² | trigonal planar |
| 4 | sp³ | tetrahedral |
| 5 | sp³d | trigonal bipyramidal |
| 6 | sp³d² | octahedral |
**σ vs π:** every bond contains one **σ** (head-on overlap). Extra bonds in a double or triple bond are **π** (side-by-side p overlap).
>* Count σ = number of bonded atom pairs. Count π = number of extra bonds in double and triple bonds.`),
      EX('Ethylene, C₂H₄', 'Find the hybridization of each C and count σ and π bonds in H₂C=CH₂.', ['Each C: 3 domains (2 C–H + 1 C=C) → **sp²**', 'σ bonds: 4 C–H + 1 C–C = **5 σ**', 'π bonds: the second bond of C=C = **1 π**']),
      G('c.hybrid'),
      G('c.sigmapi'),
      G('c.hybrid'),
      MC('What hybridization does a carbon with a triple bond (as in HC≡CH) have?', ['sp', 'sp²', 'sp³', 'sp³d'], 'Two domains (one C–H, one C≡C) → sp.'),
      G('c.sigmapi'),
      TF('A double bond consists of two σ bonds.', false, 'One σ + one π.'),
    ]),
    L('c8l5', 'Molecular Orbital Theory', {
      goal: 'Fill MO diagrams for diatomics, and find bond order and magnetism.',
      key: 'Atomic orbitals combine into bonding MOs (lower energy, electrons between the nuclei) and antibonding MOs (marked *, higher energy). Bond order = ½(bonding e⁻ − antibonding e⁻). BO 0 means the molecule doesn\'t exist (He₂, Ne₂). Higher BO means a stronger, shorter bond. Filling order for B₂–N₂: σ2s, σ*2s, π2p, σ2p, π*2p, σ*2p. For O₂–Ne₂, σ2p drops below π2p. Unpaired electrons mean paramagnetic. O₂ has two unpaired π* electrons, which explains its paramagnetism (Lewis structures can\'t).',
      formulas: ['BO = ½(bonding − antibonding)', 'O₂: BO 2, paramagnetic · N₂: BO 3, diamagnetic'],
    }, [
      T('Orbitals that belong to the whole molecule', `
Two atomic orbitals combine into two **molecular orbitals**:
- **bonding** (σ, π): lower energy, holds the atoms together
- **antibonding** (σ*, π*): higher energy, pushes them apart
$$ bond order = ½(bonding e⁻ − antibonding e⁻) $$
| Molecule | Valence e⁻ | Bond order | Magnetism |
|---|---|---|---|
| N₂ | 10 | 3 | diamagnetic |
| O₂ | 12 | 2 | **paramagnetic** |
| F₂ | 14 | 1 | diamagnetic |
| Ne₂ | 16 | 0 | doesn't exist |
>* MO theory's big win: it predicts that O₂ has **two unpaired electrons** (in π*2p). Liquid oxygen really does stick to a magnet.`),
      G('c.mo'),
      G('c.mo'),
      MC('What does a bond order of zero mean?', ['The molecule is not stable and doesn\'t form', 'The bond is a single bond', 'The molecule is ionic', 'The molecule is paramagnetic'], 'Antibonding cancels bonding, so there is no net bond.'),
      G('c.mo'),
      TF('Adding an electron to O₂ (making O₂⁻) increases its bond order.', false, 'The extra electron goes into π*, which lowers BO from 2 to 1.5.'),
      G('c.mo'),
    ]),
  ]);

  /* ================= Unit 9 ================= */
  const u9 = U('c9', 'Reactions & Stoichiometry', { sub: 'Balancing, mole ratios, limiting reactant & yield', ch: 'Ch 8' }, [
    L('c9l1', 'Balancing Equations', {
      goal: 'Balance chemical equations with the smallest whole-number coefficients.',
      key: 'Atoms are conserved, so every element must have the same count on both sides. Change only coefficients, never subscripts (that would change the substance). Strategy: balance elements that appear in only one reactant and one product first, polyatomic ions as units, and H and O (or lone elements like O₂) last. For combustion: C, then H, then O. If you need ½ O₂, double everything. Finish by reducing to the smallest whole numbers.',
      formulas: ['change coefficients, never subscripts', 'combustion: C → H → O'],
    }, [
      T('Atoms in = atoms out', `
A balanced equation has the same number of each kind of atom on both sides.
$$ C₃H₈ + 5O₂ → 3CO₂ + 4H₂O $$
**Strategy for combustion:**
1. Balance **C** with CO₂
2. Balance **H** with H₂O
3. Balance **O** last with O₂, since it's alone and easy to adjust
4. Half-coefficient? Multiply everything by 2
>! Never change a subscript. Turning H₂O into H₂O₂ makes hydrogen peroxide, a different substance.`),
      EX('Balance ethane combustion', 'Balance: C₂H₆ + O₂ → CO₂ + H₂O', ['C: 2 on the left → 2 CO₂', 'H: 6 on the left → 3 H₂O', 'O on the right: 2(2) + 3 = 7 → 7/2 O₂', 'Double everything: **2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O**']),
      G('c.balance'),
      TF('You may change subscripts to balance an equation.', false, 'Subscripts define the substance. Only coefficients change.'),
      G('c.balance'),
      ORDER('Order the steps to balance a hydrocarbon combustion.', ['Balance carbon using CO₂', 'Balance hydrogen using H₂O', 'Balance oxygen using O₂', 'Clear any fractions by multiplying through', 'Check every element on both sides']),
      G('c.balance'),
    ]),
    L('c9l2', 'Reaction Types', {
      goal: 'Classify reactions as combination, decomposition or combustion.',
      key: '**Combination:** A + B → AB (2Mg + O₂ → 2MgO). **Decomposition:** AB → A + B (CaCO₃ → CaO + CO₂). **Combustion:** a substance reacts with O₂. For hydrocarbons (CₓHᵧ, and CₓHᵧO_z), the products are always CO₂ and H₂O. Single displacement: A + BC → AC + B.',
      formulas: ['combination: A + B → AB', 'decomposition: AB → A + B', 'combustion: fuel + O₂ → CO₂ + H₂O'],
    }, [
      T('Recognize the pattern', `
| Type | Pattern | Example |
|---|---|---|
| combination | A + B → AB | 2Mg + O₂ → 2MgO |
| decomposition | AB → A + B | 2H₂O₂ → 2H₂O + O₂ |
| combustion | fuel + O₂ → CO₂ + H₂O | CH₄ + 2O₂ → CO₂ + 2H₂O |
| single displacement | A + BC → AC + B | Zn + 2HCl → ZnCl₂ + H₂ |`),
      G('c.rxtype'),
      G('c.rxtype'),
      MC('What are the products of the complete combustion of any hydrocarbon?', ['CO₂ and H₂O', 'CO and H₂', 'C and H₂O', 'CO₂ and H₂'], 'Carbon → CO₂ and hydrogen → H₂O.'),
      G('c.rxtype'),
      TF('2KClO₃ → 2KCl + 3O₂ is a decomposition reaction.', true, 'One reactant splits into two products.'),
    ]),
    L('c9l3', 'Mole Ratios & Mass Stoichiometry', {
      goal: 'Convert grams of one substance into grams of another using the balanced equation.',
      key: 'The balanced equation\'s coefficients are MOLE ratios, not mass ratios. Roadmap: grams A → (÷ M_A) → moles A → (× coefB/coefA) → moles B → (× M_B) → grams B. Never use the mole ratio on grams directly.',
      formulas: ['g A → mol A → mol B → g B', 'mol B = mol A × [[coef B|coef A]]'],
    }, [
      T('The stoichiometry roadmap', `
$$ g_A →^{÷ M_A} mol_A →^{× [[b|a]]} mol_B →^{× M_B} g_B $$
The coefficients in $aA + bB → …$ tell you how **moles** react, not grams.
>! The #1 mistake: applying the mole ratio to grams. Always go through moles.`),
      EX('Making water', 'How many grams of H₂O form from 4.00 g of H₂ (2H₂ + O₂ → 2H₂O)?', ['mol H₂ = 4.00/2.016 = 1.984 mol', 'Ratio 2 H₂O : 2 H₂ → 1.984 mol H₂O', 'g H₂O = 1.984 × 18.02 = **35.7 g**']),
      G('c.stoich'),
      MC('In N₂ + 3H₂ → 2NH₃, how many moles of NH₃ form from 6 mol of H₂?', ['4 mol', '6 mol', '2 mol', '9 mol'], '6 mol H₂ × (2 NH₃ / 3 H₂) = 4 mol.'),
      G('c.stoich'),
      TF('The coefficients in a balanced equation give the mass ratio of reactants.', false, 'They give mole ratios.'),
      G('c.stoich'),
      G('c.stoich'),
    ]),
    L('c9l4', 'Limiting Reactant', {
      goal: 'Find the limiting reactant and the theoretical yield.',
      key: 'The limiting reactant runs out first and sets how much product can form. To find it, convert each reactant to moles and divide by its coefficient. The smallest value is limiting. The theoretical yield comes from the limiting reactant only. The excess reactant left over = what you started with − what the limiting reactant used up. The reactant with the smaller MASS isn\'t necessarily limiting.',
      formulas: ['limiting: smallest (mol ÷ coefficient)', 'theoretical yield from the limiting reactant'],
    }, [
      T('Who runs out first?', `
Like making sandwiches with 10 slices of bread and 3 slices of cheese (2 bread + 1 cheese each): cheese limits you to 3 sandwiches.
**Recipe:**
1. Convert each reactant to **moles**
2. Divide each by its **coefficient**
3. The **smallest** quotient is the limiting reactant
4. Use the limiting reactant to compute the product
>! Don't compare grams. 10 g of H₂ is a lot more moles than 10 g of O₂.`),
      EX('Ammonia synthesis', '28.0 g N₂ reacts with 9.00 g H₂ (N₂ + 3H₂ → 2NH₃). Find the limiting reactant and the mass of NH₃.', ['N₂: 28.0/28.02 = 1.00 mol, ÷ 1 = 1.00', 'H₂: 9.00/2.016 = 4.46 mol, ÷ 3 = 1.49', 'N₂ is limiting → 2.00 mol NH₃ × 17.03 = **34.1 g NH₃**']),
      G('c.limiting'),
      G('c.limiting'),
      MC('2H₂ + O₂ → 2H₂O. You have 3 mol H₂ and 2 mol O₂. The limiting reactant is…', ['H₂', 'O₂', 'neither', 'both'], 'H₂: 3/2 = 1.5. O₂: 2/1 = 2. H₂ is smaller.'),
      G('c.limiting'),
      TF('The reactant present in the smallest mass is always the limiting reactant.', false, 'Compare moles ÷ coefficient, not grams.'),
    ]),
    L('c9l5', 'Percent Yield', {
      goal: 'Compute percent yield and use it in reverse.',
      key: 'Percent yield = (actual yield ÷ theoretical yield) × 100. Actual yield is measured in the lab. Theoretical yield is calculated from the limiting reactant. Yields fall below 100% because of side reactions, incomplete reactions and losses during collection. Over 100% usually means the product is impure or wet.',
      formulas: ['% yield = [[actual|theoretical]] × 100'],
    }, [
      T('Real reactions fall short', `
$$ percent yield = [[actual yield|theoretical yield]] × 100 $$
Why less than 100%? Side reactions, reactions that don't go to completion, and product lost while filtering or transferring.
>! A yield **over** 100% usually means your product is still wet or contaminated.`),
      G('c.pyield'),
      MC('A student reports a 112% yield. The most likely explanation is…', ['the product is still wet or impure', 'the reaction made extra atoms', 'the limiting reactant was in excess', 'the theoretical yield was too large'], 'Extra mass comes from water or impurities.'),
      G('c.pyield'),
      NUM('A reaction should produce **50.0 g** of product, and the typical yield is **85.0%**. How many grams do you expect to collect?', 42.5, 'g', 'actual = 0.850 × 50.0 = 42.5 g.', { lvl: 2, steps: ['actual = % yield × theoretical', '= 0.850 × 50.0 = **42.5 g**'] }),
      G('c.limiting'),
    ]),
  ]);

  /* ================= Unit 10 ================= */
  const u10 = U('c10', 'Aqueous Reactions', { sub: 'Solubility, net ionic, acids/bases, redox & titrations', ch: 'Ch 9' }, [
    L('c10l1', 'Electrolytes & Solubility', {
      goal: 'Classify electrolytes and predict solubility with the rules.',
      key: 'Strong electrolytes ionize completely: soluble ionic compounds, strong acids and strong bases. Weak electrolytes ionize partially: weak acids (HF, HC₂H₃O₂) and weak bases (NH₃). Nonelectrolytes don\'t ionize (sugar, alcohols). Solubility rules: compounds of group 1, NH₄⁺, NO₃⁻, C₂H₃O₂⁻ and ClO₄⁻ are always soluble. Cl⁻, Br⁻ and I⁻ are soluble except with Ag⁺, Hg₂²⁺ and Pb²⁺. SO₄²⁻ is soluble except with Ba²⁺, Sr²⁺, Ca²⁺, Pb²⁺, Hg₂²⁺ and Ag⁺. CO₃²⁻, PO₄³⁻, CrO₄²⁻ and S²⁻ are insoluble except with group 1 and NH₄⁺. OH⁻ is insoluble except with group 1, NH₄⁺ and Ba²⁺.',
      formulas: ['always soluble: group 1, NH₄⁺, NO₃⁻, acetate, ClO₄⁻', 'halides: not with Ag⁺, Hg₂²⁺, Pb²⁺', 'sulfates: not with Ba, Sr, Ca, Pb, Hg₂, Ag'],
    }, [
      T('What dissolves, and what conducts', `
| Type | Ionizes | Examples |
|---|---|---|
| strong electrolyte | completely | NaCl, HCl, NaOH |
| weak electrolyte | partly | HC₂H₃O₂, NH₃, HF |
| nonelectrolyte | not at all | sugar, ethanol |
**Strong acids to memorize:** HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄, HClO₃.`),
      T('Solubility rules', `
**Always soluble:** group 1 ions, NH₄⁺, NO₃⁻, C₂H₃O₂⁻ (acetate), ClO₄⁻
**Usually soluble:**
- Cl⁻, Br⁻, I⁻, except with Ag⁺, Hg₂²⁺, Pb²⁺
- SO₄²⁻, except with Ba²⁺, Sr²⁺, Ca²⁺, Pb²⁺, Hg₂²⁺, Ag⁺
**Usually insoluble:**
- CO₃²⁻, PO₄³⁻, CrO₄²⁻, S²⁻, unless paired with group 1 or NH₄⁺
- OH⁻, unless group 1, NH₄⁺ or Ba²⁺
>* The "always soluble" ions beat everything: K₃PO₄ is soluble because of K⁺.`),
      G('c.electrolyte'),
      G('c.soluble'),
      G('c.soluble'),
      MC('Which is a **weak** electrolyte?', ['HC₂H₃O₂ (acetic acid)', 'HCl', 'NaCl', 'KOH'], 'Acetic acid only partly ionizes.'),
      G('c.soluble'),
      G('c.electrolyte'),
    ]),
    L('c10l2', 'Precipitation & Net Ionic Equations', {
      goal: 'Predict precipitates and write net ionic equations.',
      key: 'Mixing two ionic solutions: swap partners and check each new pair with the solubility rules. An insoluble pair forms a precipitate (s). Molecular equation → complete ionic equation (write strong electrolytes as separate ions) → cancel the spectator ions (unchanged on both sides) → net ionic equation. Example: Ag⁺(aq) + Cl⁻(aq) → AgCl(s). Solids, liquids, gases and weak electrolytes stay as formulas.',
      formulas: ['molecular → complete ionic → net ionic', 'cancel the spectators'],
    }, [
      T('Swap partners, keep what reacts', `
**AgNO₃(aq) + NaCl(aq)**
1. Swap partners: AgCl and NaNO₃
2. Solubility: AgCl is **insoluble**, NaNO₃ is soluble
3. Complete ionic: Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻
4. Cancel spectators (Na⁺, NO₃⁻):
$$ Ag⁺(aq) + Cl⁻(aq) → AgCl(s) $$
>! Only split **strong electrolytes** in aqueous solution. Keep solids, water, gases and weak acids whole.`),
      G('c.precip'),
      G('c.precip'),
      MC('Spectator ions are ions that…', ['appear unchanged on both sides of the equation', 'form the precipitate', 'are always cations', 'only appear in the products'], 'They are present but don\'t take part.'),
      G('c.precip'),
      TF('In a net ionic equation, a precipitate is written as separate ions.', false, 'Solids are written as formulas with (s).'),
      G('c.precip'),
    ]),
    L('c10l3', 'Acid–Base Reactions', {
      goal: 'Identify strong acids and bases and write neutralization equations.',
      key: 'Arrhenius acids produce H⁺ in water and bases produce OH⁻. Brønsted acids donate H⁺ and bases accept H⁺. Strong acids: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄, HClO₃. Strong bases: group 1 hydroxides plus Ca(OH)₂, Sr(OH)₂, Ba(OH)₂. Neutralization: acid + base → salt + water. Strong acid + strong base net ionic: H⁺ + OH⁻ → H₂O. Weak acids and weak bases are written as molecules in net ionic equations.',
      formulas: ['acid + base → salt + H₂O', 'strong + strong: H⁺ + OH⁻ → H₂O'],
    }, [
      T('Proton swapping', `
**Strong acids** (memorize all 7): HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄, HClO₃
**Strong bases:** LiOH, NaOH, KOH, RbOH, CsOH, Ca(OH)₂, Sr(OH)₂, Ba(OH)₂
**Neutralization:** HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
$$ H⁺(aq) + OH⁻(aq) → H₂O(l) :: net ionic for strong acid + strong base $$
>! A **weak** acid stays as a molecule: HF(aq) + OH⁻(aq) → F⁻(aq) + H₂O(l).`),
      MC('Which is a **strong** acid?', ['HNO₃', 'HF', 'HC₂H₃O₂', 'H₂CO₃'], 'Nitric acid is on the strong-acid list.'),
      G('c.neutral'),
      MATCH('Classify each compound.', [['HCl', 'strong acid'], ['NaOH', 'strong base'], ['NH₃', 'weak base'], ['HF', 'weak acid']]),
      G('c.neutral'),
      TF('Every acid–base neutralization has the net ionic equation H⁺ + OH⁻ → H₂O.', false, 'Only strong acid + strong base. Weak species stay molecular.'),
      G('c.neutral'),
    ]),
    L('c10l4', 'Oxidation Numbers & Redox', {
      goal: 'Assign oxidation numbers and identify what is oxidized and reduced.',
      key: 'Oxidation-number rules: elements are 0; monatomic ions equal their charge; O is −2 (−1 in peroxides); H is +1 (−1 with metals); F is −1; group 1 is +1, group 2 is +2; the sum equals the overall charge. Oxidation = loss of electrons (oxidation number goes up). Reduction = gain of electrons (oxidation number goes down). OIL RIG. The species oxidized is the reducing agent, and the one reduced is the oxidizing agent. A metal displaces ions of metals below it on the activity series.',
      formulas: ['OIL RIG', 'oxidized = reducing agent · reduced = oxidizing agent', 'Σ ox numbers = charge'],
    }, [
      T('Following electrons', `
**Oxidation-number rules** (in priority order):
1. Free element: 0 (Fe, O₂, Cl₂)
2. Monatomic ion: its charge (Na⁺ = +1)
3. F: −1. O: −2 (−1 in peroxides). H: +1 (−1 with metals)
4. Sum = overall charge
**OIL RIG:** **O**xidation **I**s **L**oss, **R**eduction **I**s **G**ain (of electrons)
>* In Zn + Cu²⁺ → Zn²⁺ + Cu: Zn goes 0 → +2 (**oxidized**, the reducing agent) and Cu²⁺ goes +2 → 0 (**reduced**, the oxidizing agent).`),
      EX('Sulfur in sulfuric acid', 'Find the oxidation number of S in H₂SO₄.', ['H: 2(+1) = +2. O: 4(−2) = −8', 'Neutral: +2 + S − 8 = 0', 'S = **+6**']),
      G('c.oxnum'),
      G('c.redox'),
      G('c.oxnum'),
      G('c.activity'),
      TF('The species that is oxidized is called the oxidizing agent.', false, 'It\'s the reducing agent, because it gives electrons away.'),
      G('c.oxnum'),
    ]),
    L('c10l5', 'Molarity, Dilution & Titration', {
      goal: 'Work molarity, dilution and titration problems.',
      key: 'Molarity: M = mol solute / L solution, so mol = M × L. Dilution: $M₁V₁ = M₂V₂$ (the moles of solute stay the same). Solution stoichiometry: M × V → mol → mole ratio → mol → whatever you need. Titration: at the equivalence point, moles of H⁺ = moles of OH⁻. Watch for diprotic acids like H₂SO₄ (2 H⁺ each). M₁V₁ = M₂V₂ only works for 1:1 titrations and for dilution.',
      formulas: ['M = [[mol|L]]', 'M₁V₁ = M₂V₂ (dilution)', 'equivalence: mol H⁺ = mol OH⁻'],
    }, [
      T('Concentration as a conversion factor', `
$$ M = [[mol solute|L solution]] $$
So 0.250 L of 2.00 M NaCl contains 0.500 mol.
**Dilution** adds solvent but no solute: $M₁V₁ = M₂V₂$.
**Titration:** add base from a buret until the moles of OH⁻ exactly match the moles of H⁺.
>! H₂SO₄ gives 2 H⁺ per molecule, so it needs twice as much NaOH as the same moles of HCl.`),
      EX('Titrating an acid', '25.0 mL of HCl is neutralized by 32.4 mL of 0.100 M NaOH. Find [HCl].', ['mol NaOH = 0.100 × 0.0324 = 3.24 × 10⁻³ mol', '1 : 1 → mol HCl = 3.24 × 10⁻³', '[HCl] = 3.24×10⁻³ / 0.0250 = **0.130 M**']),
      G('c.molarity'),
      G('c.molarity'),
      G('c.titration'),
      MC('When you dilute a solution with water, what stays the same?', ['the moles of solute', 'the molarity', 'the volume', 'the density'], 'That\'s why M₁V₁ = M₂V₂.'),
      G('c.molarity'),
      G('c.titration'),
    ]),
  ]);

  CQ.addUnits('chem', [u8, u9, u10]);
})();
