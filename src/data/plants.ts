import type { Species } from "../types";

// 목업 식물 도감. 추후 실제 식별 API / DB로 교체 가능.
export const SPECIES: Species[] = [
  {
    id: "monstera",
    commonName: "몬스테라 델리시오사",
    scientificName: "Monstera deliciosa",
    family: "천남성과",
    emoji: "🌿",
    origin: "중앙아메리카 열대우림",
    light: "밝은 간접광",
    waterDays: 7,
    humidity: "60% 이상 선호",
    toxicity: "반려동물·어린이에게 독성 있음(옥살산칼슘)",
    difficulty: "easy",
    rarity: "common",
    repotMonths: 24,
    description:
      "잎에 자연스러운 구멍(천공)이 생기는 인기 관엽식물. 성장이 빠르고 공중뿌리를 내립니다.",
    tips: ["흙이 절반 이상 마르면 물 주기", "지지대를 세우면 잎이 커집니다", "월 1회 잎 닦기"],
  },
  {
    id: "sansevieria",
    commonName: "산세베리아",
    scientificName: "Dracaena trifasciata",
    family: "비짜루과",
    emoji: "🌵",
    origin: "서아프리카 건조지대",
    light: "약광~밝은 광 모두 가능",
    waterDays: 18,
    humidity: "낮은 습도에 강함",
    toxicity: "약한 독성",
    difficulty: "easy",
    rarity: "common",
    repotMonths: 36,
    description: "공기정화 식물로 유명하며 물을 적게 줘도 잘 자라 초보자에게 좋습니다.",
    tips: ["과습 주의 — 뿌리가 잘 썩습니다", "겨울에는 물주기 간격을 늘리세요"],
  },
  {
    id: "pothos",
    commonName: "스킨답서스",
    scientificName: "Epipremnum aureum",
    family: "천남성과",
    emoji: "🪴",
    origin: "남태평양 솔로몬제도",
    light: "반음지~밝은 간접광",
    waterDays: 8,
    humidity: "보통",
    toxicity: "독성 있음",
    difficulty: "easy",
    rarity: "common",
    repotMonths: 18,
    description: "덩굴성으로 빠르게 자라며 수경재배도 잘 되는 대표적인 입문 식물입니다.",
    tips: ["줄기를 잘라 물꽂이로 번식 가능", "잎이 노래지면 과습 신호"],
  },
  {
    id: "ficus-lyrata",
    commonName: "떡갈고무나무",
    scientificName: "Ficus lyrata",
    family: "뽕나무과",
    emoji: "🌳",
    origin: "서아프리카 열대우림",
    light: "밝은 간접광 필수",
    waterDays: 9,
    humidity: "보통~높음",
    toxicity: "수액에 약한 독성",
    difficulty: "medium",
    rarity: "uncommon",
    repotMonths: 24,
    description: "바이올린 모양의 큰 잎이 매력인 인테리어 식물. 환경 변화에 다소 예민합니다.",
    tips: ["자리를 자주 옮기지 마세요", "잎의 먼지를 닦아 광합성을 도우세요"],
  },
  {
    id: "calathea",
    commonName: "칼라데아 오르비폴리아",
    scientificName: "Goeppertia orbifolia",
    family: "마란타과",
    emoji: "🍃",
    origin: "남아메리카 볼리비아",
    light: "반음지의 간접광",
    waterDays: 5,
    humidity: "높은 습도 필요(60%+)",
    toxicity: "무독성(반려동물 안전)",
    difficulty: "hard",
    rarity: "rare",
    repotMonths: 18,
    description: "은녹색 줄무늬 잎이 밤에 접히는 '기도하는 식물'. 습도 관리가 까다롭습니다.",
    tips: ["정수된 물 또는 빗물 사용 권장", "가습기와 함께 두면 좋습니다"],
  },
  {
    id: "anthurium",
    commonName: "안스리움 클라리네르비움",
    scientificName: "Anthurium clarinervium",
    family: "천남성과",
    emoji: "💚",
    origin: "멕시코 석회암 지대",
    light: "밝은 간접광",
    waterDays: 6,
    humidity: "높은 습도(70%+)",
    toxicity: "독성 있음",
    difficulty: "hard",
    rarity: "rare",
    repotMonths: 18,
    description: "벨벳 질감에 흰 잎맥이 도드라지는 관엽계의 보석. 통기성 좋은 흙이 필수입니다.",
    tips: ["난석·바크 섞인 배합토 사용", "뿌리가 숨 쉬도록 과습 금지"],
  },
  {
    id: "variegated-monstera",
    commonName: "무늬 몬스테라 알보",
    scientificName: "Monstera deliciosa 'Albo Variegata'",
    family: "천남성과",
    emoji: "🤍",
    origin: "원종 변이(재배종)",
    light: "밝은 간접광",
    waterDays: 7,
    humidity: "60% 이상",
    toxicity: "독성 있음",
    difficulty: "hard",
    rarity: "legendary",
    repotMonths: 18,
    description: "흰 무늬가 들어간 희귀 몬스테라. 무늬 부분은 광합성을 못 해 관리가 까다롭고 고가입니다.",
    tips: ["흰 잎만 나오지 않도록 균형 잡힌 줄기 선택", "직광은 무늬를 태웁니다"],
  },
  {
    id: "echeveria",
    commonName: "에케베리아(다육)",
    scientificName: "Echeveria elegans",
    family: "돌나물과",
    emoji: "🌸",
    origin: "멕시코 반건조 지대",
    light: "직사광선 충분히",
    waterDays: 14,
    humidity: "낮은 습도",
    toxicity: "무독성",
    difficulty: "medium",
    rarity: "uncommon",
    repotMonths: 24,
    description: "장미꽃 모양으로 잎이 모이는 다육식물. 빛이 부족하면 웃자랍니다.",
    tips: ["흙이 완전히 마른 뒤 물 주기", "통풍이 매우 중요합니다"],
  },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s])
);

// ── 동적 종 레지스트리 ────────────────────────────────────────────
// 실제 식별 API로 발견된, 내장 도감(SPECIES)에 없는 종을 보관한다.
// 저장된 식물의 speciesId를 reload 후에도 해석할 수 있도록 localStorage에 영속화한다.
const DISCOVERED_KEY = "pullipia.species.v1";

function loadDiscovered(): Record<string, Species> {
  try {
    const raw = localStorage.getItem(DISCOVERED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const discovered: Record<string, Species> = loadDiscovered();

/**
 * 식별된 종을 레지스트리에 등록한다.
 * @param persist true면 localStorage에도 저장(컬렉션에 실제 저장하는 종만 영속화 권장)
 */
export function registerSpecies(sp: Species, persist = false): void {
  if (!sp?.id) return;
  discovered[sp.id] = sp;
  if (persist) {
    try {
      localStorage.setItem(DISCOVERED_KEY, JSON.stringify(discovered));
    } catch (e) {
      console.warn("발견 종 저장 실패:", e);
    }
  }
}

export function getSpecies(id: string): Species | undefined {
  return SPECIES_BY_ID[id] ?? discovered[id];
}
