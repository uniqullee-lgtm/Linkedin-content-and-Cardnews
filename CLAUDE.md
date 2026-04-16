# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

타피루즈그룹(HRD 컨설팅 전문 기업)을 위한 LinkedIn 콘텐츠 제작 + 카드뉴스 PPT 생성 웹앱.

**핵심 워크플로우**: 주제/맥락 입력 → Claude AI 초안 생성(본문+첫댓글 동시) → 편집 → 카드뉴스 PPT 생성/다운로드

## 개발 명령어

```bash
# 로컬 개발
docker-compose -f docker-compose.dev.yml up -d  # PostgreSQL 시작
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사

# DB
npx prisma migrate dev --name <name>  # 스키마 변경 후 마이그레이션
npx prisma migrate deploy             # 프로덕션 마이그레이션 적용
npx prisma generate                   # Prisma 클라이언트 재생성
npx prisma studio                     # DB 데이터 GUI 확인

# Google Cloud 배포
PROJECT_ID=your-project bash scripts/setup-gcloud.sh  # 최초 1회 GCP 설정
gcloud builds submit --config=cloudbuild.yaml          # 수동 배포
```

## 아키텍처

### 전체 구조

Next.js 14 App Router 모놀리식 구조. 프론트엔드와 API 라우트가 동일 프로젝트에 공존.

- **DB**: Prisma + **PostgreSQL** (로컬: Docker, 프로덕션: Cloud SQL)
- **AI**: `@anthropic-ai/sdk` — 서버 사이드 전용 (`src/lib/claude.ts`)
- **PPT**: `pptxgenjs` — 반드시 서버(API 라우트)에서만 실행, 클라이언트 import 금지
- **상태 관리**: SWR (서버 상태), React 로컬 state (UI 상태)

### 핵심 데이터 흐름

```
/posts/new (Step1 폼 입력)
  → POST /api/posts/generate (Claude 스트리밍)
  → POST DB 저장 (status: DRAFT)
  → /posts/[id]/edit (3컬럼 편집기)
  → PUT /api/posts/[id] (자동 저장, 2초 디바운스)
  → /posts/[id]/cardnews (슬라이드 편집)
  → POST /api/posts/[id]/cardnews/generate (pptxgenjs → .pptx 바이너리)
```

### API 키 관리

`ANTHROPIC_API_KEY`는 두 가지 방법으로 제공 가능:
1. `.env.local` 파일에 직접 설정 (개발자용)
2. `/settings` 페이지에서 앱 내 입력 → DB `Settings` 테이블에 암호화 저장 (비개발자용)

API 라우트에서는 `process.env.ANTHROPIC_API_KEY` → DB 저장값 순서로 fallback.

### Claude 생성 포맷

한 번의 API 호출로 **본문 + 첫 댓글을 동시 생성**. `---COMMENT---` 구분자로 분리:

```
[LinkedIn 본문 700~1200자]
---COMMENT---
[첫 댓글 내용 (링크 CTA 등)]
```

`src/lib/claude.ts`의 `parseGeneratedContent(raw: string)` 함수로 파싱.

### Google Cloud 배포 구조

```
GitHub → Cloud Build → Artifact Registry → Cloud Run
                                         ↓
                              Cloud SQL (PostgreSQL)
                              Secret Manager (API 키)
```

- **Cloud Run**: 컨테이너 서버리스, 서울 리전(`asia-northeast3`), 최소 0인스턴스
- **Cloud SQL**: PostgreSQL 15, `db-f1-micro` (개발/소규모)
- **Secret Manager**: `linkedin-app-db-url`, `linkedin-app-anthropic` 시크릿
- **배포**: `gcloud builds submit --config=cloudbuild.yaml`

### AI 스타일 학습 기능

편집기에서 ⭐ 버튼 → `isStyleReference = true` → 이후 AI 생성 시 자동 참조:

```
Post.isStyleReference = true  →  /api/posts/generate에서 최대 3개 포스팅 참조
                              →  generateStyleProfile()로 스타일 프로필 텍스트 생성
                              →  AppSettings.styleProfile에 저장
                              →  다음 생성 시 system prompt에 포함
```

Custom skill: `/style-learn` (`.claude/skills/style-learn.md`)

### AI 모델 선택 (Model Selection)

`src/lib/claude.ts`에서 세 가지 모델 지원:

| 모델 | ID | 용도 |
|------|----|----|
| `sonnet` | `claude-sonnet-4-6` | 기본값 — LinkedIn 포스팅 생성 (콘텐츠 작성 80%) |
| `haiku` | `claude-haiku-4-5` | 스타일 프로필 분석 등 단순/빠른 태스크 |
| `opus` | `claude-opus-4-6` | 사용자 명시 선택 시 — 복잡한 추론 필요 시 |

- 설정 페이지(`/settings`)에서 기본 모델 선택 → `AppSettings.preferredModel` DB 저장
- `/api/posts/generate` 요청 시 `model` 파라미터로 오버라이드 가능
- 우선순위: 요청 파라미터 > DB 설정값 > 기본값('sonnet')

