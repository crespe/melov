import type { CollectionPlant } from "../types";
import { getSpecies } from "../data/plants";

// 사진이 있으면 사진, 없으면 종 이모지를 보여주는 썸네일.
export default function PlantThumb({ plant, size = 56 }: { plant: CollectionPlant; size?: number }) {
  const sp = getSpecies(plant.speciesId);
  if (plant.photo) {
    return (
      <img
        className="plant-thumb"
        src={plant.photo}
        alt={plant.nickname}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="plant-thumb emoji" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {sp?.emoji ?? "🪴"}
    </div>
  );
}
