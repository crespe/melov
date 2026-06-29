export interface GeoPoint {
  lat: number;
  lng: number;
}

// 브라우저 위치를 한 번 가져온다. 권한 거부/미지원이면 null.
export function getCurrentPosition(): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// 위경도 → 사람이 읽는 위치명. 무료 Nominatim 역지오코딩, 실패하면 좌표 문자열.
export async function reverseGeocode(p: GeoPoint): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&lat=${p.lat}&lon=${p.lng}`;
    const res = await fetch(url, { headers: { "Accept-Language": "ko" } });
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [
      a.city || a.county || a.state,
      a.suburb || a.neighbourhood || a.town || a.village,
    ].filter(Boolean);
    return parts.join(" ") || data.display_name || coordLabel(p);
  } catch {
    return coordLabel(p);
  }
}

export function coordLabel(p: GeoPoint): string {
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
}
