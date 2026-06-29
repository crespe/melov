import { SPECIES } from "../data/plants";
import type { Species } from "../types";

export interface IdentifyCandidate {
  species: Species;
  confidence: number; // 0~1
}

export interface IdentifyResult {
  top: IdentifyCandidate;
  alternatives: IdentifyCandidate[];
}

// 이미지 dataURL을 받아 결정론적(같은 사진 → 같은 결과)으로 후보를 고르는 목업 식별기.
// 실제 모델/Plant.id 같은 API로 교체할 자리.
export async function identifyPlant(imageDataUrl: string): Promise<IdentifyResult> {
  // 살짝의 지연으로 "분석 중" UX를 흉내낸다.
  await new Promise((r) => setTimeout(r, 900));

  const seed = hashString(imageDataUrl);
  const rng = mulberry32(seed);

  // species에 의사난수 점수를 매겨 정렬 → 상위 후보 구성
  const scored = SPECIES.map((species) => ({
    species,
    score: rng(),
  })).sort((a, b) => b.score - a.score);

  const total = scored.slice(0, 4).reduce((s, x) => s + x.score, 0) || 1;
  const ranked: IdentifyCandidate[] = scored.slice(0, 4).map((x) => ({
    species: x.species,
    confidence: x.score / total,
  }));

  // 상위 후보 신뢰도를 살짝 끌어올려 자연스럽게 보이게 한다.
  ranked[0].confidence = Math.min(0.97, 0.55 + ranked[0].confidence * 0.4);

  return { top: ranked[0], alternatives: ranked.slice(1) };
}

function hashString(s: string): number {
  let h = 2166136261;
  // 큰 dataURL 전체를 돌면 느리므로 일부만 샘플링
  const step = Math.max(1, Math.floor(s.length / 2048));
  for (let i = 0; i < s.length; i += step) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
