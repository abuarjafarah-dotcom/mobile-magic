# Hamad Multiplication Adventure

## Goal
Add a first-screen choice between a new multiplication game and the existing addition game. Multiplication appears first and uses only Hamad.

## What will change
- Replace the current level-first home screen with two clear game tabs: **Multiplication** and **Addition**.
- Build a Hamad-led multiplication mode covering the 1–12 times tables, with table selection before each round.
- Make multiplication highly visual: equal groups, tappable counters, a live number-line demonstration, Hamad reactions, and step-by-step hints.
- Keep the existing five addition levels and its two-digit addition hint available under the Addition tab.
- Use Hamad alone across the shared home, multiplication questions, and multiplication rewards; preserve the other children only inside the existing addition experience.
- Keep 10-question rounds, sound feedback, stars, parent settings, and saved progress.

## Technical details
- Keep everything in the existing single client-side route and reuse the current game button, audio, reward, and settings patterns.
- Add a game-mode state and multiplication table state, with separate problem generation and answer choices.
- Update page metadata to describe both multiplication and addition.
- Verify the picker, a multiplication round, hints/interactions, addition entry, and mobile layouts.