### PostgreSQL Enum 처리

PostgreSQL에서도 Prisma enum 사용 가능하지만, 앱 레벨 유연성을 위해 String + Zod 유지:

```typescript
// src/lib/constants.ts
export const CONTENT_TYPES = ['COURSE_DEVELOPMENT', 'WORK_STYLE', ...] as const
export type ContentType = typeof CONTENT_TYPES[number]
```

### PPT 다운로드 (모바일 Safari 호환)

`window.open(url)` 팝업 차단 문제 회피. `DownloadButton.tsx`는 항상 fetch→blob→createObjectURL 패턴 사용:

```typescript
const res = await fetch('/api/posts/[id]/cardnews/generate', { method: 'POST', ... })
const blob = await res.blob()
const url = URL.createObjectURL(blob)
const a = document.createElement('a'); a.href = url; a.download = 'cardnews.pptx'; a.click()
URL.revokeObjectURL(url)
```

### 반응형 레이아웃

- **데스크탑 (>1024px)**: 좌측 사이드바(240px) + 메인 콘텐츠
- **태블릿 (768~1024px)**: 사이드바 아이콘만 표시(64px) + 메인 콘텐츠
- **모바일 (<768px)**: 하단 탭바(4개: 대시보드/새포스팅/캘린더/설정) + 풀스크린 콘텐츠

편집기 3컬럼: 데스크탑 전용. 태블릿은 미리보기 토글 버튼으로 숨김/표시. 모바일은 탭(편집/미리보기/메타데이터).

## 주요 파일 위치

| 역할 | 경로 |
|------|------|
| Claude API 래퍼 + 시스템 프롬프트 | `src/lib/claude.ts` |
| PPT 생성 메인 | `src/lib/pptx/generator.ts` |
| PPT 템플릿 4종 | `src/lib/pptx/templates/` |
| 포스팅→슬라이드 파싱 | `src/lib/pptx/slide-builder.ts` |
| Prisma 싱글턴 | `src/lib/prisma.ts` |
| 앱 전역 상수 (enum, 해시태그 프리셋) | `src/lib/constants.ts` |
| API 라우트 | `src/app/api/` |

## 콘텐츠 유형 (ContentType)

| 값 | 한국어 | 설명 |
|----|--------|------|
| `COURSE_DEVELOPMENT` | 과정개발 | 교육과정 설계 노하우 |
| `WORK_STYLE` | 일하는방식 | 업무 효율화, 협업 문화 |
| `DIAGNOSIS_DEVELOPMENT` | 진단개발 | 조직/역량 진단 설계 |
| `PROJECT_EXPERIENCE` | 프로젝트 경험 | 실제 컨설팅 사례 (고객사 익명 처리 필수) |
| `BOOKLET_WEBINAR` | 소책자/웨비나 | 리소스 공유 및 참여 유도 |

## 주요 파일 추가 (Google Cloud + 스타일 학습)

| 역할 | 경로 |
|------|------|
| Google Cloud 빌드/배포 | `cloudbuild.yaml` |
| Docker 컨테이너 | `Dockerfile` |
| 로컬 개발 DB | `docker-compose.dev.yml` |
| GCP 초기 설정 스크립트 | `scripts/setup-gcloud.sh` |
| 스타일 참조 API | `src/app/api/posts/[id]/style-reference/route.ts` |
| Custom skill | `.claude/skills/style-learn.md` |

## 알려진 실수 기록

<!-- Claude가 작업 중 발견한 실수/주의사항을 여기에 기록 -->
- [2026-04-15] SQLite → PostgreSQL 전환. `@db.Text` 어노테이션 필요 (long text 필드)
- [2026-04-15] pptxgenjs를 클라이언트 컴포넌트에서 import 시 Buffer 오류 → 서버(API 라우트) 전용
- [2026-04-15] Dockerfile에서 빌드 시 DATABASE_URL 필요 → 더미값으로 빌드 후 런타임에 실제값 주입
- [2026-04-16] Prisma v7: `schema.prisma`의 `datasource db`에서 `url` 필드 제거됨 → `prisma.config.ts`에서 관리. PrismaClient 생성 시 `@prisma/adapter-pg`의 `PrismaPg` 어댑터 필수. `prisma.ts`는 `new PrismaPg({ connectionString })` + `new PrismaClient({ adapter })` 패턴 사용
- [2026-04-16] `next.config.ts` → Next.js 14는 `.ts` 설정 파일 미지원 → `next.config.mjs`로 rename
- [2026-04-16] `next lint` → ESLint v9 flat config 미지원 → `package.json`의 lint 스크립트를 `eslint src --max-warnings 0`으로 변경, `eslint.config.mjs` 필요
- [2026-04-16] Prisma v7 생성 파일에 `index.ts` 없음 → `from '../../generated/prisma/client'`로 직접 import
- [2026-04-15] Next.js standalone 출력은 NODE_ENV=production 시에만 활성화
