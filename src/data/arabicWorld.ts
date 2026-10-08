// Arabic ++ world. Everything here is data — add words, verbs, sentences or questions and the games pick them up.
// All Arabic strings carry harakat; the exact string is also the audio key (see arabicWorldAudio.ts).

export type Who = "hamad" | "talal" | "yousef" | "mama" | "baba";
export type Pic = { emoji?: string; color?: string; who?: Who | "family"; shape?: "circle" | "square" | "triangle" | "rectangle" | "star" | "heart" | "oval" | "diamond" | "crescent"; animal?: string };
export type Word = { id: string; ar: string; en: string; pic: Pic };
export type Category = { id: string; ar: string; en: string; icon: string; tone: "sun" | "sky" | "mint" | "berry"; words: Word[] };

const w = (id: string, ar: string, en: string, emoji: string, animal?: string): Word => ({ id, ar, en, pic: animal ? { emoji, animal } : { emoji } });
const a = (id: string, ar: string, en: string, emoji: string) => w(id, ar, en, emoji, id);

export const categories: Category[] = [
  { id: "animals", ar: "الْحَيَوَانَات", en: "Animals", icon: "🦁", tone: "mint", words: [
    a("cat", "قِطَّة", "cat", "🐈"), a("dog", "كَلْب", "dog", "🐕"), a("lion", "أَسَد", "lion", "🦁"), a("elephant", "فِيل", "elephant", "🐘"),
    a("giraffe", "زَرَافَة", "giraffe", "🦒"), a("horse", "حِصَان", "horse", "🐎"), a("cow", "بَقَرَة", "cow", "🐄"), a("sheep", "خَرُوف", "sheep", "🐑"),
    a("rabbit", "أَرْنَب", "rabbit", "🐇"), a("bear", "دُبّ", "bear", "🐻"), a("monkey", "قِرْد", "monkey", "🐒"), a("bird", "طَائِر", "bird", "🐦"),
    a("fish", "سَمَكَة", "fish", "🐟"), a("chicken", "دَجَاجَة", "chicken", "🐔"), a("mouse", "فَأْر", "mouse", "🐁"),
    w("bee", "نَحْلَة", "bee", "🐝"), w("ant", "نَمْلَة", "ant", "🐜"), w("spider", "عَنْكَبُوت", "spider", "🕷️"), w("butterfly", "فَرَاشَة", "butterfly", "🦋"), w("camel", "جَمَل", "camel", "🐫"),
  ] },
  { id: "fruits", ar: "الْفَوَاكِه", en: "Fruits", icon: "🍎", tone: "berry", words: [
    w("apple", "تُفَّاحَة", "apple", "🍎"), w("banana", "مَوْزَة", "banana", "🍌"), w("orange", "بُرْتُقَالَة", "orange", "🍊"), w("grapes", "عِنَب", "grapes", "🍇"),
    w("strawberry", "فَرَاوِلَة", "strawberry", "🍓"), w("watermelon", "بِطِّيخ", "watermelon", "🍉"), w("mango", "مَانْجُو", "mango", "🥭"), w("pear", "كُمَّثْرَى", "pear", "🍐"),
    w("peach", "خَوْخ", "peach", "🍑"), w("cherry", "كَرَز", "cherry", "🍒"), w("lemon", "لَيْمُون", "lemon", "🍋"), w("pineapple", "أَنَانَاس", "pineapple", "🍍"),
    w("kiwi", "كِيوِي", "kiwi", "🥝"), w("coconut", "جَوْزُ الْهِنْد", "coconut", "🥥"), w("berries", "تُوت", "berries", "🫐"),
  ] },
  { id: "vegetables", ar: "الْخُضْرَوَات", en: "Vegetables", icon: "🥕", tone: "mint", words: [
    w("carrot", "جَزَر", "carrot", "🥕"), w("tomato", "طَمَاطِم", "tomato", "🍅"), w("cucumber", "خِيَار", "cucumber", "🥒"), w("potato", "بَطَاطَا", "potato", "🥔"),
    w("onion", "بَصَل", "onion", "🧅"), w("garlic", "ثُوم", "garlic", "🧄"), w("corn", "ذُرَة", "corn", "🌽"), w("pepper", "فُلْفُل", "pepper", "🫑"),
    w("eggplant", "بَاذِنْجَان", "eggplant", "🍆"), w("broccoli", "بُرُوكُلِي", "broccoli", "🥦"), w("lettuce", "خَسّ", "lettuce", "🥬"), w("mushroom", "فُطْر", "mushroom", "🍄"),
    w("chili", "فُلْفُل حَارّ", "chili", "🌶️"), w("peas", "بَازِلَّاء", "peas", "🫛"), w("ginger", "زَنْجَبِيل", "ginger", "🫚"),
  ] },
  { id: "family", ar: "عَائِلَتِي", en: "My family", icon: "👨‍👩‍👦", tone: "sun", words: [
    { id: "hamad", ar: "حَمَد", en: "Hamad", pic: { who: "hamad" } }, { id: "talal", ar: "طَلَال", en: "Talal", pic: { who: "talal" } },
    { id: "yousef", ar: "يُوسُف", en: "Yousef", pic: { who: "yousef" } }, { id: "mama", ar: "مَامَا", en: "Mama", pic: { who: "mama" } },
    { id: "baba", ar: "بَابَا", en: "Dad", pic: { who: "baba" } }, { id: "family", ar: "عَائِلَة", en: "family", pic: { who: "family" } },
    { id: "brother", ar: "أَخ", en: "brother", pic: { who: "talal" } }, { id: "child", ar: "طِفْل", en: "child", pic: { who: "yousef" } },
    w("grandpa", "جَدّ", "grandpa", "👴"), w("grandma", "جَدَّة", "grandma", "👵"), w("sister", "أُخْت", "sister", "👧"), w("baby", "رَضِيع", "baby", "👶"),
    w("boy", "وَلَد", "boy", "👦"), w("girl", "بِنْت", "girl", "👧"),
  ] },
  { id: "home", ar: "الْبَيْت", en: "Home", icon: "🏠", tone: "sky", words: [
    w("house", "بَيْت", "house", "🏠"), w("door", "بَاب", "door", "🚪"), w("window", "نَافِذَة", "window", "🪟"), w("bed", "سَرِير", "bed", "🛏️"),
    w("chair", "كُرْسِيّ", "chair", "🪑"), w("sofa", "كَنَبَة", "sofa", "🛋️"), w("lamp", "مِصْبَاح", "lamp", "💡"), w("key", "مِفْتَاح", "key", "🔑"),
    w("clock", "سَاعَة", "clock", "⏰"), w("cup", "كُوب", "cup", "🥤"), w("plate", "صَحْن", "plate", "🍽️"), w("spoon", "مِلْعَقَة", "spoon", "🥄"),
    w("bath", "حَوْض", "bathtub", "🛁"), w("mirror", "مِرْآة", "mirror", "🪞"), w("broom", "مِكْنَسَة", "broom", "🧹"), w("tv", "تِلْفَاز", "TV", "📺"), w("phone", "هَاتِف", "phone", "📱"),
  ] },
  { id: "nature", ar: "الطَّبِيعَة", en: "Nature", icon: "🌳", tone: "mint", words: [
    w("tree", "شَجَرَة", "tree", "🌳"), w("flower", "زَهْرَة", "flower", "🌸"), w("plant", "نَبْتَة", "plant", "🌱"), w("water", "مَاء", "water", "💧"),
    w("rain", "مَطَر", "rain", "🌧️"), w("sun", "شَمْس", "sun", "☀️"), w("moon", "قَمَر", "moon", "🌙"), w("star", "نَجْمَة", "star", "⭐"),
    w("sky", "سَمَاء", "sky", "🌌"), w("cloud", "سَحَابَة", "cloud", "☁️"), w("sea", "بَحْر", "sea", "🌊"), w("mountain", "جَبَل", "mountain", "⛰️"),
    w("river", "نَهْر", "river", "🏞️"), w("snow", "ثَلْج", "snow", "❄️"), w("rainbow", "قَوْسُ قُزَح", "rainbow", "🌈"), w("leaf", "وَرَقَة", "leaf", "🍃"), w("grass", "عُشْب", "grass", "🌿"),
  ] },
  { id: "food", ar: "الطَّعَام", en: "Food", icon: "🍞", tone: "sun", words: [
    w("bread", "خُبْز", "bread", "🍞"), w("rice", "أَرُزّ", "rice", "🍚"), w("milk", "حَلِيب", "milk", "🥛"), w("cheese", "جُبْن", "cheese", "🧀"),
    w("egg", "بَيْضَة", "egg", "🥚"), w("honey", "عَسَل", "honey", "🍯"), w("meat", "لَحْم", "meat", "🥩"), w("soup", "شُورْبَة", "soup", "🍲"),
    w("juice", "عَصِير", "juice", "🧃"), w("cake", "كَعْكَة", "cake", "🎂"), w("pizza", "بِيتْزَا", "pizza", "🍕"), w("pasta", "مَعْكَرُونَة", "pasta", "🍝"),
    w("salad", "سَلَطَة", "salad", "🥗"), w("icecream", "بُوظَة", "ice cream", "🍦"), w("tea", "شَاي", "tea", "🍵"), w("olive", "زَيْتُون", "olives", "🫒"),
  ] },
  { id: "colors", ar: "الْأَلْوَان", en: "Colors", icon: "🎨", tone: "berry", words: ([
    ["red", "أَحْمَر", "#e0433a"], ["blue", "أَزْرَق", "#2f6fd6"], ["yellow", "أَصْفَر", "#f5c72e"], ["green", "أَخْضَر", "#3aa655"], ["orange", "بُرْتُقَالِيّ", "#f28a2e"],
    ["purple", "بَنَفْسَجِيّ", "#8a4fc7"], ["pink", "وَرْدِيّ", "#f28bb8"], ["brown", "بُنِّيّ", "#8b5a2b"], ["black", "أَسْوَد", "#222222"], ["white", "أَبْيَض", "#ffffff"],
    ["gray", "رَمَادِيّ", "#9a9a9a"], ["gold", "ذَهَبِيّ", "#d4a62a"], ["silver", "فِضِّيّ", "#c4c8cc"], ["navy", "كُحْلِيّ", "#1d2d5c"], ["sky", "سَمَاوِيّ", "#8ecdf5"],
  ] as const).map(([id, ar, color]) => ({ id, ar, en: id, pic: { color } })) },
  { id: "shapes", ar: "الْأَشْكَال", en: "Shapes", icon: "🔷", tone: "sky", words: ([
    ["circle", "دَائِرَة"], ["square", "مُرَبَّع"], ["triangle", "مُثَلَّث"], ["rectangle", "مُسْتَطِيل"], ["star", "نَجْمَة"], ["heart", "قَلْب"], ["oval", "بَيْضَاوِيّ"], ["diamond", "مُعَيَّن"], ["crescent", "هِلَال"],
  ] as const).map(([id, ar]) => ({ id, ar, en: id, pic: { shape: id } })) },
  { id: "clothes", ar: "الْمَلَابِس", en: "Clothes", icon: "👕", tone: "sun", words: [
    w("shirt", "قَمِيص", "shirt", "👕"), w("pants", "بِنْطَال", "trousers", "👖"), w("dress", "فُسْتَان", "dress", "👗"), w("shoe", "حِذَاء", "shoe", "👟"),
    w("cap", "قُبَّعَة", "cap", "🧢"), w("socks", "جَوَارِب", "socks", "🧦"), w("coat", "مِعْطَف", "coat", "🧥"), w("glasses", "نَظَّارَة", "glasses", "👓"),
    w("bag", "حَقِيبَة", "bag", "🎒"), w("scarf", "وِشَاح", "scarf", "🧣"), w("gloves", "قُفَّاز", "gloves", "🧤"), w("tie", "رَبْطَةُ عُنُق", "tie", "👔"),
    w("sandals", "نَعْل", "sandals", "🩴"), w("ring", "خَاتَم", "ring", "💍"), w("watch", "سَاعَةُ يَد", "watch", "⌚"),
  ] },
  { id: "transport", ar: "الْمُوَاصَلَات", en: "Transport", icon: "🚗", tone: "sky", words: [
    w("car", "سَيَّارَة", "car", "🚗"), w("bus", "حَافِلَة", "bus", "🚌"), w("train", "قِطَار", "train", "🚆"), w("plane", "طَائِرَة", "plane", "✈️"),
    w("ship", "سَفِينَة", "ship", "🚢"), w("bike", "دَرَّاجَة", "bike", "🚲"), w("boat", "قَارِب", "boat", "⛵"), w("truck", "شَاحِنَة", "truck", "🚚"),
    w("ambulance", "سَيَّارَةُ إِسْعَاف", "ambulance", "🚑"), w("firetruck", "سَيَّارَةُ إِطْفَاء", "fire truck", "🚒"), w("helicopter", "مِرْوَحِيَّة", "helicopter", "🚁"),
    w("rocket", "صَارُوخ", "rocket", "🚀"), w("taxi", "سَيَّارَةُ أُجْرَة", "taxi", "🚕"), w("tractor", "جَرَّار", "tractor", "🚜"), w("motorbike", "دَرَّاجَة نَارِيَّة", "motorbike", "🏍️"),
  ] },
  { id: "school", ar: "الْمَدْرَسَة", en: "School", icon: "🏫", tone: "berry", words: [
    w("book", "كِتَاب", "book", "📖"), w("pencil", "قَلَم", "pencil", "✏️"), w("notebook", "دَفْتَر", "notebook", "📓"), w("scissors", "مِقَصّ", "scissors", "✂️"),
    w("ruler", "مِسْطَرَة", "ruler", "📏"), w("crayons", "أَلْوَان", "crayons", "🖍️"), w("school", "مَدْرَسَة", "school", "🏫"), w("teacher", "مُعَلِّم", "teacher", "🧑‍🏫"),
    w("brush", "فُرْشَاة", "brush", "🖌️"), w("globe", "كُرَةُ الْأَرْض", "globe", "🌍"), w("computer", "حَاسُوب", "computer", "💻"), w("bell", "جَرَس", "bell", "🔔"), w("letter", "رِسَالَة", "letter", "✉️"),
  ] },
  { id: "body", ar: "الْجِسْم", en: "Body", icon: "✋", tone: "sun", words: [
    w("eye", "عَيْن", "eye", "👁️"), w("ear", "أُذُن", "ear", "👂"), w("nose", "أَنْف", "nose", "👃"), w("mouth", "فَم", "mouth", "👄"),
    w("hand", "يَد", "hand", "✋"), w("foot", "قَدَم", "foot", "🦶"), w("leg", "رِجْل", "leg", "🦵"), w("tooth", "سِنّ", "tooth", "🦷"),
    w("tongue", "لِسَان", "tongue", "👅"), w("heart", "قَلْب", "heart", "❤️"), w("brain", "دِمَاغ", "brain", "🧠"), w("finger", "إِصْبَع", "finger", "☝️"), w("arm", "ذِرَاع", "arm", "💪"),
  ] },
  { id: "toys", ar: "الْأَلْعَاب", en: "Toys", icon: "🧸", tone: "mint", words: [
    w("ball", "كُرَة", "ball", "⚽"), w("teddy", "دُبْدُوب", "teddy bear", "🧸"), w("kite", "طَائِرَة وَرَقِيَّة", "kite", "🪁"), w("balloon", "بَالُون", "balloon", "🎈"),
    w("blocks", "مُكَعَّبَات", "blocks", "🧱"), w("puzzle", "أُحْجِيَّة", "puzzle", "🧩"), w("drum", "طَبْل", "drum", "🥁"), w("yoyo", "يُويُو", "yo-yo", "🪀"),
    w("dice", "نَرْد", "dice", "🎲"), w("robot", "رُوبُوت", "robot", "🤖"), w("bubbles", "فُقَّاعَات", "bubbles", "🫧"), w("guitar", "جِيتَار", "guitar", "🎸"), w("doll", "دُمْيَة", "doll", "🪆"),
  ] },
];

