// 서버 백엔드(기기 기반 간편 신원) 연동 — 등록/점수 동기화/리더보드.
// 신원(userId+token)은 localStorage에 보관한다. 서버는 같은 EC2의 PHP+MySQL.

const ID_KEY = "pullipia.identity.v1";

export interface Identity {
  userId: string;
  token: string;
}

export interface ServerLeaderRow {
  userId: string;
  nickname: string;
  avatar: string;
  score: number;
  plantCount: number;
  speciesCount: number;
}

export interface SyncStats {
  nickname: string;
  avatar: string;
  score: number;
  plantCount: number;
  speciesCount: number;
  entries: number;
}

export function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (!raw) return null;
    const id = JSON.parse(raw);
    return id?.userId && id?.token ? id : null;
  } catch {
    return null;
  }
}

function saveIdentity(id: Identity): void {
  try {
    localStorage.setItem(ID_KEY, JSON.stringify(id));
  } catch {
    /* ignore */
  }
}

export function getMyUserId(): string | null {
  return loadIdentity()?.userId ?? null;
}

async function postJson(url: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

/** 신원을 보장한다(없으면 등록, 있으면 프로필 갱신). 실패 시 null. */
export async function ensureRegistered(
  nickname: string,
  avatar: string
): Promise<Identity | null> {
  try {
    const existing = loadIdentity();
    const data = await postJson("/api/register.php", {
      nickname,
      avatar,
      userId: existing?.userId,
      token: existing?.token,
    });
    if (data?.userId && data?.token) {
      const id: Identity = { userId: data.userId, token: data.token };
      saveIdentity(id);
      return id;
    }
    return null;
  } catch (e) {
    console.warn("기기 등록 실패(오프라인?):", e);
    return null;
  }
}

/** 내 점수·통계를 서버에 업서트. 실패 시 null. */
export async function syncScore(stats: SyncStats): Promise<{ rank: number; total: number } | null> {
  const id = loadIdentity();
  if (!id) return null;
  try {
    const data = await postJson("/api/sync.php", { ...id, ...stats });
    if (data?.ok) return { rank: data.rank, total: data.total };
    return null;
  } catch (e) {
    console.warn("점수 동기화 실패:", e);
    return null;
  }
}

/** 상위 유저 리더보드. 실패 시 null. */
export async function fetchLeaderboard(
  limit = 50
): Promise<{ rows: ServerLeaderRow[]; total: number } | null> {
  try {
    const res = await fetch(`/api/leaderboard.php?limit=${limit}`);
    if (!res.ok) throw new Error(`leaderboard → ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data?.rows)) return { rows: data.rows, total: data.total ?? data.rows.length };
    return null;
  } catch (e) {
    console.warn("리더보드 조회 실패:", e);
    return null;
  }
}
