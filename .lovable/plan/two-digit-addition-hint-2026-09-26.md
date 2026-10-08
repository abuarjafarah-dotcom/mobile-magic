# Two-Digit Addition Hint

## Goal
Add a child-friendly **Hint** button to the two-digit addition levels without changing the game’s scoring or answer flow.

## What will change
- Show a Hint button during Levels 4 and 5.
- Open an in-game visual walkthrough using the current question.
- Split both numbers into **tens** and **ones**, add the ones first, then the tens.
- For Level 5, clearly demonstrate regrouping when ten or more ones make a new ten.
- Let the child move through the short explanation and return to the same unanswered question.
- Reset the hint automatically when the next question starts.

## Interaction and design
- Keep controls large and touch-friendly for phones.
- Use the game’s existing colors, type, icons, and button style.
- Keep the explanation compact enough to avoid covering answer choices or causing overflow on small screens.
- Include accessible labels and respect reduced-motion settings.

## Verification
- Test one Level 4 problem and one Level 5 carrying problem at a mobile viewport.
- Confirm opening, stepping through, and closing the hint preserves the current question.
- Confirm answers, scoring, progress, and other levels still behave normally.
- Check the latest preview build and browser errors.
