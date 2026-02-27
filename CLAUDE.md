# Isotope — AI / Developer Reference

## Overview

Standalone WordPress starter theme with Elementor compatibility. Provides a modern dev stack (Vite 7 + Tailwind CSS 4 + Taxi.js + GSAP + Lenis + Lottie + SplitType) with SPA-style page transitions out of the box. No business logic — this is a blank starter theme. Works with or without Elementor installed.

**Stack:** WordPress 6.0+ | PHP 8.0+ | Vite 7 | Tailwind CSS 4 | Taxi.js | GSAP | Lenis | Lottie | SplitType | Elementor

---

## File Structure

```
Isotope/
├── style.css                          # Theme metadata (standalone theme)
├── functions.php                      # Theme setup, loads includes
├── header.php                         # <head>, preloader div, Elementor header, <div data-taxi>
├── footer.php                         # </div data-taxi>, Elementor footer, wp_footer
├── index.php                          # Main template router with Taxi container
├── screenshot.png                     # 1200x900 placeholder
├── package.json                       # npm deps (no React, no Atropos, no Basecoat, no Lucide)
├── vite.config.js                     # Single entry point (assets/js/main.js), code splitting
├── .gitignore
├── includes/
│   ├── ViteAssets.php                 # Static class: dev/prod detection, manifest, asset URLs
│   ├── DataLocalizer.php              # Creates window.backend_data (site_url, theme_url, ajax_url)
│   ├── script-imports.php             # Dev mode: Vite HMR client + main entry in <head>
│   └── production-scripts.php         # Prod mode: manifest-based enqueue with modulepreload
├── assets/
│   ├── css/main.css                   # Tailwind + theme vars + Lenis + preloader + animation initial CSS
│   ├── js/
│   │   ├── main.js                    # Vite entry: imports all deps, init Taxi/Lenis/preloader/animations
│   │   ├── page-transitions.js        # DefaultRenderer (lifecycle) + FadeTransition (animations)
│   │   ├── page-functions.js          # animator(), parallax, fadeIn, levitate, bgTransition, splitAnimate
│   │   ├── lenis-init.js              # Lenis setup + GSAP ticker sync + anchor link interception
│   │   └── preloader.js               # Lottie preloader, single-play via sessionStorage
│   └── lottie/intro.json             # Placeholder animation (replaceable)
└── template-parts/
    ├── taxi-container-start.php       # <div data-taxi-view id="site-main-wrapper" data-page="...">
    ├── taxi-container-end.php         # </div>
    ├── dynamic-header.php             # Fallback header (logo, title, nav)
    ├── dynamic-footer.php             # Fallback footer (nav, copyright)
    ├── single.php                     # Single post/page
    ├── archive.php                    # Archive/blog listing
    ├── search.php                     # Search results
    └── 404.php                        # 404 page
```

---

## Build System

- **Dev:** `npm run dev` → Vite dev server at `http://localhost:3000`
- **Prod:** `npm run build` → `dist/` folder with `.vite/manifest.json`
- **Detection:** `ViteAssets::is_production()` checks if `dist/` exists. No env vars needed.
- **Code splitting:** GSAP, Lottie, Taxi, Lenis, SplitType each get their own chunk. One entry point: `assets/js/main.js`.

---

## Architecture

### Asset Loading Flow

```
functions.php
  └─ requires ViteAssets.php (must be first)
  └─ checks ViteAssets::is_production()
      ├─ true  → requires production-scripts.php (IsotopeProductionScripts)
      │           hooks into elementor/frontend/after_register_scripts (or wp_enqueue_scripts if no Elementor)
      │           enqueues JS from manifest with type="module" + modulepreload
      │           enqueues CSS from manifest
      └─ false → requires script-imports.php (IsotopeDevScripts)
                  outputs Vite client + main.js script tags in wp_head
  └─ requires DataLocalizer.php → creates window.backend_data
```

### Page Lifecycle

