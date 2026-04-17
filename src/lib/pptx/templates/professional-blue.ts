import type PptxGenJS from 'pptxgenjs'
import type { SlideContent } from '@/types/cardnews'

const COLORS = {
  primary: '1E3A5F',
  secondary: '4A9EDB',
  background: '1E3A5F',
  text: 'FFFFFF',
  textLight: 'B0C9E0',
  accent: '4A9EDB',
}

export function applyProfessionalBlue(
  pres: PptxGenJS,
  slides: SlideContent[],
  companyName: string
) {
  slides.forEach(slide => {
    const pSlide = pres.addSlide()

    // Background
    pSlide.background = { color: COLORS.background }

    if (slide.type === 'cover') {
      // Accent line
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 2.8, w: 10, h: 0.06,
        fill: { color: COLORS.secondary },
        line: { type: 'none' },
      })

      // Company label
      pSlide.addText(companyName, {
        x: 0.5, y: 0.4, w: 9, h: 0.4,
        fontSize: 13,
        color: COLORS.textLight,
        bold: false,
        fontFace: 'Noto Sans KR',
      })

      // Main title
      pSlide.addText(slide.title, {
        x: 0.5, y: 1.0, w: 9, h: 1.8,
        fontSize: 32,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'left',
        valign: 'top',
        wrap: true,
      })

      // Subtitle / body
      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.5, y: 3.1, w: 9, h: 1.0,
          fontSize: 14,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
        })
      }

      // Bottom bar
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 4.9, w: 10, h: 0.6,
        fill: { color: COLORS.secondary + '33' },
        line: { type: 'none' },
      })
      pSlide.addText('LinkedIn', {
        x: 0.3, y: 4.95, w: 2, h: 0.4,
        fontSize: 11,
        color: COLORS.textLight,
        fontFace: 'Noto Sans KR',
      })

    } else if (slide.type === 'content') {
      // Slide number badge
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 0.6, h: 5.63,
        fill: { color: COLORS.secondary },
        line: { type: 'none' },
      })
      pSlide.addText(String(slide.slideNumber ?? ''), {
        x: 0.05, y: 0.1, w: 0.5, h: 0.5,
        fontSize: 14,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })

      // Title
      pSlide.addText(slide.title, {
        x: 0.8, y: 0.3, w: 8.8, h: 0.7,
        fontSize: 20,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
      })

      // Divider
      pSlide.addShape(pres.ShapeType.line, {
        x: 0.8, y: 1.1, w: 8.5, h: 0,
        line: { color: COLORS.secondary, width: 1 },
      })

      // Bullet points or body
      if (slide.bulletPoints && slide.bulletPoints.length > 0) {
        const bulletText = slide.bulletPoints.map(b => `• ${b}`).join('\n\n')
        pSlide.addText(bulletText, {
          x: 0.8, y: 1.3, w: 8.7, h: 3.8,
          fontSize: 14,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
          valign: 'top',
          wrap: true,
          lineSpacingMultiple: 1.4,
        })
      } else if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.8, y: 1.3, w: 8.7, h: 3.8,
          fontSize: 14,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
          valign: 'top',
          wrap: true,
          lineSpacingMultiple: 1.4,
        })
      }

    } else if (slide.type === 'closing') {
      // Large decorative shape
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 2.5,
        fill: { color: COLORS.secondary },
        line: { type: 'none' },
      })

      pSlide.addText('💡', {
        x: 4.2, y: 0.4, w: 1.6, h: 0.8,
        fontSize: 36,
        align: 'center',
      })

      pSlide.addText(slide.title, {
        x: 0.5, y: 1.1, w: 9, h: 0.6,
        fontSize: 18,
        color: COLORS.text,
        bold: true,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })

      if (slide.body) {
        pSlide.addText(slide.body, {
          x: 0.8, y: 2.8, w: 8.4, h: 1.8,
          fontSize: 15,
          color: COLORS.textLight,
          fontFace: 'Noto Sans KR',
          align: 'center',
          wrap: true,
          lineSpacingMultiple: 1.5,
        })
      }

      // Company footer
      pSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 4.9, w: 10, h: 0.73,
        fill: { color: '0D2540' },
        line: { type: 'none' },
      })
      pSlide.addText(companyName, {
        x: 0.5, y: 5.0, w: 9, h: 0.5,
        fontSize: 13,
        color: COLORS.textLight,
        fontFace: 'Noto Sans KR',
        align: 'center',
      })
    }
  })
}
