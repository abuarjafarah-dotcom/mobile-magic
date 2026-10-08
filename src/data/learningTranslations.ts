import type { LearningLanguage } from "@/lib/learningLanguage";

const EN: Record<string, string> = {
  "رياضيات الصف الأول": "Grade 1 Math", "الوحدة": "Unit", "الدرس": "Lesson", "الصف الأول": "Grade 1",
  "رمضان كريم": "Ramadan Kareem", "وضع رمضان: مُفعَّل": "Ramadan theme: On", "تفعيل وضع رمضان": "Turn on Ramadan theme",
  "أحسنت!": "Well done!", "حاول مرة أخرى": "Try again", "احسب": "Calculate", "اجمع": "Add",
  "اجمع (العشرات مع العشرات والآحاد مع الآحاد)": "Add tens to tens and ones to ones",
  "قارن باستعمال < أو > أو =": "Compare using <, >, or =", "ما العدد المفقود؟": "What is the missing number?",
  "الجمع ضمن منزلتين": "Two-digit addition", "الطرح ضمن منزلتين": "Two-digit subtraction", "الأشكال الهندسية": "Geometry", "الكسور": "Fractions", "الزمن والنقود": "Time and money", "القياس": "Measurement",
  "جمع العشرات": "Adding tens", "الجمع الذهني": "Mental addition", "جمع عددين من منزلتين": "Two-digit addition", "التخمين والتحقق": "Guess and check",
  "طرح العشرات": "Subtracting tens", "الطرح الذهني": "Mental subtraction", "طرح عددين من منزلتين": "Two-digit subtraction", "اختيار العملية": "Choose the operation",
  "المجسمات": "3D solids", "الأشكال المستوية": "2D shapes", "أضلاع وزوايا": "Sides and vertices", "الأنماط الهندسية": "Patterns",
  "الأجزاء المتطابقة": "Equal parts", "النصف": "Halves", "الربع": "Quarters", "الكسر كجزء من مجموعة": "Fraction of a set",
  "أيام الأسبوع": "Days of the week", "ترتيب الأعمال": "Sequencing", "الوقت بالساعات": "Full hours", "الوقت بنصف الساعة": "Half hours", "القطع النقدية": "Coin value", "القطع المتساوية": "Equal combinations", "استعمال النقود": "Using money",
  "مقارنة الأطوال": "Comparing length", "وحدات الطول": "Length units", "مقارنة الكتل": "Comparing mass", "وحدات الكتلة": "Mass units", "مقارنة السعات": "Comparing capacity", "وحدات السعة": "Capacity units",
  "مكعب": "cube", "كرة": "sphere", "مخروط": "cone", "أسطوانة": "cylinder", "هرم": "pyramid", "دائرة": "circle", "مثلث": "triangle", "مربع": "square", "مستطيل": "rectangle",
  "الأحد": "Sunday", "الإثنين": "Monday", "الثلاثاء": "Tuesday", "الأربعاء": "Wednesday", "الخميس": "Thursday", "الجمعة": "Friday", "السبت": "Saturday", "عطلة": "a day off", "دراسة": "a school day",
  "نضيف 2": "Add 2", "نزيل 2": "Remove 2",
  "ما شكل النرد؟": "What shape is the die?", "ما شكل الكرة؟": "What shape is the ball?", "ما شكل قرن البوظة؟": "What shape is the ice-cream cone?", "ما شكل العلبة؟": "What shape is the can?", "ما شكل الأهرامات؟": "What shape are the pyramids?", "ما شكل صندوق الهدية؟": "What shape is the gift box?",
  "ما اسم هذا الشكل؟": "What is this shape called?", "اختر المثلث": "Choose the triangle", "اختر المستطيل": "Choose the rectangle",
  "كم ضلعًا للمثلث؟": "How many sides does a triangle have?", "كم رأسًا للمثلث؟": "How many vertices does a triangle have?", "كم ضلعًا للمربع؟": "How many sides does a square have?", "كم رأسًا للمربع؟": "How many vertices does a square have?", "كم ضلعًا للمستطيل؟": "How many sides does a rectangle have?", "كم رأسًا للمستطيل؟": "How many vertices does a rectangle have?", "أي شكل له 3 أضلاع؟": "Which shape has 3 sides?",
  "ما الشكل التالي في النمط؟": "Which shape comes next?", "أكمل النمط": "Complete the pattern",
  "إلى كم جزءًا متطابقًا قُسم الشكل؟": "How many equal parts is the shape divided into?", "أي شكل مقسوم إلى أجزاء متطابقة؟": "Which shape is divided into equal parts?", "ما الكسر الذي يمثّل الجزء الملوّن؟": "Which fraction shows the colored part?", "أي شكل لُوّن نصفه؟": "Which shape has one half colored?", "أي شكل لُوّن ربعه؟": "Which shape has one quarter colored?",
  "ما الكسر الذي يمثّل التفاح الملوّن؟": "Which fraction shows the colored apples?", "ما الكسر الذي يمثّل الكرات الملوّنة؟": "Which fraction shows the colored balls?", "ما الكسر الذي يمثّل النجوم الملوّنة؟": "Which fraction shows the colored stars?",
  "ما اليوم المفقود؟": "Which day is missing?", "ما اليوم الذي يأتي بعد الخميس؟": "Which day comes after Thursday?", "ما اليوم الذي يأتي قبل الأحد؟": "Which day comes before Sunday?", "هل يوم الجمعة عطلة أم يوم دراسة؟": "Is Friday a day off or a school day?", "كم يومًا في الأسبوع؟": "How many days are in a week?",
  "رتّب مراحل نمو النبتة": "Put the plant's growth stages in order", "رتّب أعمال الصباح": "Put the morning routine in order", "رتّب الأعمال": "Put the events in order",
  "كم الساعة؟": "What time is it?", "اختر الساعة التي تشير إلى 4:00": "Choose the clock that shows 4:00", "الساعة الآن 3:00. كم تصبح الساعة بعد ساعتين؟": "It is 3:00 now. What time will it be in two hours?", "اختر الساعة التي تشير إلى 6:30": "Choose the clock that shows 6:30",
  "كم قرشًا هنا؟": "How many piastres are here?", "أي مجموعة قيمتها 75 قرشًا؟": "Which group is worth 75 piastres?", "أي مجموعة قيمتها 75 قرشًا أيضًا؟": "Which other group is worth 75 piastres?", "ما أقل عدد من القطع لتكوين 80 قرشًا؟": "What is the fewest coins needed to make 80 piastres?", "أي مجموعة قيمتها 30 قرشًا؟": "Which group is worth 30 piastres?",
  "اختر الأطول": "Choose the longest", "اختر الأقصر": "Choose the shortest", "رتّب من الأقصر إلى الأطول": "Order from shortest to longest", "كم مشبكًا طول القلم؟": "How many clips long is the pencil?", "كم مشبكًا طول الفرشاة؟": "How many clips long is the brush?", "كم مشبكًا طول المفتاح؟": "How many clips long is the key?", "طول الملعقة تقريبًا؟": "About how many clips long is the spoon?",
  "اختر الأثقل": "Choose the heaviest", "اختر الأخف": "Choose the lightest", "رتّب من الأخف إلى الأثقل": "Order from lightest to heaviest", "كم مكعبًا يوازن التفاحة؟": "How many blocks balance the apple?", "كم مكعبًا يوازن الموزة؟": "How many blocks balance the banana?", "كم مكعبًا يوازن الكرة؟": "How many blocks balance the ball?", "الكفة فيها 4 مكعبات والتفاحة تحتاج 6. ماذا نفعل؟": "The pan has 4 blocks, but the apple needs 6. What should we do?",
  "أيها يتسع لماء أكثر؟": "Which holds more water?", "أيها يتسع لماء أقل؟": "Which holds less water?", "رتّب من الأصغر سعة إلى الأكبر": "Order from smallest to largest capacity", "كم كوبًا يملأ الإبريق تقريبًا؟": "About how many cups fill the pitcher?", "كم كوبًا يملأ الدلو تقريبًا؟": "About how many cups fill the bucket?", "كم كوبًا يملأ الحوض تقريبًا؟": "About how many cups fill the tub?", "كم كوبًا تملأ الزجاجة تقريبًا؟": "About how many cups fill the bottle?", "كم كوبًا يملأ الوعاء الكبير تقريبًا؟": "About how many cups fill the large pot?",
  "في مزرعة 20 شجرة برتقال و 70 شجرة ليمون. كم شجرة في المزرعة؟": "A farm has 20 orange trees and 70 lemon trees. How many trees are there?",
  "في الصف 22 طالبًا، ثم دخل 6 طلاب. كم طالبًا أصبح في الصف؟": "There were 22 students in class, then 6 more entered. How many are there now?",
  "صنع عماد 36 كعكة، ثم صنع 20 كعكة أخرى. كم كعكة صنع؟": "Imad made 36 cakes, then 20 more. How many cakes did he make?",
  "وزّعت رهف 43 وجبة في اليوم الأول و 52 وجبة في اليوم الثاني. كم وجبة وزّعت؟": "Rahaf gave out 43 meals on the first day and 52 on the second. How many meals did she give out?",
  "سجّل رامي 21 نقطة، ويريد أن يصل إلى 45. كم نقطة يحتاج بعد؟": "Rami scored 21 points and wants to reach 45. How many more does he need?",
  "مع تمارا 41 ملصقًا، ومجموع ملصقاتها مع مهند 78. كم ملصقًا مع مهند؟": "Tamara has 41 stickers. Together, she and Muhannad have 78. How many does Muhannad have?",
  "في محل 65 وردة، منها 24 وردة حمراء والباقي قرنفل. كم قرنفلة؟": "A shop has 65 flowers. 24 are red roses and the rest are carnations. How many carnations?",
  "في النادي 45 كرة طائرة، ومجموع الكرات الطائرة وكرات التنس 87. كم كرة تنس؟": "A club has 45 volleyballs and 87 volleyballs and tennis balls altogether. How many tennis balls?",
  "كان 30 نملة خارج البيت، ثم دخلت 10 نملات. كم نملة بقيت في الخارج؟": "There were 30 ants outside. Then 10 went inside. How many stayed outside?",
  "ما رقم العشرات في ناتج 48 − 41؟": "What is the tens digit in 48 − 41?", "عمر رأفة 58 سنة، وعمر ابنتها 21 سنة. ما الفرق بين عمريهما؟": "Ra'fa is 58 and her daughter is 21. What is the difference in their ages?",
  "قطفت مرام 23 جزرة و 15 حبة بطاطا. كم حبة قطفت؟ اختر العملية": "Maram picked 23 carrots and 15 potatoes. How many items did she pick? Choose the operation.",
  "مع زيادة 47 مانجو ومع هبة 15. كم تزيد مانجو زيادة؟ اختر العملية": "Ziyada has 47 mangoes and Hiba has 15. How many more does Ziyada have? Choose the operation.",
  "في الطابور 18 طالبًا من الصف الأول و 21 من الصف الثاني. كم طالبًا؟ اختر العملية": "There are 18 first-grade and 21 second-grade students in line. How many students? Choose the operation.",
  "في الحافلة 43 راكبًا، نزل 20. كم بقي؟ اختر العملية": "There were 43 passengers on the bus and 20 got off. How many remain? Choose the operation.", "في الحافلة 43 راكبًا، نزل 20. كم راكبًا بقي؟": "There were 43 passengers on the bus and 20 got off. How many remain?"
};

