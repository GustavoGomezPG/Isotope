/**
 * Initialize Lenis smooth scroll
 * @param {Object} Lenis - Lenis constructor
 * @param {Object} gsap - GSAP instance
 * @param {Object} ScrollTrigger - ScrollTrigger plugin
 * @returns {Object} Lenis instance
 */
export function initLenis(Lenis, gsap, ScrollTrigger) {
  // Initialize a new Lenis instance for smooth scrolling
  const lenis = new Lenis();

  // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  lenis.on('scroll', () => {
    ScrollTrigger.update();
  });

  // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });

  // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0);

  // Global anchor link support — intercept clicks on hash links and smooth scroll
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Handle same-page anchors (#section) and full-URL anchors (/page#section on same page)
    let hash;
    if (href.startsWith('#')) {
      hash = href;
    } else {
      try {
        const url = new URL(href, window.location.origin);
        // Only handle if it points to the current page
        if (url.pathname !== window.location.pathname) return;
        if (!url.hash) return;
        hash = url.hash;
      } catch {
        return;
      }
    }

    if (hash === '#' || hash === '') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    lenis.scrollTo(target, { offset: -20 });

    // Update URL hash without scrolling
    window.history.pushState(null, '', hash);
  });

  return lenis;
}
