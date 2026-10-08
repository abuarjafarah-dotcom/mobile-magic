// Grade 1 Math (رياضيات الصف الأول) — Jordanian NCCD workbook, part 2 (units 6–11).
// Pure data: add a lesson or question here and the lesson engine renders it. All lessons are open.

export type G1Visual =
  | { k: "blocks"; nums: number[] }
  | { k: "clock"; h: number; m: number }
  | { k: "coins"; coins: number[] }
  | { k: "fraction"; shape: "circle" | "rect"; parts: number; shaded: number; equal?: boolean }
  | { k: "set"; emoji: string; n: number; shaded: number }
  | { k: "shape"; shape: "circle" | "triangle" | "square" | "rectangle" }
  | { k: "emoji"; text: string }
  | { k: "pattern"; seq: string[] }
  | { k: "clips"; emoji: string; n: number }
  | { k: "balance"; left: string; blocks: number }
  | { k: "week"; missing: number };

export type G1Question = {
  kind: "number" | "choice" | "compare" | "op" | "order";
  prompt: string; // Arabic, RTL
  expr?: string; // math shown LTR, e.g. "70 + 20 = ؟"
  visual?: G1Visual;
  answer: string;
  options?: string[];
  optionVisuals?: G1Visual[]; // for choice: picture options (answer = index as string)
  optionScale?: number[]; // for choice: emoji sized differently (length/mass/capacity)
  items?: string[]; // for order: correct order
};
export type G1Lesson = { id: string; unit: number; ar: string; en: string; questions: G1Question[] };
export type G1Unit = { id: number; ar: string; en: string; icon: string };

export const g1Units: G1Unit[] = [
  { id: 6, ar: "الجمع ضمن منزلتين", en: "Addition (2 place values)", icon: "➕" },
  { id: 7, ar: "الطرح ضمن منزلتين", en: "Subtraction (2 place values)", icon: "➖" },
  { id: 8, ar: "الأشكال الهندسية", en: "Geometry", icon: "🔺" },
  { id: 9, ar: "الكسور", en: "Fractions", icon: "🍕" },
  { id: 10, ar: "الزمن والنقود", en: "Time & money", icon: "🕒" },
  { id: 11, ar: "القياس", en: "Measurement", icon: "📏" },
];

const calc = (e: string) => e.split(/(?=[+-])/).reduce((s, t) => s + Number(t.replace("+", "")), 0);
const n = (expr: string, prompt = "احسب", visual?: G1Visual): G1Question => ({ kind: "number", prompt, expr: `${expr.replace(/([+-])/g, " $1 ")} = ؟`, answer: String(calc(expr)), ...(visual ? { visual } : {}) });
const cmp = (l: string, r: string): G1Question => {
  const a = calc(l), b = calc(r);
  return { kind: "compare", prompt: "قارن باستعمال < أو > أو =", expr: `${l.replace(/([+-])/g, " $1 ")}  ☐  ${r.replace(/([+-])/g, " $1 ")}`, answer: a > b ? ">" : a < b ? "<" : "=" };
};
const miss = (expr: string, answer: number): G1Question => ({ kind: "number", prompt: "ما العدد المفقود؟", expr, answer: String(answer) });
const word = (prompt: string, answer: number, visual?: G1Visual): G1Question => ({ kind: "number", prompt, answer: String(answer), ...(visual ? { visual } : {}) });
const choice = (prompt: string, options: (string | number)[], answer: string | number, extra: Partial<G1Question> = {}): G1Question => ({ kind: "choice", prompt, options: options.map(String), answer: String(answer), ...extra });
const op = (prompt: string, answer: "+" | "-"): G1Question => ({ kind: "op", prompt, answer, options: ["+", "-"] });
const blocks = (a: number, b: number): G1Visual => ({ k: "blocks", nums: [a, b] });
const clock = (h: number, m = 0): G1Visual => ({ k: "clock", h, m });

