import { useEffect, useState } from "react";
import { useStore } from "../state/store";
import {
  computeScore,
  buildLeaderboard,
  computeBadges,
  RARITY_POINTS,
  type LeaderboardRow,
} from "../lib/score";
import { getSpecies } from "../data/plants";
import { fetchLeaderboard, getMyUserId } from "../lib/api";

export default function CompetePage() {
  const { state } = useStore();
  const { plants, profile } = state;
  const score = computeScore(plants);
  const badges = computeBadges(plants, score);

  // 서버 리더보드(실제 유저). 실패/빈 결과면 로컬 데모로 폴백.
  const [serverBoard, setServerBoard] = useState<LeaderboardRow[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetchLeaderboard(50).then((res) => {
      if (!alive) return;
      if (res && res.rows.length) {
        const myId = getMyUserId();
        const rows: LeaderboardRow[] = res.rows.map((r) => ({
          name: r.nickname,
          avatar: r.avatar,
          score: r.score,
          isMe: !!myId && r.userId === myId,
        }));
        // 내가 상위 목록에 없으면 로컬 점수로 내 행을 끼워넣어 순위를 보여준다.
        if (!rows.some((r) => r.isMe)) {
          rows.push({ name: profile.name, avatar: profile.avatar, score: score.total, isMe: true });
          rows.sort((a, b) => b.score - a.score);
        }
        setServerBoard(rows);
      } else {
        setServerBoard(null);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants.length]);

  const isServerBoard = serverBoard != null;
  const board = serverBoard ?? buildLeaderboard(profile.name, profile.avatar, score.total);
  const myRank = board.findIndex((r) => r.isMe) + 1;

  return (
    <div className="page">
      <header className="page-head">
        <h1>경쟁 · 랭킹</h1>
        <p className="muted">컬렉션을 키우고 기록할수록 점수가 올라갑니다</p>
      </header>

      <div className="rank-hero">
        <div className="rank-badge">#{myRank}</div>
        <div>
          <strong>{score.total.toLocaleString()}점</strong>
          <p className="muted small">
            식물 {score.plantCount} · 종 {score.speciesCount} · 기록 {score.entries}
          </p>
        </div>
      </div>

      <section className="score-breakdown">
        <h3>점수 구성</h3>
        <ScoreRow label="희귀도 점수" value={score.rarityPoints} hint="식물 등급별 합산" />
        <ScoreRow label="다양성 보너스" value={score.diversityBonus} hint="종 1개당 +8" />
        <ScoreRow label="성장 기록" value={score.carePoints} hint="기록 1개당 +3" />
        <p className="muted small rarity-legend">
          등급 점수 · 흔함 {RARITY_POINTS.common} / 조금희귀 {RARITY_POINTS.uncommon} / 희귀{" "}
          {RARITY_POINTS.rare} / 전설 {RARITY_POINTS.legendary}
        </p>
      </section>

      <section className="leaderboard">
        <h3>리더보드</h3>
        <ul>
          {board.map((r, i) => (
            <li key={r.name + i} className={"lb-row" + (r.isMe ? " me" : "")}>
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-avatar">{r.avatar}</span>
              <span className="lb-name">
                {r.name} {r.isMe && <em className="muted small">(나)</em>}
              </span>
              <span className="lb-score">{r.score.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <p className="muted small">
          {isServerBoard
            ? "* 실제 풀리피아 유저들과의 랭킹입니다. 식물을 모으면 순위가 올라가요."
            : "* 지금은 데모용 가상 라이벌입니다(서버 연결 대기). 연결되면 실제 유저와 경쟁해요."}
        </p>
      </section>

      <section className="badges">
        <h3>뱃지</h3>
        <ul className="badge-grid">
          {badges.map((b) => (
            <li key={b.id} className={"badge" + (b.earned ? " earned" : " locked")}>
              <span className="badge-emoji">{b.emoji}</span>
              <strong className="small">{b.label}</strong>
              <span className="muted tiny">{b.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {plants.length > 0 && (
        <section className="rarest">
          <h3>나의 희귀 식물</h3>
          <ul className="rarest-list">
            {[...plants]
              .sort(
                (a, b) =>
                  (RARITY_POINTS[getSpecies(b.speciesId)?.rarity ?? "common"]) -
                  (RARITY_POINTS[getSpecies(a.speciesId)?.rarity ?? "common"])
              )
              .slice(0, 3)
              .map((p) => {
                const sp = getSpecies(p.speciesId);
                return (
                  <li key={p.id}>
                    <span>{sp?.emoji}</span>
                    <span className="lb-name">{p.nickname}</span>
                    <span className="muted small">
                      +{RARITY_POINTS[sp?.rarity ?? "common"]}점
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
}

function ScoreRow({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="score-row">
      <span>{label}</span>
      <span className="muted small">{hint}</span>
      <strong>+{value}</strong>
    </div>
  );
}
