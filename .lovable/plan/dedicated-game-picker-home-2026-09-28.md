# Dedicated game-picker home

## What will change
- Replace the long first screen with a compact, child-friendly grid of the main learning worlds: Math, Qur’an, Arabic, Geography, Interactive Qur’an, More to Explore, and Building World.
- Opening Math, Qur’an, Arabic, or Geography will show its existing choices on a second screen, with a clear Back button returning to the game picker.
- Activities that already have their own menu or game screen can open directly, while keeping their existing Back button behavior.
- Keep parent settings available from the picker and activity screens.

## Layout
- Mobile: two-column picker with large touch targets and minimal vertical scrolling.
- Desktop (960px+): the picker expands into a wider grid so most or all choices fit in the first view.
- Existing mobile game layouts and desktop activity layouts remain unchanged.

## Technical details
- Keep the app as its current single client-side route.
- Add a picker/detail navigation state around the existing home content rather than moving or rewriting the individual games.
- Route every activity exit back to its relevant choice screen where useful, and provide a separate Back to Games action to reach the main picker.
- Preserve all saved progress, game state formats, audio, and open-access behavior.

## Verification
- Check the picker and category screens at phone and desktop sizes.
- Open every main choice and confirm its Back button returns to the correct screen.
- Confirm no horizontal scrolling, overlapping controls, or preview errors.
