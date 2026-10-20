// Hero color cycle: steps through the logo/background pairs defined in styles.css.
(function () {
  const hero = document.querySelector(".hero");
  const toggle = document.querySelector(".hero__toggle");
  const label = toggle.querySelector(".hero__toggle-label");

  const STATE_COUNT = 6;
  const INTERVAL_MS = 2500;

  let state = 0;
  let timer = null;
  // The visitor's choice. Start paused for people who ask their device for reduced motion.
  let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function next() {
    state = (state + 1) % STATE_COUNT;
    hero.dataset.state = String(state);
  }

  // Run the timer only when not paused and the tab is visible.
  function sync() {
    const shouldRun = !paused && !document.hidden;
    if (shouldRun && !timer) {
      timer = setInterval(next, INTERVAL_MS);
    } else if (!shouldRun && timer) {
      clearInterval(timer);
      timer = null;
    }
    // The pause button stops the color cycle and the sliding bar together.
    hero.classList.toggle("is-paused", paused);
    toggle.classList.toggle("is-paused", paused);
    label.textContent = paused ? "Play colors" : "Pause colors";
  }

  toggle.addEventListener("click", function () {
    paused = !paused;
    sync();
  });

  document.addEventListener("visibilitychange", sync);

  sync();
})();
