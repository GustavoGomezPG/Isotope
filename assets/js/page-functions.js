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
	const newParallaxItems = jQuery(e).find(".parallax");
	// Check if the element exists
	if (!newParallaxItems.length) return;
	// Loop through all the elements with the class parallax
	newParallaxItems.each(function (index) {
		// Get Direction attribute
		const direction = jQuery(this).data("direction") || "vertical";
		// Get the start and end attribute
		const posStart = jQuery(this).data("start") || 0;
		const posEnd = jQuery(this).data("end") || 300;

		// Create a custom ID for the ScrollTrigger
		const id = `parallax-${index}-${Date.now()}`;

		// add the ID's to an array to remove them later
		window.parallaxIds.push(id);

		// Create a ScrollTrigger for the element and set the speed
		if (direction === "vertical") {
			gsap.fromTo(
				jQuery(this),
				{ y: `${posStart}px` },
				{
					y: `${posEnd}px`,
					ease: "none",
					scrollTrigger: {
						trigger: this,
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
				jQuery(this),
				{ x: `${posStart}px` },
				{
					x: `${posEnd}px`,
					ease: "none",
					scrollTrigger: {
						trigger: this,
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
	const elements = jQuery(e).find(".levitate");
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
	const container = jQuery(e);

	// Find all animation containers and animate their children with stagger
	const animationContainers = container.find(".animation-container");
	animationContainers.each(function (index) {
		const fadeElements = jQuery(this).find(".fade-in");
		if (!fadeElements.length) return;

		// Set initial state
		gsap.set(fadeElements, { opacity: 0 });

		// Create unique ID for this ScrollTrigger
		const id = `fade-in-container-${index}-${Date.now()}`;
		window.fadeInIds.push(id);

		// Create ScrollTrigger for this container
		ScrollTrigger.create({
			id: id,
			trigger: this,
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
	const allFadeElements = container.find(".fade-in");
	allFadeElements.each(function (index) {
		// Skip if this element is inside an animation-container
		if (jQuery(this).closest(".animation-container").length) return;

		// Set initial state
		gsap.set(this, { opacity: 0 });

		// Create unique ID for this ScrollTrigger
		const id = `fade-in-orphan-${index}-${Date.now()}`;
		window.fadeInIds.push(id);

		// Create individual ScrollTrigger for this orphan element
		ScrollTrigger.create({
			id: id,
			trigger: this,
			start: "top 85%",
			once: true,
			onEnter: () => {
				gsap.to(this, {
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
	const container = jQuery(e);
	const bgElements = container.find(".bg-transition");
	if (!bgElements.length) return;

	bgElements.each(function (index) {
		const el = jQuery(this);

		// Get data attributes for colors and positions
		const colorStart = el.data("color-start") || "#ffffff";
		const colorEnd = el.data("color-end") || "#000000";
		const scrollStart = el.data("scroll-start") || "top bottom";
		const scrollEnd = el.data("scroll-end") || "bottom top";

		// Create unique ID for this ScrollTrigger
		const id = `bg-transition-${index}-${Date.now()}`;
		window.bgTransitionIds.push(id);

		// Create the background color transition animation
		gsap.fromTo(
			this,
			{ backgroundColor: colorStart },
			{
				backgroundColor: colorEnd,
				ease: "none",
				scrollTrigger: {
					id: id,
					trigger: this,
					start: scrollStart,
					end: scrollEnd,
					scrub: true,
				},
			},
		);
	});
};

// Function to add splitType effect on text
export const splitAnimate = (e) => {
	const splitText = jQuery(e).find(".split-text");
	if (!splitText.length) return;

	splitText.each(function () {
		// Check if element has the "once" class for one-time animation
		const animateOnce = jQuery(this).hasClass("once");

		// if the element has class split-text-words then animate the text into words
		if (jQuery(this).hasClass("split-text-words")) {
			// get the text element with class elementor-heading-title inside the element
			const text = jQuery(this).find(".elementor-heading-title");

			// create a scrollTrigger ID and add it to the  parallaxIds array
			const id = `split-text-${Date.now()}`;
			window.parallaxIds.push(id);

			// Split the text into words
			const splitted = new SplitType(text);

			// Add overflow hidden to the line container
			text.find(".line").css("overflow", "hidden");

			// Set initial state for words
			gsap.set(splitted.words, { y: "100%" });

			if (animateOnce) {
				const animation = (splitted) => {
					ScrollTrigger.create({
						id: id,
						trigger: this,
						start: "top 85%",
						once: true,
						onEnter: () => {
							gsap.to(splitted.words, {
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
						text.find(".line").css("overflow", "hidden");
						gsap.set(splitted.words, { y: "100%" });
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			} else {
				const animation = (splitted) => {
					gsap.fromTo(
						splitted.words,
						{ y: "100%" },
						{
							y: "0%",
							duration: 1,
							ease: "power3.inOut",
							id,
							stagger: 0.1,
							scrollTrigger: {
								trigger: this,
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
						ScrollTrigger.getById(id).kill();
						text.find(".line").css("overflow", "hidden");
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			}
		} else if (jQuery(this).hasClass("split-text-lines")) {
			const text = jQuery(this).find(".elementor-heading-title");

			const id = `split-text-${Date.now()}`;
			window.parallaxIds.push(id);

			const splitted = new SplitType(text);
			text.css("overflow", "hidden");
			gsap.set(splitted.words, { y: "100%" });

			if (animateOnce) {
				const animation = (splitted) => {
					ScrollTrigger.create({
						id: id,
						trigger: this,
						start: "top 85%",
						once: true,
						onEnter: () => {
							gsap.to(splitted.words, {
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
						text.css("overflow", "hidden");
						gsap.set(splitted.words, { y: "100%" });
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			} else {
				const animation = (splitted) => {
					gsap.fromTo(
						splitted.words,
						{ y: "100%" },
						{
							y: "0%",
							duration: 1,
							ease: "power3.inOut",
							id,
							stagger: 0.1,
							scrollTrigger: {
								trigger: this,
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
						ScrollTrigger.getById(id).kill();
						text.css("overflow", "hidden");
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			}
		} else {
			const text = jQuery(this).find(".elementor-heading-title");

			const id = `split-text-${Date.now()}`;
			window.parallaxIds.push(id);

			const splitted = new SplitType(text);
			text.find(".line").css("overflow", "hidden");
			gsap.set(splitted.words, { y: "100%" });

			if (animateOnce) {
				const animation = (splitted) => {
					ScrollTrigger.create({
						id: id,
						trigger: this,
						start: "top 85%",
						once: true,
						onEnter: () => {
							gsap.to(splitted.words, {
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
						text.find(".line").css("overflow", "hidden");
						gsap.set(splitted.words, { y: "100%" });
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			} else {
				const animation = (splitted) => {
					gsap.fromTo(
						splitted.words,
						{ y: "100%" },
						{
							y: "0%",
							duration: 1,
							ease: "power3.inOut",
							id,
							stagger: 0.1,
							scrollTrigger: {
								trigger: this,
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
						ScrollTrigger.getById(id).kill();
						text.find(".line").css("overflow", "hidden");
						animation(splitted);
						ScrollTrigger.refresh();
					}, 300),
				);

				window.resizeObservers.push(resizeObserver);
				resizeObserver.observe(document.body);
				animation(splitted);
			}
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
