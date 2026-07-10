# 🎟 megaskorea 구독/결제 핸드오프 (세션 인계 노트)

> 이 문서는 www.megaskorea.com 구독/결제 작업을 다른 세션에서 이어가기 위한 저널입니다.
> ⚠️ 코드베이스는 이 저장소에 없음 — EC2 서버에만 존재(git 없음, scp 배포).
> 마지막 업데이트: 2026-07-10

## 1. 인프라 / 접속

- 서버: EC2 `13.125.188.41` (`ec2-user`), 웹루트 `~/web/www.megaskorea.com`
- 스택: CodeIgniter 4.5.3 / PHP 8.3 / MySQL 8 · 앞단 CloudFront
- 배포: `scp` → `sudo systemctl reload php-fpm` · 수정 전 `.bak.<ts>` 백업 필수 (git 없음)
- SSH 키 `mk.pem`은 데스크톱 임시폴더에만 있음(동기화 안 됨) → **다른 기기에서 배포하려면 키+IP 재설정 필요**
- PG: 정기구독/기간권 `MID=DEDP00001m`, `env=live`(실청구!). 승인성공=`3001`/`0000`, `9998`=인증불가. 입금=PayAction 웹훅

## 2. 완료된 작업 (2026-07-10 기준)

### UI — 라이브 = test-lab 다크 단일소스
- 충전=`Subsc::index`→`testlab/charge.php` · 마이=`testlab/mypage.php` · 상세=`Contents::view`→`testlab/detail.php`
- 공통바 `testlab/_nav.php` · 헤더배지=🎟소장권 통일 · `$live`로 배너 숨김

### 기능
- 정기구독 / 정액제(기간권, `pass:<idx>` 마커) / 바나나 + 입금·카드결제
- 소장(voucher/banana) · 통합패키지 소장금지 · 다중파트 재생
- 관리자: `admin/subscription` · `admin/owned` · `admin/member`(회원번호+구독 부여/해지/회수)

### 보안/정합성
- 관리자 무인증 → `is_admin()` 가드 전면 적용
- 소장 차감 레이스 수정 · `3001` 성공인식
- 중복결제 방지(`GET_LOCK`+활성체크) · 금액변조 차단(서버 재산정)
- 입금 웹훅 인증(access) · 100원 테스트키 제거
- activate `GREATEST` · 타임아웃=`needs_review` 격리 · payster엔 성공만 기록

### 기타
- basic(일반): 상품/가격·디자인 성인과 통일 후 `/payment`→`/adult/payment` 리다이렉트
- 모바일 하드닝(nav 2줄·overflow-x·keep-all·VAT nowrap 등) 390px 실측
- 사고처리: lovepower69·pep55·pkg1017·bodyboy — 실패 재시도였고 실청구 각 1건, 구독/BillKey 정상

## 3. 운영 명령 (`php spark …`)

| 명령 | 용도 |
|---|---|
| `sub:diag <id>` | 구독 상태 진단 |
| `sub:activate <id> <days> [bid]` | 구독 활성화 |
| `sub:set-bid <id> <bid>` | BillKey 지정 |
| `sub:revoke <id> [voucher]` | 해지/회수 |
| `sub:mark-paid <id> [amt]` | 결제 처리 표기 |
| `sub:paylog [n]` | 결제 로그 |
| `sub:clean-failed [run]` | 실패건 정리 |

## 4. 남은 항목

1. CloudFront `/adult/*` 무효화
2. 임시라우트 `/adult/payment/preview` 제거
3. 환불규정 문구 확정
4. 관리자 검색 SQLi/XSS (검수 D, **미적용**)
5. `env=live` 오픈정책 확정
6. PayAction 웹훅 실입금 1건 최종확인

## 5. 핵심 파일 (서버 기준 경로)

- `Controllers/{Subsc,Billing,Payment,Payaction,Contents}.php`, `Controllers/admin/{Subscription,Owned,Member,Payment}.php`, `Basic.php`
- `Views/testlab/*`, `Views/templates/header_contents.php`, `Views/admin/*`
- `Libraries/{Subscription,Ownership,PaysterBilling}.php`
- `Commands/{BillingCharge,Sub*}.php`
- `Config/{Billing,ChargeCatalog,Routes}.php`
