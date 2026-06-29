import { getSpecies } from "../data/plants";
import type { CollectionPlant, Rarity } from "../types";

export const RARITY_POINTS: Record<Rarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 60,
  legendary: 150,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "흔함",
  uncommon: "조금 희귀",
  rare: "희귀",
  legendary: "전설",
};

export interface ScoreBreakdown {
  total: number;
  rarityPoints: number;
  diversityBonus: number; // 서로 다른 종 수 보너스
  carePoints: number; // 성장 기록 활동 점수
  plantCount: number;
  speciesCount: number;
  entries: number;
}

export function computeScore(plants: CollectionPlant[]): ScoreBreakdown {
  let rarityPoints = 0;
  let entries = 0;
  const speciesSet = new Set<string>();

  for (const p of plants) {
    const sp = getSpecies(p.speciesId);
    if (sp) rarityPoints += RARITY_POINTS[sp.rarity];
    speciesSet.add(p.speciesId);
    entries += p.history.length;
  }

  const diversityBonus = speciesSet.size * 8; // 도감 다양성 보너스
  const carePoints = entries * 3; // 꾸준한 성장 기록 보상
  const total = rarityPoints + diversityBonus + carePoints;

  return {
    total,
    rarityPoints,
    diversityBonus,
    carePoints,
    plantCount: plants.length,
    speciesCount: speciesSet.size,
    entries,
  };
}

export interface LeaderboardRow {
  name: string;
  avatar: string;
  score: number;
  isMe: boolean;
}

// 데모용 라이벌 + 나의 점수를 합쳐 랭킹을 구성한다.
const RIVALS: Omit<LeaderboardRow, "isMe">[] = [
  { name: "초록마법사", avatar: "🧙", score: 540 },
  { name: "분갈이장인", avatar: "🪴", score: 410 },
  { name: "다육이덕후", avatar: "🌵", score: 360 },
  { name: "베란다정글", avatar: "🌴", score: 290 },
  { name: "물주기왕", avatar: "💧", score: 180 },
];

export function buildLeaderboard(myName: string, myAvatar: string, myScore: number): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [
    ...RIVALS.map((r) => ({ ...r, isMe: false })),
    { name: myName, avatar: myAvatar, score: myScore, isMe: true },
  ];
  return rows.sort((a, b) => b.score - a.score);
}

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
}

export function computeBadges(plants: CollectionPlant[], score: ScoreBreakdown): Badge[] {
  const hasLegendary = plants.some((p) => getSpecies(p.speciesId)?.rarity === "legendary");
  const hasRepot = plants.some((p) => p.history.some((h) => h.type === "repot"));
  return [
    {
      id: "first",
      emoji: "🌱",
      label: "첫 식물",
      desc: "컬렉션에 식물 1그루 추가",
      earned: plants.length >= 1,
    },
    {
      id: "collector",
      emoji: "🏡",
      label: "수집가",
      desc: "식물 5그루 이상 보유",
      earned: plants.length >= 5,
    },
    {
      id: "botanist",
      emoji: "🔬",
      label: "식물학자",
      desc: "서로 다른 종 5종 이상",
      earned: score.speciesCount >= 5,
    },
    {
      id: "legendary",
      emoji: "👑",
      label: "전설 수집가",
      desc: "전설 등급 식물 보유",
      earned: hasLegendary,
    },
    {
      id: "repotter",
      emoji: "🪴",
      label: "분갈이 마스터",
      desc: "분갈이 기록 남기기",
      earned: hasRepot,
    },
    {
      id: "historian",
      emoji: "📖",
      label: "기록의 정원사",
      desc: "성장 기록 10개 이상",
      earned: score.entries >= 10,
    },
  ];
}
