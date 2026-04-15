'use client'
import { CARD_TEMPLATES } from '@/lib/constants'
import type { CardTemplateId } from '@/lib/constants'
import type { SlideContent } from '@/types/cardnews'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slide: SlideContent
  templateId: CardTemplateId
  companyName?: string
  scale?: number
}

export function SlidePreview({ slide, templateId, companyName = '타피루즈그룹', scale = 1 }: SlidePreviewProps) {
  const tpl = CARD_TEMPLATES.find(t => t.id === templateId) ?? CARD_TEMPLATES[0]!

  const containerStyle: React.CSSProperties = {
    width: `${560 * scale}px`,
    height: `${315 * scale}px`,
    backgroundColor: tpl.colors.background,
    fontFamily: '"Noto Sans KR", sans-serif',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '8px',
    flexShrink: 0,
  }

  const fontSize = (base: number) => `${base * scale}px`

  return (
    <div style={containerStyle} className="shadow-lg">
      {slide.type === 'cover' && (
        <CoverSlide slide={slide} tpl={tpl} companyName={companyName} scale={scale} fontSize={fontSize} />
      )}
      {slide.type === 'content' && (
        <ContentSlide slide={slide} tpl={tpl} scale={scale} fontSize={fontSize} />
      )}
      {slide.type === 'closing' && (
        <ClosingSlide slide={slide} tpl={tpl} companyName={companyName} scale={scale} fontSize={fontSize} />
      )}
    </div>
  )
}

type TplType = typeof CARD_TEMPLATES[number]

function CoverSlide({ slide, tpl, companyName, scale, fontSize }: { slide: SlideContent; tpl: TplType; companyName: string; scale: number; fontSize: (n: number) => string }) {
  return (
    <>
      {/* Header accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${8 * scale}px`, backgroundColor: tpl.colors.primary }} />
      <div style={{ position: 'absolute', top: `${16 * scale}px`, left: `${20 * scale}px`, right: `${20 * scale}px` }}>
        <p style={{ fontSize: fontSize(9), color: tpl.colors.textLight, marginBottom: `${8 * scale}px`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {companyName}
        </p>
        <p style={{ fontSize: fontSize(18), color: tpl.colors.text, fontWeight: 700, lineHeight: 1.3, marginBottom: `${16 * scale}px` }}>
          {slide.title}
        </p>
        {slide.body && (
          <p style={{ fontSize: fontSize(10), color: tpl.colors.textLight, lineHeight: 1.5 }}>
            {slide.body}
          </p>
        )}
      </div>
      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: `${28 * scale}px`, backgroundColor: tpl.colors.primary + '33',
        display: 'flex', alignItems: 'center', paddingLeft: `${20 * scale}px`,
      }}>
        <span style={{ fontSize: fontSize(8), color: tpl.colors.textLight }}>LinkedIn</span>
      </div>
    </>
  )
}

function ContentSlide({ slide, tpl, scale, fontSize }: { slide: SlideContent; tpl: TplType; scale: number; fontSize: (n: number) => string }) {
  return (
    <>
      {/* Left stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${32 * scale}px`, bottom: 0, backgroundColor: tpl.colors.secondary }} />
      {/* Slide number */}
      <div style={{
        position: 'absolute', top: `${8 * scale}px`, left: `${6 * scale}px`,
        width: `${20 * scale}px`, height: `${20 * scale}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: fontSize(11), color: tpl.colors.text, fontWeight: 700 }}>
          {slide.slideNumber}
        </span>
      </div>
      {/* Title */}
      <div style={{ position: 'absolute', top: `${16 * scale}px`, left: `${44 * scale}px`, right: `${16 * scale}px` }}>
        <p style={{ fontSize: fontSize(13), color: tpl.colors.text, fontWeight: 700, marginBottom: `${8 * scale}px` }}>
          {slide.title}
        </p>
        <div style={{ height: `${1 * scale}px`, backgroundColor: tpl.colors.secondary, marginBottom: `${10 * scale}px` }} />
        {slide.bulletPoints?.map((bp, i) => (
          <p key={i} style={{ fontSize: fontSize(9), color: tpl.colors.textLight, marginBottom: `${6 * scale}px`, lineHeight: 1.5 }}>
            • {bp}
          </p>
        ))}
        {slide.body && (
          <p style={{ fontSize: fontSize(9), color: tpl.colors.textLight, lineHeight: 1.6 }}>
            {slide.body}
          </p>
        )}
      </div>
    </>
  )
}

function ClosingSlide({ slide, tpl, companyName, scale, fontSize }: { slide: SlideContent; tpl: TplType; companyName: string; scale: number; fontSize: (n: number) => string }) {
  return (
    <>
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${40 * scale}px`, backgroundColor: tpl.colors.secondary }} />
      <div style={{ position: 'absolute', top: `${56 * scale}px`, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '90%' }}>
        <p style={{ fontSize: fontSize(16), color: tpl.colors.text, fontWeight: 700, marginBottom: `${12 * scale}px` }}>
          {slide.title}
        </p>
        {slide.body && (
          <p style={{ fontSize: fontSize(10), color: tpl.colors.textLight, lineHeight: 1.6 }}>
            {slide.body}
          </p>
        )}
      </div>
      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: `${28 * scale}px`, backgroundColor: tpl.colors.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: fontSize(8), color: tpl.colors.background === '#1A1A1A' || tpl.colors.background === '#1E3A5F' ? tpl.colors.textLight : tpl.colors.text }}>
          {companyName}
        </span>
      </div>
    </>
  )
}
