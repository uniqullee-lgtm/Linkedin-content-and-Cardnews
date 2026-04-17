import type PptxGenJS from 'pptxgenjs'
import type { SlideContent } from '@/types/cardnews'

const COLORS = {
  primary: 'F26522',
  secondary: 'FFB347',
  background: 'FFFFFF',
  text: '1A1A1A',
  textLight: '666666',
  accent: 'F26522',
}

export function applyWarmOrange(
  pres: PptxGenJS,
  slides: SlideContent[],
  companyName: string
) {
  slides.forEach(slide => {
    const pSlide = pres.addSlide()
    pSlide.background = { color: COLORS.background }

    if (slide.type === 'cover') {
      // Top orange bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 1.2,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })
      pSlide.addText(companyName, {
        x: 0.5, y: 0.3, w: 9, h: 0.6,
        fontSize: 16,
        color: 'FFFFFF',
        bold: true,
        fontFace: 'Noto Sans KR',
      })

      // Orange accent line
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0.5, y: 1.6, w: 1.2, h: 0.08,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Main title
      pSlide.addText(slide.title, {
        x: 0.5, y: 1.8, w: 9, h: 2.0,
        fontSize: 28,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'top',
        wrap: true,
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.5, y: 3.9, w: 9, h: 0.8,
          fontSize: 13,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
        })
      }

      // Bottom bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 5.2, w: 10, h: 0.43,
        fill: { color: 'FFF0E6' },
        line: { type: 'none' },
      })

    } else if (slide.type === 'content') {
      // Header area
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 1.1,
        fill: { color: 'FFF0E6' },
        line: { type: 'none' },
      })

      // Slide number circle
      pSlide.addShape(pres.ShapeType.ellipse, {
        x: 0.3, y: 0.2, w: 0.65, h: 0.65,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })
      pSlide.addText(String(slide.slideNumber ?? ''), {
        x: 0.3, y: 0.2, w: 0.65, h: 0.65,
        fontSize: 16,
        color: 'FFFFFF',
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
        valign: 'middle',
      })

      // Title
      pSlide.addText(slide.title, {
        x: 1.1, y: 0.2, w: 8.5, h: 0.7,
        fontSize: 18,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'middle',
      })

      // Content bullets
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        slide.bulletPoints.forEach((point, i) => {
          const y = 1.3 + i * 0.9
          if (y > 5.0) return

          pSlide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: y + 0.15, w: 0.08, h: 0.4,
            fill: { color: COLORS.primary },
            line: { type: 'none' },
          })
          pSlide.addText(point, {
            x: 0.8, y, w: 8.8, h: 0.8,
            fontSize: 13,
            color: COLORS.text,
            fontFace: 'Noto Sans KR',
            valign: 'middle',
            wrap: true,
          })
        })
      } else if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.5, y: 1.3, w: 9, h: 3.8,
          fontSize: 13,
          color: COLORS.text,
          fontFace: 'Noto Sans KR',
          valign: 'top',
          wrap: true,
          lineSpacingMultiple: 1.5,
        })
      }

    } else if (slide.type === 'closing') {
      // Orange gradient-like shapes
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 5.63,
        fill: { color: 'FFF0E6' },
        line: { type: 'none' },
      })
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.5,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 5.13, w: 10, h: 0.5,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      pSlide.addText('✨', {
        x: 4.3, y: 0.8, w: 1.4, h: 0.8,
        fontSize: 32,
        align: 'center',
      })

      pSlide.addText(slide.title, {
        x: 0.5, y: 1.6, w: 9, h: 0.7,
        fontSize: 22,
        color: COLORS.primary,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 1.0, y: 2.5, w: 8.0, h: 2.0,
          fontSize: 14,
          color: COLORS.text,
          fontFace: 'Noto Sans KR',
          align: 'center',
          wrap: true,
          lineSpacingMultiple: 1.6,
        })
      }

      pSlide.addText(companyName, {
        x: 0.5, y: 5.15, w: 9, h: 0.4,
        fontSize: 12,
        color: 'FFFFFF',
        fontFace: 'Noto Sans KR',
        align: 'center',
      })
    }
  })
}
