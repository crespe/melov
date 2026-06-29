import { getSpecies } from "../data/plants";
import type { CollectionPlant } from "../types";

const DAY = 24 * 60 * 60 * 1000;

export function daysBetween(a: string | undefined, b: Date = new Date()): number {
  if (!a) return Infinity;
  return Math.floor((b.getTime() - new Date(a).getTime()) / DAY);
}

export interface CareStatus {
  waterDueInDays: number; // 음수면 지남
  repotDueInDays: number;
  needsWater: boolean;
  needsRepot: boolean;
}

export function careStatus(plant: CollectionPlant): CareStatus {
  const sp = getSpecies(plant.speciesId);
  const waterEvery = sp?.waterDays ?? 7;
  const repotEvery = (sp?.repotMonths ?? 24) * 30;

  const sinceWater = daysBetween(plant.lastWaterAt ?? plant.acquiredAt);
  const sinceRepot = daysBetween(plant.lastRepotAt ?? plant.acquiredAt);

  const waterDueInDays = waterEvery - sinceWater;
  const repotDueInDays = repotEvery - sinceRepot;

  return {
    waterDueInDays,
    repotDueInDays,
    needsWater: waterDueInDays <= 0,
    needsRepot: repotDueInDays <= 0,
  };
}

export function formatRelativeDue(days: number): string {
  if (!isFinite(days)) return "—";
  if (days < 0) return `${Math.abs(days)}일 지남`;
  if (days === 0) return "오늘";
  return `${days}일 후`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
