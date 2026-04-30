# Apply

Drop these into `~/dev/the-black-box/`:

| Source (this folder)             | Destination in repo                       |
| -------------------------------- | ----------------------------------------- |
| `netlify/functions/generate.ts`  | `netlify/functions/generate.ts` (new)     |
| `src/App.tsx`                    | `src/App.tsx` (replace)                   |
| `src/components/CommandBar.tsx`  | `src/components/CommandBar.tsx` (new)     |
| `src/components/OutputCard.tsx`  | `src/components/OutputCard.tsx` (new)     |
| `src/blackout-fix.css`           | append contents into `src/index.css`      |

Then:

```bash
cd ~/dev/the-black-box
npm i @google/generative-ai @netlify/functions
# set the API key in Netlify dashboard → Site settings → Environment variables → GEMINI_API_KEY
git add -A && git commit -m "fix: blackout (root width collapse) + wire Gemini generate" && git push
```

## What's in here

**Diagnosis.** The blackout is CSS, not JS. The bundle renders the full DOM tree
correctly (verified in JSDOM, zero console errors). The cause: `body` is
`display: flex` with center alignment, and `#root` only has `height: 100%` —
no width. As a flex item with no explicit width and a child whose interior
is entirely `position: absolute`, `#root` collapses to ~0px wide. The child
`.tbb-frame { width: 100%; aspect-ratio: 16/10 }` resolves against 0 and
becomes 0×0. You see only `body`'s `#050505` background.

The fix is one CSS rule: `#root { width: 100%; min-height: 100%; }` — see
`src/blackout-fix.css`. Append it to `src/index.css` (or wherever the
`body { background: #050505 ... }` rule lives).

**Function.** `netlify/functions/generate.ts` POSTs to Gemini 1.5 Flash with
`responseMimeType: application/json` and a locked system prompt that returns
`{ headline, caption, eyebrow }`. Reads `GEMINI_API_KEY` from `process.env`.
Defensive on bad/missing prompt and bad model output.

**FIRE wiring.** `CommandBar` POSTs the prompt to `/.netlify/functions/generate`
and threads result/error/loading back up via callbacks. Loading state pulses
the FIRE button text and disables the input + button.

**OutputCard.** Now accepts `headline / caption / eyebrow` props and falls
back to the original `It works. / Every time.` static copy when none are
set. Splits a one-line generated headline into two lines on `.` or midpoint.
Errors render in the eyebrow position in red without clobbering the rest of
the card. A thin progress shimmer slides across the bottom of the card while
loading.

**App.** Owns `{ copy, loading, error, mode }` and threads them down. The
inline layout primitives (Frame, Lights, Grain, Grid, Marquee, Brand,
ModeToggle, SessionClock, Rail, FootHud) match the existing minified
bundle 1:1 — so the rest of the visual system works unchanged. If your
current `App.tsx` factors any of these into separate files, take just the
`App` function and the `useState` wiring at the bottom.

## Reconciliation notes

- I could not read `~/Desktop/THE_BLACK_BOX_v1.html` — Read tool errored
  ("outside this session's connected folders"). The component shapes here
  were reverse-engineered from the live JS bundle on Netlify. `tbb-*` class
  names, mode toggle behavior, scene/rail layout, and the default
  `It works. / Every time.` copy all match the live build exactly.
- `package.json.diff` shows the deps to add — I don't have your current
  `package.json` so the line numbers (`X,Y`) are placeholders. Just run the
  `npm i` line above; npm will update package.json itself.
- Set `GEMINI_API_KEY` in **Netlify** env vars (not just `.env` locally) or
  the function returns 500 on first call.

## Acceptance check (after push)

1. `https://the-black-box.netlify.app` — loads visibly, not black.
2. Type a prompt → click FIRE → button pulses → ~2s later card copy updates.
3. Söhne ↔ Terminal toggle still flips fonts.
4. DevTools console: clean.
