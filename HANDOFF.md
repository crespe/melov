# 🌿 풀리피아 작업 핸드오프 (세션 인계 노트)

> 이 문서는 다른 세션에서 작업을 그대로 이어가기 위한 저널입니다.
> 마지막 업데이트: 2026-06-30

## 1. 프로젝트 개요

사진으로 식물을 식별 → 내 컬렉션에 저장 → 성장 히스토리 기록 → 유저 간 점수 경쟁 →
발견 위치를 지도에 남기는 **PWA(웹앱)**. 앱 이름 **풀리피아**.

- 저장소: `crespe/melov`
- 작업 브랜치: `claude/plant-id-collection-app-ok5bzt` (이 브랜치에만 커밋/푸시)
- 기술 스택: React 18 + TS + Vite, react-router-dom, react-leaflet+Leaflet(OSM), localStorage
- **라이브: https://plant.geut.shop** (geut.shop EC2 서브도메인, 와일드카드 DNS·HTTPS 적용)

## 2. 배포 (완료, 라이브)

- 호스팅: **geut.shop EC2(54.116.165.139)** 서브도메인. 와일드카드 `*.geut.shop` DNS로 즉시 연결.
- 웹루트: `/var/www/geut.shop/public/plant/` · vhost `plant.geut.shop.conf`(+le-ssl), certbot HTTPS.
- SPA fallback: `public/.htaccess` (실제 파일/`/api/*.php`는 그대로, 그 외 → index.html).
- **배포 방법** (이 Mac에서):
  ```bash
  cd <melov> && npm run build
  rsync -avz --delete --exclude='api/config.php' \
    -e "ssh -i ~/.ssh/ecommerce-key.pem" \
    dist/ ubuntu@54.116.165.139:/var/www/geut.shop/public/plant/
  ```
  ⚠️ `--exclude='api/config.php'` 필수 — 서버 전용 시크릿(키·DB 비번)을 지우지 않기 위해.
- SSH: `ssh -i ~/.ssh/ecommerce-key.pem ubuntu@54.116.165.139` (이 Mac에 키 있음).

## 3. Phase 1 — 실제 식별 API (완료, Gemini 2.5 Flash)

- `public/api/identify.php` (서버): 사진 base64 → Gemini 비전(구조화 출력) → Species JSON(한국어 재배정보).
  - 키는 서버 전용 `public/api/config.php`(gitignore)에만. 형식 `['gemini_api_key'=>'AQ.…','gemini_model'=>'gemini-2.5-flash', 'db'=>[...]]`.
  - Gemini 키는 `AQ.` 형식(신형). era/config.php의 기존 키 재사용.
- `src/lib/identify.ts`: `/api/identify.php` fetch, 오류 시 결정론적 목업 폴백.
- `src/data/plants.ts`: **동적 종 레지스트리** + localStorage(`pullipia.species.v1`) — 식별된 종도 `getSpecies()`가 해석(내장 SPECIES 8종 + 발견 종). `registerSpecies(sp, persist)`.
- `IdentifyPage.save()`: 저장 시 선택 종 영속화.
- 검증: 해바라기 사진 → `Helianthus annuus/해바라기` 정확 식별(신뢰도 0.99).

## 4. Phase 2 — 서버 백엔드 (완료, 기기 기반 신원 + 실시간 랭킹)

- DB: 같은 EC2 MySQL **`plant_app`** / 유저 `plant` (비번은 서버 config.php). 테이블 `users`(id, token_hash, nickname, avatar, score, plant_count, species_count, entries, …).
- 서버 API (`public/api/`):
  - `db.php` — PDO 부트스트랩 + 토큰 인증 헬퍼
  - `register.php` — 닉네임·아바타 → userId·token 발급/갱신
  - `sync.php` — 점수·통계 업서트(토큰 인증, 값 클램프), 내 순위 반환
  - `leaderboard.php` — 점수순 상위 N (GET ?limit=)
- 프론트:
  - `lib/api.ts` — 신원(localStorage `pullipia.identity.v1`) + 등록/동기화/리더보드
  - `lib/useServerSync.ts` — App에서 호출. 등록 보장 + 컬렉션 변경 시 디바운스 동기화(오프라인 무해)
  - `CompetePage` — 실제 유저 리더보드, 서버 미연결 시 데모 폴백
- 검증: register→sync→leaderboard 종단 + 토큰 401 가드 확인. 테스트 유저는 정리 완료(현재 0명).

## 5. 알려진 한계 / 다음 후보

1. **식별 엔드포인트가 공개(무인증)** → 외부 남용 시 Gemini 쿼터 소모. 레이트리밋/토큰 게이트 검토.
2. **점수는 클라이언트 계산** → 스푸핑 가능. 서버측 재검증 여지.
3. **컬렉션은 단일 기기**(기기 기반 신원). 멀티기기 동기화하려면 컬렉션 자체 클라우드 저장 + 정식 계정 필요.
4. 식별 키가 채팅 기록에 노출됨 — 필요시 Google에서 키 회전.
5. 향후: 식물 지도 커뮤니티 공유, 케어 푸시 알림.

## 6. 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173 (로컬은 /api 없음 → 식별·랭킹은 폴백 동작)
npm run build    # dist/
```
실제 식별·랭킹은 라이브(plant.geut.shop)에서만 동작(서버 /api 필요).
