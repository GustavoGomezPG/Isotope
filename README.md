# Isotope

A modern WordPress starter theme with SPA-style page transitions, smooth scroll, and a production-ready animation system — all powered by Vite. Elementor compatible but fully standalone.

## Stack

| Library | Version | Purpose |
|---------|---------|---------|
| [Vite](https://vitejs.dev/) | 7 | Build system with HMR, code splitting, and manifest generation |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS (zero-config via `@tailwindcss/vite`) |
| [Taxi.js](https://taxi.js.org/) | 1.9 | SPA page transitions with automatic script re-execution |
| [GSAP](https://greensock.com/gsap/) | 3.12 | Animation engine (ScrollTrigger + ScrollToPlugin) |
| [Lenis](https://lenis.darkroom.engineering/) | 1.1 | Smooth scroll with GSAP ticker integration |
| [Lottie](https://airbnb.io/lottie/) | 5.12 | JSON-based preloader animation |
| [SplitType](https://github.com/lukePeavey/SplitType) | 0.3 | Text splitting for scroll-triggered typography animations |

## Requirements

- WordPress 6.0+
- PHP 8.0+
- [Elementor](https://elementor.com/) (free or Pro) recommended for header/footer theme builder (optional — fallback templates included)
- Node.js 18+ and npm

## Quick Start

```bash
# 1. Clone into your themes directory
cd wp-content/themes/
git clone <repo-url> Isotope

# 2. Install dependencies
cd Isotope
npm install

# 3. Start development
npm run dev

# 4. Activate the theme in WP Admin → Appearance → Themes
```

### Production Build

```bash
npm run build
```

This generates a `dist/` folder with hashed assets and a manifest file. WordPress automatically switches to production mode when `dist/` exists.

## How It Works

### Dev vs Production Mode

The theme auto-detects its environment:

- **No `dist/` folder** → Development mode. Vite dev server at `http://localhost:3000` serves assets with HMR. Script tags are injected directly into `<head>`.
- **`dist/` folder exists** → Production mode. Assets are loaded from the manifest file with proper cache-busting hashes and `modulepreload` hints.

This is handled by `ViteAssets.php` — a static class that every other loader depends on.

### Page Transition Lifecycle

Every page load follows this sequence:

```
First Visit:
  Lottie preloader plays → preloader fades out →
  content fades in (0.8s) + header slides down (0.6s) → page ready

Subsequent Navigation (SPA):
  Click link → header slides up + content fades out (parallel) →
  Taxi.js fetches new page → old DOM swapped →
  content fades in + header slides back down (parallel) → page ready
```

The preloader only plays once per session (tracked via `sessionStorage`). After the first visit, returning to the site skips the animation entirely.

### Taxi.js Script Re-execution

When Taxi.js navigates between pages, it:

1. Fetches the new page HTML
2. Extracts the content inside `<div data-taxi-view>`
3. Swaps it into the current DOM
4. Re-executes inline `<script>` tags found in the new view

The `reloadJsFilter` in `main.js` controls which scripts run. It **skips** analytics trackers, `window.backend_data`, lazy-load observers, and already-loaded externals. Everything else inside the taxi view re-executes automatically.

**Writing inline scripts that work with Taxi.js:**

```html
<script>
(function() {
  var el = document.getElementById('my-element');
  if (!el) return;
  // Your code here — runs on initial load AND after Taxi navigation
})();
</script>
```

No special boilerplate needed. Just use an IIFE with a guard check.

### Animation System

Add CSS classes to Elementor widgets (or any HTML element) to activate animations. The `animator()` function scans the incoming page content and initializes all animations.

#### Parallax

```html
<div class="parallax" data-direction="vertical" data-start="0" data-end="300">
  <!-- Moves 0px → 300px as you scroll -->
</div>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-direction` | `vertical` | `vertical` or `horizontal` |
| `data-start` | `0` | Starting position in pixels |
| `data-end` | `300` | Ending position in pixels |

#### Fade In

```html
<!-- Single element -->
<div class="fade-in">Fades in when scrolled into view</div>

<!-- Grouped with stagger -->
<div class="animation-container">
  <div class="fade-in">First</div>
  <div class="fade-in">Second (0.2s delay)</div>
  <div class="fade-in">Third (0.4s delay)</div>
</div>
```

Elements fade from `opacity: 0` to `1` when they enter the viewport (top 85% trigger point). Elements inside `.animation-container` stagger with 0.2s delay between each.

#### Levitate

```html
<div class="levitate">Floats gently in random directions</div>
```

Creates a continuous floating effect with randomized X, Y, and rotation values. Useful for decorative elements.

#### Background Color Transition

```html
<div class="bg-transition"
     data-color-start="#ffffff"
     data-color-end="#000000"
     data-scroll-start="top bottom"
     data-scroll-end="bottom top">
</div>
```

Transitions background color as the element scrolls through the viewport.

#### Text Splitting Animations

```html
<!-- Split into words (scroll-scrub) -->
<div class="split-text split-text-words">
  <h2 class="elementor-heading-title">Your heading text</h2>
</div>

<!-- Split into lines (scroll-scrub) -->
<div class="split-text split-text-lines">
  <h2 class="elementor-heading-title">Your heading text</h2>
</div>

<!-- Split into characters (scroll-scrub) -->
<div class="split-text">
  <h2 class="elementor-heading-title">Your heading text</h2>
</div>

<!-- One-time animation (plays once, doesn't scrub) -->
<div class="split-text split-text-words once">
  <h2 class="elementor-heading-title">Your heading text</h2>
</div>
```

Text elements slide up from below their line containers. Without `.once`, the animation scrubs with scroll position. With `.once`, it plays once when the element enters the viewport and stays.

All split-text animations automatically re-split on window resize via ResizeObserver.

### Smooth Scroll

Lenis handles smooth scrolling site-wide. It integrates with GSAP's ticker for frame-perfect sync with ScrollTrigger.

**Anchor links** are automatically intercepted — clicking `<a href="#section">` or `<a href="/current-page#section">` smooth-scrolls to the target with a -20px offset.

**Programmatic scrolling:**

```javascript
// Smooth scroll to element
window.lenis.scrollTo(document.querySelector('#target'), { offset: -20 });

// Smooth scroll to top
window.lenis.scrollTo(0);

// Instant scroll (no animation)
window.lenis.scrollTo(0, { immediate: true });
```

**Prevent smooth scroll on specific containers:**

```html
<div data-lenis-prevent>
  <!-- This container uses native scroll behavior -->
</div>
```

### Programmatic Navigation

Use `window.taxi.navigateTo(url)` for SPA-style navigation from JavaScript (e.g., after an AJAX form submission):

```javascript
// Navigate with page transition
window.taxi.navigateTo('/thank-you/');
```

### Global JavaScript Objects

These are available on `window` after the theme initializes:

| Object | Type | Description |
|--------|------|-------------|
| `window.gsap` | GSAP instance | Animation engine |
| `window.ScrollTrigger` | GSAP plugin | Scroll-based animation triggers |
| `window.Lenis` | Constructor | Lenis class (for creating new instances) |
| `window.lenis` | Lenis instance | Active smooth scroll instance |
| `window.lottie` | Lottie instance | Lottie animation player |
| `window.SplitType` | Constructor | Text splitting library |
| `window.taxi` | Taxi Core | Page transition engine |
| `window.animator` | Function | Initializes all animations on a container |
| `window.loaderAnimation` | Function | Plays preloader (returns Promise) |
| `window.backend_data` | Object | PHP data (`site_url`, `theme_url`, `ajax_url`) |

### PHP Data Bridge

`DataLocalizer.php` creates `window.backend_data` with:

```javascript
window.backend_data = {
  site_info: {
    site_url: "https://your-site.com",
    theme_url: "https://your-site.com/wp-content/themes/Isotope",
    ajax_url: "https://your-site.com/wp-admin/admin-ajax.php"
  },
  theme_settings: {
    theme_name: "Isotope",
    theme_version: "1.0.0"
  }
}
```

Use `theme_url` for referencing theme assets from JavaScript (e.g., Lottie JSON files).

## File Structure

```
Isotope/
├── style.css                          # Theme metadata (standalone theme)
├── functions.php                      # Theme setup, loads includes
├── header.php                         # <head>, preloader, Elementor header, opens <div data-taxi>
├── footer.php                         # Closes </div data-taxi>, Elementor footer
├── index.php                          # Main template router with Taxi container
├── screenshot.png                     # Theme thumbnail (1200x900)
├── package.json                       # npm dependencies and scripts
├── vite.config.js                     # Vite build config (code splitting, manifest)
├── .gitignore                         # Ignores node_modules, dist, .claude
│
├── includes/
│   ├── ViteAssets.php                 # Dev/prod asset resolution (static class)
│   ├── DataLocalizer.php              # PHP→JS data bridge (window.backend_data)
│   ├── script-imports.php             # Dev mode: Vite HMR client + entry script
│   └── production-scripts.php         # Prod mode: manifest-based script/CSS enqueue
│
├── assets/
│   ├── css/main.css                   # Tailwind CSS + theme variables + animation CSS
│   ├── js/
│   │   ├── main.js                    # Vite entry: imports, init, Taxi setup
│   │   ├── page-transitions.js        # DefaultRenderer + FadeTransition classes
│   │   ├── page-functions.js          # Animation utilities (animator, parallax, fadeIn, etc.)
│   │   ├── lenis-init.js              # Smooth scroll setup + anchor link handling
│   │   └── preloader.js               # Lottie preloader with single-play logic
│   └── lottie/
│       └── intro.json                 # Preloader animation (replace with your own)
│
└── template-parts/
    ├── taxi-container-start.php       # Opens <div data-taxi-view> with page namespace
    ├── taxi-container-end.php         # Closes </div>
    ├── dynamic-header.php             # Fallback header (logo, nav, mobile toggle)
    ├── dynamic-footer.php             # Fallback footer (logo, nav, copyright)
    ├── single.php                     # Single post/page template
    ├── archive.php                    # Archive/blog listing template
    ├── search.php                     # Search results template
    └── 404.php                        # 404 page template
```

## Adding Page Templates

Create a new page template following this pattern:

```php
<?php
/**
 * Template Name: My Custom Page
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) exit;

get_header();
get_template_part('template-parts/taxi-container-start');
?>

<main id="content" class="site-main">
  <h1><?php the_title(); ?></h1>
  <?php the_content(); ?>

  <!-- Your custom content here -->
</main>

<?php
get_template_part('template-parts/taxi-container-end');
get_footer();
```

The `taxi-container-start` / `taxi-container-end` wrappers are required for page transitions to work. Content inside these wrappers gets swapped during navigation.

## Customizing the Preloader

Replace `assets/lottie/intro.json` with your own Lottie animation file. The animation should:

- Be non-looping (`loop: false` is set in code)
- Fire a `complete` event when done (all standard Lottie animations do)
- Be reasonably sized (the container is max 250px wide)

To skip the preloader entirely, remove the `<div id="page-preloader"></div>` from `header.php` and the preloader initialization from `main.js`.

## Customizing Theme Colors

Edit the `@theme` block in `assets/css/main.css`:

```css
@theme {
  --color-primary: #3b82f6;    /* Your primary brand color */
  --color-secondary: #10b981;  /* Your secondary color */
  --color-accent: #f59e0b;     /* Your accent color */
}
```

These are available as Tailwind utilities: `bg-primary`, `text-secondary`, `border-accent`, etc.

## Customizing Page Transitions

Edit `assets/js/page-transitions.js` to modify the `FadeTransition` class:

- `onLeave()` — Controls how the current page exits (header slide + content fade)
- `onEnter()` — Controls how the new page enters (content fade + header slide)

You can create additional transition classes and register them in `main.js`:

```javascript
const taxi = new Core({
  transitions: {
    default: FadeTransition,
    special: MySpecialTransition, // data-taxi-transition="special" on links
  },
});
```

## Code Splitting

Vite automatically splits these into separate chunks for optimal loading:

| Chunk | Size (gzip) | Contents |
|-------|-------------|----------|
| `main.min.js` | ~3.4 KB | Theme code (transitions, animations, init) |
| `gsap` | ~46 KB | GSAP + ScrollTrigger + ScrollToPlugin |
| `lottie` | ~79 KB | Lottie player (loaded once for preloader) |
| `lenis` | ~5 KB | Smooth scroll |
| `taxi` | ~3 KB | Page transition engine |
| `split-type` | ~4.5 KB | Text splitting |
| `vendor` | ~2.3 KB | Other shared dependencies |
| `main.min.css` | ~2 KB | Tailwind output + theme styles |

## Elementor Integration

- **Header/Footer:** Use Elementor's Theme Builder to create custom headers and footers. The theme registers all core Elementor locations. If no Elementor template exists, the fallback `dynamic-header.php` / `dynamic-footer.php` renders.
- **Widgets:** Elementor widgets are automatically re-initialized after Taxi.js page transitions (two passes — once on enter, once after animation completes).
- **Videos:** Elementor video widgets with autoplay are automatically played after transitions.
- **Hide Title:** The Elementor "Hide Title" setting is respected via the `isotope_page_title` filter.

## Gotchas

1. **jQuery is available:** The theme loads jQuery (WordPress dependency). The animation system and Taxi.js transition code use jQuery for DOM queries. It's available globally.

2. **Header initial state:** The header starts hidden (`opacity: 0; transform: translateY(-100%)`) via CSS. The intro animation slides it in. If you remove the preloader/intro animation, also remove these CSS rules from `main.css`.

3. **`#site-main-wrapper` starts invisible:** The main content wrapper has `opacity: 0` by default. The intro animation fades it in. Same note as above — remove the CSS if you remove the animation.

4. **Session-based preloader:** The preloader only plays once per browser session (`sessionStorage`). Clear session storage or open a new tab to test it again.

5. **`data-taxi-ignore`:** Add this attribute to any link that should NOT use SPA navigation (e.g., download links, external links, admin links).

6. **`data-lenis-prevent`:** Add this to containers that need native scroll behavior (e.g., modals, dropdowns with overflow).

## License

MIT
