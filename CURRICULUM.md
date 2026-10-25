# Comet Quest: Curriculum & Progression Plan

This is the design spec for the study game. It covers **how** the material is sequenced so you never stall and never coast, and **what** is taught in each course, unit by unit, mapped to the textbook chapters and to the exams.

Courses (UT Dallas):

| Course | Title | Textbook the content is aligned to |
|---|---|---|
| PHYS 2325 | Mechanics (calculus-based) | Young & Freedman, *University Physics*, Vol. 1 (Ch 1–15) |
| CHEM 1311 | General Chemistry I | Burdge & Overby, *Chemistry: Atoms First* (Ch 1–11) |
| MECH 1208 | Introduction to Mechanical Engineering II | Wickert & Lewis, *An Introduction to Mechanical Engineering* (Ch 1–8), plus the CAD/SolidWorks and truss labs |

Sections and professors differ, so the exam groupings below follow the most common UTD syllabi. Every unit can be opened early with a "Jump here" placement test, and Settings has a free-roam switch.

---

## 1. The progression curve

The target is the **85% zone**: you get about 8–9 out of 10 right on the first try. If you score higher, the game speeds up. If you score lower, it slows down and re-teaches. Six mechanisms keep you there.

### 1.1 One new idea per lesson
A lesson is 6–8 minutes and introduces **one** idea (two at most when they only make sense together, like *v = rω* and *a = rα*). A unit has 3–5 lessons and ends with a boss.

### 1.2 Lesson anatomy: the ramp
Every lesson follows the same ramp, so the shape becomes familiar and only the content is new:

| Stage | Screen type | What it does | Level |
|---|---|---|---|
| Hook + Concept | Teach card | Intuition first, then the formula, then the classic exam trap | — |
| Worked example | Step-reveal card | You tap through a full solution one step at a time | — |
| Warm-up | Multiple choice, true/false | Recognize the idea | L1 |
| Build | Match pairs, word bank, ordering | Recall structure (which formula, which step comes next) | L2 |
| Apply | Numeric input | One-step calculation | L3 |
| Stretch | Numeric, multi-step, generated | Exam-style problem with new numbers every time | L4 |
| Spiral review | Any | 1–2 questions pulled from earlier lessons by the review scheduler | — |

This follows **worked-example fading**, an approach from cognitive-load research: first you watch a full solution, then you finish a partial one, then you solve a problem alone.

### 1.3 The flow engine (adaptive difficulty)
- **Miss once:** you see the correct answer, a short explanation, and the full step-by-step solution. The question returns at the end of the lesson, and generated problems return **with new numbers**, so you can't pass by memorizing the answer.
- **Miss twice in a row: Rescue.** The engine stops, shows the lesson's one-paragraph *Key Idea* again, and puts an easier stepping-stone question in front of you before continuing.
- **Three right in a row: Fast track.** Remaining warm-up (L1) questions get skipped, so time goes to the harder material.
- **Hints are free in learning mode.** The first hint is the first step of the solution. Using one only lowers the XP for that question.
- **No hearts while learning.** In learning mode, mistakes are how you learn and cost you nothing. Hearts only appear in boss fights and Legendary runs, where the stakes are intentional.

### 1.4 The mastery ladder (per lesson)
| Crown | Mode | Content |
|---|---|---|
| 1 | Learn | Full lesson with teaching and scaffolding |
| 2 | Level Up | No teach cards, L2+ only, every generated problem twice |
| 3 | Legendary | Exam-style only, no hints, 3 hearts, at least 90% to pass |

### 1.5 Unit bosses and exam simulators
- **Boss:** 12 mixed exam-style questions from the whole unit, 3 hearts. Beating it unlocks the next unit. This forces **interleaving**: you have to identify *which* idea a problem needs, which is the skill exams actually test.
- **Exam simulator:** one per exam (Exam 1 / 2 / 3 / Final). It is timed, gives no feedback until you submit, mixes units the way the real exam does, and finishes with a full review. Each simulator has an **Exam Readiness %** computed from crowns, review-box levels, and recent simulator scores.

### 1.6 Spaced repetition
Every question you answer goes into a 6-box Leitner scheduler with review intervals of 0 → 1 → 3 → 7 → 16 → 35 days. A miss sends the question back to box 1. The **Review** tab builds a session from questions that are due, and **Weak Spots** drills the ones you miss most. Spiral-review questions inside lessons come from the same scheduler.

### 1.7 Difficulty across a course
- Early units: more teach cards, more L1–L2, single-step numbers.
- Middle units: fewer teach cards, more L3–L4, two-step problems.
- Late units: mostly L4, multi-concept problems (for example, energy plus momentum in a ballistic pendulum).
- Each boss is harder than the last because its pool draws on everything taught so far.

