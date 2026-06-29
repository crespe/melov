import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useStore } from "../state/store";
import { getSpecies } from "../data/plants";
import { formatDate } from "../lib/care";

// 이모지를 마커로 쓰면 Leaflet 기본 아이콘 에셋 경로 문제를 피할 수 있다.
function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div class="map-pin">${emoji}</div>`,
    className: "map-pin-wrap",
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36],
  });
}

export default function MapPage() {
  const { state } = useStore();
  const located = useMemo(
    () => state.plants.filter((p) => p.lat != null && p.lng != null),
    [state.plants]
  );

  const center = useMemo<[number, number]>(() => {
    if (located.length > 0) return [located[0].lat!, located[0].lng!];
    return [37.5665, 126.978]; // 기본값: 서울
  }, [located]);

  return (
    <div className="page map-page">
      <header className="page-head">
        <h1>식물 지도</h1>
        <p className="muted">내가 발견한 식물들의 위치를 한눈에</p>
      </header>

      {located.length === 0 && (
        <div className="map-empty-note">
          📍 아직 위치가 기록된 식물이 없어요. 식별 후 저장할 때 위치 권한을 허용하면 지도에 표시됩니다.
        </div>
      )}

      <div className="map-wrap">
        <MapContainer center={center} zoom={located.length > 0 ? 11 : 6} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {located.map((p) => {
            const sp = getSpecies(p.speciesId);
            return (
              <Marker key={p.id} position={[p.lat!, p.lng!]} icon={emojiIcon(sp?.emoji ?? "🪴")}>
                <Popup>
                  <div className="map-popup">
                    <strong>{p.nickname}</strong>
                    <p className="muted small">{sp?.scientificName}</p>
                    {p.placeName && <p className="small">📍 {p.placeName}</p>}
                    <p className="muted small">{formatDate(p.acquiredAt)} 발견</p>
                    <Link to={`/plant/${p.id}`}>상세 보기 →</Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {located.length > 0 && (
        <p className="muted small map-count">📍 {located.length}곳에 식물 기록</p>
      )}
    </div>
  );
}
