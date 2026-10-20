// "Scroll for more" hint: if a visitor is still at the top of the page and hasn't scrolled, swiped or pressed a
// key for 7 seconds, fade in a small hint at the bottom of the screen. It fades out as soon as they scroll,
// and can come back if they return to the top and sit still again.
(function () {
  const hint = document.querySelector(".scroll-hint");
  if (!hint) return;

  const IDLE_MS = 7000;
  const TOP_PX = 40; // counts as "still at the top"
  let timer = null;

  function atTop() {
    return window.scrollY <= TOP_PX;
  }

  function hide() {
    hint.classList.remove("is-visible");
  }

  function restart() {
    clearTimeout(timer);
    if (!atTop()) return;
    timer = setTimeout(function () {
      if (atTop()) hint.classList.add("is-visible");
    }, IDLE_MS);
  }

  // Any of these counts as the visitor doing something: hide the hint and start the 7 seconds over.
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (type) {
    window.addEventListener(type, function () { hide(); restart(); }, { passive: true });
  });
  window.addEventListener("scroll", function () {
    if (!atTop()) hide();
    restart();
  }, { passive: true });

  restart();
})();
