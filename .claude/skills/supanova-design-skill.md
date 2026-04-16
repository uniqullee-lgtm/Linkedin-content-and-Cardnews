---
name: supanova-design-engine
description: Supanova Landing Page Design Engine. Generates premium, conversion-optimized landing pages using pure HTML + Tailwind CSS (CDN). Overrides default LLM biases toward generic templates. Enforces metric-based design rules, Korean typography standards, and hardware-accelerated motion for standalone HTML output.
---

# Supanova Design Engine

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 3 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)
* LANDING_PURPOSE: conversion (conversion | brand | portfolio | saas | ecommerce)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 3, conversion). Do not ask the user to edit this file. ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 8.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
All output is **standalone HTML** designed for direct browser rendering. No build tools, no bundlers, no frameworks.

* **Output Format:** Single HTML file with all styles and scripts inline. The page must work by simply opening the file in a browser.
* **Styling:** Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`). Use the `tailwind.config` script block for custom theme extensions (colors, fonts, spacing).
* **Typography — Korean First:**
  * **Primary Font:** `Pretendard` via CDN (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css`). This is NON-NEGOTIABLE for Korean text rendering.
  * **English Display Font:** Pair with `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi` for English headlines.
  * **Font Stack:** `font-family: 'Pretendard', 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;`
* **Icons:** Use Iconify with Solar icon set exclusively. Load via `<script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>`. Usage: `<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>`.
* **Images:** Use `https://picsum.photos/seed/{descriptive_name}/{width}/{height}` for all placeholder images. NEVER use Unsplash URLs (they break). For avatars, use `https://i.pravatar.cc/150?u={unique_name}`.
* **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in markup or visible text content. Replace with Iconify Solar icons or clean SVG primitives.
* **Responsiveness:**
  * Standardize breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
  * Contain page layouts using `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  * **Viewport Stability [CRITICAL]:** NEVER use `h-screen`. ALWAYS use `min-h-[100dvh]` to prevent layout jumping on iOS Safari.
  * **Grid over Flex-Math:** Use CSS Grid instead of complex flexbox percentage calculations.
* **Language:** Default content language is **Korean**. All placeholder text, headings, descriptions, and CTAs must be written in natural, professional Korean — not translated-sounding text.

## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

**Rule 1: Deterministic Typography**
* **Korean Headlines:** `text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight font-bold`. Pretendard handles Korean beautifully at these sizes.
  * **CRITICAL:** Korean text requires `leading-tight` to `leading-snug` (NOT `leading-none`). Korean characters need more vertical breathing room than Latin text.
  * **Word Breaking:** Always add `word-break: keep-all` to Korean text blocks to prevent mid-word line breaks.
* **English Display Text:** Use `tracking-tighter leading-none` for maximum impact with Latin fonts.
* **Body/Paragraphs:** `text-base md:text-lg text-gray-600 leading-relaxed max-w-[65ch]`.
* **ANTI-SLOP FONTS:** `Inter` is BANNED. `Noto Sans KR` is BANNED (use Pretendard instead). `Roboto`, `Arial`, `Open Sans` are all BANNED.

**Rule 2: Color Calibration**
* **Constraint:** Max 1 Accent Color per page. Saturation < 80%.
* **THE LILA BAN:** Purple/Blue "AI" gradients are strictly BANNED. No neon glows, no purple button effects.
* **Supanova Palette Philosophy:** Use deep neutral bases (Zinc-900, Slate-950, Stone-100) with ONE high-contrast accent (Emerald, Electric Blue, Warm Amber, or Deep Rose).
* **Dark Mode Default:** Landing pages look more premium in dark mode. Default to dark backgrounds (`bg-zinc-950`, `bg-slate-950`) unless the content demands light.

**Rule 3: Landing Page Layout Diversification**
* **ANTI-CENTER BIAS:** When `DESIGN_VARIANCE > 4`, centered Hero sections are BANNED. Use:
  * **Split Screen** (50/50 text + visual)
  * **Left-aligned content / Right-aligned asset**
  * **Asymmetric white-space** with dramatic negative space
  * **Full-bleed image with overlaid text**
* **Section Flow:** A landing page is NOT a stack of identical sections. Vary each section's layout dramatically.

**Rule 4: Materiality and Depth**
* Use cards ONLY when elevation communicates hierarchy.
* **Glass Effects:** Go beyond `backdrop-blur`. Add `border border-white/10` and `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]` for physical edge refraction.

**Rule 5: Conversion-Driven UI States**
* **CTA Buttons:** Must have hover (`scale-[1.02]`), active (`scale-[0.98]`), and focus states. Minimum size `px-8 py-4 text-lg`.
* **Social Proof:** Numbers must feel organic (`47,200+` not `50,000+`). Use real-sounding Korean names and companies.

**Rule 6: Korean Content Standards**
* **NO Translated Korean:** Write native, natural Korean. "지금 시작하세요" not "시작을 하세요 지금".
* **Honorifics:** Use 합니다/하세요 form consistently. Never mix 반말 and 존댓말.
* **CTA Copy:** Direct, action-oriented: "무료로 시작하기", "3분만에 만들어보기", "지금 바로 체험하기"
* **Avoid Korean AI Cliches:** "혁신적인", "획기적인", "차세대" are BANNED. Use concrete, specific language.

## 4. CREATIVE PROACTIVITY

* **"Liquid Glass" Refraction:** Beyond `backdrop-blur-xl`. Layer `border border-white/10`, `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`, and a subtle `bg-white/5` for true depth.
* **Staggered Reveals:** Sections fade in sequentially using CSS `animation-delay` cascades.
* **Gradient Mesh Backgrounds:** Use multiple `radial-gradient` layers for organic, blob-like ambient backgrounds.
* **Scroll-Triggered Animations (MOTION_INTENSITY > 6):** Use `IntersectionObserver` for viewport-based reveals. NEVER use `window.addEventListener('scroll')`.

## 5. PERFORMANCE GUARDRAILS
* **DOM Cost:** Grain/noise filters go on `position: fixed; inset: 0; z-index: 50; pointer-events: none` elements ONLY.
* **Hardware Acceleration:** Animate ONLY `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.
* **Image Optimization:** Use `loading="lazy"` on all images below the fold. Use `decoding="async"` on all images.

