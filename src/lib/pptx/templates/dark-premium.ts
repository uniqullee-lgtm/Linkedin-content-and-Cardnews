import type PptxGenJS from 'pptxgenjs'
import type { SlideContent } from '@/types/cardnews'

const COLORS = {
  primary: 'C9A84C',
  secondary: 'E8C96A',
  background: '1A1A1A',
  text: 'FFFFFF',
  textLight: 'AAAAAA',
  surface: '252525',
}

export function applyDarkPremium(
  pres: PptxGenJS,
  slides: SlideContent[],
  companyName: string
) {
  slides.forEach(slide => {
    const pSlide = pres.addSlide()
    pSlide.background = { color: COLORS.background }

    if (slide.type === 'cover') {
      // Gold top accent
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.12,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Subtle surface overlay
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0.4, y: 0.4, w: 9.2, h: 4.6,
        fill: { color: COLORS.surface },
        line: { type: 'none' },
      })

      pSlide.addText(companyName, {
        x: 0.8, y: 0.6, w: 8, h: 0.5,
        fontSize: 12,
        color: COLORS.primary,
        bold: true,
        fontFace: 'Noto Sans KR',
        charSpacing: 2,
      })

      // Gold divider
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0.8, y: 1.2, w: 1.5, h: 0.06,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Main title
      pSlide.addText(slide.title, {
        x: 0.8, y: 1.4, w: 8.4, h: 2.2,
        fontSize: 30,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'top',
        wrap: true,
        lineSpacingMultiple: 1.25,
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.8, y: 3.7, w: 8.4, h: 0.9,
          fontSize: 13,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
        })
      }

      // Bottom gold bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 5.2, w: 10, h: 0.43,
        fill: { color: COLORS.primary + '44' },
        line: { type: 'none' },
      })

    } else if (slide.type === 'content') {
      // Gold left border
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 0.08, h: 5.63,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Surface card
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0.2, y: 0.2, w: 9.6, h: 1.0,
        fill: { color: COLORS.surface },
        line: { type: 'none' },
      })

      // Slide number
      pSlide.addText(String(slide.slideNumber ?? ''), {
        x: 0.2, y: 0.2, w: 0.8, h: 1.0,
        fontSize: 20,
        color: COLORS.primary,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
        valign: 'middle',
      })

      // Title
      pSlide.addText(slide.title, {
        x: 1.1, y: 0.3, w: 8.5, h: 0.8,
        fontSize: 19,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'middle',
      })

      // Content
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        slide.bulletPoints.forEach((point, i) => {
          const y = 1.5 + i * 0.95
          if (y > 5.0) return

          // Gold bullet
          pSlide.addShape(pres.ShapeType.ellipse, {
            x: 0.3, y: y + 0.22, w: 0.14, h: 0.14,
            fill: { color: COLORS.primary },
            line: { type: 'none' },
          })

          pSlide.addText(point, {
            x: 0.6, y, w: 9.1, h: 0.8,
            fontSize: 13,
            color: COLORS.textLight,
            fontFace: 'Noto Sans KR',
            valign: 'middle',
            wrap: true,
          })
        })
      } else if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.3, y: 1.5, w: 9.4, h: 3.7,
          fontSize: 14,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
          valign: 'top',
          wrap: true,
          lineSpacingMultiple: 1.5,
        })
      }

    } else if (slide.type === 'closing') {
      // Gold top border
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.5,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Center card
      pSlide.addShape(pres.ShapeType.rect, {
        x: 1.0, y: 1.0, w: 8.0, h: 3.5,
        fill: { color: COLORS.surface },
        line: { type: 'none' },
      })

      pSlide.addText('★', {
        x: 4.4, y: 1.2, w: 1.2, h: 0.8,
        fontSize: 28,
        color: COLORS.primary,
        align: 'center',
      })

      pSlide.addText(slide.title, {
        x: 1.0, y: 2.1, w: 8.0, h: 0.7,
        fontSize: 20,
        color: COLORS.secondary,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 1.5, y: 3.0, w: 7.0, h: 1.3,
          fontSize: 13,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
          align: 'center',
          wrap: true,
          lineSpacingMultiple: 1.5,
        })
      }

      // Bottom gold bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 5.1, w: 10, h: 0.53,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })
      pSlide.addText(companyName, {
        x: 0.5, y: 5.12, w: 9, h: 0.45,
        fontSize: 12,
        color: COLORS.background,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })
    }
  })
}