export const allWords = categories.flatMap((c) => c.words.map((x) => ({ ...x, cat: c.id })));

/* ---------------- Verbs ---------------- */
export type VerbAnim = "jump" | "run" | "sleep" | "bob" | "sway" | "shake";
export type Verb = { id: string; ar: string; en: string; who?: Who | undefined; prop: string; anim: VerbAnim; sentence: string };
const v = (id: string, ar: string, en: string, who: Who | undefined, prop: string, anim: VerbAnim, sentence: string): Verb => ({ id, ar, en, who, prop, anim, sentence });
export const verbs: Verb[] = [
  v("eat", "يَأْكُلُ", "eats", "hamad", "🍎", "bob", "حَمَد يَأْكُلُ تُفَّاحَةً."),
  v("drink", "يَشْرَبُ", "drinks", "talal", "💧", "bob", "طَلَال يَشْرَبُ الْمَاءَ."),
  v("read", "يَقْرَأُ", "reads", "hamad", "📖", "sway", "حَمَد يَقْرَأُ كِتَابًا."),
  v("sleep", "يَنَامُ", "sleeps", "yousef", "💤", "sleep", "يُوسُف يَنَامُ."),
  v("run", "يَجْرِي", "runs", "talal", "💨", "run", "طَلَال يَجْرِي."),
  v("walk", "يَمْشِي", "walks", "hamad", "👣", "run", "حَمَد يَمْشِي فِي الْحَدِيقَةِ."),
  v("jump", "يَقْفِزُ", "jumps", "talal", "🤸", "jump", "طَلَال يَقْفِزُ."),
  v("write", "يَكْتُبُ", "writes", "hamad", "✏️", "sway", "حَمَد يَكْتُبُ."),
  v("draw", "يَرْسُمُ", "draws", "yousef", "🎨", "sway", "يُوسُف يَرْسُمُ."),
  v("play", "يَلْعَبُ", "plays", "hamad", "⚽", "jump", "حَمَد يَلْعَبُ بِالْكُرَةِ."),
  v("wash", "يَغْسِلُ", "washes", "talal", "🧼", "shake", "طَلَال يَغْسِلُ يَدَيْهِ."),
  v("open", "يَفْتَحُ", "opens", "baba", "🚪", "sway", "بَابَا يَفْتَحُ الْبَابَ."),
  v("close", "يُغْلِقُ", "closes", "hamad", "🚪", "shake", "حَمَد يُغْلِقُ الْبَابَ."),
  v("sit", "يَجْلِسُ", "sits", "yousef", "🪑", "sleep", "يُوسُف يَجْلِسُ عَلَى الْكُرْسِيِّ."),
  v("stand", "يَقُومُ", "stands up", "talal", "⬆️", "jump", "طَلَال يَقُومُ."),
  v("take", "يَأْخُذُ", "takes", "hamad", "🍌", "bob", "حَمَد يَأْخُذُ مَوْزَةً."),
  v("give", "يُعْطِي", "gives", "talal", "🎁", "bob", "طَلَال يُعْطِي يُوسُف هَدِيَّةً."),
  v("see", "يَرَى", "sees", "hamad", "🐈", "sway", "حَمَد يَرَى قِطَّةً."),
  v("hear", "يَسْمَعُ", "hears", "yousef", "🎵", "sway", "يُوسُف يَسْمَعُ صَوْتًا."),
  v("laugh", "يَضْحَكُ", "laughs", "talal", "😄", "shake", "طَلَال يَضْحَكُ."),
  v("cry", "يَبْكِي", "cries", "yousef", "💧", "shake", "يُوسُف يَبْكِي."),
  v("ride", "يَرْكَبُ", "rides", "baba", "🚲", "run", "بَابَا يَرْكَبُ الدَّرَّاجَةَ."),
  v("fly", "يَطِيرُ", "flies", undefined, "🐦", "jump", "الطَّائِرُ يَطِيرُ."),
  v("swim", "يَسْبَحُ", "swims", "hamad", "🌊", "sway", "حَمَد يَسْبَحُ فِي الْبَحْرِ."),
  v("go", "يَذْهَبُ", "goes", "talal", "🏫", "run", "طَلَال يَذْهَبُ إِلَى الْمَدْرَسَةِ."),
  v("come", "يَأْتِي", "comes", "yousef", "🏠", "run", "يُوسُف يَأْتِي إِلَى الْبَيْتِ."),
  v("love", "يُحِبُّ", "loves", "hamad", "❤️", "bob", "حَمَد يُحِبُّ مَامَا."),
  v("cook", "تَطْبُخُ", "cooks", "mama", "🍳", "bob", "مَامَا تَطْبُخُ."),
  v("water", "يَسْقِي", "waters", "talal", "🌸", "sway", "طَلَال يَسْقِي الزُّهُورَ."),
];

