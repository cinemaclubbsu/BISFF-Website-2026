// Scroll animations for everything below the hero, built with GSAP + ScrollTrigger:
// - anything marked data-reveal fades and drifts up into place as it comes up the screen
// - the Blurb pins for its own moment: the date banner fades, "alive." turns red, then the page shifts to black
// - once the page is fully black, the film strip squares sweep in row by row, top to bottom, as you scroll
// - the bottom two squares then stretch into a red bar that grows to paint the screen red for the next section
// - Event details: the date, time and place fade in at the center, then the section holds while thin lines
//   draw a rule-of-thirds grid around them, a cream panel wipes across, and "Free to the public" appears centered
// - the closing text wipes on behind one red rectangle, which then wipes off
// Everything rewinds when you scroll back up.
(function () {
  const root = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("anim"); // show everything without animation
    const next = document.querySelector(".event");
    if (next) next.classList.add("is-red");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Phones and tablets (touch screens).
  const isTouch = window.matchMedia("(pointer: coarse)").matches || ScrollTrigger.isTouch === 1;

  // --- Touch scrolling ------------------------------------------------------
  // Phones keep the browser's own touch scrolling (with its natural momentum: taking it over made flicks feel
  // short and heavy on iPhone). When the screen height changes only because a toolbar slid in or out,
  // don't re-measure everything, which would cause jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // On phones, the held ("pinned") moments are shorter and the scroll-tied animations follow the finger more
  // directly, since one screen of scrolling is a short swipe there.
  function onPhone(phoneValue, otherValue) {
    return isTouch ? phoneValue : otherValue;
  }

  // --- Smooth scrolling (Lenis) -------------------------------------------
  // Mouse wheel and trackpad scrolling glide instead of jumping. The browser's normal scrolling stays
  // underneath, so the keyboard, scrollbar, find-in-page and in-page links all work as usual.
  // Only on computers (touch scrolling is handled above). Off for visitors who ask for reduced motion.
  let lenis = null;
  if (window.Lenis && !reduceMotion && !isTouch) {
    lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);       // keep the scroll animations in step with the glide
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // The top-left logo glides to the top; afterwards, move keyboard focus there too, so keyboard and
  // screen reader users continue from the top of the page. (The bottom-left logo has its own transition below.)
  document.querySelectorAll('.hero__mark').forEach(function (link) {
    link.addEventListener("click", function () {
      const main = document.getElementById("main");
      if (main) setTimeout(function () { main.focus({ preventScroll: true }); }, 0);
    });
  });
  const RISE = reduceMotion ? 0 : 32; // px the text drifts up while fading in

  // --- The Blurb moment ---------------------------------------------------
  // As "We don't just screen films. / We keep the film scene alive." reaches the middle of the screen,
  // the sliding date banner fades away. Then the section pins (holds still) for a while as you scroll:
  //   hold on the text  ->  "alive." fades to red  ->  hold  ->  the page shifts to black  ->  hold  ->  release
  // The cream-to-black change plays over about a second once triggered (not frame-by-frame with the scroll),
  // so it can never be left half-faded with grey text on a grey background.
  const blurb = document.querySelector(".blurb");
  const alive = blurb && blurb.querySelector(".blurb__alive");
  const marquee = document.querySelector(".marquee");
  const PIN_SCREENS = onPhone(1.1, 1.8); // how long the moment lasts, in screen-heights of scrolling
  const DARK_AT = 0.62;    // point in the moment (0 to 1) where the page shifts to black

  let darkFade = null;
  let darkOn = false;
  function setDark(on) {
    if (!darkFade || on === darkOn) return;
    darkOn = on;
    if (on) darkFade.play();
    else darkFade.reverse();
  }

  if (blurb) {
    // Recolors just the page background and the two sections that sit on it (cheaper on phones than
    // changing a page-wide color setting, which makes the browser restyle everything on every frame).
    const fadeDuration = reduceMotion ? 0 : 1;
    const stripSection = document.querySelector(".strip");
    darkFade = gsap.timeline({ paused: true, onUpdate: function () { updateColumns(); } });
    darkFade
      .fromTo(document.body, { backgroundColor: "#fff8e8" }, { backgroundColor: "#000000", duration: fadeDuration, ease: "power1.inOut" }, 0)
      .fromTo([blurb, stripSection].filter(Boolean),
        { backgroundColor: "#fff8e8", color: "#000000" },
        { backgroundColor: "#000000", color: "#fff8e8", duration: fadeDuration, ease: "power1.inOut" }, 0);
  }

  if (blurb && !reduceMotion) {
    // Banner fades out as the lines come up to the middle (fully gone just before the section pins).
    if (marquee) {
      gsap.to(marquee, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: blurb, start: "top 45%", end: "top 5%", scrub: true },
      });
    }

    const moment = gsap.timeline({
      scrollTrigger: {
        trigger: blurb,
        start: "top top",
        end: function () { return "+=" + Math.round(window.innerHeight * PIN_SCREENS); },
        pin: true,
        anticipatePin: 1, // switch into place a hair early so it doesn't jump on fast scrolls
        scrub: onPhone(0.3, 0.5),
        invalidateOnRefresh: true,
        onUpdate: function (self) { setDark(self.progress >= DARK_AT); },
      },
    });
    moment
      .to({}, { duration: 0.12 }) // hold: just the two lines
      .fromTo(alive, { color: "#000000" }, { color: "#ff0000", duration: 0.08, ease: "power1.out" }) // "alive." to red
      .to({}, { duration: 0.8 }); // hold red, black kicks in at DARK_AT, then hold on black before releasing
  } else if (blurb) {
    // Reduced motion: no pinning or fading. "alive." is simply red and the page switches to black past the Blurb.
    if (alive) gsap.set(alive, { color: "#ff0000" });
    ScrollTrigger.create({
      trigger: blurb,
      start: "top 8%",
      onEnter: function () { setDark(true); },
      onLeaveBack: function () { setDark(false); },
    });
  }

  // --- Event details --------------------------------------------------------
  // (Set up right after the Blurb, before the film strip and paint below, so every later animation
  // measures the page with this section's hold already included.)
  // 1. Once the red has filled the screen, the date, time and place fade in at the center (over about a second,
  //    not frame-by-frame with the scroll, so the text is never left half-faded and hard to read).
  // 2. The section then holds still while you scroll:
  //    - after a short pause, the two vertical lines rise from the bottom, then the two horizontal lines sweep
  //      across (top one from the left, bottom one from the right): a rule-of-thirds grid around the text
  //    - a cream panel wipes across left to right, covering the grid and the details
  //    - "Free to the public" fades in at the center
  //    - its letters pull together into a small red square, the red square grows to fill the screen, then a
  //      black square grows out of its middle until the screen is black. Then it lets go.
  const eventSection = document.querySelector(".event");
  const eventInfo = eventSection && eventSection.querySelector(".event__info");
  const eventWipe = eventSection && eventSection.querySelector(".event__wipe");
  const eventWipeInner = eventSection && eventSection.querySelector(".event__wipe-inner");
  const eventFree = eventSection && eventSection.querySelector(".event__free");
  const vLines = eventSection ? eventSection.querySelectorAll(".event__line--v") : [];
  const hLines = eventSection ? eventSection.querySelectorAll(".event__line--h") : [];
  const EVENT_SCREENS = onPhone(3.2, 5.2); // how long the hold lasts, in screen-heights of scrolling
  const redSquare = eventSection && eventSection.querySelector(".event__sq--red");
  const blackSquare = eventSection && eventSection.querySelector(".event__sq--black");

  // Wrap each letter of "Free to the public" in its own span so the letters can move separately.
  // Screen readers get the whole phrase from a hidden copy instead of letter by letter.
  function splitLetters(el) {
    const text = el.textContent.trim();
    el.textContent = "";
    const readable = document.createElement("span");
    readable.className = "visually-hidden";
    readable.textContent = text;
    el.appendChild(readable);
    text.split(" ").forEach(function (word, w) {
      if (w > 0) el.appendChild(document.createTextNode(" "));
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      wordSpan.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (letter) {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.textContent = letter;
        wordSpan.appendChild(charSpan);
      });
      el.appendChild(wordSpan);
    });
    return el.querySelectorAll(".char");
  }

  // How much a square must grow to cover the whole screen, with room to spare in case the window gets taller
  // without a refresh (e.g. a phone's address bar sliding away). Anything past the section edge is clipped.
  function coverScale(square) {
    const biggest = Math.max(window.innerWidth, window.innerHeight, window.screen.width || 0, window.screen.height || 0);
    return (biggest / square.offsetWidth) * 1.3;
  }

  // The second line of each pair starts a beat after the first.
  function lineStagger(i, line) {
    return line.classList.contains("event__line--v2") || line.classList.contains("event__line--h2") ? 0.06 : 0;
  }

  if (eventSection && eventInfo && eventWipe && eventFree) {
    if (reduceMotion) {
      // No animation: everything shows at once on the red (grid lines are drawn by the CSS), with
      // "Free to the public" under the details instead of a cream panel covering them.
      eventSection.classList.add("event--static");
      gsap.set(eventInfo, { opacity: 1 });
      gsap.set(eventFree, { opacity: 1 });
    } else {
      gsap.set(eventInfo, { opacity: 0, y: RISE });
      ScrollTrigger.create({
        trigger: eventSection,
        start: "top 12%", // right after the red paint has covered the screen
        onEnter: function () {
          gsap.to(eventInfo, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", overwrite: true });
        },
        onLeaveBack: function () {
          gsap.to(eventInfo, { opacity: 0, y: RISE, duration: 0.5, ease: "power2.in", overwrite: true });
        },
      });

      // "Free to the public" fades in over a moment once the wipe is done (not tied to the scroll frame by frame).
      let freeShown = false;
      gsap.set(eventFree, { opacity: 0, y: RISE });
      function showFree(on) {
        if (on === freeShown) return;
        freeShown = on;
        gsap.to(eventFree, on
          ? { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", overwrite: true }
          : { opacity: 0, y: RISE, duration: 0.4, ease: "power2.in", overwrite: true });
      }

      const letters = splitLetters(eventFree);
      // Distance from each letter to the middle of the red square. Both are measured at the same moment, so the
      // answer is right wherever the page is scrolled when it's worked out (the section may not be on screen yet).
      // The heading's own fade-in nudge (its y offset) is taken out, so letters land dead center.
      function toCenterX(i, letter) {
        const r = letter.getBoundingClientRect();
        const s = redSquare.getBoundingClientRect();
        return (s.left + s.width / 2) - (r.left + r.width / 2);
      }
      function toCenterY(i, letter) {
        const r = letter.getBoundingClientRect();
        const s = redSquare.getBoundingClientRect();
        const freeNudge = gsap.getProperty(eventFree, "y") || 0;
        return (s.top + s.height / 2) - (r.top + r.height / 2 - freeNudge);
      }

      gsap.set(vLines, { scaleY: 0 });
      gsap.set(hLines, { scaleX: 0 });
      // The cream panel slides in from the left while its contents slide the opposite way, so the contents
      // stay put and appear to be revealed (smoother on phones than cutting the panel to shape each frame).
      // (x: 0 replaces the CSS starting offset, so it isn't counted twice.)
      gsap.set(eventWipe, { x: 0, xPercent: -100 });
      gsap.set(eventWipeInner, { x: 0, xPercent: 100 });
      let eventTl = null;
      eventTl = gsap.timeline({
        scrollTrigger: {
          trigger: eventSection,
          start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * EVENT_SCREENS); },
          pin: true,
          anticipatePin: 1,
          scrub: onPhone(0.35, 0.8),
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (eventTl) showFree(self.progress >= eventTl.labels.wiped / eventTl.duration());
          },
        },
      });
      eventTl
        .to({}, { duration: 0.15 }) // short pause on just the text
        .to(vLines, { scaleY: 1, duration: 0.4, ease: "power2.inOut", stagger: lineStagger })
        .to(hLines, { scaleX: 1, duration: 0.4, ease: "power2.inOut", stagger: lineStagger }, "-=0.15")
        .to({}, { duration: 0.2 }) // hold on the finished grid
        .addLabel("wipe")
        .to(eventWipe, { xPercent: 0, duration: 0.6, ease: "power2.inOut" }, "wipe") // cream wipe, left to right
        .to(eventWipeInner, { xPercent: 0, duration: 0.6, ease: "power2.inOut" }, "wipe")
        .addLabel("wiped")
        .to({}, { duration: 0.5 }) // "Free to the public" fades in here, then holds
        // Letters pull into the center and shrink away as the small red square appears there.
        .addLabel("collapse")
        .to(letters, {
          x: toCenterX,
          y: toCenterY,
          scale: 0,
          duration: 0.5,
          ease: "power2.in",
          stagger: { each: 0.012, from: "center" },
        }, "collapse")
        .fromTo(redSquare, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(1.6)" }, "collapse+=0.3")
        .to({}, { duration: 0.15 }) // a beat on the little red square
        .to(redSquare, { scale: function () { return coverScale(redSquare); }, duration: 0.5, ease: "power2.in" }) // red fills the screen
        .fromTo(blackSquare, { scale: 0 }, { scale: function () { return coverScale(blackSquare); }, duration: 0.5, ease: "power2.in" }, "-=0.15") // then black from the middle
        .to({}, { duration: 0.05 }); // a brief beat on black before letting go
    }
  }

  // --- Text fade-ins ------------------------------------------------------
  // data-reveal="0.7" = fade in once the element's top is 70% of the way down the screen.
  // (Created after the pin above, so their positions account for the extra scrolling it adds.)
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    const at = parseFloat(el.dataset.reveal) || 0.85;
    gsap.set(el, { opacity: 0, y: RISE });
    ScrollTrigger.create({
      trigger: el,
      start: "top " + at * 100 + "%",
      onEnter: function () {
        gsap.to(el, { opacity: 1, y: 0, duration: reduceMotion ? 0 : 1.1, ease: "power3.out", overwrite: true });
      },
      onLeaveBack: function () {
        gsap.to(el, { opacity: 0, y: RISE, duration: reduceMotion ? 0 : 0.5, ease: "power2.in", overwrite: true });
      },
    });
  });

  function isDark() {
    return !darkFade || (darkFade.progress() > 0.99 && !darkFade.reversed());
  }

  // --- Film strip squares -------------------------------------------------
  // The squares sweep in row by row, top to bottom, tied to how far you've scrolled through the strip
  // (so a square is never already showing before the sweep reaches it). Several rows are mid-fade at once,
  // which makes the leading edge a soft gradient. The whole strip stays hidden until the page is fully black.
  const strip = document.querySelector(".strip");
  const columns = document.querySelectorAll(".strip__holes");
  const FADE_ROWS = 6; // how many rows the soft leading edge spans
  let sweep = null;
  let columnsShown = null;

  function rowOf(hole) {
    return Array.prototype.indexOf.call(hole.parentNode.children, hole);
  }

  function updateColumns() {
    const dark = isDark();
    if (dark === columnsShown) return;
    columnsShown = dark;
    gsap.to(columns, { opacity: dark ? 1 : 0, duration: reduceMotion ? 0 : dark ? 0.3 : 0.2, overwrite: true });
  }

  function buildSweep() {
    if (sweep) {
      if (sweep.scrollTrigger) sweep.scrollTrigger.kill();
      sweep.kill();
      sweep = null;
    }
    const holes = Array.prototype.slice.call(document.querySelectorAll(".strip__hole"));
    if (!strip || !holes.length) return;

    gsap.set(holes, { opacity: 0, scale: reduceMotion ? 1 : 0.4 });
    sweep = gsap.timeline({
      scrollTrigger: {
        trigger: strip,
        start: "top 45%",      // starts once the strip is well onto the screen (the page is black by then)
        end: "bottom bottom",  // last row lands as the end of the strip reaches the bottom of the screen
        scrub: reduceMotion ? true : onPhone(0.3, 0.6),
      },
    });
    // Each row starts one step after the row above it; left and right squares in a row go together.
    function byRow(i, hole) {
      return rowOf(hole);
    }
    // Opacity eases in evenly (the soft gradient); size settles with a tiny bounce, at the same time.
    sweep.to(holes, { opacity: 1, duration: FADE_ROWS, ease: "power1.inOut", stagger: byRow }, 0);
    if (!reduceMotion) {
      sweep.to(holes, { scale: 1, duration: FADE_ROWS, ease: "back.out(1.7)", stagger: byRow }, 0);
    }
  }

  if (columns.length) {
    gsap.set(columns, { opacity: 0 });
    updateColumns();
    buildSweep();
  }

  // --- Paint the screen red ------------------------------------------------
  // Tied to the scroll, in two steps:
  //   1. the bottom square of each column stretches sideways until they meet, forming one thin red bar
  //   2. the bar grows down (into the next section) and up, until the whole screen is red
  // The red pieces sit in .paint, above the squares but below the strip text.
  const zone = document.querySelector(".paint-zone");
  const nextSection = document.querySelector(".event");
  const paintLeft = document.querySelector(".paint__left");
  const paintRight = document.querySelector(".paint__right");
  const paintBar = document.querySelector(".paint__bar");

  // Position of a column's bottom square inside the paint zone (offsets ignore the sweep's scale animation).
  function bottomSquare(column) {
    const hole = column.lastElementChild;
    if (!hole) return { left: 0, top: 0, size: 0 };
    return {
      left: strip.offsetLeft + column.offsetLeft + hole.offsetLeft,
      top: strip.offsetTop + column.offsetTop + hole.offsetTop,
      size: hole.offsetWidth,
    };
  }
  function leftSq() { return bottomSquare(columns[0]); }
  function rightSq() { return bottomSquare(columns[columns.length - 1]); }
  function half() { return zone.clientWidth / 2; }
  // How far the bar grows up: enough to pass the top of the screen by the end.
  function growUp() { return window.innerHeight * 0.15 + 48; }
  // How far it grows down: to the bottom of the next section.
  function growDown() { const sq = leftSq(); return zone.offsetHeight - (sq.top + sq.size); }

  if (reduceMotion) {
    if (nextSection) nextSection.classList.add("is-red");
  } else if (zone && strip && columns.length && paintBar) {
    const STRETCH = 30; // share of the scroll spent stretching into a bar
    const FILL = 55;    // share spent growing the bar to fill the screen

    const paint = gsap.timeline({
      scrollTrigger: {
        trigger: strip,
        start: "bottom bottom", // right as the last row of squares has appeared
        end: "bottom 15%",
        scrub: onPhone(0.3, 0.6),
        invalidateOnRefresh: true, // re-measure the squares after a resize
      },
    });

    // The pieces are laid out once at their finished size and position; the animation only slides and
    // stretches them (transforms), which phones can do smoothly without re-measuring the page every frame.
    function placePaint() {
      const L = leftSq(), R = rightSq(), h = half(), up = growUp(), down = growDown();
      gsap.set(paintLeft, { left: 0, top: L.top, width: h + 1, height: L.size });
      gsap.set(paintRight, { left: h - 1, top: R.top, width: h + 1, height: R.size });
      gsap.set(paintBar, { top: L.top - up, height: L.size + up + down }); // full width comes from the CSS
    }
    placePaint();
    ScrollTrigger.addEventListener("refresh", function () {
      placePaint();
      paint.invalidate(); // re-work-out the start sizes for the new layout
      if (paint.scrollTrigger) paint.progress(paint.scrollTrigger.progress);
    });

    // 1. Stretch: red pieces start exactly on top of the two bottom squares, then reach the edges and the middle.
    paint.fromTo([paintLeft, paintRight], { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);
    paint.fromTo(
      paintLeft,
      { x: function () { return leftSq().left; }, scaleX: function () { return leftSq().size / (half() + 1); }, transformOrigin: "0% 50%" },
      { x: 0, scaleX: 1, duration: STRETCH, ease: "power2.inOut", immediateRender: false },
      0
    );
    paint.fromTo(
      paintRight,
      { x: function () { return rightSq().left - (half() - 1); }, scaleX: function () { return rightSq().size / (half() + 1); }, transformOrigin: "0% 50%" },
      { x: 0, scaleX: 1, duration: STRETCH, ease: "power2.inOut", immediateRender: false },
      0
    );

    // 2. Fill: one full-width bar takes over and grows up and down until the screen is red.
    paint.fromTo(paintBar, { opacity: 0 }, { opacity: 1, duration: 0.01 }, STRETCH);
    paint.fromTo(
      paintBar,
      {
        y: function () { return growUp(); },
        scaleY: function () { const s = leftSq().size; return s / (s + growUp() + growDown()); },
        transformOrigin: "50% 0%",
      },
      { y: 0, scaleY: 1, duration: FILL, ease: "power2.in", immediateRender: false },
      STRETCH
    );
  }

  // --- Closing text wipe-on --------------------------------------------------
  // One red rectangle wipes on over the closing heading from the left, the cream text appears on it all at
  // once, then the rectangle wipes off to the right, leaving the text on black. Plays over about a second once
  // the heading comes up the screen (not frame-by-frame with the scroll), and resets if you scroll back up.
  const finaleHeading = document.querySelector(".finale__heading");

  // Wrap every word in a span (inside the link too) so the text's exact outline can be measured.
  // The screen-reader-only text inside the link is left alone.
  function splitWords(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return node.parentElement.closest(".visually-hidden") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (node) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "finale__word";
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    return Array.prototype.slice.call(root.querySelectorAll(".finale__word"));
  }

  if (finaleHeading && !reduceMotion) {
    const words = splitWords(finaleHeading);
    const wipesBox = document.createElement("span");
    wipesBox.className = "finale__wipes";
    wipesBox.setAttribute("aria-hidden", "true");
    finaleHeading.appendChild(wipesBox);

    let wipeTl = null;
    let revealed = false;

    // One red rectangle covering the whole heading (sized to the text as it currently wraps).
    function buildWipe() {
      const box = finaleHeading.getBoundingClientRect();
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      words.forEach(function (word) {
        const r = word.getBoundingClientRect();
        left = Math.min(left, r.left - box.left);
        top = Math.min(top, r.top - box.top);
        right = Math.max(right, r.right - box.left);
        bottom = Math.max(bottom, r.bottom - box.top);
      });

      if (wipeTl) wipeTl.kill();
      wipesBox.textContent = "";
      const PAD = 0.15; // rectangle sticks out a little past the letters (in em)
      const bar = document.createElement("span");
      bar.className = "finale__wipe";
      bar.style.left = "calc(" + left + "px - " + PAD + "em)";
      bar.style.top = "calc(" + top + "px - " + PAD + "em)";
      bar.style.width = "calc(" + (right - left) + "px + " + PAD * 2 + "em)";
      bar.style.height = "calc(" + (bottom - top) + "px + " + PAD * 2 + "em)";
      wipesBox.appendChild(bar);

      // Wipe on from the left, the whole heading appears at once, wipe off to the right.
      wipeTl = gsap.timeline({ paused: true })
        .fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" })
        .set(words, { opacity: 1 })
        .to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.55, ease: "power2.inOut" }, "+=0.1");
      if (revealed) wipeTl.progress(1);
      else gsap.set(words, { opacity: 0 });
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      wipeTl.play(0);
    }
    function hide() {
      if (!revealed) return;
      revealed = false;
      wipeTl.pause(0);
      gsap.set(words, { opacity: 0 });
    }

    buildWipe();
    ScrollTrigger.create({
      trigger: finaleHeading,
      start: "top 92%", // as soon as it comes up into view
      onEnter: reveal,
      onLeaveBack: hide,
    });

    // If someone tabs to the link before the wipe has played, show the text straight away.
    finaleHeading.addEventListener("focusin", function () {
      revealed = true;
      wipeTl.progress(1);
    });

    // Lines can re-wrap when the window size changes.
    let wipeResize = null;
    window.addEventListener("resize", function () {
      clearTimeout(wipeResize);
      wipeResize = setTimeout(buildWipe, 200);
    });
  }

  // --- "Back to top" transition (bottom-left logo) -------------------------------
  // Instead of scrolling all the way back up: a panel in a random brand color wipes across left to right with
  // the BISFF logo centered in a contrasting color. With the screen covered, the page jumps straight to the top
  // and the scroll animations snap back to their starting state; then the panel wipes off to the right.
  // Each click picks a different color from the last one. Reduced motion: no transition, just jump to the top.
  const homeLink = document.querySelector(".finale__home");
  const homeWipe = document.querySelector(".home-wipe");
  const HOME_COLORS = ["cream", "red", "black"];
  let lastHomeColor = null;
  let homeBusy = false;

  function jumpToTop() {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    ScrollTrigger.update();
    // Things that normally play out over a second when you scroll back up are finished instantly instead.
    if (darkFade) darkFade.progress(0);
  }

  // Random color, never the same as the previous click.
  function pickHomeColor() {
    const choices = HOME_COLORS.filter(function (c) { return c !== lastHomeColor; });
    lastHomeColor = choices[Math.floor(Math.random() * choices.length)];
    return lastHomeColor;
  }

  if (homeLink && homeWipe && !reduceMotion) {
    const panel = homeWipe.querySelector(".home-wipe__panel");
    const logo = document.querySelector(".hero__mark svg");
    if (logo) panel.appendChild(logo.cloneNode(true));

    homeLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // keep the smooth-scroll library from also handling this link
      if (homeBusy) return;
      homeBusy = true;

      panel.classList.remove("is-cream", "is-red", "is-black");
      panel.classList.add("is-" + pickHomeColor());
      gsap.set(homeWipe, { autoAlpha: 1 });
      gsap.set(panel, { clipPath: "inset(0% 100% 0% 0%)" });

      gsap.timeline({
        onComplete: function () {
          homeBusy = false;
          gsap.set(homeWipe, { autoAlpha: 0 });
          const main = document.getElementById("main");
          if (main) main.focus({ preventScroll: true });
        },
      })
        .to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.inOut" }) // wipe in, left to right
        .add(jumpToTop, "+=0.05")
        .to(panel, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.55, ease: "power3.inOut" }, "+=0.25"); // wipe off to the right
    });
  }

  // js/strip.js rebuilds the squares when the window is resized.
  window.addEventListener("strip:built", function () {
    buildSweep();
    ScrollTrigger.refresh();
  });
})();
