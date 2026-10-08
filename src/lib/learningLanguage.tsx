import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { GameButton } from "@/components/game/GameButton";

export type LearningLanguage = "ar" | "en";
const KEY = "learning-language-v1";

export function useLearningLanguage(): [LearningLanguage, (language: LearningLanguage) => void] {
  const [language, setLanguageState] = useState<LearningLanguage>("ar");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") setLanguageState(saved);
  }, []);
  const setLanguage = (next: LearningLanguage) => {
    window.localStorage.setItem(KEY, next);
    setLanguageState(next);
  };
  return [language, setLanguage];
}

export const languageDirection = (language: LearningLanguage) => language === "ar" ? "rtl" : "ltr";

export function LearningLanguageSwitch({ language, onChange }: { language: LearningLanguage; onChange: (language: LearningLanguage) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1" role="group" aria-label="Language · اللغة">
      <GameButton tone={language === "ar" ? "sky" : "neutral"} className="min-h-11 rounded-xl px-3 text-sm" onClick={() => onChange("ar")} aria-pressed={language === "ar"}>
        <span className="inline-flex items-center gap-2"><Languages className="h-4 w-4" /><span lang="ar" dir="rtl" className="font-arabic font-black">العربية</span></span>
      </GameButton>
      <GameButton tone={language === "en" ? "sky" : "neutral"} className="min-h-11 rounded-xl px-3 text-sm" onClick={() => onChange("en")} aria-pressed={language === "en"}>
        English
      </GameButton>
    </div>
  );
}
