import { Link } from "react-router-dom";
import { useStore } from "../state/store";
import { getSpecies } from "../data/plants";
import { computeScore } from "../lib/score";
import { careStatus, formatRelativeDue } from "../lib/care";
import PlantThumb from "../components/PlantThumb";
import RarityTag from "../components/RarityTag";

export default function CollectionPage() {
  const { state } = useStore();
  const { plants, profile } = state;
  const score = computeScore(plants);

  return (
    <div className="page">
      <header className="page-head row">
        <div>
          <h1>나의 식물 도감</h1>
          <p className="muted">
            {profile.avatar} {profile.name} · {plants.length}그루 · {score.total.toLocaleString()}점
          </p>
        </div>
        <Link to="/identify" className="btn primary small">
          + 식별
        </Link>
      </header>

      {plants.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🪴</div>
          <p className="empty-title">아직 식물이 없어요</p>
          <p className="muted">식물 사진을 찍어 첫 컬렉션을 시작해 보세요.</p>
          <Link to="/identify" className="btn primary">
            식물 식별하기
          </Link>
        </div>
      ) : (
        <ul className="plant-grid">
          {plants.map((p) => {
            const sp = getSpecies(p.speciesId);
            const care = careStatus(p);
            return (
              <li key={p.id}>
                <Link to={`/plant/${p.id}`} className="plant-card">
                  <PlantThumb plant={p} size={72} />
                  <div className="plant-card-body">
                    <div className="plant-card-title">
                      <strong>{p.nickname}</strong>
                      {sp && <RarityTag rarity={sp.rarity} />}
                    </div>
                    <p className="muted small">{sp?.scientificName}</p>
                    <div className="care-pills">
                      <span className={"pill" + (care.needsWater ? " warn" : "")}>
                        💧 {formatRelativeDue(care.waterDueInDays)}
                      </span>
                      {care.needsRepot && <span className="pill warn">🪴 분갈이 시기</span>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
