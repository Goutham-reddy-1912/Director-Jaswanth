ASSETS — ALAM JASWANTH PORTFOLIO
================================

The site runs on a single image and is designed to look complete on that
alone — nothing on the page is waiting on a file that doesn't exist.

IN PLACE
--------
Imgs/imgg_1.png     THE only visual asset, used twice from one file and one
                    network request:
                      · Hero  — full figure, 2:3, uncropped, the opening
                        shot of the film
                      · About — tight head-and-torso crop, 4:5, a
                        deliberately different frame
                    Preloaded in <head> so the opening sequence never
                    waits on it.

WHERE THERE IS NO PHOTO
-----------------------
Four projects are shown in "The Films" and none has a poster still. Rather
than a broken-image placeholder, each is a designed film-slate card — a
large frame number, viewfinder corner brackets, grain and the same hover
sweep a photo would get. This is the finished presentation, not a stand-in.

The Showreel section has no footage. It shows a permanent "in
post-production" state with the same play control, grain and metadata as a
working reel would have.

The project detail view (click any film) shows "Footage not yet available"
and "Not yet available" for stills/BTS rather than "add image here" —
visitor-facing copy, not a developer note.

There is no CV download and no video/audio credentials link anywhere on the
site, because neither exists — nothing points at a file that would 404.

IF MORE MATERIAL EVER TURNS UP
-------------------------------
Nothing below is required. It's here only for when/if you have the file.

  A film poster           Open index.html, find the matching <button
                          class="film__btn" ... data-film="..."> in the
                          Films rail, and replace its
                          <span class="film__frame film__frame--slate">...
                          </span> block with:
                            <span class="film__frame">
                              <img src="assets/Imgs/your-file.jpg" alt=""
                                   loading="lazy" decoding="async">
                              <span class="film__grain" aria-hidden="true"></span>
                              <span class="film__sweep" aria-hidden="true"></span>
                              <span class="film__num meta" aria-hidden="true">01</span>
                            </span>
                          Use a landscape crop (3:2 or similar) — the frame
                          is aspect-ratio:3/2.

  A showreel cut          Open index.html, inside <div id="reelStage">
                          delete the .reel__empty block and add:
                            <video class="reel__video" id="reelVideo"
                                   controls playsinline preload="none"
                                   poster="assets/Imgs/your-poster.jpg">
                              <source src="assets/video/your-file.mp4"
                                      type="video/mp4">
                            </video>
                          script.js already checks for #reelVideo — the
                          play button switches to a real control the
                          moment the element exists.

  A CV / résumé PDF       Add a link wherever it belongs (the contact CTA
                          row in index.html is the obvious spot) —
                          <a class="btn btn--ghost" href="assets/your.pdf"
                             download data-cursor="OPEN">Download CV</a>

  Real cast/crew/year     The FILMS object near the top of section 08 in
  details for a project   script.js. Every field currently reading "TBA" is
                          exactly that; nothing is invented.

THE FILM-STILL TREATMENT (in style.css, search "FILM-STILL TREATMENT")
------------------------------------------------------------------------
imgg_1.png is graded by the page, not baked into the file — the original is
never touched, so the look can be retuned any time. Four variables aim it,
set inline on the element in index.html:

  --focus-x / --focus-y   where the light lands (the face)
  --zoom                  how far to crop in (1 = no crop)
  --origin-y              what the zoom crops around (the face again)
  --crop-y                vertical framing before the zoom

imgg_1.png is measured and set to --focus-x:56% --focus-y:19-21%
--origin-y:22-24% (values differ slightly between the hero and About crops,
since each frames the same photo differently).

TWO GRADES — .still vs .still--native
--------------------------------------
  .still           The rescue grade: heavy desaturation, crushed blacks, a
                   multiply spotlight that sinks a busy background toward
                   black. For a flat, brightly lit snapshot.

  .still--native   The light touch, and what imgg_1.png uses — a whisper of
                   contrast, an edge vignette, grain, an occasional light
                   pass. For a frame that already arrives lit and graded.

imgg_1.png is a dark studio frame with a warm arc light that already sits
near this site's accent colour, so it uses --native: the rescue grade would
desaturate that light away.

Rule of thumb: bright/flat/busy background -> .still.
Already dark and lit with intent -> .still--native.

Three ready-made variants: .still--portrait (4:5), .still--wide (16:9),
.still--banner (21:9 editorial, subject held right, black space left for a
headline). The layer spans (spot/tone/beam/grain/gate, or grain/sweep/edge
for --native) must stay in that order — it's a blend stack.

IMAGE TIPS
----------
- imgg_1.png is currently the one heavy asset (lossless PNG). Converting to
  WebP, or JPG at ~85%, typically cuts 70-80% with no visible difference —
  update the two <img src> attributes and the <link rel="preload"> in
  index.html to match if you do.
- The loading screen has no photograph in it on purpose — it's the
  projector throwing light before the first frame exists.
