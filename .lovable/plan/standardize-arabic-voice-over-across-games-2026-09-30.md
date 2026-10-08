# Standardize Arabic voice-over across games

## Goal
Make every non-Qur’an game use the same Arabic voice behavior as the Arabic learning game, while preserving all Qur’an recitation and Qur’an Explore audio unchanged.

## Changes
- Add one shared Arabic speech helper that matches the Arabic game: use its mapped recorded clip when available, otherwise use the calm `ar-SA` device voice at rate `0.8`.
- Update non-Qur’an games with Arabic speech, including Science, Palestinian Kitchen, Building World, Geography, and shared learning activities, to use that helper for Arabic text.
- Preserve English speech and sound effects as they are.
- Keep the Arabic game’s existing recorded clips and curriculum audio as the preferred source.
- Do not touch Qur’an memorization, recitation, verse timing, adhan, or Qur’an Explore voice files.

## Verification
- Check Arabic playback entry points in each affected game.
- Confirm English options still speak English.
- Confirm Qur’an files are unchanged.
- Verify the project builds successfully.

## Technical details
- Centralize cancellation, mapped-audio lookup, Arabic locale, and speech rate in a browser-safe utility.
- Record the shared voice convention in the project architecture notes.
