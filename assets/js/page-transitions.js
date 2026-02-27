/**
 * Page Transitions Module
 * Handles Taxi.js page transitions, renderers, and animations
 */

import { Renderer, Transition } from '@unseenco/taxi';

// This function helps add and remove js and css files during a page transition
const elementExistsInArray = (element, array) =>
	array.some((el) => el.isEqualNode(element));

/**
 * Default Renderer — handles lifecycle hooks for every page
 */
export class DefaultRenderer extends Renderer {
	initialLoad() {
		// Preloader runs on first page load only
		// loaderAnimation is called from main.js before Taxi init
	}

	onEnter() {
		// --- Body class sync ---
		const newDoc = this.page;
		if (newDoc && newDoc.body) {
			const newBodyClasses = newDoc.body.getAttribute('class');
			if (newBodyClasses) {
				document.body.setAttribute('class', newBodyClasses);
			}
		}

		// --- Head element diffing (preserve scripts, styles, and Vite assets) ---
		if (newDoc) {
			const newHeadElements = [...newDoc.head.children];
			const currentHeadElements = [...document.head.children];

			// Add new elements not in current head (skip scripts and stylesheets — they persist)
			newHeadElements.forEach((newEl) => {
				const tag = newEl.tagName;
				if (tag === 'SCRIPT') return;
				if (tag === 'LINK' && newEl.rel === 'stylesheet') return;
				if (tag === 'STYLE') return;
				if (!elementExistsInArray(newEl, currentHeadElements)) {
					document.head.appendChild(newEl.cloneNode(true));
				}
			});

			// Remove old elements not in new head, but never remove scripts, styles, or stylesheets
			currentHeadElements.forEach((currentEl) => {
				const tag = currentEl.tagName;
				if (tag === 'SCRIPT' || tag === 'STYLE') return;
				if (tag === 'LINK' && currentEl.rel === 'stylesheet') return;

				if (!elementExistsInArray(currentEl, newHeadElements)) {
					document.head.removeChild(currentEl);
				}
			});
		}

		// --- Elementor video autoplay ---
		const elementorVideos = document.querySelectorAll('.elementor-video');
		if (elementorVideos) {
			elementorVideos.forEach((video) => {
				video.play();
			});
		}

		// --- Reinitialize Elementor widgets (single pass) ---
		// Elementor's addHandler() has no dedup on the frontend (no model-cid),
		// so each runReadyTrigger call creates a new handler instance.
		// We run ONE pass here in onEnter so widgets init before the fade-in.
		if (typeof elementorFrontend !== 'undefined' && elementorFrontend.elementsHandler) {
			const wrapper = this.wrapper;
			if (wrapper) {
				try {
					wrapper.querySelectorAll('[data-widget_type]').forEach((widget) => {
						elementorFrontend.elementsHandler.runReadyTrigger(window.jQuery ? jQuery(widget) : widget);
					});
				} catch { /* Elementor observer accessing stale elements */ }
			}
		}

		// --- Lazyload ---
		if (typeof lazyloadRunObserver !== 'undefined') {
			lazyloadRunObserver();
		}

		// --- Hash scroll or scroll-to-top ---
		const pendingHash = this._pendingHash;
		if (pendingHash) {
			window.history.replaceState(null, '', window.location.pathname + window.location.search + pendingHash);
			const targetElement = this.wrapper.querySelector(pendingHash);
			if (targetElement && window.lenis) {
				window.lenis.scrollTo(targetElement, { immediate: true, offset: -20 });
			} else if (window.lenis) {
				window.lenis.scrollTo(0, { immediate: true });
			}
			this._pendingHash = null;
		} else {
			if (window.lenis) {
				window.lenis.scrollTo(0, { immediate: true });
			}
		}
	}

	onEnterCompleted() {
		// Widget init handled in onEnter (single pass to avoid duplicate handlers)
	}

