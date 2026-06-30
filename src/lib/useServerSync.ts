import { useEffect } from "react";
import { useStore } from "../state/store";
import { computeScore } from "./score";
import { ensureRegistered, syncScore, type SyncStats } from "./api";

// 컬렉션 상태를 서버에 동기화한다(기기 기반 신원).
// 오프라인이면 조용히 실패하고 로컬은 그대로 동작한다.
export function useServerSync(): void {
  const { state } = useStore();
  const { profile, plants } = state;

  function stats(): SyncStats {
    const s = computeScore(plants);
    return {
      nickname: profile.name,
      avatar: profile.avatar,
      score: s.total,
      plantCount: s.plantCount,
      speciesCount: s.speciesCount,
      entries: s.entries,
    };
  }

  // 신원 보장(최초 등록 또는 프로필 갱신) 후 즉시 1회 동기화
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await ensureRegistered(profile.name, profile.avatar);
      if (id && !cancelled) void syncScore(stats());
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name, profile.avatar]);

  // 컬렉션 변경 시 디바운스 동기화
  useEffect(() => {
    const t = setTimeout(() => void syncScore(stats()), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]);
}