### 1.8 Cross-course bridges
- PHYS Unit 4–5 (Newton's laws) → MECH Unit 2–3 (forces, moments, trusses): same physics, applied to engineering structures.
- PHYS Unit 10 (torque, rotational power) → MECH Unit 7 (gears, P = Tω).
- PHYS Unit 11 (stress and strain) → MECH Unit 4 (materials and stresses).
- CHEM Unit 11 (thermochemistry) → MECH Unit 6 (thermal and energy systems).

The home screen's "Today" plan suggests one lesson per course plus a review, so all three courses stay fresh.

---

## 2. PHYS 2325 · Mechanics

Exam map: **Exam 1** Units 1–5 (Ch 1–5) · **Exam 2** Units 6–8 (Ch 6–8) · **Exam 3** Units 9–11 (Ch 9–11) · **Final** Units 12–14 (Ch 13–15) plus everything before.

| Unit | Lessons | Can do after |
|---|---|---|
| 1. The Physicist's Toolkit (Ch 1) | Units & conversions · Sig figs & estimation · Vector components · Adding vectors & unit vectors · Dot & cross products | Break any vector into components, combine vectors, take dot/cross products |
| 2. Motion in a Line (Ch 2) | Displacement, velocity & speed · Instantaneous velocity & acceleration (slopes) · The Big Four equations · Free fall · Calculus & motion graphs | Solve any 1-D constant-acceleration problem; read x–t and v–t graphs |
| 3. Motion in 2D (Ch 3) | Position & velocity vectors · Horizontal launch · Angled launch · Uniform circular motion · Relative velocity | Split projectile motion into independent x/y problems; use a = v²/R |
| 4. Newton's Laws (Ch 4) | Forces & the 1st law · ΣF = ma · Mass, weight & normal force · 3rd-law pairs · Free-body diagrams | Draw a correct FBD and write ΣF = ma in components |
| 5. Applying Newton's Laws (Ch 5) | Equilibrium & tension · Inclined planes · Friction · Connected objects · Circular dynamics | Solve incline, pulley, friction and banked-curve problems |
| 6. Work & Kinetic Energy (Ch 6) | Work by a constant force · Work–energy theorem · Springs & variable forces · Power | Use W = ΔK, compute work from F·d and from ∫F dx |
| 7. Potential Energy (Ch 7) | Gravitational PE & conservation · Elastic PE · Friction & W_other · Force from U(x), energy diagrams | Use K₁ + U₁ + W_other = K₂ + U₂ on any track/spring problem |
| 8. Momentum & Collisions (Ch 8) | Momentum & impulse · Conservation of momentum · Inelastic collisions · Elastic collisions · Center of mass | Pick momentum vs energy correctly; solve 1-D and 2-D collisions |
| 9. Rotation (Ch 9) | Angular variables · Constant angular acceleration · Linking linear & angular · Rotational KE & moment of inertia | Convert rev/rpm/rad, use the rotational Big Four, compute I (incl. parallel axis) |
| 10. Rotational Dynamics (Ch 10) | Torque · Στ = Iα · Rolling · Rotational work & power · Angular momentum | Solve pulley-with-mass, rolling-race and spinning-skater problems |
| 11. Equilibrium & Elasticity (Ch 11) | Equilibrium & center of gravity · Beams, ladders & struts · Stress, strain & Young's modulus | Use ΣF = 0, Στ = 0 with a smart pivot; compute ΔL = FL₀/(AY) |
| 12. Gravitation (Ch 13) | Newton's law of gravitation · Gravitational PE & escape speed · Orbits & Kepler | Compute g at altitude, orbital speed/period, escape speed |
| 13. Periodic Motion (Ch 14) | SHM basics · x(t), v(t), a(t) · Energy in SHM · Pendulums | Get ω, T, f, amplitude and max speed for springs and pendulums |
| 14. Mechanical Waves (Ch 15) | Wave basics, v = fλ · Wave functions · String waves & energy · Standing waves | Read y(x,t), compute wave speed on a string, find harmonics |

## 3. CHEM 1311 · General Chemistry I

Exam map: **Exam 1** Units 1–4 (Ch 1–3) · **Exam 2** Units 5–7 (Ch 4–6) · **Exam 3** Units 8–10 (Ch 7–9) · **Final** Units 11–12 (Ch 10–11) plus everything before.

| Unit | Lessons | Can do after |
|---|---|---|
| 1. Measurement Toolkit (Ch 1) | Classifying matter · SI units, temperature & density · Significant figures · Dimensional analysis | Convert anything, keep correct sig figs |
| 2. Atoms & the Periodic Table (Ch 2) | Subatomic particles & atomic models · Isotopes & ions · Average atomic mass · Periodic table map · The mole & molar mass | Count p/n/e, compute average atomic mass, go between grams, moles and atoms |
| 3. Light & Quantum Theory (Ch 3) | Light as a wave · Photons & photoelectric effect · Bohr model & H spectrum · Matter waves & uncertainty · Quantum numbers & orbitals | Use c = λν, E = hν, the Bohr energy levels; list valid quantum numbers |
| 4. Electron Configurations (Ch 3) | Aufbau, Pauli & Hund · Writing configurations · Blocks, valence & exceptions · Ions & magnetism | Write configurations for atoms and ions; spot paramagnetism |
| 5. Periodic Trends (Ch 4) | Effective nuclear charge · Atomic & ionic radius · Ionization energy · Electron affinity & metallic character | Rank elements by any trend and explain *why* with Z_eff |
| 6. Compounds & Formulas (Ch 5) | Ionic vs molecular · Naming ionic compounds · Polyatomic ions · Molecular compounds & acids · Percent composition & empirical formulas | Name/formula anything in Ch 5; find empirical and molecular formulas |
| 7. Lewis Structures (Ch 6) | Electronegativity & bond polarity · Drawing Lewis structures · Formal charge · Resonance · Octet exceptions | Draw the best Lewis structure for any molecule or ion |
| 8. Shapes & Bonding Theories (Ch 7) | VSEPR electron geometry · Molecular shape & angles · Molecular polarity · Hybridization & σ/π bonds · MO theory | Predict shape, angle, polarity, hybridization and bond order |
| 9. Reactions & Stoichiometry (Ch 8) | Balancing equations · Reaction types · Mole-ratio stoichiometry · Limiting reactant · Percent yield | Do grams → moles → moles → grams, find the limiting reactant |
| 10. Aqueous Reactions (Ch 9) | Electrolytes & solubility · Precipitation & net ionic equations · Acid–base reactions · Oxidation numbers & redox · Molarity, dilution & titration | Write net ionic equations, assign oxidation numbers, solve titrations |
| 11. Thermochemistry (Ch 10) | Energy & the first law · Enthalpy · Calorimetry · Hess's law · Enthalpies of formation | Solve calorimetry, Hess's-law and ΔH°f problems |
| 12. Gases (Ch 11) | Pressure & gas laws · Ideal gas law · Partial pressures & gas stoichiometry · Kinetic theory & effusion | Use PV = nRT in every form, Dalton's and Graham's laws |

## 4. MECH 1208 · Intro to Mechanical Engineering II

Exam map: **Midterm** Units 1–4 · **Final** Units 5–8 plus everything before.

| Unit | Lessons | Can do after |
|---|---|---|
| 1. The Engineer's Method (Ch 1–2) | What MEs do & engineering ethics · SI and USCS units (lbf vs lbm, slugs) · Dimensional consistency & estimation · The Approach–Solution–Discussion method | Convert between unit systems without the lbm/lbf trap; sanity-check answers |
| 2. Forces & Moments (Ch 3) | Force components · Resultants · Moment of a force · Equilibrium & free-body diagrams | Find resultants and moments; write ΣFx = ΣFy = ΣM = 0 |
| 3. Structures & Trusses (Ch 3, truss labs) | Two-force members & trusses · Support reactions · Method of joints · Levers & mechanical advantage | Solve a simple truss for member forces (tension or compression) |
| 4. Materials & Stresses (Ch 4) | Tension & compression stress · Strain & Hooke's law · Stress–strain curve & material behavior · Shear stress (single/double shear) · Materials selection & factor of safety | Size a rod or pin so it doesn't yield, and explain why |
| 5. Fluids Engineering (Ch 5) | Fluid properties & hydrostatic pressure · Buoyancy · Reynolds number & flow regimes · Drag, lift & flow rate | Compute pressure at depth, buoyant force, Re, drag force, Q = Av |
| 6. Thermal & Energy Systems (Ch 6) | Energy, work & power units · Fuels, heating value & efficiency · Heat transfer modes · Heat engines & Carnot | Do energy/power bookkeeping, conduction through a wall, engine efficiency |
| 7. Motion & Power Transmission (Ch 7) | Rotational speed & velocity · Torque & power · Gear types & gear ratio · Gear trains · Belts, chains & machine elements | Find output speed and torque of a gear train; use P = Tω |
| 8. Design, Drawings & CAD (Ch 2 & 8, SolidWorks) | The design process · Sketching & orthographic views · CAD modeling workflow (sketch → feature → assembly) · Dimensioning, tolerances & manufacturing | Lead a design from requirements to prototype; read multiview drawings |

---

## 5. Suggested pacing

- **Daily:** about 20 minutes. That is the default daily goal of 50 XP, roughly two lessons plus one review.
- **Weekly:** one boss per course.
- **Exam week:** switch to the exam simulator for that exam. Run it, read the review, drill the Weak Spots it shows, then run it again. Aim for 85% or better on two consecutive runs.
- **Already mid-semester?** Use "Jump here" on the unit your class is on now and come back to earlier units through Review.

## 6. Content format (for adding textbook material later)

All course content lives in `content/*.js` as plain data: teach cards, worked examples and exercises, plus *generator* functions that produce unlimited fresh numeric problems with full solutions. See the README for the card types. Material from your textbook PDFs can be added as new lessons or exercises without touching the game engine.
