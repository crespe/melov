// 앱 전체에서 쓰는 도메인 타입 정의

export type Rarity = "common" | "uncommon" | "rare" | "legendary";
export type Difficulty = "easy" | "medium" | "hard";

/** 목업 식물 도감(species) 한 건 */
export interface Species {
  id: string;
  commonName: string; // 일반명 (예: 몬스테라)
  scientificName: string; // 학명
  family: string; // 과 (예: 천남성과)
  emoji: string;
  origin: string; // 원산지
  light: string; // 햇빛 요구
  waterDays: number; // 권장 물주기 간격(일)
  humidity: string; // 습도
  toxicity: string; // 독성 정보
  difficulty: Difficulty;
  rarity: Rarity;
  repotMonths: number; // 권장 분갈이 주기(개월)
  description: string; // 특징 설명
  tips: string[]; // 재배 팁
}

/** 성장 히스토리 타임라인의 한 항목 */
export type GrowthType = "photo" | "measure" | "water" | "repot" | "note";

export interface GrowthEntry {
  id: string;
  date: string; // ISO
  type: GrowthType;
  note?: string;
  photo?: string; // dataURL
  heightCm?: number;
}

/** 내 컬렉션에 저장된 식물 한 그루 */
export interface CollectionPlant {
  id: string;
  speciesId: string;
  nickname: string;
  photo?: string; // 대표 사진 dataURL
  acquiredAt: string; // ISO
  location?: string; // 화분 위치 (예: 거실 창가)
  lat?: number; // 식별/발견 위치 위도 (식물 지도용)
  lng?: number; // 식별/발견 위치 경도
  placeName?: string; // 사람이 읽는 위치명 (예: 서울 한강공원)
  lastWaterAt?: string; // ISO
  lastRepotAt?: string; // ISO
  history: GrowthEntry[];
}

export interface Profile {
  name: string;
  avatar: string; // emoji
  createdAt: string;
}

export interface AppState {
  profile: Profile;
  plants: CollectionPlant[];
}
