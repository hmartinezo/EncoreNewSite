# Wix Migration Guide

This document maps each mockup's design to Wix Editor elements so you can recreate any chosen design in Wix.

---

## Mockup 1: Elegant Dark

### Colors
| Token | Hex | Use |
|---|---|---|
| Primary | `#1a1a2e` | Background, nav |
| Accent gold | `#e6b422` | Headings, buttons, accents |
| Text light | `#f5f0eb` | Body text on dark bg |

### Fonts (add via Wix > Site Fonts)
- **Playfair Display** - headings
- **Montserrat** - body text

### Section-by-Section Mapping
| Section | Wix Element |
|---|---|
| Hero w/ video bg | **Video Box** or **Video Strip** with overlay text |
| Stats counter | **Animated Numbers** element |
| Programs cards | **Repeater** with hover effects |
| Dance styles marquee | **Ticker/Marquee** (Wix App Market) |
| Testimonials carousel | **Testimonials Slider** element |
| FAQ accordion | **Accordion** element (FAQ section) |
| Contact + map | **Google Maps** element + text columns |

### Animations
- GSAP scroll triggers -> Use Wix **Scroll Effects** (fade in, slide up) on each section
- Parallax hero -> Enable **Parallax** on strip background

---

## Mockup 2: Bright & Bold

### Colors
| Token | Hex | Use |
|---|---|---|
| Coral | `#ff6b6b` | Primary buttons, accents |
| Teal | `#4ecdc4` | Secondary accent |
| Purple | `#a78bfa` | Gradient blend |

### Fonts
- **Poppins** - body text
- **Dancing Script** - decorative headings (logo)

### Section-by-Section Mapping
| Section | Wix Element |
|---|---|
| Split hero w/ image | **Strip** with 2 columns |
| Flip cards (programs) | **Pro Gallery** with hover text or **Repeater** |
| Style pills | **Button Group** or **Tags** element |
| Wave dividers | **Strip Dividers** (wave shape) in Wix |
| Masonry testimonials | **Columns** with staggered heights |
| Gradient CTA | **Strip** with gradient background + button |

---

## Mockup 3: Cinematic Minimal

### Colors
| Token | Hex | Use |
|---|---|---|
| Black | `#111111` | Text, dark sections |
| White | `#ffffff` | Background |
| Gold | `#c9a96e` | Accents, overline text |

### Fonts
- **Cormorant Garamond** - headings (serif, elegant)
- **Inter** - body text

### Section-by-Section Mapping
| Section | Wix Element |
|---|---|
| Full-screen hero w/ Ken Burns | **Strip** with background image, enable **Parallax** + zoom |
| Side navigation dots | Not native in Wix; use **Anchor Menu** app |
| Horizontal scroll programs | **Pro Gallery** in horizontal carousel mode |
| Large text style list | **Text** element with custom font size |
| Floating register pill | **Floating Action Button** (Wix App Market) |
| Minimal footer | **Footer** template, simplified |

---

## Chatbot Integration on Wix

### Option A: Embed via Custom HTML (Easiest)
1. In Wix Editor, add **Embed > Custom Element** or **HTML iframe**
2. Paste this code:
```html
<script>
  // Set chatbot theme to match your Wix site colors
  document.documentElement.style.setProperty('--chatbot-primary', '#YOUR_PRIMARY_COLOR');
  document.documentElement.style.setProperty('--chatbot-bg', '#YOUR_BG_COLOR');
</script>
<script src="https://hmartinezo.github.io/EncoreNewSite/shared/chatbot/chatbot.js"></script>
```

### Option B: Wix Velo (Production Recommended)
1. Move the Gemini API call to a **Wix Backend Web Module** (`backend/gemini.jsw`)
2. Call it from the frontend via `import { askGemini } from 'backend/gemini'`
3. This hides the API key server-side

### Chatbot CSS Variables
```css
--chatbot-primary    /* bubble and header color */
--chatbot-bg         /* chat window background */
--chatbot-text       /* text color in chat */
--chatbot-bubble-bot /* bot message bg */
--chatbot-bubble-user /* user message bg */
--chatbot-user-text  /* user message text color */
```

---

## Schema.org / SEO

### In Wix:
1. Go to **Settings > SEO (Google)**
2. Add custom meta tags for Open Graph
3. For JSON-LD structured data, add a **Custom Code** snippet (in Settings > Custom Code > Head) with the `<script type="application/ld+json">` block from any mockup's `<head>`

### llms.txt
Upload `llms.txt` to your Wix site root. In Wix, go to **Settings > Custom Code** and add an HTML file redirect, or host it externally and redirect.

---

## Quick Reference

| Asset | Mockup 1 | Mockup 2 | Mockup 3 |
|---|---|---|---|
| Style | Elegant Dark | Bright & Bold | Cinematic Minimal |
| Hero | Video bg | Split image + blob | Ken Burns image |
| Animation | GSAP | CSS + Intersection Observer | CSS + Intersection Observer |
| Nav | Transparent -> solid | Transparent -> solid | Minimal topbar + side dots |
| Programs | Hover cards | Flip cards | Horizontal scroll |
| CTA feel | Floating button | Pulsing ring | Floating pill |
| Best for | Premium/luxury feel | Energetic/youthful | Clean/editorial |