/* ---------------- Sentences ---------------- */
export type Sentence = { id: string; words: string[]; who?: Who | undefined; props: string[]; en: string; anim?: VerbAnim | undefined };
const s = (id: string, text: string, who: Who | undefined, props: string[], en: string, anim?: VerbAnim): Sentence => ({ id, words: text.split(" "), who, props, en, anim });
export const sentences: Sentence[] = [
  s("s1", "حَمَد يَأْكُلُ تُفَّاحَةً.", "hamad", ["🍎"], "Hamad eats an apple.", "bob"),
  s("s2", "طَلَال يَشْرَبُ الْمَاءَ.", "talal", ["💧"], "Talal drinks water.", "bob"),
  s("s3", "يُوسُف يَنَامُ.", "yousef", ["💤", "🛏️"], "Yousef sleeps.", "sleep"),
  s("s4", "مَامَا تَقْرَأُ كِتَابًا.", "mama", ["📖"], "Mama reads a book.", "sway"),
  s("s5", "بَابَا يَفْتَحُ الْبَابَ.", "baba", ["🚪"], "Dad opens the door.", "sway"),
  s("s6", "حَمَد يَلْعَبُ بِالْكُرَةِ.", "hamad", ["⚽"], "Hamad plays with the ball.", "jump"),
  s("s7", "طَلَال يَجْرِي فِي الْحَدِيقَةِ.", "talal", ["🌳", "💨"], "Talal runs in the garden.", "run"),
  s("s8", "مَامَا تَشْرَبُ الْمَاءَ.", "mama", ["💧"], "Mama drinks water.", "bob"),
  s("s9", "حَمَد يَرَى قِطَّةً.", "hamad", ["🐈"], "Hamad sees a cat.", "sway"),
  s("s10", "يُوسُف يَرْسُمُ.", "yousef", ["🎨"], "Yousef draws.", "sway"),
  s("s11", "بَابَا يَرْكَبُ الدَّرَّاجَةَ.", "baba", ["🚲"], "Dad rides the bike.", "run"),
  s("s12", "طَلَال يَسْقِي الزُّهُورَ.", "talal", ["🌸"], "Talal waters the flowers.", "sway"),
];
export const sentenceText = (x: Sentence) => x.words.join(" ");
export const yesNoText = (x: Sentence) => `هَلْ ${sentenceText(x).replace(/\.$/, "")}؟`;

