import { SPECIES, registerSpecies } from "../data/plants";
import type { Species } from "../types";

export interface IdentifyCandidate {
  species: Species;
  confidence: number; // 0~1
}

export interface IdentifyResult {
  top: IdentifyCandidate;
  alternatives: IdentifyCandidate[];
}

const API_ENDPOINT = "/api/identify.php";

/**
 * 사진(dataURL)을 서버 식별 프록시(Gemini 비전)로 보내 식물을 식별한다.
 * 네트워크/서버 오류 시에는 결정론적 목업으로 폴백한다.
 * 식별된 종은 동적 레지스트리에 등록해 getSpecies()로 해석되게 한다.
 */
export async function identifyPlant(imageDataUrl: string): Promise<IdentifyResult> {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    if (!res.ok) {
      const msg = await res.json().catch(() => null);
      throw new Error(msg?.error ?? `식별 API 오류 ${res.status}`);
    }
    const data = (await res.json()) as IdentifyResult;
    if (!data?.top?.species?.id) throw new Error("식별 응답 형식 오류");

    // 식별된 종을 메모리 레지스트리에 등록(결과 화면·저장 직전 해석용)
    registerSpecies(data.top.species);
    data.alternatives?.forEach((c) => registerSpecies(c.species));
    return data;
  } catch (err) {
    console.warn("실제 식별 실패 → 목업으로 폴백:", err);
    return mockIdentify(imageDataUrl);
  }
}

// ── 목업 식별기 (오프라인/오류 폴백) ──────────────────────────────
// 같은 사진 → 같은 결과가 나오도록 결정론적으로 후보를 고른다.
async function mockIdentify(imageDataUrl: string): Promise<IdentifyResult> {
  await new Promise((r) => setTimeout(r, 600));

  const seed = hashString(imageDataUrl);
  const rng = mulberry32(seed);

  const scored = SPECIES.map((species) => ({ species, score: rng() })).sort(
    (a, b) => b.score - a.score
  );

  const total = scored.slice(0, 4).reduce((s, x) => s + x.score, 0) || 1;
  const ranked: IdentifyCandidate[] = scored.slice(0, 4).map((x) => ({
    species: x.species,
    confidence: x.score / total,
  }));
  ranked[0].confidence = Math.min(0.97, 0.55 + ranked[0].confidence * 0.4);

  return { top: ranked[0], alternatives: ranked.slice(1) };
}

function hashString(s: string): number {
  let h = 2166136261;
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
