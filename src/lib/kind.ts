import type { CollectionPlant, PlantKind } from "../types";

export const KIND_META: Record<PlantKind, { label: string; icon: string }> = {
  mine: { label: "내 화분", icon: "🪴" },
  wild: { label: "발견", icon: "🍃" },
};

/** 기존 데이터(kind 없음)는 "mine"으로 간주. */
export function plantKind(p: Pick<CollectionPlant, "kind">): PlantKind {
  return p.kind ?? "mine";
}
