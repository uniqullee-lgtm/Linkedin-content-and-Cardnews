---
name: awesome-design-md
description: Use DESIGN.md files from 58+ premium brands (Apple, Spotify, Notion, Linear, Vercel, Toss, Kakao, etc.) as UI style references. Fetches brand design tokens, color systems, typography, and component patterns to generate pixel-perfect brand-matched UI.
---

# Awesome DESIGN.md — Brand Design System Reference

## What is DESIGN.md?

`DESIGN.md` is a plain-text design system document that AI agents read to generate consistent, brand-matched UI. Drop it in your project and Claude instantly understands how your UI should look.

- `AGENTS.md` → How to *build* the project (tech, commands)
- `DESIGN.md` → How the project should *look and feel*

## How to Use This Skill

When the user says "make it look like [Brand]" or "use [Brand] design system", fetch the corresponding DESIGN.md and apply it:

```
User: "대시보드를 Linear 스타일로 만들어줘"
→ Fetch Linear DESIGN.md → Apply tokens → Generate UI
```

## Available Brand DESIGN.md Files

Fetch these via: `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/{brand}/DESIGN.md`

### Korean & Asian Tech
| Brand | Style | URL slug |
|-------|-------|----------|
| **Toss** | 미니멀 핀테크, 토스 블루 | `toss` (check repo) |
| **Kakao** | 카카오 옐로우, 친근한 | `kakao` (check repo) |
| **Baemin** | 배민 민트, 손그림체 | `baemin` (check repo) |
| **Karrot** | 당근 오렌지, 로컬 커뮤니티 | `karrot` (check repo) |

### AI & Developer Tools
| Brand | Style | URL slug |
|-------|-------|----------|
| **Claude** | 따뜻한 테라코타, 에디토리얼 | `claude` |
| **Vercel** | 블랙/화이트 정밀함, Geist 폰트 | `vercel` |
| **Linear** | 울트라 미니멀, 퍼플 액센트 | `linear.app` |
| **Notion** | 웜 미니멀, 세리프 헤딩, 부드러운 표면 | `notion` |
| **Cursor** | 슬릭 다크, 그래디언트 액센트 | `cursor` |
| **Supabase** | 다크 에메랄드, 코드 중심 | `supabase` |

### Design & Creative
| Brand | Style | URL slug |
|-------|-------|----------|
| **Figma** | (check repo) | `figma` |
| **Framer** | 모션 중심, 크리에이티브 | `framer` |
| **Miro** | 협업 화이트보드, 컬러풀 | `miro` |
| **Webflow** | 노코드 프리미엄 | `webflow` |

### Finance & Consumer
| Brand | Style | URL slug |
|-------|-------|----------|
| **Stripe** | 퍼플/블루 프리미엄, 개발자 친화 | `stripe` |
| **Revolut** | 다크 프리미엄, 핀테크 | `revolut` |
| **Wise** | 그린 포인트, 글로벌 | `wise` |
| **Airbnb** | 웜 코랄, 환대 | `airbnb` |

### Automotive & Luxury
| Brand | Style | URL slug |
|-------|-------|----------|
| **Tesla** | 미니멀 화이트, 프리미엄 | `tesla` |
| **BMW** | 블루/화이트, 독일 엔지니어링 | `bmw` |
| **Ferrari** | 레드/블랙, 럭셔리 스포츠 | `ferrari` |

## Workflow

### 1. 브랜드 스타일 적용하기

```
User: "이 컴포넌트를 Vercel처럼 만들어줘"
```

1. Fetch: `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/vercel/DESIGN.md`
2. Extract design tokens (colors, typography, spacing, radius)
3. Apply to the component while keeping the project's functional structure

### 2. 커스텀 DESIGN.md 생성하기

```
User: "이 프로젝트의 DESIGN.md 만들어줘"
```

Generate a `DESIGN.md` based on the project's current color system (`brand-navy #1E3A5F`, `brand-blue #4A9EDB`), Tailwind config, and existing component patterns.

### 3. 복수 브랜드 혼합

```
User: "Linear의 미니멀함과 Toss의 한국어 UX를 섞어줘"
```

Extract specific elements from each DESIGN.md and synthesize a hybrid system.

## This Project's Design Tokens (참고)

This LinkedIn Content Creator project uses:
```
Primary:   #1E3A5F (brand-navy) — 사이드바, 버튼
Accent:    #4A9EDB (brand-blue) — 포커스, 링크
Success:   #22C55E
Warning:   #F59E0B
Danger:    #EF4444
Font:      Noto Sans KR (한국어), system-ui (영문)
Radius:    rounded-xl (카드), rounded-lg (버튼/인풋)
Shadow:    border-gray-100 (카드 테두리), 그림자 최소화
```

## Quick Fetch Command

To get any brand's DESIGN.md via curl:
```bash
curl -s "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/{brand}/DESIGN.md"
```

Replace `{brand}` with slugs from the table above (e.g., `vercel`, `notion`, `linear.app`).
