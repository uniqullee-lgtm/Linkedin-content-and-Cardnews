import Anthropic from '@anthropic-ai/sdk'
import type { GeneratePostRequest } from '@/types/post'
import { CONTENT_TYPE_LABELS, HASHTAG_PRESETS } from './constants'

// ---------------------------------------------------------------------------
// Model selection — 태스크별 적합 모델
// ---------------------------------------------------------------------------
// haiku  (claude-haiku-4-5)   — 요약, 번역, 분류, 스타일 프로필 생성 등 단순/빠른 작업
// sonnet (claude-sonnet-4-6)  — 코딩, 콘텐츠 작성, 리팩토링 [기본값]
// opus-s (claude-opus-4-5)    — 코드리뷰, 경영 분석, 장기 에이전트 (중간 복잡도)
// opus   (claude-opus-4-6)    — 아키텍쳐 설계, 복잡한 디버깅 등 깊은 추론 전용
export type ClaudeModel = 'haiku' | 'sonnet' | 'opus-s' | 'opus'

const MODEL_IDS: Record<ClaudeModel, string> = {
  haiku:  'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-6',
  'opus-s': 'claude-opus-4-5',
  opus:   'claude-opus-4-6',
}

export function resolveModelId(model: ClaudeModel = 'sonnet'): string {
  return MODEL_IDS[model]
}

function getApiKey(): string {
  return process.env.ANTHROPIC_API_KEY || ''
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

  if (customStyleProfile) {
    prompt += `\n\n## 학습된 스타일 프로필\n${customStyleProfile}`
  }

  const validExamples = styleExamples.filter(ex => ex.content.trim().length > 0)
  if (validExamples.length > 0) {
    prompt += `\n\n## 스타일 참조 포스팅 (이 스타일을 참고하여 작성하세요)\n`
    validExamples.forEach((ex, i) => {
      prompt += `\n### 참조 ${i + 1}: ${ex.title}\n`
      if (ex.styleNotes) prompt += `스타일 특징: ${ex.styleNotes}\n`
      prompt += `\`\`\`\n${ex.content.slice(0, 800)}${ex.content.length > 800 ? '...' : ''}\n\`\`\`\n`
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
  const hashtags = HASHTAG_PRESETS[input.contentType].join(' ')
  const contentTypeLabel = CONTENT_TYPE_LABELS[input.contentType]
  const systemPrompt = buildSystemPrompt(styleExamples, styleProfile)
  const modelId = resolveModelId(model)

  const userMessage = `다음 정보를 바탕으로 LinkedIn 포스팅을 작성해주세요.

**제목**: ${input.title}
**콘텐츠 유형**: ${contentTypeLabel}
**주제**: ${input.topic}
**맥락/배경**: ${input.context}${input.seriesInfo ? `\n**시리즈 정보**: ${input.seriesInfo}` : ''}${input.additionalInstructions ? `\n**추가 지시사항**: ${input.additionalInstructions}` : ''}

권장 해시태그: ${hashtags}

위 정보를 참고하여 시스템 프롬프트의 형식과 규칙에 따라 포스팅 본문과 첫 댓글을 작성해주세요.`

  const stream = client.messages.stream({
    model: modelId,
    max_tokens: 2000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      } satisfies Anthropic.TextBlockParam,
    ],
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
  const validExamples = examples.filter(ex => ex.content.trim().length > 0)
  if (!key || validExamples.length === 0) return ''

  const client = new Anthropic({ apiKey: key })

  const exampleTexts = validExamples
    .map((ex, i) => `### 예시 ${i + 1}: ${ex.title}\n${ex.content.slice(0, 600)}`)
    .join('\n\n')

  const response = await client.messages.create({
    model: resolveModelId('haiku'),
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `다음 LinkedIn 포스팅들을 분석하여 공통된 글쓰기 스타일 프로필을 200자 이내로 요약해주세요.\n문체, 어조, 구조, 특징적인 표현 방식을 중심으로 작성해주세요.\n\n${exampleTexts}\n\n스타일 프로필 (한국어, 200자 이내):`,
    }],
  })

  const text = response.content[0]
  return text?.type === 'text' ? text.text.trim() : ''
}
