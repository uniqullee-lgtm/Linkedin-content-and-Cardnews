# style-learn skill

LinkedIn 콘텐츠 앱에서 스타일 참조 포스팅을 분석하고 AI 스타일 프로필을 업데이트합니다.

## 사용법
```
/style-learn
```

## 동작 순서

1. **현재 스타일 참조 포스팅 조회**
   - `GET /api/posts?styleReference=true` 호출 (또는 DB 직접 조회)
   - 없으면 사용자에게 안내: "편집기에서 ⭐ 버튼으로 참조 포스팅을 먼저 지정해주세요."

2. **스타일 분석**
   - 참조 포스팅들의 공통 패턴 분석:
     - 훅 문장 유형 (질문형 / 통계형 / 역설형)
     - 문단 길이 및 구조
     - 이모지 사용 패턴
     - 해시태그 위치 및 개수
     - 특징적인 표현/어투

3. **스타일 프로필 생성**
   - `POST /api/settings`에 분석 결과를 `styleProfile` 필드로 저장
   - 200자 이내의 간결한 설명으로 요약

4. **결과 보고**
   - 분석한 포스팅 수
   - 생성된 스타일 프로필 요약
   - 다음 AI 생성 시 자동 반영됨을 안내

## 예시 출력

```
✅ 스타일 학습 완료

분석한 참조 포스팅: 3개
  - "과정개발자가 알아야 할 핵심 원칙" (과정개발)
  - "진단 프로젝트 뒤에 남는 것" (진단개발)
  - "팀장의 첫 100일" (일하는방식)

🎨 학습된 스타일 프로필:
  질문형 훅으로 시작, 3~4문단의 콤팩트 구조.
  실무 사례 중심의 친근한 전문가 어투.
  이모지 1개, 해시태그 4개 패턴 유지.

다음 포스팅 생성 시 이 스타일이 자동 반영됩니다.
```

## 구현 시 참고

이 스킬이 실행될 때 다음 API를 활용합니다:

```typescript
// 스타일 참조 포스팅 가져오기
const posts = await prisma.post.findMany({
  where: { isStyleReference: true, finalContent: { not: null } },
  orderBy: { updatedAt: 'desc' },
  take: 5,
})

// 스타일 프로필 생성 (src/lib/claude.ts)
const profile = await generateStyleProfile(posts.map(p => ({
  title: p.title,
  content: p.finalContent,
  contentType: p.contentType,
  styleNotes: p.styleNotes,
})), apiKey)

// 설정에 저장
await prisma.appSettings.upsert({
  where: { id: 'singleton' },
  update: { styleProfile: profile },
  create: { id: 'singleton', companyName: '타피루즈그룹', styleProfile: profile },
})
```
