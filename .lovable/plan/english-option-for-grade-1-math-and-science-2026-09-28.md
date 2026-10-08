# English option for Grade 1 Math and Science

## What will change
- Add an Arabic / English language switch inside **Grade 1 Math** and **Science World**.
- Keep Arabic as the initial option and remember the child’s last choice on this device.
- Translate the complete activity experience, not only headings: instructions, questions, choices, object names, feedback, completion messages, lesson names, and accessibility labels.
- Switch English screens to left-to-right layout while preserving correct right-to-left Arabic shaping.
- Use English device speech when English is selected and Arabic device speech when Arabic is selected.

## Grade 1 Math
- Extend the existing Grade 1 curriculum data with matching English prompts, word problems, answer labels, sequencing items, weekday names, and money labels.
- Keep numbers, diagrams, question order, correct answers, lesson completion, and saved progress unchanged.
- Show English unit and lesson names in English mode and Arabic unit and lesson names in Arabic mode.
- Localize shared lesson controls and feedback such as Back, Again, Lesson complete, Try again, and ordering guidance.

## Science World
- Extend the existing structured Science data with English object names, materials, properties, Earth facts, water vocabulary, seasons, world names, and activity names.
- Localize every lab’s guide speech, controls, predictions, sorting baskets, discoveries, results, and challenge flow.
- Add English lesson-source titles without changing the generated textbook files.
- Keep all artwork, experiments, activity rules, stars, and saved progress exactly as they are.

## Technical details
- Use one small shared language preference for these two sections so a switch made in either section carries into the other.
- Keep translated curriculum content in the existing authored data modules; do not hand-edit generated textbook JSON.
- Pass the active language through the existing single-route lesson/activity engines rather than duplicating screens.
- Preserve the current Grade 1 Math and Science storage formats so existing progress remains intact.

## Verification
- Check both sections in Arabic and English on phone and desktop sizes.
- Play at least one activity from every Grade 1 Math unit and every Science world in both languages.
- Confirm correct answers remain correct after translation, speech uses the selected language, Back controls work, and no text overlaps or horizontal scrolling appears.
- Confirm existing saved Math and Science progress still displays after switching languages.
