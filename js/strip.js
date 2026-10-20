// Film strip section: fill both edge columns with as many red squares as fit the section's height.
// js/scroll.js fades them in (top to bottom) once the page has turned black.
(function () {
  const columns = document.querySelectorAll(".strip__holes");
  if (!columns.length) return;

  function build() {
    columns.forEach(function (column) {
      const styles = getComputedStyle(column);
      const gap = parseFloat(styles.rowGap) || 0;
      const probe = document.createElement("span");
      probe.className = "strip__hole";
      column.appendChild(probe);
      const size = probe.getBoundingClientRect().height;
      probe.remove();

      const available = column.clientHeight - 2 * gap;
      const count = Math.max(0, Math.floor((available + gap) / (size + gap)));
      if (column.children.length === count) return;

      column.textContent = "";
      for (let i = 0; i < count; i++) {
        const hole = document.createElement("span");
        hole.className = "strip__hole";
        column.appendChild(hole);
      }
    });
    // Let js/scroll.js know the squares changed.
    window.dispatchEvent(new Event("strip:built"));
  }

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  build();
})();
