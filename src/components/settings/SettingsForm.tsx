'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react'
import { showToast } from '@/components/shared/Toast'
import { CONTENT_TYPES, CONTENT_TYPE_LABELS, HASHTAG_PRESETS } from '@/lib/constants'
import type { ContentType } from '@/lib/constants'

interface SettingsData {
  companyName: string
  hasApiKey: boolean
  hashtagPresets: Record<string, string[]>
  styleProfile?: string
}

export function SettingsForm() {
  const [data, setData] = useState<SettingsData>({
    companyName: '타피루즈그룹',
    hasApiKey: false,
    hashtagPresets: {},
  })
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'general' | 'hashtags' | 'style'>('general')
  const [localPresets, setLocalPresets] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setData(d)
        // Merge DB presets with defaults
        const merged: Record<string, string[]> = {}
        CONTENT_TYPES.forEach(ct => {
          merged[ct] = d.hashtagPresets?.[ct] ?? HASHTAG_PRESETS[ct]
        })
        setLocalPresets(merged)
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        companyName: data.companyName,
        hashtagPresets: localPresets,
      }
      if (apiKey) body.anthropicApiKey = apiKey

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('저장 실패')
      const updated = await res.json()
      setData(updated)
      setApiKey('')
      showToast('설정이 저장되었습니다.', 'success')
    } catch {
      showToast('저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateHashtag = (ct: string, index: number, value: string) => {
    setLocalPresets(prev => {
      const arr = [...(prev[ct] ?? [])]
      arr[index] = value
      return { ...prev, [ct]: arr }
    })
  }

  const addHashtag = (ct: string) => {
    setLocalPresets(prev => ({ ...prev, [ct]: [...(prev[ct] ?? []), '#'] }))
  }

  const removeHashtag = (ct: string, index: number) => {
    setLocalPresets(prev => {
      const arr = (prev[ct] ?? []).filter((_, i) => i !== index)
      return { ...prev, [ct]: arr }
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-32 text-sm text-gray-400">불러오는 중...</div>
  }

  const inputCls = 'w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue'

  return (
    <div className="max-w-2xl space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['general', 'hashtags', 'style'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'general' ? '일반 설정' : tab === 'hashtags' ? '해시태그 프리셋' : '스타일 프로필'}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">회사/브랜드명</label>
            <input
              type="text"
              value={data.companyName}
              onChange={e => setData(d => ({ ...d, companyName: e.target.value }))}
              className={inputCls}
              placeholder="카드뉴스 하단에 표시될 회사명"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Anthropic API 키
              {data.hasApiKey && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">저장됨</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={data.hasApiKey ? '새 키 입력 시 덮어씁니다' : 'sk-ant-...'}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Anthropic Console에서 발급받은 API 키를 입력하세요. DB에 암호화 저장됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Hashtag presets */}
      {activeTab === 'hashtags' && (
        <div className="space-y-4">
          {CONTENT_TYPES.map(ct => (
            <div key={ct} className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {CONTENT_TYPE_LABELS[ct]}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {(localPresets[ct] ?? []).map((ht, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      value={ht}
                      onChange={e => updateHashtag(ct, i, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg w-28 focus:outline-none focus:border-brand-blue"
                    />
                    <button
                      onClick={() => removeHashtag(ct, i)}
                      className="text-gray-300 hover:text-red-400 text-xs"
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => addHashtag(ct)}
                  className="text-xs px-2 py-1 border border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-brand-blue hover:text-brand-navy"
                >+ 추가</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Style profile */}
      {activeTab === 'style' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-3 p-3 bg-brand-blue-light rounded-lg mb-4">
            <span className="text-lg">🎨</span>
            <div>
              <p className="text-sm font-semibold text-brand-navy">AI 스타일 학습</p>
              <p className="text-xs text-gray-600 mt-0.5">
                포스팅 편집 화면에서 우수한 포스팅에 ⭐ 스타일 참조 마크를 추가하면,
                이후 AI 생성 시 해당 스타일을 자동으로 반영합니다.
              </p>
            </div>
          </div>
          {data.styleProfile ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">학습된 스타일 프로필</label>
              <textarea
                value={data.styleProfile}
                onChange={e => setData(d => ({ ...d, styleProfile: e.target.value }))}
                rows={8}
                className={`${inputCls} resize-none text-xs font-mono`}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-400">
              <p>아직 스타일 참조 포스팅이 없습니다.</p>
              <p className="text-xs mt-1">포스팅 편집 화면에서 ⭐ 버튼으로 참조 포스팅을 지정하세요.</p>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 disabled:opacity-60"
      >
        {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> 저장 중...</> : <><Save className="w-4 h-4" /> 설정 저장</>}
      </button>
    </div>
  )
}
