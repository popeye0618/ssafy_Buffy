# 백엔드 API 수정/추가 목록

프론트엔드 코드(`src/stores/app.ts`, `src/api/contracts.ts`, `src/api/mappers.ts`)와 배포된 백엔드의 실제 OpenAPI 스펙(`GET /openapi.json`, `info.version = "1.1.1"`)을 비교한 결과입니다. 코드 수정 없이 조사만 수행했습니다.

> 참고: 이 저장소에는 프론트엔드만 있고 백엔드 소스는 없습니다. 백엔드는 `https://ssafy-first-team.onrender.com` (FastAPI, `/openapi.json`, `/docs` 제공)에서 별도로 서빙됩니다.

---

## 🔴 우선순위 높음 — 이미 프론트에 구현됐지만 백엔드 데이터가 없어 동작하지 않는 기능

### 1. 영어(EN) 필드가 응답 스키마에 전혀 없음 — 언어 전환 기능 무력화

프론트에는 설정에서 한국어/영어를 전환하는 기능이 실제로 존재합니다(`src/stores/app.ts:9,24`, `localStorage`에 저장, `tr()` 헬퍼로 렌더링). `src/api/mappers.ts`도 각 리소스의 `xxxEn` 필드를 읽어 영어 모드에서 사용하도록 이미 작성되어 있습니다. 그런데 실제 백엔드 응답 스키마에는 해당 필드가 하나도 없어서, 영어로 전환해도 항상 한국어로 폴백됩니다.

| 리소스 | 프론트가 기대하는 필드 (`contracts.ts`) | 백엔드 `*Response` 스키마 실제 필드 |
|---|---|---|
| `BoardResponse` | `nameEn`, `descriptionEn` | 없음 |
| `AttractionResponse` | `nameEn`, `summaryEn`, `descriptionEn`, `addressEn` | 없음 |
| `FestivalResponse` | `nameEn`, `placeEn`, `summaryEn` | 없음 |
| `TagResponse` | `nameEn` | 없음 |

**조치**: `GET /api/v1/boards`, `GET /api/v1/boards/{id}`, `GET /api/v1/tourism/attractions[/*]`, `GET /api/v1/tourism/festivals[/*]`, `GET /api/v1/tags` 응답에 위 영어 필드 추가.

---

### 2. `AttractionResponse` / `FestivalResponse`에 `boardId` 없음 — "커뮤니티 가기" 버튼 항상 비활성

관광지/축제 상세 페이지(`src/views/DetailView.vue:8`)는 이미 `item.boardId`가 있으면 연결된 커뮤니티 게시판으로 이동하는 버튼을, 없으면 "연결된 게시판 정보가 아직 없습니다" 안내를 보여주도록 구현되어 있습니다. 하지만 백엔드 응답에 `boardId`가 아예 없어 항상 안내 문구만 노출됩니다.

- `src/api/contracts.ts:5-6`에 `boardId?: number | null`로 타입까지 정의돼 있음
- 계약 테스트 `scripts/check-api-contract.mjs:17`도 "관광 응답에 boardId가 추가되면 커뮤니티 연결을 갱신하라"는 가드를 걸어둔 상태 → 이미 예정된 작업으로 보임

**조치**: 관광지/축제와 커뮤니티 게시판을 연결하는 매핑을 만들고 `AttractionResponse`, `FestivalResponse`에 `boardId` 필드 추가.

---

### 3. 전체 게시판 통합 "인기 게시글" 조회 API 없음

홈 화면(`src/views/HomeView.vue:38`)에 "인기 게시글 API 준비 중 / 전체 게시판의 추천 글을 조회하는 API가 추가되면 이 영역에 표시됩니다"라는 안내가 하드코딩돼 있습니다. 현재 특정 게시판 내 정렬(`GET /api/v1/boards/{board_id}/posts?sort=likes`)만 가능하고, 게시판을 가로지르는 인기글 목록 API가 없습니다.

- 계약 테스트 `scripts/check-api-contract.mjs:18`도 `/api/v1/posts` 부재를 감시 중 (추가되면 실패하도록) → 신규 엔드포인트로 설계된 뒤 이 assert도 함께 업데이트해야 함

**조치**: 전체 게시판을 대상으로 인기글(예: 좋아요순 상위 N개)을 조회하는 신규 엔드포인트 추가 (예: `GET /api/v1/posts/popular`). 단순 `GET /api/v1/posts` 전체 목록으로 만들 경우 계약 테스트 문구("전체 게시글 API가 추가됐습니다")와 충돌하니 명칭/설계 시 유의.

---

## 🟡 우선순위 중간 — 확장성/성능 관련

### 4. `GET /api/v1/boards`에 검색·필터·페이지네이션 쿼리 파라미터 없음

`src/stores/app.ts:31-45`의 `loadBoards()`를 보면 `category`, `keyword`, `page`, `size` 파라미터를 받지만, 실제 API 호출은 `GET /api/v1/boards` (쿼리 파라미터 없이 전체 목록)만 하고 있고, 카테고리 필터링·키워드 검색·페이지 슬라이싱을 전부 **프론트에서 클라이언트 사이드로** 처리합니다. 게시판 수가 늘어나면 비효율적입니다. 다른 목록형 엔드포인트(`/api/v1/boards/{board_id}/posts`, `/api/v1/search`)는 이미 `keyword`/`page`/`size` 쿼리 파라미터를 지원하므로 동일한 패턴을 `/api/v1/boards`에도 적용하는 게 일관적입니다.

**조치**: `GET /api/v1/boards`에 `keyword`, `page`, `size` (및 필요 시 `category`) 쿼리 파라미터 지원 추가.

> ⚠️ 단, 프론트의 카테고리 필터 버튼 값(`ATTRACTION`, `LEISURE`, `CULTURE`, `SHOPPING`, `STAY`, `COURSE`, `FESTIVAL` — `src/views/BoardsView.vue:6`)은 실제 백엔드 `BoardCategory` enum(`FREE`, `HAEUNDAE`, `GWANGALLI`, `SEOMYEON`, `NAMPODONG`, `YEONGDO`, `GIJANG` — 지역구 기반)과 완전히 다른 값입니다. 이건 **백엔드가 아니라 프론트 쪽 버그**로 보이며(관광지 콘텐츠 타입 값이 잘못 재사용된 것으로 추정), 백엔드에 category 파라미터를 추가하더라도 프론트의 카테고리 옵션 값을 실제 enum에 맞게 별도로 고쳐야 필터가 정상 동작합니다.

---

## 🟢 참고 — 백엔드 조치 불필요 (정보성)

- **통합 검색 API는 이미 존재합니다.** `GET /api/v1/search?q=...&page=&size=` (`SearchResponse`)가 백엔드에 이미 구현돼 있고 스펙도 완비되어 있습니다. 그런데 프론트(`src/views/SearchView.vue`, `src/views/HomeView.vue`)는 아직 이 API를 호출하지 않고 "통합 검색 API 확장 준비 중"이라는 비활성 UI만 노출 중입니다. → 백엔드는 준비 완료, **프론트 연동 작업만 남음.**

---

## 검증 방법 메모

- 배포된 스펙: `curl https://ssafy-first-team.onrender.com/openapi.json` (버전 `1.1.1`, `/docs`에서 Swagger UI 확인 가능)
- 나머지 경로/스키마(게시글 CRUD, 댓글, 좋아요, 미디어 업로드, 태그 생성, 챗봇, 비밀번호 검증 등)는 프론트 호출부(`src/stores/app.ts`)와 백엔드 스펙을 1:1로 대조했고 **모두 일치**하여 별도 조치가 필요 없습니다.
