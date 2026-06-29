import { useStore } from "../state/store";
import { computeScore, buildLeaderboard, computeBadges, RARITY_POINTS } from "../lib/score";
import { getSpecies } from "../data/plants";

export default function CompetePage() {
  const { state } = useStore();
  const { plants, profile } = state;
  const score = computeScore(plants);
  const board = buildLeaderboard(profile.name, profile.avatar, score.total);
  const badges = computeBadges(plants, score);
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
        <p className="muted small">* 라이벌은 데모용 가상 유저입니다. 서버 연동 시 실제 친구와 경쟁할 수 있어요.</p>
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