```
header.php
  ├─ <div id="page-preloader"></div>      ← Lottie preloader target
  ├─ Elementor header (or dynamic-header.php fallback)
  └─ <div data-taxi>                      ← Taxi.js wrapper opens

index.php (or page-*.php)
  ├─ taxi-container-start.php             ← <div data-taxi-view>
  ├─ Content (single/archive/search/404)
  └─ taxi-container-end.php              ← </div>

footer.php
  ├─ </div>                              ← Taxi.js wrapper closes
  ├─ Elementor footer (or dynamic-footer.php fallback)
  └─ wp_footer()
```

### Taxi.js Page Transition Flow

**Initial page load:**
1. `main.js` runs → imports everything, registers GSAP plugins, exposes globals on `window`
2. `initLenis()` → Lenis instance created, synced with GSAP ticker
3. `initPreloader()` → Lottie animation loaded from `assets/lottie/intro.json`
4. `loaderAnimation()` → Preloader plays (or skips if session flag set)
5. After preloader resolves → content fades in (0.8s) + header slides down (0.6s) via GSAP timeline
6. `new Core({...})` → Taxi.js initialized with DefaultRenderer + FadeTransition

**SPA navigation (subsequent clicks):**
1. User clicks a link → Taxi.js intercepts (unless `target`, `#`, or `data-taxi-ignore`)
2. `FadeTransition.onLeave()` → removes active menu classes → header slides up + content fades out (parallel)
3. `DefaultRenderer.onLeave()` → cleans up all animations (parallax, levitate, fadeIn, bgTransition, ScrollTriggers, GSAP tweens)
4. Taxi.js fetches new page → extracts `<div data-taxi-view>` content → swaps DOM
5. `DefaultRenderer.onEnter()` → syncs body classes → diffs `<head>` elements → re-inits Elementor widgets → handles hash scroll / scroll-to-top → runs lazyload
6. `FadeTransition.onEnter()` → updates active menu classes → `animator(newContent)` → content fades in + header slides down (parallel)
7. `DefaultRenderer.onEnterCompleted()` → second pass Elementor widget re-init

### Script Re-execution Filter

`reloadJsFilter` in `main.js` decides which `<script>` tags re-execute after Taxi navigation:

**Skipped (never re-execute):**
- Scripts containing `window.backend_data` (PHP data — already set)
- Scripts containing `lazyloadRunObserver` (handled in DefaultRenderer)
- Analytics: `gtag`, `google-analytics`, `facebook`, `fbevents`
- External scripts already loaded (checks `document.querySelector('script[src="..."]')`)
- Non-executable types (not `text/javascript` or `module`)

**Re-executed:** Everything else inside the taxi-view. No boilerplate needed in inline scripts — just use IIFEs:

```javascript
<script>
(function() {
  var el = document.getElementById('my-widget');
  if (!el) return;
  // ... your code ...
})();
</script>
```

---

## Animation System

All animations are initialized by `animator(containerElement)` which calls:
1. `splitAnimate()` — `.split-text`, `.split-text-words`, `.split-text-lines` (+ `.once`)
2. `fadeIn()` — `.fade-in` (+ `.animation-container` for stagger groups)
3. `parallax()` — `.parallax` (`data-direction`, `data-start`, `data-end`)
4. `levitate()` — `.levitate` (random floating motion)
5. `bgTransition()` — `.bg-transition` (`data-color-start`, `data-color-end`, `data-scroll-start`, `data-scroll-end`)

### Cleanup

Each animation system stores IDs/references globally for cleanup during page transitions:
- `window.parallaxIds[]` — ScrollTrigger IDs for parallax + split-text
- `window.resizeObservers[]` — ResizeObserver instances for split-text responsive re-split
- `window.levitateTweens[]` — GSAP tweens for levitate
- `window.fadeInIds[]` — ScrollTrigger IDs for fade-in
- `window.bgTransitionIds[]` — ScrollTrigger IDs for bg-transition

