import dadIdle from "@/assets/family/dad-idle.png";
import hamadIdle from "@/assets/kitchen/cast/hamad-idle.png";
import mamaIdle from "@/assets/family/mama-idle.png";
import talalIdle from "@/assets/kitchen/cast/talal-idle.png";
import yousefHappy from "@/assets/science/yousef-happy.png";

const FAMILY = [dadIdle, hamadIdle, mamaIdle, talalIdle, yousefHappy];

// Decorative row of the whole family, shown on the home and Neighborhood screens. Never interactive.
export function FamilyStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-end justify-center gap-1 sm:gap-3 ${className}`}>
      {FAMILY.map((src, index) => (
        <img key={index} src={src} alt="" draggable={false} className="h-16 w-auto object-contain drop-shadow-md sm:h-24" />
      ))}
    </div>
  );
}