/* ---------------- Questions ---------------- */
export type Choice = { ar: string; pic: Pic };
export type Question = { id: string; q: string; scene: { who?: Who | undefined; props: string[]; anim?: VerbAnim | undefined }; choices: Choice[]; answer: string; en: string };
const e = (ar: string, emoji: string): Choice => ({ ar, pic: { emoji } });
const p = (ar: string, who: Who, emoji: string): Choice => ({ ar, pic: { who, emoji } });
// The first choice is always the correct one; games shuffle before showing.
export const questions: Question[] = [
  { id: "q1", q: "مَاذَا يَأْكُلُ حَمَد؟", scene: { who: "hamad", props: ["🍎"], anim: "bob" }, choices: [e("تُفَّاحَة", "🍎"), e("مَوْزَة", "🍌"), e("بُرْتُقَالَة", "🍊")], answer: "حَمَد يَأْكُلُ تُفَّاحَةً.", en: "What is Hamad eating?" },
  { id: "q2", q: "مَاذَا يَشْرَبُ طَلَال؟", scene: { who: "talal", props: ["💧"], anim: "bob" }, choices: [e("الْمَاء", "💧"), e("الْحَلِيب", "🥛"), e("الْعَصِير", "🧃")], answer: "طَلَال يَشْرَبُ الْمَاءَ.", en: "What is Talal drinking?" },
  { id: "q3", q: "مَاذَا يَفْعَلُ حَمَد؟", scene: { who: "hamad", props: ["📖"], anim: "sway" }, choices: [e("يَقْرَأُ", "📖"), e("يَنَامُ", "💤"), e("يَجْرِي", "💨")], answer: "حَمَد يَقْرَأُ.", en: "What is Hamad doing?" },
  { id: "q4", q: "أَيْنَ الْقِطَّةُ؟", scene: { props: ["🐈", "🪑"] }, choices: [e("عَلَى الْكُرْسِيِّ", "🪑"), e("فِي الْحَدِيقَةِ", "🌳"), e("فِي السَّيَّارَةِ", "🚗")], answer: "الْقِطَّةُ عَلَى الْكُرْسِيِّ.", en: "Where is the cat?" },
  { id: "q5", q: "مَنْ يَقْفِزُ؟", scene: { props: [] }, choices: [p("طَلَال", "talal", "🤸"), p("يُوسُف", "yousef", "💤"), p("حَمَد", "hamad", "📖")], answer: "طَلَال يَقْفِزُ.", en: "Who is jumping?" },
  { id: "q6", q: "مَا هٰذَا؟", scene: { props: ["🚗"] }, choices: [e("سَيَّارَة", "🚗"), e("كُرَة", "⚽"), e("قَلَم", "✏️")], answer: "هٰذِهِ سَيَّارَة.", en: "What is this?" },
  { id: "q7", q: "مَا لَوْنُ التُّفَّاحَةِ؟", scene: { props: ["🍎"] }, choices: [{ ar: "أَحْمَر", pic: { color: "#e0433a" } }, { ar: "أَزْرَق", pic: { color: "#2f6fd6" } }, { ar: "أَخْضَر", pic: { color: "#3aa655" } }], answer: "التُّفَّاحَةُ حَمْرَاءُ.", en: "What colour is the apple?" },
  { id: "q8", q: "مَاذَا يَفْعَلُ يُوسُف؟", scene: { who: "yousef", props: ["💤"], anim: "sleep" }, choices: [e("يَنَامُ", "💤"), e("يَأْكُلُ", "🍎"), e("يَسْبَحُ", "🌊")], answer: "يُوسُف يَنَامُ.", en: "What is Yousef doing?" },
  { id: "q9", q: "أَيْنَ الْقَمَرُ؟", scene: { props: ["🌙", "🌌"] }, choices: [e("فِي السَّمَاءِ", "🌌"), e("فِي الْبَحْرِ", "🌊"), e("فِي الْبَيْتِ", "🏠")], answer: "الْقَمَرُ فِي السَّمَاءِ.", en: "Where is the moon?" },
  { id: "q10", q: "مَنْ يَنَامُ؟", scene: { props: [] }, choices: [p("يُوسُف", "yousef", "💤"), p("حَمَد", "hamad", "⚽"), p("طَلَال", "talal", "💨")], answer: "يُوسُف يَنَامُ.", en: "Who is sleeping?" },
  { id: "q11", q: "مَاذَا يَرْكَبُ بَابَا؟", scene: { who: "baba", props: ["🚲"], anim: "run" }, choices: [e("دَرَّاجَة", "🚲"), e("قِطَار", "🚆"), e("طَائِرَة", "✈️")], answer: "بَابَا يَرْكَبُ الدَّرَّاجَةَ.", en: "What is Dad riding?" },
  { id: "q12", q: "مَا لَوْنُ الْمَوْزَةِ؟", scene: { props: ["🍌"] }, choices: [{ ar: "أَصْفَر", pic: { color: "#f5c72e" } }, { ar: "أَحْمَر", pic: { color: "#e0433a" } }, { ar: "أَزْرَق", pic: { color: "#2f6fd6" } }], answer: "الْمَوْزَةُ صَفْرَاءُ.", en: "What colour is the banana?" },
  { id: "q13", q: "مَنْ يَأْكُلُ؟", scene: { props: [] }, choices: [p("حَمَد", "hamad", "🍎"), p("طَلَال", "talal", "💨"), p("يُوسُف", "yousef", "🎨")], answer: "حَمَد يَأْكُلُ.", en: "Who is eating?" },
  { id: "q14", q: "مَاذَا يَفْعَلُ طَلَال؟", scene: { who: "talal", props: ["💨", "🌳"], anim: "run" }, choices: [e("يَجْرِي", "💨"), e("يَكْتُبُ", "✏️"), e("يَنَامُ", "💤")], answer: "طَلَال يَجْرِي.", en: "What is Talal doing?" },
];

