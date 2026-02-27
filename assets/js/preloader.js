/**
 * Initialize and run the preloader animation
 * @param {Object} lottie - Lottie instance
 * @returns {Function} loaderAnimation function
 */
export function initPreloader(lottie) {
  const preloaderElement = document.getElementById("page-preloader");
  const introAnimation = lottie.loadAnimation({
    container: preloaderElement,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: `${window.backend_data.site_info.theme_url}/assets/lottie/intro.json`,
    rendererSettings: {
      progressiveLoad: false
    }
  });

  const loaderAnimation = () => {
    return new Promise((resolve) => {
      if(window.sessionStorage.getItem("loaderAnimationPlayed")) {
        gsap.set(preloaderElement, { display: "none", opacity: 0 });
        resolve();
        return;
      }

      introAnimation.play();
      introAnimation.addEventListener("complete", () => {
        const svg = preloaderElement.querySelector("svg");

        // Fade out SVG first
        gsap.to(svg, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            // Then fade out preloader background
            gsap.to(preloaderElement, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              delay: 0.2,
              onComplete: () => {
                gsap.set(preloaderElement, { display: "none" });
                resolve();
              }
            });
          }
        });
      });

      window.sessionStorage.setItem("loaderAnimationPlayed", true);
    });
  };

  return loaderAnimation;
}
