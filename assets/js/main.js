/**
 * Main JavaScript Entry Point
 * Isotope Starter Theme
 *
 * This file imports all necessary dependencies and custom scripts
 * for the theme functionality including Taxi.js page transitions,
 * GSAP animations, Lenis smooth scroll, and Lottie animations.
 */

// ===========================
// Styles
// ===========================

// Import main CSS (includes Tailwind CSS)
import "../css/main.css";

// ===========================
// External Dependencies
// ===========================

// Taxi.js for page transitions
import { Core } from '@unseenco/taxi';

// GSAP for animations
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

// Lenis smooth scroll
import Lenis from "lenis";

window.Lenis = Lenis;

// Lottie for animations
import lottie from "lottie-web";

window.lottie = lottie;

// SplitType for text animations
import SplitType from "split-type";

window.SplitType = SplitType;

// ===========================
// Custom Modules
// ===========================

// Import Lenis initialization
import { initLenis } from "./lenis-init.js";
// Import Page Functions
import {
	animator,
	removeParallax,
	removeResizeObservers,
	removeLevitate,
	removeFadeIn,
	removeBgTransition,
} from "./page-functions.js";
// Import Page Transitions (Taxi Renderer + Transition classes)
import { DefaultRenderer, FadeTransition } from "./page-transitions.js";
// Import Preloader
import { initPreloader } from "./preloader.js";

// ===========================
// Initialize Theme
// ===========================

// Initialize Lenis smooth scroll
const lenis = initLenis(Lenis, gsap, ScrollTrigger);
window.lenis = lenis;

// Initialize preloader and get the animation function
const loaderAnimation = initPreloader(lottie);
window.loaderAnimation = loaderAnimation;

// Make animator function globally available
window.animator = animator;

// Make cleanup functions globally available for Taxi Renderer
window.removeParallax = removeParallax;
window.removeResizeObservers = removeResizeObservers;
window.removeLevitate = removeLevitate;
window.removeFadeIn = removeFadeIn;
window.removeBgTransition = removeBgTransition;

// Run preloader on initial load, then play intro animation (once only)
loaderAnimation().then(() => {
	const initialContainer = document.querySelector('[data-taxi-view]');
	if (initialContainer) {
		const header = document.querySelector('[data-elementor-type="header"]') || document.querySelector('#site-header');

		gsap.set(initialContainer, { opacity: 0, display: 'block' });
		animator(initialContainer);

		// Fade in content and slide header down simultaneously
		const tl = gsap.timeline();

		tl.to(initialContainer, {
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
			});
		}
	}
});

// Initialize Taxi.js page transitions
const taxi = new Core({
	renderers: {
		default: DefaultRenderer,
	},
	transitions: {
		default: FadeTransition,
	},
	reloadJsFilter: (element) => {
		const content = element.textContent || '';
		const src = element.src || '';

		// Skip non-executable script types
		const scriptType = element.getAttribute('type');
		if (scriptType && scriptType !== 'text/javascript' && scriptType !== 'module') {
			return false;
		}

		// Skip analytics and globally-handled scripts
		const skip = [
			'window.backend_data',
			'lazyloadRunObserver',
			'gtag',
			'google-analytics',
			'facebook',
			'fbevents',
		];
		if (skip.some(p => content.includes(p) || src.includes(p))) return false;

		// Skip already-loaded external scripts
		if (src && document.querySelector('script[src="' + src + '"]')) return false;

		// Reload all other scripts inside the taxi view
		return true;
	},
	links: 'a:not([target]):not([href^="\\#"]):not([href^="#"]):not([data-taxi-ignore]):not([href*="/wp-admin"]):not([href*="/wp-login"]):not([href$=".pdf"]):not([href$=".zip"]):not([href$=".png"]):not([href$=".jpg"])',
});

window.taxi = taxi;