/* ---------------- Conversations ---------------- */
export type Dialogue = { id: string; props: string[]; en: string; lines: { who: Who; text: string }[] };
export const dialogues: Dialogue[] = [
  { id: "d1", props: ["🍎"], en: "Mama: What do you want? Hamad: I want an apple.", lines: [{ who: "mama", text: "مَاذَا تُرِيدُ يَا حَمَد؟" }, { who: "hamad", text: "أُرِيدُ تُفَّاحَةً." }] },
  { id: "d2", props: ["🌳"], en: "Mama: Where is Talal? Hamad: Talal is in the garden.", lines: [{ who: "mama", text: "أَيْنَ طَلَال؟" }, { who: "hamad", text: "طَلَال فِي الْحَدِيقَةِ." }] },
  { id: "d3", props: ["💤"], en: "Dad: What is Yousef doing? Mama: Yousef is sleeping.", lines: [{ who: "baba", text: "مَاذَا يَفْعَلُ يُوسُف؟" }, { who: "mama", text: "يُوسُف يَنَامُ." }] },
  { id: "d4", props: ["🍌"], en: "Talal: Do you like bananas? Yousef: Yes, I like bananas.", lines: [{ who: "talal", text: "هَلْ تُحِبُّ الْمَوْزَ؟" }, { who: "yousef", text: "نَعَمْ، أُحِبُّ الْمَوْزَ." }] },
  { id: "d5", props: ["👋"], en: "Hamad greets Dad; Dad replies.", lines: [{ who: "hamad", text: "السَّلَامُ عَلَيْكُمْ يَا بَابَا." }, { who: "baba", text: "وَعَلَيْكُمُ السَّلَامُ يَا حَمَد." }] },
  { id: "d6", props: ["🌌"], en: "Mama: What colour is the sky? Talal: The sky is blue.", lines: [{ who: "mama", text: "مَا لَوْنُ السَّمَاءِ؟" }, { who: "talal", text: "السَّمَاءُ زَرْقَاءُ." }] },
];

