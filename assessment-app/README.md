# 타피루즈 진단센터 (assessment-app)

타피루즈그룹의 온라인 진단 플랫폼. **데이터 기반 진단 엔진** 하나 위에 모든 진단을 콘텐츠로 얹는 구조 — 새 진단 추가는 코드 변경 없이 시드 데이터 입력만으로 가능합니다.

> 이 디렉토리는 자체 `package.json`을 가진 독립 앱입니다. 별도 저장소로 분리해도 그대로 동작합니다.

## 현재 상태 (Phase 1 완료)

- ✅ 진단 엔진: 문항 렌더링 → 응답 수집 → 차원별 채점(역채점 지원) → 구간(band) 해설 매핑
- ✅ 진단 1탑재: **동기·성격·강점 통합 진단** (동기 6 + 성격 5 + 강점 6 + 드레일먼트 6 = 23차원, 69문항)
- ✅ 응답 즉시 무료 해설 (레이더 차트 + 차원별 점수/해설, 드레일먼트는 위험 신호 색상 표시)
- ✅ 결과 페이지는 토큰 링크(`/r/[token]`)로만 접근, 개인정보 수집 동의 필수

⚠️ **문항·해설 텍스트는 개발용 초안입니다.** 운영 전 검증된 문항으로 교체하세요 (`prisma/seed.ts`의 `GROUPS` 데이터 수정 → `npm run db:seed`).

## 개발 명령어

```bash
docker compose -f docker-compose.dev.yml up -d  # PostgreSQL (포트 5433)
cp .env.example .env
npm install
npx prisma migrate dev    # 스키마 적용
npm run db:seed           # 진단 콘텐츠 시드
npm run dev               # http://localhost:3100
```

## 구조

| 역할 | 경로 |
|------|------|
| DB 스키마 (진단 엔진) | `prisma/schema.prisma` |
| 진단 콘텐츠 시드 | `prisma/seed.ts` |
| 채점 로직 | `src/lib/scoring.ts` |
| 척도·구간 상수 | `src/lib/constants.ts` |
| 설문 UI | `src/app/a/[slug]/survey/SurveyClient.tsx` |
| 응답 제출 API | `src/app/api/assessments/[slug]/responses/route.ts` |
| 결과 페이지 | `src/app/r/[token]/page.tsx` |

### 데이터 모델

```
Assessment (진단) ─┬─ Dimension (측정 차원, isRisk=드레일먼트)
                   │     ├─ Question (문항, isReversed=역채점)
                   │     └─ InterpretationBand (LOW/MID/HIGH 구간별 해설, summary=무료/detail=유료)
                   └─ Response (응답 + 채점 결과, token으로 결과 접근)
```

## 로드맵

- **Phase 2 — 수익화**: 토스페이먼츠 결제 + Playwright HTML→PDF 심층 리포트 (`InterpretationBand.detail` 활용)
- **Phase 3 — 다면진단 + 관리자**: Campaign/Invitation/Subject 모델, 평가자 역할별 토큰 발송(Resend), 익명성 최소 응답자 규칙, 이메일 템플릿 편집, 엑셀(exceljs) 로우데이터 export
- **Phase 4 — 팀·조직 진단**: 집단 보고서, 팀 간 비교, Claude API 기반 해석 코멘트 생성

## 배포

부모 프로젝트(LinkedIn 앱)와 동일: Cloud Run + Cloud SQL 또는 Vercel + Supabase.
프로덕션 `DATABASE_URL`에 `sslmode=require`가 포함되면 SSL이 자동 활성화됩니다 (또는 `DATABASE_SSL=true`).
