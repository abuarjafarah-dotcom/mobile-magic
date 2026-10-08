# Desktop-responsive layout

## Goal
Use more of the available desktop width to reduce unnecessary vertical scrolling, while leaving the existing mobile layout and interactions unchanged.

## Changes
- Expand the shared activity shells only at desktop breakpoints, keeping their current phone widths and spacing intact.
- Reflow the main learning screen into wider multi-column grids on desktop: activity navigation, times tables, addition levels, Qur’an selections, Arabic, geography, and Grade 1 lesson lists.
- Let active games use wider desktop compositions where helpful, including side-by-side question/visual and answer areas, while retaining the existing stacked mobile flow.
- Give Math Bowling a larger desktop lane and wider play area without changing its ten-round logic, assets, or mobile dimensions.
- Reduce desktop-only top/bottom spacing where it creates avoidable page height; preserve safe-area spacing on mobile.

## Validation
- Check the home screen and representative Math, Qur’an, Arabic, Geography, Explore, and Bowling screens at desktop size for clipping, overlap, and avoidable scrolling.
- Recheck the same screens at phone size to confirm their existing layout remains unchanged.
- Confirm the preview builds without errors and all existing controls still work.

## Technical details
- Use `lg:` responsive classes and shared shell sizing rather than global scaling, so changes begin only on desktop.
- Preserve all game state, content, audio, progress, and navigation logic; this is a presentation-only update.
