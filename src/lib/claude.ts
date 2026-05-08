import Anthropic from '@anthropic-ai/sdk'
import type { GeneratePostRequest } from '@/types/post'
import { CONTENT_TYPE_LABELS, HASHTAG_PRESETS } from './constants'

// ---------------------------------------------------------------------------
// Model selection — 태스크별 적합 모델
// ---------------------------------------------------------------------------
// haiku  (claude-haiku-4-5-20251001) — 요약, 번역, 분류, 스타일 프로필 생성 등 단순/빠른 작업
// sonnet (claude-sonnet-4-6)         — 코딩, 콘텐츠 작성, 리팩토링 [기본값]
// opus-s (claude-opus-4-5)           — 코드리뷰, 경영 분석, 장기 에이전트 (중간 복잡도)
// opus   (claude-opus-4-6)           — 아키텍쳐 설계, 복잡한 디버깅 등 깊은 추론 전용

export type ClaudeModel = 'haiku' | 'sonnet' | 'opus-s' | 'opus'

const MODEL_IDS: Record<ClaudeModel, string> = {
  haiku: 'claude-haiku-4-5-20251001', // ✅ FIX: 정확한 모델 ID (기존: 'claude-haiku-4-5')
  sonnet: 'claude-sonnet-4-6',
  'opus-s': 'claude-opus-4-5',
  opus: 'claude-opus-4-6',
}

export function resolveModelId(model: ClaudeModel = 'sonnet'): string {
  return MODEL_IDS[model]
}

function getApiKey(): string {
  return process.env.ANTHROPIC_API_KEY || ''
}

// ---------------------------------------------------------------------------
// ✅ FIX: 빈 텍스트 방지 헬퍼
// ---------------------------------------------------------------------------
function sanitizeText(text: string | undefined | null, fallback = ''): string {
  const result = (text ?? '').trim()
  return result.length > 0 ? result : fallback
}

const BASE_SYSTEM_PROMPT = `당신은 타피루즈그룹의 LinkedIn 콘텐츠 전문가입니다. 타피루즈그룹은 HRD(인적자원개발) 컨설팅 전문 기업으로, 과정개발, 조직진단, 리더십 개발 등의 서비스를 제공합니다.

## 역할

기업 HRD 담당자, 팀장, 조직개발 전문가들에게 공감을 주는 LinkedIn 포스팅을 작성합니다.

## 포스팅 구조 (반드시 준수)

1. **훅 (첫 1~2문장)**: 스크롤을 멈추게 하는 강력한 첫 문장. 질문, 놀라운 통계, 역설적 발언 활용

2. **맥락**: 왜 이 주제가 중요한지 1~2문단

3. **전개**: 핵심 인사이트, 경험, 배운 점 2~3문단

4. **마무리**: 핵심 메시지 요약

5. **CTA**: 댓글 유도 ("여러분의 경험은 어떠신가요?", "어떻게 생각하시나요?" 등)

## 글쓰기 규칙

- 총 글자 수: 700~1,200자 (공백 포함)

- 짧은 문단(2~3문장), 문단 사이 빈 줄로 가독성 확보

- 이모지: 1~2개만 (절제하여 사용)

- 해시태그: 3~5개, 포스팅 맨 끝에 배치

- 고객사 실명 금지: "A사", "H그룹", "국내 대기업" 등으로 익명 처리

- 전문적이되 딱딱하지 않은 톤 (친근한 전문가)

- 한국어로 작성

## 첫 댓글 작성

포스팅 본문 외에 "첫 댓글"도 함께 작성합니다. 첫 댓글에는:

- 포스팅 내용을 보완하는 추가 인사이트 또는 실용적인 팁

- 타피루즈그룹의 관련 서비스/자료 소개 (자연스럽게)

- 독자가 바로 활용할 수 있는 구체적인 내용

## 출력 형식

반드시 다음 정확한 형식으로 출력하세요:

[포스팅 본문 내용]

---COMMENT---

[첫 댓글 내용]`

export interface StyleExample {
  title: string
  content: string
  contentType: string
  styleNotes?: string
}

function buildSystemPrompt(styleExamples: StyleExample[] = [], customStyleProfile?: string): string {
  let prompt = BASE_SYSTEM_PROMPT

  // ✅ FIX: 빈 문자열 체크 강화
  const profile = sanitizeText(customStyleProfile)
  if (profile) {
    prompt += `\n\n## 학습된 스타일 프로필\n${profile}`
  }

  const validExamples = styleExamples.filter(ex => sanitizeText(ex.content).length > 0)
  if (validExamples.length > 0) {
    prompt += `\n\n## 스타일 참조 포스팅 (이 스타일을 참고하여 작성하세요)\n`
    validExamples.forEach((ex, i) => {
      const title = sanitizeText(ex.title, `참조 ${i + 1}`)
      const content = sanitizeText(ex.content)
      prompt += `\n### 참조 ${i + 1}: ${title}\n`
      if (ex.styleNotes && sanitizeText(ex.styleNotes)) {
        prompt += `스타일 특징: ${sanitizeText(ex.styleNotes)}\n`
      }
      prompt += `\`\`\`\n${content.slice(0, 800)}${content.length > 800 ? '...' : ''}\n\`\`\`\n`
    })
    prompt += `\n위 참조 포스팅들의 문체, 구조, 톤을 최대한 반영하되, 내용은 새롭게 작성하세요.`
  }

  return prompt
}

