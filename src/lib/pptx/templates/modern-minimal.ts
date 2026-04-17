import type PptxGenJS from 'pptxgenjs'
import type { SlideContent } from '@/types/cardnews'

const COLORS = {
  primary: '111111',
  secondary: '555555',
  background: 'FAFAFA',
  text: '111111',
  textLight: '888888',
  accent: '111111',
  border: 'E5E7EB',
}

export function applyModernMinimal(
  pres: PptxGenJS,
  slides: SlideContent[],
  companyName: string
) {
  slides.forEach(slide => {
    const pSlide = pres.addSlide()
    pSlide.background = { color: COLORS.background }

    if (slide.type === 'cover') {
      // Large centered layout
      pSlide.addText(companyName.toUpperCase(), {
        x: 0.5, y: 0.5, w: 9, h: 0.4,
        fontSize: 10,
        color: COLORS.textLight,
        fontFace: 'Noto Sans KR',
        align: 'left',
        charSpacing: 3,
      })

      // Thin divider
      pSlide.addShape(pres.ShapeType.line, {
        x: 0.5, y: 1.1, w: 2.0, h: 0,
        line: { color: COLORS.primary, width: 2 },
      })

      // Main title - large
      pSlide.addText(slide.title, {
        x: 0.5, y: 1.3, w: 9, h: 2.8,
        fontSize: 36,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'top',
        wrap: true,
        lineSpacingMultiple: 1.2,
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.5, y: 4.2, w: 9, h: 0.7,
          fontSize: 13,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
        })
      }

      // Bottom corner accent
      pSlide.addShape(pres.ShapeType.rect, {
        x: 8.5, y: 4.9, w: 1.5, h: 0.73,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

    } else if (slide.type === 'content') {
      // Minimal top bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.08,
        fill: { color: COLORS.primary },
        line: { type: 'none' },
      })

      // Slide number - top right
      pSlide.addText(`0${slide.slideNumber ?? 1}`, {
        x: 8.5, y: 0.15, w: 1.2, h: 0.5,
        fontSize: 28,
        color: COLORS.border,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'right',
      })

      // Title
      pSlide.addText(slide.title, {
        x: 0.5, y: 0.2, w: 8.0, h: 0.9,
        fontSize: 22,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        valign: 'middle',
      })

      // Thin divider
      pSlide.addShape(pres.ShapeType.line, {
        x: 0.5, y: 1.2, w: 9.0, h: 0,
        line: { color: COLORS.border, width: 1 },
      })

      // Content
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        slide.bulletPoints.forEach((point, i) => {
          const y = 1.4 + i * 1.0
          if (y > 5.0) return

          pSlide.addText('—', {
            x: 0.5, y, w: 0.4, h: 0.6,
            fontSize: 13,
            color: COLORS.secondary,
            fontFace: 'Noto Sans KR',
            valign: 'middle',
          })
          pSlide.addText(point, {
            x: 1.0, y, w: 8.7, h: 0.8,
            fontSize: 13,
            color: COLORS.text,
            fontFace: 'Noto Sans KR',
            valign: 'middle',
            wrap: true,
          })
        })
      } else if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.5, y: 1.4, w: 9.0, h: 3.8,
          fontSize: 14,
          color: COLORS.text,
          fontFace: 'Noto Sans KR',
          valign: 'top',
          wrap: true,
          lineSpacingMultiple: 1.6,
        })
      }

    } else if (slide.type === 'closing') {
      // Full black background for closing
      pSlide.background = { color: COLORS.primary }

      pSlide.addText(slide.title, {
        x: 0.5, y: 1.5, w: 9, h: 1.0,
        fontSize: 28,
        color: 'FFFFFF',
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })

      pSlide.addShape(pres.ShapeType.line, {
        x: 3.5, y: 2.8, w: 3.0, h: 0,
        line: { color: 'FFFFFF', width: 1 },
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 1.0, y: 3.1, w: 8.0, h: 1.6,
          fontSize: 14,
          color: 'AAAAAA',
          fontFace: 'Noto Sans KR',
          align: 'center',
          wrap: true,
          lineSpacingMultiple: 1.6,
        })
      }

      pSlide.addText(companyName, {
        x: 0.5, y: 5.0, w: 9, h: 0.4,
        fontSize: 11,
        color: '666666',
        fontFace: 'Noto Sans KR',
        align: 'center',
      })
    }
  })
}
