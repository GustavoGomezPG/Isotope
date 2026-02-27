/**
 * Page Functions Module
 * Contains animation and interaction functions for page elements
 */

// Debounce utility function
export const debounce = (func, delay) => {
	let debounceTimer;
	return function () {

		const args = arguments;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => func.apply(this, args), delay);
	};
};

// Create an array to store the ID's of the ScrollTriggers
window.parallaxIds = [];

// Create an array to store the resize observers
window.resizeObservers = [];

// Create an array to store the levitate tweens
window.levitateTweens = [];

// Function to remove all the resize observers
export const removeResizeObservers = () => {
	window.resizeObservers.forEach((observer) => {
		observer.disconnect();
	});
};

// Function to look for all the assets that will have parallax on the page
export const parallax = (e) => {
	const newParallaxItems = e.querySelectorAll(".parallax");
	if (!newParallaxItems.length) return;

	newParallaxItems.forEach((item, index) => {
		const direction = item.dataset.direction || "vertical";
		const posStart = item.dataset.start || 0;
		const posEnd = item.dataset.end || 300;

		const id = `parallax-${index}-${Date.now()}`;
		window.parallaxIds.push(id);

		if (direction === "vertical") {
			gsap.fromTo(
				item,
				{ y: `${posStart}px` },
				{
					y: `${posEnd}px`,
					ease: "none",
					scrollTrigger: {
						trigger: item,
						id: id,
						start: "top top",
						end: "bottom top",
						scrub: 0.8,
						markers: false,
					},
				},
			);
		} else {
			gsap.fromTo(
				item,
				{ x: `${posStart}px` },
				{
					x: `${posEnd}px`,
					ease: "none",
					scrollTrigger: {
						trigger: item,
						start: "top bottom",
						end: "bottom top",
						scrub: true,
						markers: false,
					},
				},
			);
		}
	});
};

// Function to remove all the ScrollTriggers
export const removeParallax = () => {
	window.parallaxIds.forEach((id) => {
		try {
			const trigger = ScrollTrigger.getById(id);
			if (trigger) trigger.kill();
		} catch { /* element already removed from DOM */ }
	});
	window.parallaxIds = [];
};

// Levitate animation

// Function to remove all levitate tweens
export const removeLevitate = () => {
	window.levitateTweens.forEach((tween) => {
		if (tween && tween.kill) {
			tween.kill();
		}
	});
	window.levitateTweens = [];
};

// Function to create a levitating effect on an item
export const levitate = (e) => {
	const elements = e.querySelectorAll(".levitate");
	if (!elements.length) return;

	function random(min, max) {
		const delta = max - min;
		return (direction = 1) => (min + delta * Math.random()) * direction;
	}

	const randomX = random(1, 10);
	const randomY = random(1, 10);
	const randomTime = random(3, 5);
	const randomTime2 = random(5, 10);
	const randomAngle = random(-5, 5);

	const gsapEls = gsap.utils.toArray(elements);
	gsapEls.forEach((el) => {
		gsap.set(el, {
			x: randomX(-1),
			y: randomX(1),
			rotation: randomAngle(-1),
		});

		// Create tweens and store them for cleanup
		const tweenX = createMoveXTween(el, 1);
		const tweenY = createMoveYTween(el, -1);
		const tweenRotate = createRotateTween(el, 1);

		window.levitateTweens.push(tweenX, tweenY, tweenRotate);
	});

	function createRotateTween(target, direction) {
		const tween = gsap.to(target, {
			duration: randomTime2(),
			rotation: randomAngle(direction),
			ease: "sine.inOut",
			onComplete: () => {
				const newTween = createRotateTween(target, direction * -1);
				window.levitateTweens.push(newTween);
			},
		});
		return tween;
	}

	function createMoveXTween(target, direction) {
		const tween = gsap.to(target, {
			duration: randomTime(),
			x: randomX(direction),
			ease: "sine.inOut",
			onComplete: () => {
				const newTween = createMoveXTween(target, direction * -1);
				window.levitateTweens.push(newTween);
			},
		});
		return tween;
	}

	function createMoveYTween(target, direction) {
		const tween = gsap.to(target, {
			duration: randomTime(),
			y: randomY(direction),
			ease: "sine.inOut",
			onComplete: () => {
				const newTween = createMoveYTween(target, direction * -1);
				window.levitateTweens.push(newTween);
			},
		});
		return tween;
	}
};

// Create an array to store fade-in ScrollTrigger IDs
window.fadeInIds = [];

// Function to remove all fade-in ScrollTriggers
export const removeFadeIn = () => {
	window.fadeInIds.forEach((id) => {
		try {
			const trigger = ScrollTrigger.getById(id);
			if (trigger) trigger.kill();
		} catch { /* element already removed from DOM */ }
	});
	window.fadeInIds = [];
};

