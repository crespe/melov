import type { AppState } from "../types";

const KEY = "melov.state.v1";

const DEFAULT_STATE: AppState = {
  profile: {
    name: "나의 정원사",
    avatar: "🧑‍🌾",
    createdAt: new Date().toISOString(),
  },
  plants: [],
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as AppState;
    // 최소한의 방어적 정규화
    if (!parsed.profile || !Array.isArray(parsed.plants)) {
      return structuredClone(DEFAULT_STATE);
    }
    return parsed;
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // 용량 초과(사진 dataURL이 많을 때) 등은 콘솔 경고만.
    console.warn("상태 저장 실패:", e);
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
