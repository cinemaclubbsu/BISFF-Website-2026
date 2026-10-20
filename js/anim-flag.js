// Runs before the page is drawn: marks that scroll animations are on, so animated content starts hidden
// (no flash before it fades in). If the animation library hasn't loaded by the time the page finishes
// loading, the mark comes off again so nothing stays invisible.
document.documentElement.classList.add("anim");
window.addEventListener("load", function () {
  if (!window.ScrollTrigger) document.documentElement.classList.remove("anim");
});
