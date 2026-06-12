'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SurveyQuestion {
  id: string
  text: string
  group: string
}

interface SurveyClientProps {
  slug: string
  title: string
  scaleMin: number
  scaleMax: number
  scaleLabels: string[]
  questions: SurveyQuestion[]
}

const PAGE_SIZE = 8

// 그룹 순서를 유지하면서 그룹별로 PAGE_SIZE 이하 페이지로 분할
function buildPages(questions: SurveyQuestion[]): { group: string; items: SurveyQuestion[] }[] {
  const pages: { group: string; items: SurveyQuestion[] }[] = []
  for (const q of questions) {
    const last = pages[pages.length - 1]
    if (last && last.group === q.group && last.items.length < PAGE_SIZE) {
      last.items.push(q)
    } else {
      pages.push({ group: q.group, items: [q] })
    }
  }
  return pages
}

export default function SurveyClient({
  slug,
  title,
  scaleMin,
  scaleMax,
  scaleLabels,
  questions,
}: SurveyClientProps) {
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)
  const pages = useMemo(() => buildPages(questions), [questions])

  // step 0 = 시작(동의), 1..pages.length = 문항 페이지
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMissing, setShowMissing] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / questions.length) * 100)
  const scaleValues = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i)

  const currentPage = step >= 1 ? pages[step - 1] : null
  const pageComplete = currentPage?.items.every((q) => answers[q.id] !== undefined) ?? false

  function goTo(nextStep: number) {
    setShowMissing(false)
    setStep(nextStep)
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/assessments/${slug}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          consent,
          answers,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? '제출에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
      const { token } = await res.json()
      router.push(`/r/${token}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '제출에 실패했습니다.')
      setSubmitting(false)
    }
  }

  if (step === 0) {
    return (
      <div ref={topRef} className="space-y-6">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              이름 <span className="text-slate-400">(선택)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="결과 리포트에 표시됩니다"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              이메일 <span className="text-slate-400">(선택)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="결과 링크를 받아보실 수 있습니다"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            <span>
              진단 결과 제공을 위한 개인정보 수집·이용에 동의합니다. (필수){' '}
              <Link href="/privacy" target="_blank" className="underline">
                자세히
              </Link>
            </span>
          </label>
        </div>
        <button
          onClick={() => goTo(1)}
          disabled={!consent}
          className="w-full rounded-xl bg-brand-600 py-4 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          응답 시작 ({questions.length}문항)
        </button>
      </div>
    )
  }

  return (
    <div ref={topRef} className="space-y-6">
      <div className="sticky top-0 -mx-4 space-y-2 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-brand-700">
            {currentPage!.group} · {step}/{pages.length} 페이지
          </span>
          <span>
            {answeredCount}/{questions.length} 응답
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {currentPage!.items.map((q, i) => {
          const missing = showMissing && answers[q.id] === undefined
          return (
            <fieldset
              key={q.id}
              className={`rounded-2xl border bg-white p-5 ${
                missing ? 'border-red-400' : 'border-slate-200'
              }`}
            >
              <legend className="sr-only">{q.text}</legend>
              <p className="mb-4 text-sm font-medium leading-relaxed">
                <span className="mr-1.5 text-slate-400">{(step - 1) * PAGE_SIZE + i + 1}.</span>
                {q.text}
              </p>
              <div className="flex items-center justify-between gap-1">
                {scaleValues.map((v) => (
                  <label key={v} className="flex flex-1 cursor-pointer flex-col items-center gap-1">
                    <input
                      type="radio"
                      name={q.id}
                      value={v}
                      checked={answers[q.id] === v}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                      className="peer sr-only"
                    />
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-sm text-slate-500 transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:font-semibold peer-checked:text-white">
                      {v}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                <span>{scaleLabels[0]}</span>
                <span>{scaleLabels[scaleLabels.length - 1]}</span>
              </div>
              {missing && <p className="mt-2 text-xs text-red-500">응답해 주세요</p>}
            </fieldset>
          )
        })}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => goTo(step - 1)}
          className="rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-medium text-slate-600 transition hover:bg-white"
        >
          이전
        </button>
        {step < pages.length ? (
          <button
            onClick={() => (pageComplete ? goTo(step + 1) : setShowMissing(true))}
            className="flex-1 rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition hover:bg-brand-700"
          >
            다음
          </button>
        ) : (
          <button
            onClick={() => {
              if (answeredCount < questions.length) {
                setShowMissing(true)
                return
              }
              handleSubmit()
            }}
            disabled={submitting}
            className="flex-1 rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-300"
          >
            {submitting ? '결과 분석 중…' : '제출하고 결과 보기'}
          </button>
        )}
      </div>
    </div>
  )
}