Cleanup functions (`removeParallax`, `removeResizeObservers`, `removeLevitate`, `removeFadeIn`, `removeBgTransition`) are called in `DefaultRenderer.onLeave()` before DOM swap.

---

## CSS Architecture

`assets/css/main.css` structure:

```css
@import "tailwindcss";                    /* Tailwind CSS 4 base */
@plugin "@tailwindcss/typography";        /* Prose styling plugin */

@source "../../**/*.php";                 /* Scan PHP files for classes */
@source "../js/**/*.js";                  /* Scan JS files for classes */

@theme {
  --color-primary: #3b82f6;              /* Customize these */
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
  /* breakpoints, z-index scale, spacing */
}

@utility container { ... }               /* Responsive container */
@utility inner-container { ... }          /* Max-width 1280px centered */

@layer base {
  /* Body flex column layout */
  /* Lenis smooth scroll CSS (.lenis, .lenis-smooth, .lenis-stopped) */
  /* Preloader: fixed fullscreen white, z-9999 */
  /* Initial hidden states:
       #site-main-wrapper { opacity: 0 }
       [data-elementor-type="header"] { opacity: 0; transform: translateY(-100%) }
  */
  /* Skip link hidden */
}
```

**Important CSS initial states:** The header and main wrapper start invisible. The intro animation (in `main.js`) fades/slides them in. If you remove the intro animation, you MUST also remove these CSS rules or the page will be invisible.

---

## Global JavaScript API

Available on `window` after theme initializes:

| Global | Type | Purpose |
|--------|------|---------|
| `gsap` | Object | GSAP animation engine |
| `ScrollTrigger` | Object | GSAP ScrollTrigger plugin |
| `Lenis` | Constructor | Lenis class |
| `lenis` | Instance | Active Lenis smooth scroll |
| `lottie` | Object | Lottie animation player |
| `SplitType` | Constructor | Text splitting library |
| `taxi` | Instance | Taxi.js Core (use `taxi.navigateTo(url)` for programmatic nav) |
| `animator` | Function | `animator(containerEl)` — initializes all animations |
| `loaderAnimation` | Function | Returns Promise, plays preloader |
| `backend_data` | Object | `{ site_info: { site_url, theme_url, ajax_url }, theme_settings: { theme_name, theme_version } }` |
| `removeParallax` | Function | Cleanup parallax ScrollTriggers |
| `removeResizeObservers` | Function | Cleanup ResizeObservers |
| `removeLevitate` | Function | Cleanup levitate tweens |
| `removeFadeIn` | Function | Cleanup fade-in ScrollTriggers |
| `removeBgTransition` | Function | Cleanup bg-transition ScrollTriggers |

---

## Key Patterns

### Creating Page Templates

Every page template MUST wrap content in the Taxi container:

```php
<?php
get_header();
get_template_part('template-parts/taxi-container-start');
?>

<!-- Your content here -->

<?php
get_template_part('template-parts/taxi-container-end');
get_footer();
?>
```

Without these wrappers, Taxi.js page transitions will break.

### PHP Class Self-Instantiation

All include classes instantiate themselves at file bottom:

```php
new DataLocalizer();
new IsotopeDevScripts();
new IsotopeProductionScripts();
```

### ViteAssets Static Usage

```php
ViteAssets::is_dev_mode();              // true if no dist/ folder
ViteAssets::is_production();            // true if dist/ exists
ViteAssets::get_js_url('main');         // JS URL for entry point (dev or prod)
ViteAssets::get_css_urls('main');       // Array of CSS URLs from manifest
ViteAssets::get_chunk_urls('main');     // Array of chunk URLs for modulepreload
ViteAssets::enqueue_css('main', 'isotope-theme-main'); // wp_enqueue_style from manifest
```

### Elementor Integration