export function parseGeneratedContent(raw: string): { content: string; firstComment: string } {
  const parts = raw.split('---COMMENT---')
  return {
    content: (parts[0] ?? raw).trim(),
    firstComment: (parts[1] ?? '').trim(),
  }
}

export async function* streamLinkedInPost(
  input: GeneratePostRequest,
  apiKey?: string,
  styleExamples: StyleExample[] = [],
  styleProfile?: string,
  model: ClaudeModel = 'sonnet',
): AsyncGenerator<string> {
  const key = apiKey || getApiKey()
  if (!key) {
    throw new Error('Anthropic API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
  }

  const client = new Anthropic({ apiKey: key })

  const hashtags = HASHTAG_PRESETS[input.contentType]?.join(' ') ?? ''
  const contentTypeLabel = CONTENT_TYPE_LABELS[input.contentType] ?? input.contentType

  const systemPrompt = buildSystemPrompt(styleExamples, styleProfile)

  // ✅ FIX: systemPrompt 빈 값 방어
  if (!systemPrompt.trim()) {
    throw new Error('시스템 프롬프트가 비어 있습니다. 관리자에게 문의하세요.')
  }

  const modelId = resolveModelId(model)

  // ✅ FIX: 각 입력값 sanitize 후 userMessage 구성
  const title = sanitizeText(input.title)
  const topic = sanitizeText(input.topic)
  const context = sanitizeText(input.context)

  if (!title || !topic || !context) {
    throw new Error(`입력값이 비어 있습니다. (제목: "${title}", 주제: "${topic}", 맥락: "${context}")`)
  }

  const optionalParts = [
    input.seriesInfo && sanitizeText(input.seriesInfo)
      ? `\n**시리즈 정보**: ${sanitizeText(input.seriesInfo)}`
      : '',
    input.additionalInstructions && sanitizeText(input.additionalInstructions)
      ? `\n**추가 지시사항**: ${sanitizeText(input.additionalInstructions)}`
      : '',
  ].join('')

  const userMessage = [
    '다음 정보를 바탕으로 LinkedIn 포스팅을 작성해주세요.',
    '',
    `**제목**: ${title}`,
    `**콘텐츠 유형**: ${contentTypeLabel}`,
    `**주제**: ${topic}`,
    `**맥락/배경**: ${context}${optionalParts}`,
    hashtags ? `\n권장 해시태그: ${hashtags}` : '',
    '',
    '위 정보를 참고하여 시스템 프롬프트의 형식과 규칙에 따라 포스팅 본문과 첫 댓글을 작성해주세요.',
  ]
    .filter(line => line !== undefined)
    .join('\n')
    .trim()

  // ✅ FIX: userMessage 빈 값 방어
  if (!userMessage) {
    throw new Error('생성 요청 메시지가 비어 있습니다.')
  }

  // ✅ FIX: cache_control 제거
  // cache_control: { type: 'ephemeral' } 을 system 블록에 적용하면
  // 일부 SDK 버전에서 빈 text block을 추가로 생성하여
  // "messages: text content blocks must be non-empty" 400 오류를 유발합니다.
  const stream = client.messages.stream({
    model: modelId,
    max_tokens: 2000,
    system: systemPrompt,  // ✅ 문자열로 직접 전달 (배열 + cache_control 방식 제거)
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

export async function generateLinkedInPost(
  input: GeneratePostRequest,
  apiKey?: string,
  styleExamples: StyleExample[] = [],
  styleProfile?: string,
  model: ClaudeModel = 'sonnet',
): Promise<{ content: string; firstComment: string }> {
  let raw = ''
  for await (const chunk of streamLinkedInPost(input, apiKey, styleExamples, styleProfile, model)) {
    raw += chunk
  }
  return parseGeneratedContent(raw)
}

/** 스타일 참조 포스팅들로 스타일 프로필 텍스트를 생성합니다 (Haiku 사용 — 빠르고 저렴) */
export async function generateStyleProfile(
  examples: StyleExample[],
  apiKey?: string,
): Promise<string> {
  const key = apiKey || getApiKey()
  const validExamples = examples.filter(ex => sanitizeText(ex.content).length > 0)

  if (!key || validExamples.length === 0) return ''

  const client = new Anthropic({ apiKey: key })

  const exampleTexts = validExamples
    .map((ex, i) => {
      const title = sanitizeText(ex.title, `예시 ${i + 1}`)
      const content = sanitizeText(ex.content)
      return `### 예시 ${i + 1}: ${title}\n${content.slice(0, 600)}`
    })
    .join('\n\n')

  const userContent = `다음 LinkedIn 포스팅들을 분석하여 공통된 글쓰기 스타일 프로필을 200자 이내로 요약해주세요.\n문체, 어조, 구조, 특징적인 표현 방식을 중심으로 작성해주세요.\n\n${exampleTexts}\n\n스타일 프로필 (한국어, 200자 이내):`

  // ✅ FIX: content 빈 값 방어
  if (!userContent.trim()) return ''

  const response = await client.messages.create({
    model: resolveModelId('haiku'),
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: userContent,
    }],
  })

  const text = response.content[0]
  return text?.type === 'text' ? sanitizeText(text.text) : ''
}