export const g1Lessons: G1Lesson[] = [
  /* ---------- Unit 6 ---------- */
  { id: "6-1", unit: 6, ar: "جمع العشرات", en: "Adding tens", questions: [
    n("70+20", "احسب", blocks(70, 20)), n("10+40", "احسب", blocks(10, 40)), n("50+30"), n("20+20"), n("10+6"), n("7+8"), n("4+9"),
    cmp("60+10", "50+30"), cmp("30+30", "40+20"), cmp("70+10", "50+20"), cmp("20+20", "10+30"),
    word("في مزرعة 20 شجرة برتقال و 70 شجرة ليمون. كم شجرة في المزرعة؟", 90, { k: "emoji", text: "🍊🌳 20   🍋🌳 70" }),
  ] },
  { id: "6-2", unit: 6, ar: "الجمع الذهني", en: "Mental addition", questions: [
    n("11+50"), n("39+40"), n("73+10"), n("48+20"), n("78+30"), n("66+30"),
    miss("20 + ؟ = 26", 6), miss("40 + ؟ = 78", 38), miss("؟ + 5 = 55", 50),
    word("في الصف 22 طالبًا، ثم دخل 6 طلاب. كم طالبًا أصبح في الصف؟", 28, { k: "emoji", text: "🧒 22 + 6" }),
    word("صنع عماد 36 كعكة، ثم صنع 20 كعكة أخرى. كم كعكة صنع؟", 56, { k: "emoji", text: "🧁 36 + 20" }),
  ] },
  { id: "6-3", unit: 6, ar: "جمع عددين من منزلتين", en: "Two-digit addition", questions: [
    n("71+28", "اجمع (العشرات مع العشرات والآحاد مع الآحاد)", blocks(71, 28)), n("55+23", "اجمع", blocks(55, 23)), n("54+12", "اجمع", blocks(54, 12)), n("42+36", "اجمع", blocks(42, 36)),
    word("وزّعت رهف 43 وجبة في اليوم الأول و 52 وجبة في اليوم الثاني. كم وجبة وزّعت؟", 95, blocks(43, 52)),
  ] },
  { id: "6-4", unit: 6, ar: "التخمين والتحقق", en: "Guess & check", questions: [
    choice("سجّل رامي 21 نقطة، ويريد أن يصل إلى 45. كم نقطة يحتاج بعد؟", [24, 44, 57], 24),
    choice("مع تمارا 41 ملصقًا، ومجموع ملصقاتها مع مهند 78. كم ملصقًا مع مهند؟", [37, 57], 37),
    choice("في محل 65 وردة، منها 24 وردة حمراء والباقي قرنفل. كم قرنفلة؟", [24, 34, 41], 41),
    choice("في النادي 45 كرة طائرة، ومجموع الكرات الطائرة وكرات التنس 87. كم كرة تنس؟", [31, 42, 52], 42),
  ] },
  /* ---------- Unit 7 ---------- */
  { id: "7-1", unit: 7, ar: "طرح العشرات", en: "Subtracting tens", questions: [
    n("70-20", "احسب", blocks(70, 20)), n("40-10"), n("50-40"), n("80-50"),
    cmp("70-20", "50-10"), cmp("70-30", "60-20"), cmp("80-20", "40+20"), cmp("30+20", "90-30"),
    word("كان 30 نملة خارج البيت، ثم دخلت 10 نملات. كم نملة بقيت في الخارج؟", 20, { k: "emoji", text: "🐜 30 − 10" }),
  ] },
  { id: "7-2", unit: 7, ar: "الطرح الذهني", en: "Mental subtraction", questions: [
    n("68-7"), n("49-6"), n("56-4"), n("99-9"), n("32-10"), n("66-30"), n("99-80"), n("82-70"),
    miss("79 − ؟ = 73", 6), miss("67 − ؟ = 61", 6), miss("88 − ؟ = 48", 40), miss("88 − ؟ = 18", 70),
  ] },
  { id: "7-3", unit: 7, ar: "طرح عددين من منزلتين", en: "Two-digit subtraction", questions: [
    n("78-63"), n("45-22"), n("92-51"), n("88-56"), n("63-23"), n("59-48"),
    choice("ما رقم العشرات في ناتج 48 − 41؟", [0, 7, 4], 0),
    word("عمر رأفة 58 سنة، وعمر ابنتها 21 سنة. ما الفرق بين عمريهما؟", 37),
  ] },
  { id: "7-4", unit: 7, ar: "اختيار العملية", en: "Choose the operation", questions: [
    op("قطفت مرام 23 جزرة و 15 حبة بطاطا. كم حبة قطفت؟ اختر العملية", "+"),
    op("مع زيادة 47 مانجو ومع هبة 15. كم تزيد مانجو زيادة؟ اختر العملية", "-"),
    op("في الطابور 18 طالبًا من الصف الأول و 21 من الصف الثاني. كم طالبًا؟ اختر العملية", "+"),
    op("في الحافلة 43 راكبًا، نزل 20. كم بقي؟ اختر العملية", "-"),
    word("في الحافلة 43 راكبًا، نزل 20. كم راكبًا بقي؟", 23, { k: "emoji", text: "🚌 43 − 20" }),
  ] },
  /* ---------- Unit 8 ---------- */
  { id: "8-1", unit: 8, ar: "المجسمات", en: "3D solids", questions: [
    choice("ما شكل النرد؟", ["مكعب", "كرة", "مخروط"], "مكعب", { visual: { k: "emoji", text: "🎲" } }),
    choice("ما شكل الكرة؟", ["أسطوانة", "كرة", "هرم"], "كرة", { visual: { k: "emoji", text: "⚽" } }),
    choice("ما شكل قرن البوظة؟", ["مخروط", "مكعب", "أسطوانة"], "مخروط", { visual: { k: "emoji", text: "🍦" } }),
    choice("ما شكل العلبة؟", ["كرة", "أسطوانة", "هرم"], "أسطوانة", { visual: { k: "emoji", text: "🥫" } }),
    choice("ما شكل الأهرامات؟", ["هرم", "مكعب", "كرة"], "هرم", { visual: { k: "emoji", text: "🔺🏜️" } }),
    choice("ما شكل صندوق الهدية؟", ["مكعب", "مخروط", "كرة"], "مكعب", { visual: { k: "emoji", text: "🎁" } }),
  ] },
  { id: "8-2", unit: 8, ar: "الأشكال المستوية", en: "2D shapes", questions: [
    choice("ما اسم هذا الشكل؟", ["دائرة", "مثلث", "مربع", "مستطيل"], "دائرة", { visual: { k: "shape", shape: "circle" } }),
    choice("ما اسم هذا الشكل؟", ["دائرة", "مثلث", "مربع", "مستطيل"], "مثلث", { visual: { k: "shape", shape: "triangle" } }),
    choice("ما اسم هذا الشكل؟", ["دائرة", "مثلث", "مربع", "مستطيل"], "مربع", { visual: { k: "shape", shape: "square" } }),
    choice("ما اسم هذا الشكل؟", ["دائرة", "مثلث", "مربع", "مستطيل"], "مستطيل", { visual: { k: "shape", shape: "rectangle" } }),
    choice("اختر المثلث", ["0", "1", "2"], "1", { optionVisuals: [{ k: "shape", shape: "square" }, { k: "shape", shape: "triangle" }, { k: "shape", shape: "circle" }] }),
    choice("اختر المستطيل", ["0", "1", "2"], "2", { optionVisuals: [{ k: "shape", shape: "circle" }, { k: "shape", shape: "square" }, { k: "shape", shape: "rectangle" }] }),
  ] },
  { id: "8-3", unit: 8, ar: "أضلاع وزوايا", en: "Sides & vertices", questions: [
    word("كم ضلعًا للمثلث؟", 3, { k: "shape", shape: "triangle" }), word("كم رأسًا للمثلث؟", 3, { k: "shape", shape: "triangle" }),
    word("كم ضلعًا للمربع؟", 4, { k: "shape", shape: "square" }), word("كم رأسًا للمربع؟", 4, { k: "shape", shape: "square" }),
    word("كم ضلعًا للمستطيل؟", 4, { k: "shape", shape: "rectangle" }), word("كم رأسًا للمستطيل؟", 4, { k: "shape", shape: "rectangle" }),
    choice("أي شكل له 3 أضلاع؟", ["0", "1", "2"], "0", { optionVisuals: [{ k: "shape", shape: "triangle" }, { k: "shape", shape: "square" }, { k: "shape", shape: "rectangle" }] }),
  ] },
  { id: "8-4", unit: 8, ar: "الأنماط الهندسية", en: "Patterns", questions: [
    choice("ما الشكل التالي في النمط؟", ["🔺", "🟦", "🟡"], "🟦", { visual: { k: "pattern", seq: ["🔺", "🟦", "🔺", "🟦", "🔺"] } }),
    choice("ما الشكل التالي في النمط؟", ["🟡", "🔺", "🟦"], "🟡", { visual: { k: "pattern", seq: ["🟡", "🟡", "🔺", "🟡", "🟡", "🔺"] } }),
    choice("ما الشكل التالي في النمط؟", ["🟦", "🟩", "🔺"], "🟩", { visual: { k: "pattern", seq: ["🟦", "🟩", "🔺", "🟦"] } }),
    choice("ما الشكل التالي في النمط؟", ["⭐", "🟡", "🔺"], "⭐", { visual: { k: "pattern", seq: ["⭐", "🟡", "🟡", "⭐", "🟡", "🟡"] } }),
    choice("أكمل النمط", ["🔺", "🟦"], "🔺", { visual: { k: "pattern", seq: ["🟦", "🔺", "🔺", "🟦", "🔺"] } }),
  ] },
  /* ---------- Unit 9 ---------- */
  { id: "9-1", unit: 9, ar: "الأجزاء المتطابقة", en: "Equal parts", questions: [
    word("إلى كم جزءًا متطابقًا قُسم الشكل؟", 2, { k: "fraction", shape: "circle", parts: 2, shaded: 0 }),
    word("إلى كم جزءًا متطابقًا قُسم الشكل؟", 4, { k: "fraction", shape: "rect", parts: 4, shaded: 0 }),
    word("إلى كم جزءًا متطابقًا قُسم الشكل؟", 3, { k: "fraction", shape: "rect", parts: 3, shaded: 0 }),
    choice("أي شكل مقسوم إلى أجزاء متطابقة؟", ["0", "1"], "0", { optionVisuals: [{ k: "fraction", shape: "rect", parts: 2, shaded: 0 }, { k: "fraction", shape: "rect", parts: 2, shaded: 0, equal: false }] }),
  ] },
  { id: "9-2", unit: 9, ar: "النصف", en: "Halves", questions: [
    choice("ما الكسر الذي يمثّل الجزء الملوّن؟", ["1/2", "1/4", "1/3"], "1/2", { visual: { k: "fraction", shape: "circle", parts: 2, shaded: 1 } }),
    choice("ما الكسر الذي يمثّل الجزء الملوّن؟", ["1/4", "1/2"], "1/2", { visual: { k: "fraction", shape: "rect", parts: 2, shaded: 1 } }),
    choice("أي شكل لُوّن نصفه؟", ["0", "1", "2"], "1", { optionVisuals: [{ k: "fraction", shape: "circle", parts: 4, shaded: 1 }, { k: "fraction", shape: "circle", parts: 2, shaded: 1 }, { k: "fraction", shape: "rect", parts: 3, shaded: 1 }] }),
  ] },
  { id: "9-3", unit: 9, ar: "الربع", en: "Quarters", questions: [
    choice("ما الكسر الذي يمثّل الجزء الملوّن؟", ["1/2", "1/4", "1/3"], "1/4", { visual: { k: "fraction", shape: "circle", parts: 4, shaded: 1 } }),
    choice("ما الكسر الذي يمثّل الجزء الملوّن؟", ["1/4", "1/2"], "1/4", { visual: { k: "fraction", shape: "rect", parts: 4, shaded: 1 } }),
    choice("أي شكل لُوّن ربعه؟", ["0", "1", "2"], "2", { optionVisuals: [{ k: "fraction", shape: "rect", parts: 2, shaded: 1 }, { k: "fraction", shape: "circle", parts: 3, shaded: 1 }, { k: "fraction", shape: "circle", parts: 4, shaded: 1 }] }),
  ] },
  { id: "9-4", unit: 9, ar: "الكسر كجزء من مجموعة", en: "Fraction of a set", questions: [
    choice("ما الكسر الذي يمثّل التفاح الملوّن؟", ["1/2", "1/3", "1/4"], "1/2", { visual: { k: "set", emoji: "🍎", n: 2, shaded: 1 } }),
    choice("ما الكسر الذي يمثّل الكرات الملوّنة؟", ["1/2", "1/3", "1/4"], "1/3", { visual: { k: "set", emoji: "⚽", n: 3, shaded: 1 } }),
    choice("ما الكسر الذي يمثّل النجوم الملوّنة؟", ["1/2", "1/3", "1/4"], "1/4", { visual: { k: "set", emoji: "⭐", n: 4, shaded: 1 } }),
  ] },
  /* ---------- Unit 10 ---------- */
  { id: "10-1", unit: 10, ar: "أيام الأسبوع", en: "Days of the week", questions: [
    choice("ما اليوم المفقود؟", ["الإثنين", "الخميس", "السبت"], "الإثنين", { visual: { k: "week", missing: 1 } }),
    choice("ما اليوم المفقود؟", ["الأحد", "الأربعاء", "الجمعة"], "الأربعاء", { visual: { k: "week", missing: 3 } }),
    choice("ما اليوم المفقود؟", ["الثلاثاء", "الجمعة", "الأحد"], "الجمعة", { visual: { k: "week", missing: 5 } }),
    choice("ما اليوم الذي يأتي بعد الخميس؟", ["الجمعة", "الأربعاء", "السبت"], "الجمعة"),
    choice("ما اليوم الذي يأتي قبل الأحد؟", ["الإثنين", "السبت", "الجمعة"], "السبت"),
    choice("هل يوم الجمعة عطلة أم يوم دراسة؟", ["عطلة", "دراسة"], "عطلة"),
    word("كم يومًا في الأسبوع؟", 7),
  ] },
  { id: "10-2", unit: 10, ar: "ترتيب الأعمال", en: "Sequencing", questions: [
    { kind: "order", prompt: "رتّب مراحل نمو النبتة", answer: "", items: ["🌰 بذرة", "🌱 برعم", "🌿 نبتة", "🌻 زهرة"] },
    { kind: "order", prompt: "رتّب أعمال الصباح", answer: "", items: ["⏰ أستيقظ", "🪥 أنظّف أسناني", "🍳 أفطر", "🎒 أذهب إلى المدرسة"] },
    { kind: "order", prompt: "رتّب الأعمال", answer: "", items: ["🥚 بيضة", "🐣 يفقس", "🐥 صوص", "🐔 دجاجة"] },
  ] },
  { id: "10-3", unit: 10, ar: "الوقت بالساعات", en: "Full hours", questions: [
    choice("كم الساعة؟", ["3:00", "12:15", "9:00"], "3:00", { visual: clock(3) }),
    choice("كم الساعة؟", ["7:00", "12:07", "5:00"], "7:00", { visual: clock(7) }),
    choice("كم الساعة؟", ["10:00", "2:00", "12:10"], "10:00", { visual: clock(10) }),
    choice("اختر الساعة التي تشير إلى 4:00", ["0", "1", "2"], "1", { optionVisuals: [clock(8), clock(4), clock(12)] }),
    choice("الساعة الآن 3:00. كم تصبح الساعة بعد ساعتين؟", ["4:00", "5:00", "6:00"], "5:00", { visual: clock(3) }),
  ] },
  { id: "10-4", unit: 10, ar: "الوقت بنصف الساعة", en: "Half hours", questions: [
    choice("كم الساعة؟", ["6:30", "6:00", "7:30"], "6:30", { visual: clock(6, 30) }),
    choice("كم الساعة؟", ["1:30", "2:30", "1:00"], "2:30", { visual: clock(2, 30) }),
    choice("كم الساعة؟", ["9:00", "9:30", "10:30"], "9:30", { visual: clock(9, 30) }),
    choice("اختر الساعة التي تشير إلى 6:30", ["0", "1", "2"], "0", { optionVisuals: [clock(6, 30), clock(6), clock(12, 30)] }),
  ] },
  { id: "10-5", unit: 10, ar: "القطع النقدية", en: "Coin value", questions: [
    word("كم قرشًا هنا؟", 10, { k: "coins", coins: [5, 5] }), word("كم قرشًا هنا؟", 15, { k: "coins", coins: [10, 5] }),
    word("كم قرشًا هنا؟", 20, { k: "coins", coins: [10, 5, 5] }), word("كم قرشًا هنا؟", 25, { k: "coins", coins: [10, 10, 5] }),
    word("كم قرشًا هنا؟", 45, { k: "coins", coins: [25, 10, 10] }), word("كم قرشًا هنا؟", 70, { k: "coins", coins: [50, 10, 10] }),
  ] },
  { id: "10-6", unit: 10, ar: "القطع المتساوية", en: "Equal combinations", questions: [
    choice("أي مجموعة قيمتها 75 قرشًا؟", ["0", "1", "2"], "0", { optionVisuals: [{ k: "coins", coins: [50, 25] }, { k: "coins", coins: [50, 10, 10] }, { k: "coins", coins: [25, 25, 10] }] }),
    choice("أي مجموعة قيمتها 75 قرشًا أيضًا؟", ["0", "1", "2"], "2", { optionVisuals: [{ k: "coins", coins: [25, 25] }, { k: "coins", coins: [50, 5] }, { k: "coins", coins: [25, 25, 25] }] }),
    choice("ما أقل عدد من القطع لتكوين 80 قرشًا؟", ["0", "1", "2"], "1", { optionVisuals: [{ k: "coins", coins: [25, 25, 10, 10, 10] }, { k: "coins", coins: [50, 25, 5] }, { k: "coins", coins: [50, 10, 10, 10] }] }),
    choice("أي مجموعة قيمتها 30 قرشًا؟", ["0", "1"], "1", { optionVisuals: [{ k: "coins", coins: [10, 10, 5] }, { k: "coins", coins: [25, 5] }] }),
  ] },
  { id: "10-7", unit: 10, ar: "استعمال النقود", en: "Using money", questions: [35, 45, 55, 60, 80, 85, 90, 95].map((price) => {
    const sets: Record<number, number[][]> = {
      35: [[25, 10], [25, 5], [10, 10, 10]], 45: [[25, 10, 10], [25, 10, 5], [50]], 55: [[50, 5], [25, 25], [50, 10]],
      60: [[50, 10], [25, 25, 5], [50, 5]], 80: [[50, 25, 5], [50, 25], [50, 10, 10]], 85: [[50, 25, 10], [50, 25, 5], [50, 10, 10, 10]],
      90: [[50, 25, 10, 5], [50, 25, 10], [50, 10, 10, 10]], 95: [[50, 25, 10, 10], [50, 25, 10, 5], [50, 25, 25]],
    };
    const opts = sets[price]!;
    const right = opts.findIndex((c) => c.reduce((a, b) => a + b, 0) === price);
    return choice(`اختر النقود لشراء لعبة ثمنها ${price} قرشًا`, opts.map((_, i) => String(i)), String(right), { optionVisuals: opts.map((coins) => ({ k: "coins", coins }) as G1Visual) });
  }) },
  /* ---------- Unit 11 ---------- */
  { id: "11-1", unit: 11, ar: "مقارنة الأطوال", en: "Comparing length", questions: [
    choice("اختر الأطول", ["0", "1", "2"], "2", { optionVisuals: [{ k: "clips", emoji: "✏️", n: 2 }, { k: "clips", emoji: "✏️", n: 3 }, { k: "clips", emoji: "✏️", n: 5 }] }),
    choice("اختر الأقصر", ["0", "1", "2"], "0", { optionVisuals: [{ k: "clips", emoji: "🐍", n: 1 }, { k: "clips", emoji: "🐍", n: 4 }, { k: "clips", emoji: "🐍", n: 3 }] }),
    { kind: "order", prompt: "رتّب من الأقصر إلى الأطول", answer: "", items: ["🐜 نملة", "🐈 قطة", "🐎 حصان", "🦒 زرافة"] },
    { kind: "order", prompt: "رتّب من الأقصر إلى الأطول", answer: "", items: ["🖍️ طبشورة", "✏️ قلم", "📏 مسطرة", "🚪 باب"] },
  ] },
  { id: "11-2", unit: 11, ar: "وحدات الطول", en: "Length in clips", questions: [
    word("كم مشبكًا طول القلم؟", 4, { k: "clips", emoji: "✏️", n: 4 }), word("كم مشبكًا طول الفرشاة؟", 6, { k: "clips", emoji: "🖌️", n: 6 }),
    word("كم مشبكًا طول المفتاح؟", 2, { k: "clips", emoji: "🔑", n: 2 }), choice("طول الملعقة تقريبًا؟", [3, 30, 300], 3, { visual: { k: "clips", emoji: "🥄", n: 3 } }),
  ] },
  { id: "11-3", unit: 11, ar: "مقارنة الكتل", en: "Comparing mass", questions: [
    choice("اختر الأثقل", ["🪶", "🐘", "🍎"], "🐘"), choice("اختر الأخف", ["🚗", "🎈", "📚"], "🎈"), choice("اختر الأثقل", ["🍉", "🍓", "🍇"], "🍉"),
    { kind: "order", prompt: "رتّب من الأخف إلى الأثقل", answer: "", items: ["🪶 ريشة", "🍎 تفاحة", "🍉 بطيخة", "🐘 فيل"] },
  ] },
  { id: "11-4", unit: 11, ar: "وحدات الكتلة", en: "Mass units", questions: [
    word("كم مكعبًا يوازن التفاحة؟", 3, { k: "balance", left: "🍎", blocks: 3 }), word("كم مكعبًا يوازن الموزة؟", 5, { k: "balance", left: "🍌", blocks: 5 }),
    word("كم مكعبًا يوازن الكرة؟", 7, { k: "balance", left: "⚽", blocks: 7 }),
    choice("الكفة فيها 4 مكعبات والتفاحة تحتاج 6. ماذا نفعل؟", ["نضيف 2", "نزيل 2"], "نضيف 2", { visual: { k: "balance", left: "🍎", blocks: 4 } }),
  ] },
  { id: "11-5", unit: 11, ar: "مقارنة السعات", en: "Comparing capacity", questions: [
    choice("أيها يتسع لماء أكثر؟", ["☕", "🪣", "🥄"], "🪣", { optionScale: [1, 1.5, 0.8] }), choice("أيها يتسع لماء أقل؟", ["🛁", "🥛", "🪣"], "🥛", { optionScale: [1.5, 0.9, 1.2] }),
    { kind: "order", prompt: "رتّب من الأصغر سعة إلى الأكبر", answer: "", items: ["🥄 ملعقة", "☕ كوب", "🪣 دلو", "🛁 حوض"] },
  ] },
  { id: "11-6", unit: 11, ar: "وحدات السعة", en: "Capacity units", questions: [
    choice("كم كوبًا يملأ الإبريق تقريبًا؟", [6, 60, 1], 6, { visual: { k: "emoji", text: "🫖 = ☕ × ؟" } }),
    choice("كم كوبًا يملأ الدلو تقريبًا؟", [2, 20, 200], 20, { visual: { k: "emoji", text: "🪣 = ☕ × ؟" } }),
    choice("كم كوبًا يملأ الحوض تقريبًا؟", [8, 50, 1], 50, { visual: { k: "emoji", text: "🛁 = ☕ × ؟" } }),
    choice("كم كوبًا تملأ الزجاجة تقريبًا؟", [2, 60, 20], 2, { visual: { k: "emoji", text: "🍼 = ☕ × ؟" } }),
    choice("كم كوبًا يملأ الوعاء الكبير تقريبًا؟", [1, 8, 60], 8, { visual: { k: "emoji", text: "🍲 = ☕ × ؟" } }),
  ] },
];
