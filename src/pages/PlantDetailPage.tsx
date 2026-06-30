import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../state/store";
import { getSpecies } from "../data/plants";
import { careStatus, formatRelativeDue, formatDate, formatDaysAgo } from "../lib/care";
import { fileToResizedDataUrl } from "../lib/image";
import { KIND_META, plantKind } from "../lib/kind";
import type { GrowthType } from "../types";
import RarityTag from "../components/RarityTag";

const TYPE_META: Record<GrowthType, { icon: string; label: string }> = {
  photo: { icon: "📷", label: "사진" },
  measure: { icon: "📏", label: "측정" },
  water: { icon: "💧", label: "물주기" },
  repot: { icon: "🪴", label: "분갈이" },
  note: { icon: "📝", label: "메모" },
};

export default function PlantDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, addEntry, removePlant, updatePlant } = useStore();
  const plant = state.plants.find((p) => p.id === id);

  const [type, setType] = useState<GrowthType>("note");
  const [note, setNote] = useState("");
  const [height, setHeight] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

  if (!plant) {
    return (
      <div className="page">
        <p>식물을 찾을 수 없습니다.</p>
        <Link to="/" className="btn">
          도감으로
        </Link>
      </div>
    );
  }

  const sp = getSpecies(plant.speciesId);
  const care = careStatus(plant);
  const kind = plantKind(plant);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(await fileToResizedDataUrl(file));
    setType("photo");
    e.target.value = "";
  }

  function submit() {
    if (!plant) return;
    const date = new Date().toISOString();
    addEntry(plant.id, {
      date,
      type,
      note: note.trim() || undefined,
      photo: pendingPhoto ?? undefined,
      heightCm: height ? Number(height) : undefined,
    });
    setNote("");
    setHeight("");
    setPendingPhoto(null);
    setType("note");
  }

  function quickAction(t: GrowthType) {
    if (!plant) return;
    addEntry(plant.id, { date: new Date().toISOString(), type: t, note: TYPE_META[t].label });
  }

  function rename() {
    const next = prompt("식물 별명", plant!.nickname);
    if (next && next.trim()) updatePlant(plant!.id, { nickname: next.trim() });
  }

  function del() {
    if (confirm("이 식물을 컬렉션에서 삭제할까요?")) {
      removePlant(plant!.id);
      nav("/");
    }
  }

  const latestHeight = plant.history.find((h) => h.heightCm != null)?.heightCm;

  return (
    <div className="page">
      <header className="page-head row">
        <button className="btn ghost small" onClick={() => nav(-1)}>
          ← 뒤로
        </button>
        <div className="row gap">
          <button className="btn ghost small" onClick={rename}>
            ✏️ 이름
          </button>
          <button className="btn ghost small danger" onClick={del}>
            삭제
          </button>
        </div>
      </header>

      <div className="detail-hero">
        {plant.photo ? (
          <img className="detail-photo" src={plant.photo} alt={plant.nickname} />
        ) : (
          <div className="detail-photo emoji">{sp?.emoji ?? "🪴"}</div>
        )}
        <div className="detail-title">
          <h1>{plant.nickname}</h1>
          <p className="sci">{sp?.scientificName}</p>
          <div className="row gap">
            <span className={"kind-badge " + kind}>
              {KIND_META[kind].icon} {KIND_META[kind].label}
            </span>
            {sp && <RarityTag rarity={sp.rarity} />}
            <span className="muted small">함께한 지 {daysSince(plant.acquiredAt)}일</span>
          </div>
          {plant.placeName && <p className="muted small">📍 {plant.placeName}에서 발견</p>}
        </div>
      </div>

      {/* 케어 현황 — 내 화분만 */}
      {kind === "mine" ? (
        <section className="care-status">
          <div className={"care-box" + (care.needsWater ? " warn" : "")}>
            <span className="care-box-icon">💧</span>
            <div>
              <strong>물주기</strong>
              <p className="muted small">{formatRelativeDue(care.waterDueInDays)}</p>
              <p className="muted tiny">마지막: {formatDaysAgo(plant.lastWaterAt)}</p>
            </div>
            <button className="btn primary tiny" onClick={() => quickAction("water")}>
              💧 오늘 줬어요
            </button>
          </div>
          <div className={"care-box" + (care.needsRepot ? " warn" : "")}>
            <span className="care-box-icon">🪴</span>
            <div>
              <strong>분갈이(옮겨심기)</strong>
              <p className="muted small">{formatRelativeDue(care.repotDueInDays)}</p>
              <p className="muted tiny">마지막: {formatDaysAgo(plant.lastRepotAt)}</p>
            </div>
            <button className="btn primary tiny" onClick={() => quickAction("repot")}>
              완료
            </button>
          </div>
        </section>
      ) : (
        <section className="wild-note">
          🍃 밖에서 발견한 식물이에요. 키우는 화분으로 바꾸면 물주기·분갈이 알림을 받을 수 있어요.
          <button
            className="btn ghost small"
            onClick={() => updatePlant(plant.id, { kind: "mine", lastWaterAt: new Date().toISOString() })}
          >
            내 화분으로 가져오기
          </button>
        </section>
      )}

      {/* 생장 정보 요약 */}
      {sp && (
        <section className="grow-info">
          <h3>생장 정보</h3>
          <dl className="spec-grid">
            <div>
              <dt>햇빛</dt>
              <dd>{sp.light}</dd>
            </div>
            <div>
              <dt>물주기</dt>
              <dd>약 {sp.waterDays}일마다</dd>
            </div>
            <div>
              <dt>습도</dt>
              <dd>{sp.humidity}</dd>
            </div>
            <div>
              <dt>현재 키</dt>
              <dd>{latestHeight != null ? `${latestHeight}cm` : "기록 없음"}</dd>
            </div>
          </dl>
          <ul className="tips">
            {sp.tips.map((t, i) => (
              <li key={i}>💡 {t}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 성장 기록 입력 */}
      <section className="entry-form">
        <h3>성장 기록 추가</h3>
        <div className="type-row">
          {(Object.keys(TYPE_META) as GrowthType[]).map((t) => (
            <button
              key={t}
              className={"type-chip" + (type === t ? " active" : "")}
              onClick={() => setType(t)}
            >
              {TYPE_META[t].icon} {TYPE_META[t].label}
            </button>
          ))}
        </div>
        <textarea
          placeholder="메모를 남겨보세요 (예: 새 잎이 나왔어요!)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="row gap">
          {type === "measure" && (
            <input
              className="height-input"
              type="number"
              inputMode="decimal"
              placeholder="키(cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          )}
          <label className="btn ghost small">
            📷 사진
            <input type="file" accept="image/*" hidden onChange={onPhoto} />
          </label>
          {pendingPhoto && <img className="pending-thumb" src={pendingPhoto} alt="첨부" />}
          <button className="btn primary small" onClick={submit}>
            기록 추가
          </button>
        </div>
      </section>

      {/* 성장 히스토리 타임라인 */}
      <section className="timeline">
        <h3>성장 히스토리 ({plant.history.length})</h3>
        {plant.history.length === 0 ? (
          <p className="muted">아직 기록이 없습니다.</p>
        ) : (
          <ul>
            {plant.history.map((h) => (
              <li key={h.id} className="timeline-item">
                <span className="timeline-dot">{TYPE_META[h.type].icon}</span>
                <div className="timeline-body">
                  <div className="timeline-meta">
                    <strong>{TYPE_META[h.type].label}</strong>
                    <span className="muted small">{formatDate(h.date)}</span>
                  </div>
                  {h.heightCm != null && <p className="small">키 {h.heightCm}cm</p>}
                  {h.note && <p className="small">{h.note}</p>}
                  {h.photo && <img className="timeline-photo" src={h.photo} alt="기록 사진" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)));
}