## 6. LANDING PAGE SECTION LIBRARY

### Hero Sections
* **Split Hero:** 60/40 text-to-visual split. Text left, product screenshot right.
* **Minimal Statement Hero:** Massive typography (text-7xl+) with extreme white-space. Single-line value proposition.
* **Interactive Hero:** Typewriter effect cycling through use cases.

### Feature Sections
* **Bento Grid:** Asymmetric grid (2fr 1fr 1fr pattern) with different card heights.
* **Zig-Zag Alternating:** Image-left/text-right → text-left/image-right pattern. Never 3-column equal cards.

### Social Proof
* **Logo Cloud:** Client/press logos in a subtle, auto-scrolling marquee strip.
* **Testimonial Masonry:** Staggered card heights. Real Korean names, real company names.
* **Metrics Bar:** Large numbers with animated counting effect.

### CTA Sections
* **Full-Bleed CTA:** Dark background, massive text, glowing accent CTA button.
* **Sticky Bottom CTA:** Fixed bottom bar that appears after scrolling past the hero.

## 7. AI TELLS (Forbidden Patterns)
* **NO Neon/Outer Glows.** Use inner borders or tinted shadows instead.
* **NO Pure Black (#000000).** Use `#0a0a0a`, Zinc-950, or Slate-950.
* **NO Inter, Noto Sans KR, Roboto, Arial.** Use Pretendard + premium English fonts.
* **NO 3-Column Equal Card Rows.** Use Bento grids, zig-zag, or asymmetric layouts.
* **NO Identical Section Layouts.** Each section must have a visually distinct structure.
* **NO "John Doe" / "김철수".** Use creative, realistic Korean names: "하윤서", "박도현", "이서진".
* **NO Round Numbers.** Use `47,200+` not `50,000+`. Use `4.87` not `5.0`.
* **NO AI Cliche Copy.** Ban: "혁신적인", "원활한", "차세대", "게임 체인저". Write specific, concrete copy.
* **NO Lorem Ipsum or 영문 Placeholder.** All content in natural Korean.
* **NO Unsplash URLs.** Use `picsum.photos/seed/{name}/{w}/{h}` exclusively.

## 8. THE SUPANOVA LANDING PAGE FORMULA

### Document Setup
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css">
  <script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Pretendard', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
</head>
```

### Mandatory Section Order (Minimum)
1. **Navigation** — Floating glass pill nav OR minimal top bar
2. **Hero** — The single most impactful section. Must be above the fold.
3. **Social Proof Strip** — Logo cloud or metrics bar. Builds trust immediately.
4. **Features** — 3-5 key features in Bento grid or zig-zag layout.
5. **Testimonials** — Real-feeling Korean testimonials with names and roles.
6. **CTA** — Full-bleed conversion section with primary action.
7. **Footer** — Minimal, clean, essential links only.

### Design Philosophy
* **Premium by Default:** Every pixel must look intentional. If it looks like a template, it fails.
* **Korean-Native:** The page must feel like it was designed BY Koreans FOR Koreans. Not a translation.
* **Conversion-Focused:** Every section should guide the eye toward the CTA.
* **Mobile-First:** 70%+ of Korean web traffic is mobile. Design mobile-first, enhance for desktop.
