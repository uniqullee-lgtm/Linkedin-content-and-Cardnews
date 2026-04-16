---
name: oh-my-design
description: Korean-focused design system reference tool by @kwakseongjae. Access DESIGN.md files from 62 global and Korean companies (Toss, Kakao, Baemin, Karrot, Linear, Notion, Apple, etc.). Fetch brand design tokens and apply them to generate consistent, brand-matched UI.
---

# OMD (Oh-My-Design) — 62개 브랜드 디자인 시스템 레퍼런스

## 소개

[kwakseongjae/oh-my-design](https://github.com/kwakseongjae/oh-my-design)은 62개 글로벌/한국 기업의 DESIGN.md 파일을 제공하는 오픈소스 프로젝트입니다.
한국 기업(토스, 카카오, 배민, 당근)을 포함한 대기업 디자인 시스템을 AI 에이전트가 바로 읽을 수 있는 형식으로 제공합니다.

## 브랜드 DESIGN.md 가져오기

**파일 경로 패턴:**
```
https://raw.githubusercontent.com/kwakseongjae/oh-my-design/main/references/{brand}/DESIGN.md
```

**curl 명령어:**
```bash
curl -s "https://raw.githubusercontent.com/kwakseongjae/oh-my-design/main/references/{brand}/DESIGN.md"
```

## 전체 브랜드 목록 (62개)

### 한국 테크 (필수 참고)
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **토스** | `toss` | Toss Blue #3182f6, 토스 Product Sans, OKLCH 색상계, 모바일 퍼스트 375px, 한국어 금융 UX |
| **카카오** | `kakao` | Yellow #FEE500, 친근함, 굵은 볼드 |
| **배민** | `baemin` | Mint #29D6D0, 손그림체 강조, 유머 감성 |
| **당근** | `karrot` | Orange #FF6F0F, 로컬 커뮤니티, 따뜻함 |

### 프로덕티비티 & SaaS
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Linear** | `linear.app` | 울트라 미니멀, 퍼플 액센트, 개발자 감성 |
| **Notion** | `notion` | 웜 미니멀, 세리프 헤딩, 편집기 감성 |
| **Airtable** | `airtable` | 컬러풀 데이터, 친근한 |
| **Intercom** | `intercom` | 블루 팔레트, 대화형 UI |
| **Zapier** | `zapier` | 워밍 오렌지, 자동화 친화 |
| **Cal.com** | `cal` | 깔끔한 중립, 개발자 지향 |
| **Miro** | `miro` | 협업 화이트보드, 컬러풀 |

### 개발자 도구
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Vercel** | `vercel` | 블랙/화이트 정밀, Geist 폰트 |
| **Cursor** | `cursor` | 슬릭 다크, 그래디언트 액센트 |
| **Supabase** | `supabase` | 다크 에메랄드, 코드 중심 |
| **Raycast** | `raycast` | 다크 크롬, 생동감 있는 그래디언트 |
| **Warp** | `warp` | 다크 IDE, 블록 기반 |
| **Expo** | `expo` | 다크 테마, 코드 중심 |
| **Hashicorp** | `hashicorp` | 엔터프라이즈 클린, 블랙/화이트 |
| **VoltAgent** | `voltagent` | 보이드 블랙, 에메랄드 액센트 |
| **Lovable** | `lovable` | 재미있는 그래디언트, 친근한 |

### AI & LLM
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Claude** | `claude` | 따뜻한 테라코타, 에디토리얼 |
| **Cohere** | `cohere` | 생동감 있는 그래디언트, 데이터 밀집 |
| **ElevenLabs** | `elevenlabs` | 다크 시네마틱, 오디오 웨이브 |
| **Mistral AI** | `mistral.ai` | 프랑스 미니멀리즘, 퍼플 톤 |
| **Ollama** | `ollama` | 터미널 퍼스트, 흑백 단순 |
| **Minimax** | `minimax` | 굵은 다크 인터페이스, 네온 액센트 |
| **Replicate** | `replicate` | 클린 화이트, 코드 중심 |
| **RunwayML** | `runwayml` | 시네마틱 다크, 미디어 리치 |
| **Together AI** | `together.ai` | 기술적, 청사진 스타일 |
| **xAI** | `x.ai` | 스타크 흑백, 미래지향적 |

### 디자인 & 크리에이티브
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Figma** | `figma` | 크리에이티브, 협업 강조 |
| **Framer** | `framer` | 모션 중심, 크리에이티브 |
| **Webflow** | `webflow` | 노코드 프리미엄 |
| **Clay** | `clay` | 3D 클레이 캐릭터, 재미있음 |

### 금융 & 소비자
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Stripe** | `stripe` | 퍼플/인디고, 금융 신뢰, 문서 중심 |
| **Revolut** | `revolut` | 다크 프리미엄, 핀테크 |
| **Wise** | `wise` | 그린 포인트, 글로벌 |
| **Coinbase** | `coinbase` | 블루 신뢰, 크립토 |
| **Kraken** | `kraken` | 다크 퍼플, 크립토 |
| **Uber** | `uber` | 블랙/화이트 정밀, 도시 |
| **Airbnb** | `airbnb` | 웜 코랄, 환대 |
| **Pinterest** | `pinterest` | 레드 포인트, 인스피레이션 |

### 자동차 & 럭셔리
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Tesla** | `tesla` | 미니멀 화이트, 프리미엄 |
| **BMW** | `bmw` | 블루/화이트, 독일 엔지니어링 |
| **Ferrari** | `ferrari` | 레드/블랙, 럭셔리 스포츠 |
| **Lamborghini** | `lamborghini` | 어그레시브, 익스트림 |
| **Renault** | `renault` | 프렌치 디자인, 다이아몬드 |

### 기타
| 브랜드 | 슬러그 | 주요 특성 |
|--------|--------|----------|
| **Apple** | `apple` | 극도의 미니멀, SF Pro, 여백 |
| **Spotify** | `spotify` | 블랙 + 그린 #1DB954, 음악 감성 |
| **Notion** | `notion` | 웜 미니멀 |
| **IBM** | `ibm` | 엔터프라이즈, 블루, 격자 |
| **Nvidia** | `nvidia` | 게이밍/AI, 그린 #76B900 |
| **MongoDB** | `mongodb` | 그린 리프, 개발자 문서 |
| **PostHog** | `posthog` | 플레이풀, 개발자 친화 다크 |
| **Sentry** | `sentry` | 다크 대시보드, 핑크-퍼플 |
| **Sanity** | `sanity` | 레드 액센트, 콘텐츠 중심 |
| **Mintlify** | `mintlify` | 깔끔, 그린 액센트, 독서 최적화 |
| **SpaceX** | `spacex` | 미니멀 블랙, 우주 |
| **Superhuman** | `superhuman` | 프리미엄 다크, 키보드 퍼스트 |
| **Resend** | `resend` | 미니멀 다크, 모노스페이스 액센트 |

## 워크플로우

### 1. 브랜드 스타일 적용

```
User: "토스 스타일로 대시보드 카드 만들어줘"
```

**실행:**
```bash
curl -s "https://raw.githubusercontent.com/kwakseongjae/oh-my-design/main/references/toss/DESIGN.md"
```

→ 디자인 토큰 추출 → 이 프로젝트(React + Next.js + Tailwind)에 맞게 구현

### 2. 여러 브랜드 혼합

```
User: "Linear의 미니멀함 + 토스의 한국어 UX 스타일로"
```

두 DESIGN.md를 모두 fetch해서 각각 원하는 요소만 조합.

### 3. 이 프로젝트용 DESIGN.md 생성

```
User: "이 프로젝트 DESIGN.md 만들어줘"
```

현재 프로젝트 토큰 기반으로 루트에 `DESIGN.md` 생성:
```
Primary:  #1E3A5F (brand-navy)
Accent:   #4A9EDB (brand-blue)
Font:     Noto Sans KR (현재) → Pretendard 전환 권장
Radius:   rounded-xl
Target:   한국어 HRD 컨설팅, 전문적·신뢰감
```

## 토스 DESIGN.md 핵심 토큰 (한국 앱 참고)

```
Primary Color:    Toss Blue #3182f6
Background:       Pure White #ffffff
Text Primary:     Dark Charcoal #191f28
Border Default:   #e5e8eb
Font:             Toss Product Sans (유사: Pretendard)
Font Stack:       Pretendard, -apple-system, BlinkMacSystemFont, system-ui
Design Base:      Mobile-first 375px
Number Style:     Tabular numerals for financial data
Shadow:           최소화 (신뢰는 선명함에서 나옴)
```
