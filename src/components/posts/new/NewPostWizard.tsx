'use client'
import { useState } from 'react'
import { Step1Form } from './Step1Form'
import { Step2Preview } from './Step2Preview'
import { Step3Done } from './Step3Done'
import type { GeneratePostRequest } from '@/types/post'
import { cn } from '@/lib/utils'

const STEPS = ['정보 입력', 'AI 생성', '완료']

export function NewPostWizard() {
  const [step, setStep] = useState(0)
  const [input, setInput] = useState<GeneratePostRequest | null>(null)
  const [savedPostId, setSavedPostId] = useState('')
  const [savedTitle, setSavedTitle] = useState('')

  const handleStep1 = (data: GeneratePostRequest) => {
    setInput(data)
    setStep(1)
  }

  const handleSave = async (content: string, firstComment: string) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: input!.title,
        topic: input!.topic,
        context: input!.context,
        contentType: input!.contentType,
        draft: content,
        finalContent: content,
        firstComment,
        status: 'DRAFT',
      }),
    })
    if (!res.ok) throw new Error('저장 실패')
    const post = await res.json()
    setSavedPostId(post.id)
    setSavedTitle(post.title)
    setStep(2)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                i < step ? 'bg-green-500 border-green-500 text-white' :
                i === step ? 'bg-brand-navy border-brand-navy text-white' :
                'bg-white border-gray-200 text-gray-400'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('text-xs mt-1 font-medium', i === step ? 'text-brand-navy' : 'text-gray-400')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 flex-1 mx-2 mt-[-10px]', i < step ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {step === 0 && <Step1Form onNext={handleStep1} />}
        {step === 1 && input && (
          <Step2Preview
            input={input}
            onSave={handleSave}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && <Step3Done postId={savedPostId} title={savedTitle} />}
      </div>
    </div>
  )
}