const WORDS: Record<string, string> = {
  "🌰 بذرة":"🌰 seed", "🌱 برعم":"🌱 sprout", "🌿 نبتة":"🌿 plant", "🌻 زهرة":"🌻 flower", "⏰ أستيقظ":"⏰ wake up", "🪥 أنظّف أسناني":"🪥 brush my teeth", "🍳 أفطر":"🍳 eat breakfast", "🎒 أذهب إلى المدرسة":"🎒 go to school", "🥚 بيضة":"🥚 egg", "🐣 يفقس":"🐣 hatch", "🐥 صوص":"🐥 chick", "🐔 دجاجة":"🐔 hen", "🐜 نملة":"🐜 ant", "🐈 قطة":"🐈 cat", "🐎 حصان":"🐎 horse", "🦒 زرافة":"🦒 giraffe", "🖍️ طبشورة":"🖍️ chalk", "✏️ قلم":"✏️ pencil", "📏 مسطرة":"📏 ruler", "🚪 باب":"🚪 door", "🪶 ريشة":"🪶 feather", "🍎 تفاحة":"🍎 apple", "🍉 بطيخة":"🍉 watermelon", "🐘 فيل":"🐘 elephant", "🥄 ملعقة":"🥄 spoon", "☕ كوب":"☕ cup", "🪣 دلو":"🪣 bucket", "🛁 حوض":"🛁 tub"
};

export function mathText(text: string, language: LearningLanguage): string {
  if (language === "ar") return text;
  if (EN[text]) return EN[text];
  if (WORDS[text]) return WORDS[text];
  const price = text.match(/^اختر النقود لشراء لعبة ثمنها (\d+) قرشًا$/);
  if (price) return `Choose the coins to buy a toy costing ${price[1]} piastres`;
  return text.replaceAll("؟", "?");
}
