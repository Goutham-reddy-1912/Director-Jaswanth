ASSETS — ALAM JASWANTH PORTFOLIO
================================

Every image slot on the site falls back to a clearly marked placeholder while the
file is missing, so the site never looks broken. Drop files in with these exact
names and they appear automatically — no code changes needed.

REQUIRED
--------
portrait.jpg                  Director's Note portrait. Portrait crop, 4:5
                              (e.g. 1000 x 1250 px). The photo from the resume
                              works well here.

PROJECT POSTERS (2:3 portrait, e.g. 900 x 1350 px)
--------------------------------------------------
poster-naa-boy-bestie.jpg     Naa Boy Bestie (YouTube web series)
poster-faded.jpg              #FADED (45-minute independent film)
poster-feature-01.jpg         Untitled feature film — Assistant Director
poster-feature-02.jpg         Untitled feature film — Associate Director

For the two feature films the markup currently forces the placeholder state.
Once posters exist, open index.html, find the film cards marked
"placeholder, details to be added", and:
  1. remove the class "is-empty" from <span class="film__poster is-empty">
  2. add   <img src="assets/poster-feature-01.jpg" alt="" loading="lazy"
                onerror="this.closest('.film__poster').classList.add('is-empty')">
     as the first child, exactly like the first two cards.

PROJECT DETAIL VIEW
-------------------
The text, role list, credits and link chips inside the project pop-up live in
the FILMS object near the top of section 09 in script.js. Everything currently
reading "TBA" is a placeholder waiting for real information — titles, cast,
crew, years, trailer and film links. Nothing there is invented.

Trailers, stills and behind-the-scenes photos are laid out as empty frames in
the pop-up. Replace those placeholder blocks with <img> or <iframe> elements
when the material is ready.

IMAGE TIPS
----------
- Export JPG at ~80% quality, or WebP for smaller files (update the filename in
  index.html if you switch format).
- Keep posters under ~300 KB and the portrait under ~250 KB so the cinematic
  loading sequence stays quick.
- All images already lazy-load below the fold.