	onLeave() {
		// --- Animation cleanup ---
		if (window.removeParallax) window.removeParallax();
		if (window.removeResizeObservers) window.removeResizeObservers();
		if (window.removeLevitate) window.removeLevitate();
		if (window.removeFadeIn) window.removeFadeIn();
		if (window.removeBgTransition) window.removeBgTransition();

		// Kill all ScrollTriggers and GSAP tweens on the outgoing content
		ScrollTrigger.getAll().forEach((t) => {
			try { t.kill(); } catch { /* element already removed */ }
		});
		try {
			gsap.killTweensOf(this.content.querySelectorAll('*'));
		} catch { /* stale DOM reference */ }
	}
}

/**
 * Fade Transition — default page transition with header slide and content fade
 */
export class FadeTransition extends Transition {
	onLeave({ from, trigger, done }) {
		// Remove active menu classes
		document.querySelectorAll('li').forEach((li) => {
			li.classList.remove('elementor-item-active', 'current-menu-item', 'current_page_item');
		});
		document.querySelectorAll('li > a').forEach((a) => {
			a.classList.remove('elementor-item-active', 'current-menu-item', 'current_page_item');
		});

		// Capture hash from trigger link for the renderer
		if (trigger && trigger.href) {
			try {
				const url = new URL(trigger.href, window.location.origin);
				this._pendingHash = url.hash || null;
			} catch {
				this._pendingHash = null;
			}
		} else {
			this._pendingHash = null;
		}

		// Header slides out and body fades out simultaneously
		const header = document.querySelector('[data-elementor-type="header"]') || document.querySelector('#site-header');

		if (header) {
			gsap.to(header, {
				duration: 0.6,
				y: '-100%',
				opacity: 0,
				ease: 'power3.inOut',
			});
		}

		gsap.fromTo(
			from,
			{ opacity: 1, display: 'block' },
			{
				opacity: 0,
				display: 'none',
				duration: 0.8,
				ease: 'power3.inOut',
				onComplete: () => {
					// Kill all GSAP activity on outgoing content before Taxi
					// swaps the DOM
					ScrollTrigger.getAll().forEach((t) => t.kill());
					gsap.killTweensOf(from);
					gsap.killTweensOf([...from.querySelectorAll('*')]);
					if (header) gsap.killTweensOf(header);
					done();
				},
			}
		);
	}

	onEnter({ to, trigger, done }) {
		// Pass pending hash to the renderer
		const renderer = this.taxi && this.taxi.currentCacheEntry && this.taxi.currentCacheEntry.renderer;
		if (renderer && this._pendingHash) {
			renderer._pendingHash = this._pendingHash;
		}

		// Add active menu classes for current page
		document.querySelectorAll('a').forEach((a) => {
			const href = a.getAttribute('href');
			if (!href) return;

			const currentURL = window.location.href.replace(/\/$/, '');
			const currentPath = window.location.pathname.replace(/\/$/, '');
			const linkURL = href.replace(/\/$/, '');

			let linkPath;
			try {
				const url = new URL(linkURL, window.location.origin);
				linkPath = url.pathname.replace(/\/$/, '');
			} catch {
				linkPath = linkURL.replace(/\/$/, '');
			}

			const isCurrentPage =
				linkURL === currentURL ||
				linkURL === currentPath ||
				linkPath === currentPath ||
				(currentPath === '' && (linkPath === '' || linkPath === '/'));

			if (isCurrentPage) {
				a.classList.add('elementor-item-active', 'current-menu-item', 'current_page_item');
				const parentLi = a.closest('li');
				if (parentLi) parentLi.classList.add('current-menu-item', 'current_page_item');
				a.addEventListener('click', (event) => {
					event.preventDefault();
				}, { once: true });
			}
		});

		// Body fades in and header slides back in simultaneously
		const header = document.querySelector('[data-elementor-type="header"]') || document.querySelector('#site-header');
		const tl = gsap.timeline({ onComplete: done });

		gsap.set(to, { opacity: 0, display: 'block' });

		if (window.animator) {
			window.animator(to);
		}

		tl.to(to, {
			opacity: 1,
			duration: 0.8,
			ease: 'power3.inOut',
			onStart: () => {
				ScrollTrigger.refresh();
			},
		});

		if (header) {
			tl.to(header, {
				duration: 0.6,
				y: '0',
				opacity: 1,
				ease: 'power3.inOut',
			}, 0);
		}
	}
}
