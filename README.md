# Comet Quest

A Duolingo-style study game for three UT Dallas courses:

| Course | Content | Exams simulated |
|---|---|---|
| **PHYS 2325** Mechanics | 14 units · 61 lessons (Young & Freedman Ch 1–15) | Exam 1, 2, 3, Final |
| **CHEM 1311** General Chemistry I | 12 units · 56 lessons (Burdge *Atoms First* Ch 1–11) | Exam 1, 2, 3, Final |
| **MECH 1208** Intro to ME II | 8 units · 34 lessons (Wickert & Lewis Ch 1–8, CAD, truss lab) | Midterm, Final |

The progression design (why lessons are ordered and paced the way they are) is in [CURRICULUM.md](CURRICULUM.md).

## Play it

- **Easiest:** open `dist/comet-quest.html` in any browser. It's one self-contained file, so you can also AirDrop it to your phone.
- **From source:** open `index.html` (no build step, no server needed).

Progress saves in your browser. Profile → *Copy save code* moves it to another device.

## What's in the game

- **Skill path** per course: lessons, treasure chests and a boss at the end of every unit. "Jump here" tests you out of units you already know.
- **Lessons** go concept → worked example (revealed step by step) → warm-up → build → apply → exam-level. Eight exercise types: multiple choice, select-all, true/false, numeric entry (with an on-screen keypad on phones and scientific notation), typed answers (chemical formulas), word-bank fill-ins, matching and ordering.
- **Generated problems:** 224 problem generators produce fresh numbers every attempt, each with a full worked solution. A missed problem comes back later with new numbers, so you can't memorize your way through.
- **Adaptive flow:** two misses in a row trigger a **Rescue** (re-teaches the key idea, then an easier stepping-stone question). Three right in a row triggers **Fast track** (skips warm-ups).
- **Mastery ladder:** Crown 1 (learn) → Crown 2 (level up, no teaching) → Crown 3 (Legendary: exam-level, no hints, 3 hearts, 90%+).
- **Spaced repetition:** every question goes into a 6-box Leitner scheduler (0/1/3/7/16/35 days). **Review** and **Weak spots** drill what's due or what you miss most.
- **Exam simulators:** timed, no feedback until the end, mixed the way the real exam is, then a full review with solutions. Each one shows an **Exam Readiness %**.
- **Cheat sheet:** every key idea and formula you've unlocked, searchable.
- **Game layer:** XP and levels, combos (×2 at 5, ×3 at 10), daily goal, streaks with streak freezes, gems, daily quests, 24 achievements, mascot skins, sound effects, confetti, light and dark themes.

## Project layout

```
index.html            app shell (loads everything below)
css/app.css           all styles; light/dark tokens at the top
js/core.js            RNG, number parsing/formatting, markup renderer, icons
js/content-api.js     course registry + the content DSL
js/diagrams.js        SVG figure builders (vectors, inclines, trusses, gears, orbitals, Lewis structures…)
js/store.js           save data, XP/levels, streaks, spaced repetition, quests, achievements, cloud sync
js/engine.js          session builder and adaptive flow (re-queue, Rescue, Fast track, scoring)
js/ui.js, player.js   screens and the lesson player
content/*.js          course content (phys-1…5, chem-1…4, mech-1…2)
tools/                validate, sweep, smoke test, build
```

## Adding content (for example, from your textbook PDFs)

Content is plain JavaScript data. Inside a content file:

```js
const { L, U, T, EX, MC, TF, NUM, MATCH, ORDER, FILL, G } = CQ.dsl;

L('p2l9', 'Lesson title', { goal: 'What you can do after', key: 'One-paragraph key idea', formulas: ['v = v₀ + at'] }, [
  T('Teach card title', `Markup with **bold**, $inline formula$, [[a|b]] fractions, √{x}, tables, and callouts (>* key, >! trap)`),
  EX('Worked example', 'Problem text', ['Step 1', 'Step 2', '**Answer**']),
  MC('Question?', ['correct answer', ['wrong answer', 'feedback shown if this one is picked'], 'another wrong answer']),
  NUM('Numeric question', 42, 'm/s', 'Why it\'s 42', { steps: ['…'] }),
  G('p.kin.stop'),   // a generated problem: see CQ.gen(...) in the content files
])
```

Then run the checks:

```bash
node tools/validate.mjs   # instantiates every card (each generator 60×) and checks answers, options and markup
node tools/sweep.mjs      # plays every lesson, boss, jump test, exam and review to completion
node tools/build.mjs      # writes dist/comet-quest.html and dist/artifact.html
node tools/smoke.cjs out  # Playwright: plays lessons in the browser and saves screenshots
```