// Function to add a fade-in effect to an element
export const fadeIn = (e) => {
	// Find all animation containers and animate their children with stagger
	const animationContainers = e.querySelectorAll(".animation-container");
	animationContainers.forEach((container, index) => {
		const fadeElements = container.querySelectorAll(".fade-in");
		if (!fadeElements.length) return;

		gsap.set(fadeElements, { opacity: 0 });

		const id = `fade-in-container-${index}-${Date.now()}`;
		window.fadeInIds.push(id);

		ScrollTrigger.create({
			id: id,
			trigger: container,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(fadeElements, {
					opacity: 1,
					duration: 1,
					ease: "power3.inOut",
					stagger: 0.2,
				});
			},
		});
	});

	// Find orphan .fade-in elements (not inside an animation-container)
	const allFadeElements = e.querySelectorAll(".fade-in");
	allFadeElements.forEach((el, index) => {
		if (el.closest(".animation-container")) return;

		gsap.set(el, { opacity: 0 });

		const id = `fade-in-orphan-${index}-${Date.now()}`;
		window.fadeInIds.push(id);

		ScrollTrigger.create({
			id: id,
			trigger: el,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(el, {
					opacity: 1,
					duration: 1,
					ease: "power3.inOut",
				});
			},
		});
	});
};

// Create an array to store background transition ScrollTrigger IDs
window.bgTransitionIds = [];

// Function to remove all background transition ScrollTriggers
export const removeBgTransition = () => {
	window.bgTransitionIds.forEach((id) => {
		try {
			const trigger = ScrollTrigger.getById(id);
			if (trigger) trigger.kill();
		} catch { /* element already removed from DOM */ }
	});
	window.bgTransitionIds = [];
};

// Function to add background color transition on scroll
export const bgTransition = (e) => {
	const bgElements = e.querySelectorAll(".bg-transition");
	if (!bgElements.length) return;

	bgElements.forEach((el, index) => {
		const colorStart = el.dataset.colorStart || "#ffffff";
		const colorEnd = el.dataset.colorEnd || "#000000";
		const scrollStart = el.dataset.scrollStart || "top bottom";
		const scrollEnd = el.dataset.scrollEnd || "bottom top";

		const id = `bg-transition-${index}-${Date.now()}`;
		window.bgTransitionIds.push(id);

		gsap.fromTo(
			el,
			{ backgroundColor: colorStart },
			{
				backgroundColor: colorEnd,
				ease: "none",
				scrollTrigger: {
					id: id,
					trigger: el,
					start: scrollStart,
					end: scrollEnd,
					scrub: true,
				},
			},
		);
	});
};

// Helper to set overflow hidden on .line elements within a container
const setLineOverflow = (container) => {
	container.querySelectorAll(".line").forEach((line) => {
		line.style.overflow = "hidden";
	});
};

// Helper to create split-text animation with resize observer
const createSplitAnimation = (el, textEl, splitted, id, animateOnce, setOverflow) => {
	if (animateOnce) {
		const animation = (s) => {
			ScrollTrigger.create({
				id: id,
				trigger: el,
				start: "top 85%",
				once: true,
				onEnter: () => {
					gsap.to(s.words, {
						y: "0%",
						duration: 1,
						ease: "power3.inOut",
						stagger: 0.1,
					});
				},
			});
		};

		const resizeObserver = new ResizeObserver(
			debounce(() => {
				splitted.split();
				const trigger = ScrollTrigger.getById(id);
				if (trigger) trigger.kill();
				setOverflow();
				gsap.set(splitted.words, { y: "100%" });
				animation(splitted);
				ScrollTrigger.refresh();
			}, 300),
		);

		window.resizeObservers.push(resizeObserver);
		resizeObserver.observe(document.body);
		animation(splitted);
	} else {
		const animation = (s) => {
			gsap.fromTo(
				s.words,
				{ y: "100%" },
				{
					y: "0%",
					duration: 1,
					ease: "power3.inOut",
					id,
					stagger: 0.1,
					scrollTrigger: {
						trigger: el,
						scrub: true,
						start: "top-=200% center",
						end: "bottom+=200% center",
					},
				},
			);
		};

		const resizeObserver = new ResizeObserver(
			debounce(() => {
				splitted.split();
				const trigger = ScrollTrigger.getById(id);
				if (trigger) trigger.kill();
				setOverflow();
				animation(splitted);
				ScrollTrigger.refresh();
			}, 300),
		);

		window.resizeObservers.push(resizeObserver);
		resizeObserver.observe(document.body);
		animation(splitted);
	}
};

// Function to add splitType effect on text
export const splitAnimate = (e) => {
	const splitTextEls = e.querySelectorAll(".split-text");
	if (!splitTextEls.length) return;

	splitTextEls.forEach((el) => {
		const animateOnce = el.classList.contains("once");
		const textEl = el.querySelector(".elementor-heading-title");
		if (!textEl) return;

		const id = `split-text-${Date.now()}`;
		window.parallaxIds.push(id);

		const splitted = new SplitType(textEl);
		gsap.set(splitted.words, { y: "100%" });

		if (el.classList.contains("split-text-words")) {
			setLineOverflow(textEl);
			createSplitAnimation(el, textEl, splitted, id, animateOnce, () => setLineOverflow(textEl));
		} else if (el.classList.contains("split-text-lines")) {
			textEl.style.overflow = "hidden";
			createSplitAnimation(el, textEl, splitted, id, animateOnce, () => { textEl.style.overflow = "hidden"; });
		} else {
			setLineOverflow(textEl);
			createSplitAnimation(el, textEl, splitted, id, animateOnce, () => setLineOverflow(textEl));
		}
	});
};

// Animator function that calls all the animation functions
export const animator = (e) => {
	splitAnimate(e);
	fadeIn(e);
	parallax(e);
	levitate(e);
	bgTransition(e);
};
