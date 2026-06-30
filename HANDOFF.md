# 🌿 Melov 작업 핸드오프 (세션 인계 노트)

> 이 문서는 다른 세션에서 작업을 그대로 이어가기 위한 저널입니다.
> 마지막 업데이트: 2026-06-30

## 1. 프로젝트 개요

사진으로 식물을 식별 → 내 컬렉션에 저장 → 성장 히스토리 기록 → 유저 간 점수 경쟁 →
발견 위치를 지도에 남기는 **PWA(웹앱)**.

- 저장소: `crespe/melov`
- 작업 브랜치: `claude/plant-id-collection-app-ok5bzt` (이 브랜치에만 커밋/푸시)
- 기술 스택: React 18 + TypeScript + Vite, react-router-dom, react-leaflet + Leaflet(OSM), localStorage

## 2. 확정된 결정사항 (사용자 선택)

| 항목 | 선택 | 비고 |
|---|---|---|
| 플랫폼 | **웹앱(PWA)** | 이 환경에서 바로 빌드/실행 가능 |
| 식물 식별 | **목업 먼저** | `src/lib/identify.ts` 결정론적 목업. 추후 실제 API 교체 |
| 데이터 저장 | **로컬 우선** | localStorage. 경쟁 라이벌은 데모용 가상 유저 |
| 추가 요청 | **식물 지도** | 식별 시 위치 저장 → OSM 지도에 핀 표시 |

## 3. 구현 완료 (MVP, 빌드·브라우저 스모크 테스트 통과)

5개 탭 모두 동작 확인됨 (도감/지도/식별/경쟁/내정보):

- **📸 식별** (`pages/IdentifyPage.tsx`): 사진 촬영/선택 → 목업 식별 → 특징 표시 → 컬렉션 저장(위치 함께 기록)
- **🏡 도감** (`pages/CollectionPage.tsx`): 내 식물 목록 + 물주기/분갈이 시기
- **🌱 상세** (`pages/PlantDetailPage.tsx`): 생장정보 + 성장 히스토리 타임라인 + 물주기/분갈이 완료 기록
- **🏆 경쟁** (`pages/CompetePage.tsx`): 희귀도/다양성/기록 기반 점수·리더보드·뱃지
- **🗺️ 지도** (`pages/MapPage.tsx`): 발견 식물을 OSM 지도에 이모지 핀으로 표시
- **🧑‍🌾 내정보** (`pages/ProfilePage.tsx`): 닉네임/아바타/통계

핵심 로직:
- `lib/identify.ts` — 식별(목업, 같은 사진 → 같은 결과). **여기만 바꾸면 실제 API 연동**
- `lib/score.ts` — 점수/리더보드/뱃지
- `lib/care.ts` — 물주기/분갈이 일정 계산
- `lib/geo.ts` — 위치/역지오코딩(Nominatim)
- `lib/storage.ts` + `state/store.tsx` — localStorage 영속화 + 전역 상태(reducer)
- `data/plants.ts` — 목업 식물 도감 8종

빌드: `npm install && npm run build` → `dist/` 정적 산출물. 에러 없음.

## 4. 진행 중 / 막힌 작업 ⛔ — 배포

**목표: `plant.geut.shop`에 배포.**

현재 막힌 이유:
- 이 실행 환경은 격리된 임시 컨테이너. 해당 도메인/서버에 직접 접근 수단 없음.
- 환경의 AWS 자격증명은 테스트 결과 `InvalidAccessKeyId` → 실제 배포용 아님(샌드박스 인프라용).
- 작동하는 호스팅 토큰/SSH/DNS 제어권 없음 → 버튼 하나로 그 주소에 바로 못 올림.

**필요한 정보 (사용자에게 받아야 함):** `plant.geut.shop`이 어떤 방식으로 호스팅되는가?
- Cloudflare Pages → API 토큰 + 계정 ID
- Vercel / Netlify → 토큰(또는 GitHub 저장소 연동)
- 직접 서버(VPS/SSH) → 서버 주소·계정·키
- 미정 → 추천: GitHub 저장소 연동형(Cloudflare Pages / Vercel)이 가장 간단

**대기 중이던 사용자 답변:** 위 질문에 대한 응답을 받지 못한 상태에서 세션 인계됨.

## 5. 다음 세션에서 할 일 (이어가기)

1. 사용자에게 `plant.geut.shop` 호스팅 방식 확인.
2. 방식이 정해지면:
   - **GitHub 연동형(권장)**: 저장소를 Cloudflare Pages/Vercel에 연결.
     빌드 명령 `npm run build`, 출력 디렉터리 `dist`. SPA라우팅 fallback 필요
     (Cloudflare Pages는 `public/_redirects`에 `/* /index.html 200`, Vercel은 `vercel.json` rewrites).
   - **토큰 제공형**: `.github/workflows/deploy.yml` 작성해 push 시 자동 배포(토큰은 GitHub Secrets).
   - **SSH/VPS**: rsync/scp로 `dist/` 업로드하는 워크플로우 또는 스크립트.
3. 커스텀 도메인 `plant.geut.shop` 연결 + DNS(CNAME) 안내.
4. (선택) SPA fallback 파일 추가 — 현재 저장소에는 아직 없음. 상세/지도 등 하위 경로 새로고침 대응 위해 필요.

## 6. 향후 기능 확장 로드맵

1. 목업 식별 → 실제 API(Plant.id / PlantNet / Claude Vision) — `lib/identify.ts` 교체
2. 로컬 저장 → Supabase/Firebase: 실제 계정·클라우드 동기화·실시간 유저 랭킹
3. 식물 지도 커뮤니티 공유(다른 유저 발견 위치)
4. 케어 푸시 알림

## 7. 빠른 시작 명령

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
npm run preview  # 빌드 미리보기
```
