# BISFF Website: Boise International Short Film Festival

Website for the Boise International Short Film Festival (BISFF), run by the Boise State University Cinema Club.

## Event facts (use exactly as written)

- **Date:** November 8th, 2026
- **Time:** 5 PM
- **Location:** SPEC Theater, 1700 W University Dr, Boise, ID 83725 (Westside of the Boise State Student Union Building)
- **Cost:** Free. No tickets or registration needed; people can just come.
- **Film submissions:** CLOSED (deadline has passed). Do not promote submitting. FilmFreeway page (linked from the closing section as a place to check out the festival, not as a call to submit): https://filmfreeway.com/BoiseInternationalShortFilmFestival-1
- **Organizer:** Cinema Club Officers and faculty at Boise State University
- **Club name:** Cinema Club
- **Club email:** cinemaclub.bsu@gmail.com
- **Instagram:** @bsu.film (Cinema Club's account): https://www.instagram.com/bsu.film/

## About blurb (short, for the About section)

Boise International Short Film Festival (BISFF) is a hub for filmmakers around the globe to showcase their art. BISFF is a hub for new ideas, bold approaches, and real cinematic innovation. From newly budding filmmakers to industry heads, BISFF is a driver for bringing stories to the big screen.

## Brand

**Purpose:** BISFF exists to make filmmakers everywhere feel local, no matter how far. From film students to seasoned veterans, it is a hub for new ideas, bold approaches, and real cinematic innovation. It is not just a place to screen work; it connects filmmakers from across the globe. Boise has a swiftly growing creative economy and budding film scene, and BISFF is the crossroads bridging the community with the storytellers who fuel it. It's not just about recognizing the films. It's about the people who make them happen.

**Mission:** To recognize filmmakers who don't just think outside the box, but destroy it. Film has no borders; creativity transcends geography, and we recognize talent from all across the globe. From newly starting filmmakers to retired industry heads, we celebrate the pursuit of passion and the drive to bring ideas to the big screen.

**Vision:** To be the place you meet your next crew. We don't just display talented filmmakers, we celebrate them. Filmmaking and collaboration are synonymous. We are dedicated to fostering a space of fresh perspectives, various cultures, and bold ideas. Film shouldn't be formulaic. We aim to be a landmark of ingenuity and passion, for cinema and for humanity.

**Positioning:** BISFF isn't just a film festival. It's a place to foster human creativity. No matter the hemisphere, BISFF is an opportunity to recognize striking ideas, new perspectives, and hear stories worth sharing. *We don't just screen films. We keep the film scene alive.*

**Values:**
1. **Everyone is local.** No matter where you are from, BISFF is a community to celebrate cinema, and you're invited.
2. **Freshness over formula.** Boldness, ingenuity, and creative risks aren't just applauded, but encouraged.
3. **Inspiration, always.** BISFF is an opportunity to learn, network, and collaborate with fellow storytellers.

**Voice:** Bold, warm, inclusive, and a little defiant. Welcoming to students and veterans alike; global in outlook, rooted in Boise. Prefer short, punchy lines over corporate language. Avoid festival clichés.

## Visual identity

- **Colors** (use only these, as CSS variables):
  - Red `#ff0000`
  - Cream `#fff8e8`
  - Black `#000000`
  - **Secondary:** Yellow `#ffd84d` (accent only; use sparingly, never as the main brand color). Not used anywhere on the site yet.
- **Typeface:** Instrument Sans
  - Headings: Bold (700), **ALL CAPS** (apply with CSS `text-transform: uppercase` and keep the HTML text in normal sentence case so screen readers read it naturally)
  - Body: Regular (400), normal sentence case (never all caps)
  - Font files are in `../Branding/Typography/Instrument_Sans/` (variable and static TTFs, OFL license). Self-host them or load from Google Fonts; no other typefaces.
- **Logos:** `../Branding/Logos/` (SVG). Variants: Acronym, Horizontal, Horizontal_Multi, Vertical, each in Black / Red / White (Multi has Black / Red / White too). Always use these files as provided; never redraw, recolor, stretch, or recreate them. Pick the variant with enough contrast against its background (e.g. White on black or red, Black or Red on cream).
- Hero ideas file: `../BISFF_Web_Hero Section Ideas.ai`

## Project layout

- `Claude Code - BISFF/` (this folder): working directory for the site build
- `../Branding/`: Colors, Logos, Typography (source of truth for brand assets; copy what's needed into the site's assets folder)
- `../BISFF_Website_Repository/`: currently empty (the site's Git repository is this folder)

## Publishing

- Hosted on **Vercel** at **https://www.bisfilmfestival.com** (the www address is the main one; bisfilmfestival.com and http:// redirect to it), deployed from GitHub (push to the main branch → Vercel redeploys). Plain static site: no build command.
- `vercel.json` adds security headers, including a strict Content-Security-Policy: only files from this site may load. So: **no inline `<script>` or `style="..."` in the HTML** (put code in `js/`, styles in `css/`), and no scripts, fonts or images from other servers unless the policy is updated on purpose.
- `robots.txt`, `sitemap.xml` and the canonical link point search engines at https://www.bisfilmfestival.com/ (keep them on www); update `lastmod` in the sitemap after big content changes.
- `.vercelignore` keeps files that aren't part of the site (like this CLAUDE.md) off the live server.
- Favicon: `assets/favicon.svg` (plus `favicon-32.png` and `apple-touch-icon.png`): the logo's "B" (no square), black on red.
- The user chose **not** to add Google event listing data or social link previews (for now).

## Build guidelines

- **Goal:** inform people about the festival and fill seats on November 8th. Submissions are closed, so there is no submit call to action.
- **Audience:** Boise State students, faculty, and the Boise community who might attend, plus filmmakers and supporters who want to know about the festival. They should find the date, location, and "free, just come" within seconds.
- **Primary action:** Attend. Make date, time, location, and "Free, no tickets needed" the loudest things on the page. Secondary: follow @bsu.film on Instagram and email the club for updates.
- **Sections built so far:** Hero (color-cycling logo, sliding date bar; a "Scroll for more" hint fades in at the bottom after 7 idle seconds, js/hint.js), Blurb ("We don't just screen films." / "We keep the film scene alive." fade in, the date banner fades out, then the section pins centered for its own moment: "alive." scrolls to red, the page shifts to black, then it releases), Film strip (red squares down both edges sweeping in top to bottom on scroll, centered body text; at its end the bottom two squares stretch into a red bar that grows to paint the screen red). Event details (date, time and address fade in centered in cream, then the section pins while thin cream lines draw a rule-of-thirds grid with the text in the middle box, a cream panel wipes left to right covering the grid and details, and "Free to the public" fades in centered in red; then its letters pull into a small red square that grows to fill the screen, and a black square grows out of it until the screen is black, leading into the black closing section `.finale` (a footer-like strip, not a full screen, since the Event section above ends fully black: "Click here to check out our FilmFreeway" sits just above the corner icons and wipes on behind one red rectangle, with "here" as an underlined link that turns red on hover/focus; the acronym logo bottom-left links back to the top via a quick transition screen (a panel in a random brand color, never the same as the last click, wipes in left to right with the BISFF logo centered in a contrasting color; the page jumps to the top underneath, then the panel wipes off to the right; `.home-wipe`. Avoid full-screen color flashing here: WCAG allows at most three flashes per second), an Instagram icon bottom-right links to @bsu.film); vertical lines sit at 1/3 on large screens, 20% on medium, 10% on phones, 6% on very small phones so the text fits). Event details sits on that red: its content must sit above the `.paint` layer (z-index 3+), and text on red must be black (~5.3:1) or very large cream (~3.8:1, large text only).
- **Likely next sections:** About, Contact/Social, Footer. Confirm the page list as the design evolves.
- Mobile-first and responsive.
- Keep it simple and fast: plain HTML/CSS/JS. Agreed exceptions: **GSAP 3.13 + ScrollTrigger** for animations, saved in `assets/vendor/gsap/`, and **Lenis 1.3.4** for smooth wheel/trackpad scrolling (MIT), saved in `assets/vendor/lenis/`, driven by GSAP's ticker and off under reduced motion. Never load either from a CDN. Scroll animations live in `js/scroll.js`; they must keep working if GSAP fails to load (content shows without animation), respect `prefers-reduced-motion`, and never leave text in a low-contrast in-between state if the user stops scrolling.
- Do not invent content: no fake sponsors, awards, schedules, film lineups, prices, deadlines, or testimonials. If info is missing, use a clear placeholder and flag it.

## Accessibility (required: ADA / WCAG 2.1 AA)

Boise State is a public university, so the site should meet WCAG 2.1 Level AA (the standard used for ADA compliance on public-entity sites). Treat this as a requirement on every change, not a final polish step.

- **Contrast:** text 4.5:1 minimum, large text (24px+, or 18.66px+ bold) and UI components 3:1. Approximate ratios for the brand colors: black on cream ~19:1 (great), red on black ~5.3:1 (passes for all text), red on cream ~3.8:1 (large text and graphics ONLY, never small body text), white on red ~4:1 (large text only). Yellow `#ffd84d`: on black ~15:1 (great for any text), on red ~2.9:1 (FAILS even for large text; use only for decoration, never for text or meaningful graphics on red), on cream ~1.3:1 (FAILS; never use yellow text, icons, or borders on cream, only as a decorative fill with black text on top of it). Default body text to black on cream or cream on black.
- **Structure:** semantic HTML (`header`, `nav`, `main`, `footer`, `section`), one `h1`, logical heading order, `lang="en"`, descriptive page `<title>`, "Skip to main content" link.
- **Keyboard:** everything usable by keyboard alone, logical tab order, clearly visible focus indicator (3:1 against its background), no keyboard traps.
- **Images/logos:** meaningful `alt` text (logo: "Boise International Short Film Festival"); empty `alt=""` for purely decorative images. Any SVG logo gets a `<title>`/`role="img"` or alt on the `<img>`.
- **Links and buttons:** descriptive text (no "click here"); don't rely on color alone to show links; touch targets at least 44x44px.
- **Motion/media:** respect `prefers-reduced-motion`; no auto-playing audio; any video needs captions and no autoplay; nothing flashing more than 3 times per second.
- **Text:** use relative units (rem), support 200% zoom and 320px-wide reflow with no horizontal scrolling, no text baked into images (put event info in real text).
- **Forms (if any):** visible labels, clear error messages.
- **Verify before calling anything done:** run automated checks (axe or Lighthouse accessibility), check contrast on every color pairing used, tab through the page by keyboard, and test at 320px width and 200% zoom. Report what passed and what needs a human check (e.g., screen reader testing with VoiceOver). Automated tools only catch part of the issues, so say so honestly.

## Working agreement

- Zoe describes what she wants; build it directly without asking for approval first. The design is exploratory, so expect trial and error and iterate on feedback.
- After each build, check your own work (open it in the browser, view desktop and mobile widths, run the accessibility checks) and fix problems before reporting. Then summarize what you made and what to look at.
- Ask only when something is truly ambiguous or missing (e.g., real content). Use clearly marked placeholders instead of invented content.
- Still ask before deploying/publishing the site, sending anything on the club's behalf, or deleting files.
