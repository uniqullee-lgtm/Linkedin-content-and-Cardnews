'use client'
import { CARD_TEMPLATES } from '@/lib/constants'
import type { CardTemplateId } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface TemplateGridProps {
  selected: CardTemplateId
  onSelect: (id: CardTemplateId) => void
}

export function TemplateGrid({ selected, onSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CARD_TEMPLATES.map(tpl => {
        const isSelected = selected === tpl.id
        return (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={cn(
              'relative rounded-xl border-2 overflow-hidden text-left transition-all',
              isSelected ? 'border-brand-blue shadow-md' : 'border-gray-100 hover:border-gray-200'
            )}
          >
            {/* Template mini preview */}
            <div
              className="h-16 flex items-center justify-center"
              style={{ backgroundColor: tpl.colors.background }}
            >
              <div className="text-center px-2">
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: tpl.colors.primary }}
                >
                  {tpl.nameKo}
                </div>
                <div
                  className="text-xs mt-0.5 opacity-70"
                  style={{ color: tpl.colors.text === '#FFFFFF' ? '#FFFFFF' : tpl.colors.textLight }}
                >
                  미리보기
                </div>
              </div>
            </div>
            <div className="p-2 bg-white">
              <p className="text-xs font-semibold text-gray-800">{tpl.nameKo}</p>
              <p className="text-xs text-gray-400 leading-tight">{tpl.description}</p>
            </div>
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
