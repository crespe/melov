import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { identifyPlant, type IdentifyResult, type IdentifyCandidate } from "../lib/identify";
import { fileToResizedDataUrl } from "../lib/image";
import { getCurrentPosition, reverseGeocode } from "../lib/geo";
import { uid } from "../lib/storage";
import { registerSpecies } from "../data/plants";
import { KIND_META } from "../lib/kind";
import { useStore } from "../state/store";
import RarityTag from "../components/RarityTag";
import type { PlantKind, Species } from "../types";

type Phase = "capture" | "analyzing" | "result";

export default function IdentifyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const { addPlant } = useStore();

  const [phase, setPhase] = useState<Phase>("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [chosen, setChosen] = useState<Species | null>(null);
  const [kind, setKind] = useState<PlantKind>("mine");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 후보가 바뀌면 별명 기본값을 그 종의 일반명으로 맞춘다.
  useEffect(() => {
    if (chosen) setNickname(chosen.commonName);
  }, [chosen]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPhoto(dataUrl);
      setPhase("analyzing");
      const res = await identifyPlant(dataUrl);
      setResult(res);
      setChosen(res.top.species);
      setPhase("result");
    } catch (err) {
      setError("사진을 처리하지 못했습니다. 다시 시도해 주세요.");
      setPhase("capture");
      console.error(err);
    } finally {
      e.target.value = "";
    }
  }

  async function save() {
    if (!chosen) return;
    // 식별로 발견한 종을 영속화 — reload 후에도 getSpecies()가 해석하도록.
    registerSpecies(chosen, true);
    const now = new Date().toISOString();
    // 위치를 가져와 식물 지도에 표시 (권한 거부 시 위치 없이 저장)
    const pos = await getCurrentPosition();
    let placeName: string | undefined;
    if (pos) placeName = await reverseGeocode(pos);

    addPlant({
      id: uid(),
      speciesId: chosen.id,
      kind,
      nickname: nickname.trim() || chosen.commonName,
      photo: photo ?? undefined,
      acquiredAt: now,
      lat: pos?.lat,
      lng: pos?.lng,
      placeName,
      // 야생 발견은 물주기 케어가 없으므로 마지막 케어일을 두지 않는다.
      lastWaterAt: kind === "mine" ? now : undefined,
      lastRepotAt: kind === "mine" ? now : undefined,
      history: [
        {
          id: uid(),
          date: now,
          type: "photo",
          note: kind === "mine" ? "컬렉션에 추가됨" : "발견 기록",
          photo: photo ?? undefined,
        },
      ],
    });
    nav("/");
  }

  function reset() {
    setPhase("capture");
    setPhoto(null);
    setResult(null);
    setChosen(null);
    setKind("mine");
    setNickname("");
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>식물 식별</h1>
        <p className="muted">사진을 찍거나 골라서 어떤 식물인지 알아보세요</p>
      </header>

      {phase === "capture" && (
        <div className="capture-zone" onClick={() => fileRef.current?.click()}>
          <div className="capture-icon">📷</div>
          <p className="capture-title">탭하여 식물 촬영 / 사진 선택</p>
          <p className="muted small">잎과 전체 모양이 잘 보이게 찍으면 정확도가 올라갑니다</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={onFile}
          />
        </div>
      )}

      {phase === "analyzing" && (
        <div className="analyzing">
          {photo && <img className="preview-img" src={photo} alt="분석 중" />}
          <div className="spinner" />
          <p>식물을 분석하는 중…</p>
        </div>
      )}

      {phase === "result" && result && chosen && (
        <div className="result">
          {photo && <img className="preview-img" src={photo} alt="식별 결과" />}

          <div className="confidence-bar">
            <span>가장 유력한 후보</span>
            <strong>{Math.round(result.top.confidence * 100)}% 일치</strong>
          </div>

          <SpeciesCard species={chosen} highlight />

          {result.alternatives.length > 0 && (
            <div className="alternatives">
              <p className="muted small">다른 후보 (탭하여 선택)</p>
              {result.alternatives.map((c: IdentifyCandidate) => (
                <button
                  key={c.species.id}
                  className={"alt-row" + (chosen.id === c.species.id ? " selected" : "")}
                  onClick={() => setChosen(c.species)}
                >
                  <span className="alt-emoji">{c.species.emoji}</span>
                  <span className="alt-name">{c.species.commonName}</span>
                  <RarityTag rarity={c.species.rarity} />
                  <span className="muted small">{Math.round(c.confidence * 100)}%</span>
                </button>
              ))}
            </div>
          )}

          <div className="save-options">
            <p className="muted small">저장 옵션</p>
            <div className="kind-toggle" role="group" aria-label="화분 유형">
              {(["mine", "wild"] as PlantKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={"kind-btn" + (kind === k ? " active" : "")}
                  onClick={() => setKind(k)}
                >
                  {KIND_META[k].icon} {KIND_META[k].label}
                </button>
              ))}
            </div>
            <p className="muted tiny kind-hint">
              {kind === "mine"
                ? "내가 키우는 화분 — 물주기·분갈이 알림을 받아요."
                : "밖에서 발견한 식물 — 지도에 발견 기록으로 남겨요."}
            </p>
            <label className="nickname-field">
              <span className="muted small">별명</span>
              <input
                type="text"
                value={nickname}
                maxLength={20}
                placeholder={chosen.commonName}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>
          </div>

          <div className="action-row">
            <button className="btn ghost" onClick={reset}>
              다시 찍기
            </button>
            <button className="btn primary" onClick={save}>
              {kind === "mine" ? "내 화분에 저장" : "발견 기록 저장"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

function SpeciesCard({ species, highlight }: { species: Species; highlight?: boolean }) {
  return (
    <div className={"species-card" + (highlight ? " highlight" : "")}>
      <div className="species-head">
        <span className="species-emoji">{species.emoji}</span>
        <div>
          <h2>{species.commonName}</h2>
          <p className="sci">{species.scientificName}</p>
        </div>
        <RarityTag rarity={species.rarity} />
      </div>
      <p className="species-desc">{species.description}</p>
      <dl className="spec-grid">
        <div>
          <dt>과</dt>
          <dd>{species.family}</dd>
        </div>
        <div>
          <dt>원산지</dt>
          <dd>{species.origin}</dd>
        </div>
        <div>
          <dt>햇빛</dt>
          <dd>{species.light}</dd>
        </div>
        <div>
          <dt>물주기</dt>
          <dd>약 {species.waterDays}일마다</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd>{species.humidity}</dd>
        </div>
        <div>
          <dt>분갈이</dt>
          <dd>{species.repotMonths}개월마다</dd>
        </div>
        <div className="span2">
          <dt>독성</dt>
          <dd>{species.toxicity}</dd>
        </div>
      </dl>
      {species.tips.length > 0 && (
        <ul className="tips">
          {species.tips.map((t, i) => (
            <li key={i}>💡 {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