- Header/footer: Elementor Theme Builder locations are registered. Fallbacks in `template-parts/dynamic-header.php` and `dynamic-footer.php`.
- Widget re-init: `DefaultRenderer.onEnter()` and `onEnterCompleted()` call `elementorFrontend.elementsHandler.runReadyTrigger()` on all widgets in the new content. Wrapped in try-catch for stale element safety.
- Head diffing: `DefaultRenderer.onEnter()` diffs `<head>` elements — adds new meta/link tags, removes stale ones, but **never removes scripts, styles, or stylesheets** to prevent breaking Vite/Elementor assets.
- Videos: `.elementor-video` elements are auto-played after transitions.
- Hide title: The `isotope_page_title` filter respects Elementor's "Hide Title" document setting.

### Programmatic Navigation

```javascript
window.taxi.navigateTo('/some-page/');  // SPA navigation with transition
```

Use this instead of `window.location.href` when you want the page transition animation.

### Preventing Taxi.js Navigation

```html
<a href="/file.pdf" data-taxi-ignore>Download PDF</a>     <!-- Skipped by Taxi -->
<a href="/page" target="_blank">Open in new tab</a>        <!-- Skipped (has target) -->
<a href="#section">Jump to section</a>                     <!-- Skipped (hash link) -->
```

### Preventing Smooth Scroll on Containers

```html
<div data-lenis-prevent>
  <!-- Native scroll behavior inside this element -->
</div>
```

---

## Adding New JavaScript

### Option A: Inline script in a page template (simplest)

```php
<script>
(function() {
  var form = document.getElementById('my-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // ...
  });
})();
</script>
```

Taxi.js will re-execute this on every navigation to that page.

### Option B: New JS module imported in main.js

1. Create `assets/js/my-feature.js`
2. Add `import './my-feature.js';` in `main.js`
3. The module runs once on initial load. If it needs to re-run per page, expose an init function on `window` and call it from `DefaultRenderer.onEnterCompleted()`.

### Option C: Conditional module (page-specific)

```javascript
// In main.js, dynamically import based on page
const page = document.querySelector('[data-taxi-view]')?.getAttribute('data-page');
if (page === 'contact') {
  import('./contact-form.js');
}
```

---

## Adding New Animation Types

1. Create tracking array: `window.myAnimationIds = [];`
2. Create init function: `export const myAnimation = (container) => { ... }`
3. Create cleanup function: `export const removeMyAnimation = () => { ... }`
4. Add to `animator()` in `page-functions.js`
5. Export cleanup from `page-functions.js`
6. Import cleanup in `main.js`, expose on `window`
7. Add cleanup call in `DefaultRenderer.onLeave()` in `page-transitions.js`

---

## Gotchas

1. **Header starts hidden via CSS.** `[data-elementor-type="header"]` has `opacity: 0; transform: translateY(-100%)`. The intro animation slides it in. Remove these CSS rules if you remove the intro animation.

2. **`#site-main-wrapper` starts invisible.** `opacity: 0` in CSS. Same note as above.

3. **Preloader plays once per session.** Uses `sessionStorage.loaderAnimationPlayed`. Clear storage or new tab to re-test.

4. **jQuery is loaded.** WordPress enqueues jQuery. The animation system and Taxi transitions use `jQuery()` for DOM queries. It's available globally.

5. **Elementor re-init uses try-catch.** After Taxi DOM swap, Elementor's MutationObserver can access stale elements. The try-catch in `DefaultRenderer` prevents crashes.

6. **All ScrollTriggers killed on leave.** `DefaultRenderer.onLeave()` kills ALL ScrollTriggers and GSAP tweens on the outgoing content. This prevents callbacks from accessing removed DOM nodes.

7. **Active menu classes on `<li>`.** `FadeTransition.onEnter()` adds `current-menu-item` to both the `<a>` AND its parent `<li>`. WordPress CSS targets `li.current-menu-item > a`.

8. **Production handle is `isotope-theme-main`.** The `script_loader_tag` filter checks for this handle to add `type="module"`. If you change the handle, update the filter.

9. **Version uses `wp_get_theme()->get('Version')`.** Not a constant. Change the version in `style.css` to cache-bust.
