# 🌿 풀리피아 — 식물 컬렉션 & 경쟁 앱

사진으로 식물을 식별하고, 내 컬렉션에 모으고, 성장 히스토리를 기록하며, 다른 유저와 점수로 경쟁하고, 발견한 식물을 지도에 남기는 PWA(웹앱)입니다.

## 주요 기능

- **📸 식물 식별** — 사진을 찍거나 골라 식물명·특징(원산지, 햇빛/물·습도 요구, 독성, 재배 팁)을 확인
- **🏡 내 컬렉션 / 도감** — 식별한 식물을 저장하고 물주기·분갈이 시기를 한눈에
- **🌱 성장 히스토리** — 사진·키 측정·물주기·분갈이·메모를 타임라인으로 기록
- **🏆 유저 경쟁** — 희귀도·다양성·기록 활동으로 점수를 매겨 리더보드와 뱃지 제공
- **🗺️ 식물 지도** — 식별 시 위치를 저장해 발견한 식물을 지도(OpenStreetMap)에 핀으로 표시
- **📱 PWA** — '홈 화면에 추가'로 앱처럼 설치, 오프라인 캐시 지원

## 기술 스택

- React 18 + TypeScript + Vite
- react-router-dom (라우팅)
- react-leaflet + Leaflet + OpenStreetMap (지도, API 키 불필요)
- 데이터 저장: 브라우저 localStorage (로컬 우선)

## 현재 단계 (MVP)

선택한 방향에 따라 다음과 같이 시작했습니다:

- **식별**: 데모용 **목업**(`src/lib/identify.ts`) — 같은 사진은 항상 같은 결과가 나오도록 결정론적으로 구현. 추후 Plant.id / PlantNet / Claude Vision 등 실제 API로 교체 가능.
- **저장**: **로컬 우선**(localStorage). 경쟁 리더보드의 라이벌은 데모용 가상 유저.

## 다음 확장 단계

1. 실제 식물 식별 API 연동
2. Supabase/Firebase로 계정·클라우드 동기화·실시간 유저 간 랭킹
3. 식물 지도 커뮤니티 공유(다른 유저의 발견 위치 보기)
4. 케어 알림(푸시 알림)

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
  data/plants.ts        # 목업 식물 도감 데이터
  lib/identify.ts       # 식별 로직 (목업 → 추후 API 교체)
  lib/score.ts          # 점수·리더보드·뱃지
  lib/care.ts           # 물주기·분갈이 일정 계산
  lib/geo.ts            # 위치/역지오코딩 (식물 지도)
  lib/storage.ts        # localStorage 영속화
  state/store.tsx       # 전역 상태 (React Context + reducer)
  pages/                # 도감 / 식별 / 상세 / 경쟁 / 지도 / 내정보
  components/           # 하단 네비, 썸네일, 희귀도 태그
```
