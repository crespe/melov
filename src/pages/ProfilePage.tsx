import { useStore } from "../state/store";
import { computeScore } from "../lib/score";

const AVATARS = ["🧑‍🌾", "👩‍🌾", "🧙", "🌻", "🌵", "🪴", "🌿", "🍀"];

export default function ProfilePage() {
  const { state, updateProfile } = useStore();
  const { profile, plants } = state;
  const score = computeScore(plants);

  function rename() {
    const next = prompt("닉네임을 입력하세요", profile.name);
    if (next && next.trim()) updateProfile({ name: next.trim() });
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>내 정보</h1>
      </header>

      <div className="profile-hero">
        <div className="profile-avatar">{profile.avatar}</div>
        <div>
          <h2>{profile.name}</h2>
          <p className="muted small">{score.total.toLocaleString()}점 · 정원사</p>
        </div>
        <button className="btn ghost small" onClick={rename}>
          ✏️ 닉네임
        </button>
      </div>

      <section className="avatar-picker">
        <h3>아바타 선택</h3>
        <div className="avatar-row">
          {AVATARS.map((a) => (
            <button
              key={a}
              className={"avatar-opt" + (profile.avatar === a ? " active" : "")}
              onClick={() => updateProfile({ avatar: a })}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <Stat label="식물" value={score.plantCount} />
        <Stat label="종(species)" value={score.speciesCount} />
        <Stat label="성장 기록" value={score.entries} />
        <Stat label="총점" value={score.total} />
      </section>

      <section className="about">
        <h3>Melov 정보</h3>
        <p className="muted small">
          데이터는 이 기기(브라우저)에만 저장됩니다. 식별은 현재 데모용 목업이며, 추후 실제 식별
          API와 서버 계정/실시간 랭킹으로 확장할 수 있습니다.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-box">
      <strong>{value.toLocaleString()}</strong>
      <span className="muted small">{label}</span>
    </div>
  );
}