/* ---------------- Interactive scenes ---------------- */
export type Scene = { id: string; ar: string; en: string; who: Who; bg: string; things: { ar: string; emoji: string; x: number; y: number }[]; actions: string[] };
export const scenes: Scene[] = [
  { id: "kitchen", ar: "الْمَطْبَخ", en: "Kitchen", who: "hamad", bg: "from-secondary to-card", actions: ["eat", "drink", "open", "close", "wash"], things: [
    { ar: "تُفَّاحَة", emoji: "🍎", x: 14, y: 20 }, { ar: "مَاء", emoji: "💧", x: 80, y: 18 }, { ar: "كُوب", emoji: "🥤", x: 62, y: 38 }, { ar: "صَحْن", emoji: "🍽️", x: 20, y: 62 },
    { ar: "مِلْعَقَة", emoji: "🥄", x: 40, y: 72 }, { ar: "خُبْز", emoji: "🍞", x: 82, y: 64 }, { ar: "بَاب", emoji: "🚪", x: 48, y: 12 },
  ] },
  { id: "garden", ar: "الْحَدِيقَة", en: "Garden", who: "talal", bg: "from-success/30 to-card", actions: ["run", "jump", "sit", "play", "water"], things: [
    { ar: "شَجَرَة", emoji: "🌳", x: 14, y: 22 }, { ar: "زَهْرَة", emoji: "🌸", x: 80, y: 60 }, { ar: "مَاء", emoji: "💧", x: 60, y: 76 }, { ar: "عُشْب", emoji: "🌿", x: 22, y: 76 },
    { ar: "فَرَاشَة", emoji: "🦋", x: 76, y: 16 }, { ar: "نَحْلَة", emoji: "🐝", x: 48, y: 10 }, { ar: "شَمْس", emoji: "☀️", x: 90, y: 4 },
  ] },
  { id: "animals", ar: "عَالَمُ الْحَيَوَانَات", en: "Animal world", who: "yousef", bg: "from-primary/25 to-card", actions: ["see", "hear", "laugh"], things: [
    { ar: "قِطَّة", emoji: "🐈", x: 12, y: 18 }, { ar: "كَلْب", emoji: "🐕", x: 80, y: 18 }, { ar: "أَسَد", emoji: "🦁", x: 46, y: 8 }, { ar: "فِيل", emoji: "🐘", x: 16, y: 62 },
    { ar: "حِصَان", emoji: "🐎", x: 82, y: 58 }, { ar: "بَقَرَة", emoji: "🐄", x: 46, y: 78 }, { ar: "خَرُوف", emoji: "🐑", x: 24, y: 40 }, { ar: "نَحْلَة", emoji: "🐝", x: 72, y: 40 }, { ar: "نَمْلَة", emoji: "🐜", x: 8, y: 84 },
  ] },
];

