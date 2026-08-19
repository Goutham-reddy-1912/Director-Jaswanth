ASSETS — ALAM JASWANTH PORTFOLIO
================================

Every image slot on the site falls back to a clearly marked placeholder while the
file is missing, so the site never looks broken. Drop files in with these exact
names and they appear automatically — no code changes needed.

All images live in assets/Imgs/.

IN PLACE
--------
Imgs/imgg_1.png               THE primary visual. Used twice, from one file and
                              one network request:
                                · Hero  — full figure, 2:3, uncropped, the
                                  opening shot of the film
                                · About — tight head-and-torso crop, 4:5,
                                  a deliberately different frame
                              It is preloaded in <head> so the opening
                              sequence never waits on it.

Imgs/Media.jpeg               NO LONGER USED. imgg_1.png replaced it in both
                              slots — it is a lit studio frame that matches the
                              site's palette, where Media.jpeg was a phone
                              snapshot against a bright blue mural and needed
                              heavy correction to fit. Safe to delete, or swap
                              it back by changing the two src attributes (and
                              the treatment — see the note on --native below).

A NOTE ON PNG
-------------
imgg_1.png is a photograph in a lossless format, which is the one heavy asset
on the site. Converting it to WebP (or JPG at ~85%) will usually cut it by
70-80% with no visible difference. If you do, update the two src attributes
and the <link rel="preload"> in index.html to match the new filename.

STILL TO ADD — FILM FRAMES (3:2 landscape, e.g. 1500 x 1000 px)
---------------------------------------------------------------
The Films rail uses landscape frames, so these want a film still or a wide
crop of a poster rather than a tall poster.

Imgs/poster-naa-boy-bestie.jpg   Naa Boy Bestie (YouTube web series)
Imgs/poster-faded.jpg            #FADED (45-minute independent film)
Imgs/poster-feature-01.jpg       Untitled feature film — Assistant Director
Imgs/poster-feature-02.jpg       Untitled feature film — Associate Director

For the two feature films the markup currently forces the placeholder state.
Once images exist, open index.html, find the two cards with class "film--tba"
and:
  1. remove "is-empty" from <span class="film__frame is-empty">
  2. add   <img src="assets/Imgs/poster-feature-01.jpg" alt="" loading="lazy"
                onerror="this.closest('.film__frame').classList.add('is-empty')">
     as the first child, exactly like the first two cards.

PROJECT DETAIL EXPERIENCE
-------------------------
Clicking a film opens a full-screen detail view, not a pop-up. Its text, role
list, credits and link chips live in the FILMS object in section 08 of
script.js. Everything reading "TBA" is a placeholder waiting for real
information — titles, cast, crew, years, trailer and film links. Nothing there
is invented.

Trailer, visuals and behind-the-scenes blocks are laid out as empty plates.
Replace them with <img> or <iframe> elements when the material is ready.

THE FILM-STILL TREATMENT (in style.css, under "FILM-STILL TREATMENT")
---------------------------------------------------------------------
Photos are graded by the page, not baked into the file. Drop the original
straight off the camera or phone — the stack desaturates it, crushes the
blacks, warms the skin back in, throws a projector light across it from the
upper left, sinks the background toward black with a multiply spotlight, and
lays fine emulsion grain over the top. It also racks into focus as it scrolls
into the scene, like a camera finding its mark.

This means the source file is never damaged and you can retune the look at any
time. Four variables do the aiming — they sit inline on the element in
index.html so they are easy to find:

  --focus-x / --focus-y   where the light lands. Put this on the face.
  --zoom                  how far to crop in (1 = no crop, 1.18 = current)
  --origin-y              what the zoom crops around — the face again
  --crop-y                vertical framing before the zoom

Media.jpeg is measured and set to --focus-x:44% --focus-y:21% --zoom:1.18
--origin-y:22% --crop-y:18%. Those numbers were read off the photo itself:
the face sits 45% across and 20.6% down, so the crop runs from a little above
the head to mid-thigh and the projector light lands on the face. If you swap
in a differently framed photo, nudge those numbers and reload — nothing else
needs to change.

TWO GRADES — PICK THE RIGHT ONE
-------------------------------
There are two treatments, and using the wrong one will spoil a good photo.

  .still            The rescue grade. Heavy desaturation, crushed blacks, and
                    a multiply spotlight that sinks the background toward
                    black. Built for a flat, brightly lit snapshot with a
                    distracting background. Layers: spot, tone, beam, grain,
                    gate.

  .still--native    The light touch, and what imgg_1.png uses. A whisper of
                    contrast, an edge vignette, grain, and an occasional light
                    pass — nothing else. For a frame that already arrives lit
                    and graded. Layers: grain, sweep, edge.

imgg_1.png is already a dark studio frame with a warm amber arc light that
happens to sit right on this site's accent colour. Running the rescue grade
over it would desaturate that light away and the multiply spotlight would
crush an already-dark image into mud. Hence --native.

Rule of thumb: bright, flat, busy background -> .still.
Already dark and lit with intent -> .still--native.

If you want the grade stronger or weaker, the single most useful dial is the
brightness/contrast pair in `.still > img` or `.still--native > img`.

USING IT ELSEWHERE
------------------
Three variants ship ready to use: .still--portrait (4:5), .still--wide (16:9)
and .still--banner (21:9 editorial, subject held to the right with black
negative space on the left for headlines). To drop a full-bleed banner
between two scenes, paste this straight after any </section> in index.html:

  <div class="still still--banner" data-reveal
       style="--focus-y:30%; --zoom:1.1; --origin-y:24%">
    <img src="assets/Imgs/Media.jpeg" alt="" loading="lazy" decoding="async">
    <span class="still__spot"  aria-hidden="true"></span>
    <span class="still__tone"  aria-hidden="true"></span>
    <span class="still__beam"  aria-hidden="true"></span>
    <span class="still__grain" aria-hidden="true"></span>
    <span class="still__gate"  aria-hidden="true"></span>
  </div>

The layer spans must stay in that order — they are a blend stack, so order is
the grade. Any of them can be removed for a lighter treatment; .still__spot is
the one doing the heavy lifting on busy or brightly lit backgrounds.

Note the loading screen has no photograph in it on purpose — it is the
projector throwing light before the first frame exists.

IMAGE TIPS
----------
- Export JPG at ~80% quality, or WebP for smaller files (update the filename in
  index.html if you switch format).
- Keep posters under ~300 KB and the portrait under ~250 KB so the cinematic
  loading sequence stays quick.
- All images already lazy-load below the fold.
