import { RARITY_LABEL } from "../lib/score";
import type { Rarity } from "../types";

export default function RarityTag({ rarity }: { rarity: Rarity }) {
  return <span className={`rarity-tag rarity-${rarity}`}>{RARITY_LABEL[rarity]}</span>;
}