/* ---------------- Colour by instruction & sorting ---------------- */
export const paintTasks = (["heart", "square", "triangle"] as const).flatMap((shape) =>
  (["red", "blue", "yellow", "green"] as const).map((color) => {
    const sh = { heart: "الْقَلْبَ", square: "الْمُرَبَّعَ", triangle: "الْمُثَلَّثَ" }[shape];
    const co = { red: "الْأَحْمَرِ", blue: "الْأَزْرَقِ", yellow: "الْأَصْفَرِ", green: "الْأَخْضَرِ" }[color];
    return { id: `${shape}-${color}`, shape, color, text: `لَوِّنِ ${sh} بِاللَّوْنِ ${co}.` };
  }),
);
export const paintColors = { red: "#e0433a", blue: "#2f6fd6", yellow: "#f5c72e", green: "#3aa655" } as const;

export const ui = {
  title: "الْعَرَبِيَّة", subtitle: "هَيَّا نَتَعَلَّمُ الْعَرَبِيَّةَ!", listen: "اِسْمَعْ وَاخْتَرْ", what: "مَا هٰذَا؟", build: "كَوِّنِ الْجُمْلَةَ.",
  missing: "مَاذَا نَقَصَ؟", sort: "صَنِّفْ", fruit: "فَاكِهَة", veg: "خُضَار", yes: "نَعَمْ", no: "لَا", great: "أَحْسَنْتَ!", again: "حَاوِلْ مَرَّةً أُخْرَى",
  memory: "اِبْحَثْ عَنِ الْأَزْوَاجِ", free: "الْعَبْ بِحُرِّيَّة",
} as const;

/** Every Arabic string that can be voiced. */
export function worldClipTexts(): string[] {
  const out = new Set<string>();
  const add = (t: string) => out.add(t);
  allWords.forEach((x) => add(x.ar));
  verbs.forEach((x) => { add(x.ar); add(x.sentence); });
  sentences.forEach((x) => { add(sentenceText(x)); add(yesNoText(x)); x.words.forEach((y) => add(y.replace(/\.$/, ""))); });
  questions.forEach((x) => { add(x.q); add(x.answer); x.choices.forEach((c) => add(c.ar)); });
  dialogues.forEach((d) => d.lines.forEach((l) => add(l.text)));
  scenes.forEach((x) => { add(x.ar); x.things.forEach((t) => add(t.ar)); });
  categories.forEach((c) => add(c.ar));
  paintTasks.forEach((t) => add(t.text));
  Object.values(ui).forEach(add);
  return [...out];
}
