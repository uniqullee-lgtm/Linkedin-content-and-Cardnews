'use client'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { CONTENT_TYPES, CONTENT_TYPE_LABELS } from '@/lib/constants'
import type { GeneratePostRequest } from '@/types/post'

interface Step1FormProps {
  onNext: (data: GeneratePostRequest) => void
}

export function Step1Form({ onNext }: Step1FormProps) {
  const [form, setForm] = useState<GeneratePostRequest>({
    title: '',
    topic: '',
    context: '',
    contentType: 'COURSE_DEVELOPMENT',
    additionalInstructions: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = '제목을 입력해주세요.'
    if (!form.topic.trim()) e.topic = '주제를 입력해주세요.'
    if (!form.context.trim()) e.context = '맥락/배경을 입력해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext(form)
  }

  const field = (label: string, name: keyof GeneratePostRequest, el: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {el}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {field('제목 *', 'title',
        <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="예: 과정개발자가 반드시 알아야 할 핵심 원칙 3가지"
          className={inputCls} />
      )}

      {field('콘텐츠 유형 *', 'contentType',
        <select value={form.contentType} onChange={e => setForm(p => ({ ...p, contentType: e.target.value as typeof form.contentType }))}
          className={inputCls}>
          {CONTENT_TYPES.map(ct => (
            <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</option>
          ))}
        </select>
      )}

      {field('주제 *', 'topic',
        <input type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          placeholder="예: ISD 모델의 실무 적용 방법"
          className={inputCls} />
      )}

      {field('맥락/배경 *', 'context',
        <textarea rows={4} value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))}
          placeholder="어떤 경험이나 상황에서 이 글을 쓰게 됐나요? 독자에게 전달하고 싶은 핵심 메시지는 무엇인가요?"
          className={`${inputCls} resize-none`} />
      )}

      {field('추가 지시사항', 'additionalInstructions',
        <input type="text" value={form.additionalInstructions ?? ''} onChange={e => setForm(p => ({ ...p, additionalInstructions: e.target.value }))}
          placeholder="특별한 톤, 포함할 내용, 주의사항 등 (선택)"
          className={inputCls} />
      )}

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors">
        AI 생성하기 <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  )
}
