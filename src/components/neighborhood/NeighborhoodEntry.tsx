import { useEffect, useState } from "react";
import { readFamilyUnlocked } from "@/lib/familyPassword";
import { NeighborhoodWorld as WalkableNeighborhood } from "@/components/world/NeighborhoodWorld";
import { NeighborhoodGate, NeighborhoodList } from "@/components/neighborhood/NeighborhoodWorld";
import type { WorldTarget } from "@/data/neighborhoodWorld";

// Entry to the Neighborhood: family password first, then the walkable world.
// "All games" opens the full list so every activity stays reachable.
export function NeighborhoodEntry({ onExit, onOpen }: { onExit: () => void; onOpen: (screen: string) => void }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setUnlocked(readFamilyUnlocked());
  }, []);

  if (unlocked === null) return null;
  if (!unlocked) return <NeighborhoodGate onExit={onExit} onUnlocked={() => setUnlocked(true)} />;
  if (showAll) return <NeighborhoodList onExit={() => setShowAll(false)} onOpen={onOpen} />;

  return (
    <WalkableNeighborhood
      onExit={onExit}
      onShowAll={() => setShowAll(true)}
      onEnterGame={(target: WorldTarget) => onOpen(target)}
    />
  );
}
