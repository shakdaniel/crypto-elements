# Contributing

Thanks for helping. Adding an icon takes about ten minutes.

## Add an icon

1. **Draw or obtain the SVG.** Drop it at `icons/chain/<id>.svg` or `icons/dex/<id>.svg`.

   Requirements, all enforced by `npm run lint:icons`:

   - square viewBox starting at `0 0` — use `0 0 32 32` unless you have a reason not to;
   - `xmlns="http://www.w3.org/2000/svg"` on the root, no `width`/`height`;
   - no `<script>`, `<image>`, `<foreignObject>`, inline `on*` handlers or external URLs;
   - no `<text>` or `font-family` — convert lettering to paths so it renders without the font;
   - artwork optically centred, filling the box the way the other icons do.

2. **Mark anything that shouldn't survive into the mono variant.**

   Mono icons are derived by swapping every fill to `currentColor`. For an icon drawn on a
   coloured badge that would produce a solid disc, so annotate the backdrop — and any detail
   that only reads as a knockout — with `data-mono="drop"`:

   ```svg
   <circle data-mono="drop" cx="16" cy="16" r="14" fill="#FF0420"/>  <!-- badge backdrop -->
   <path d="…"/>                                                      <!-- the glyph, kept -->
   <circle data-mono="drop" cx="18" cy="15" r="1.2" fill="#FF0420"/> <!-- knocked-out eye -->
   ```

   The attribute is stripped from the colour output, so it costs nothing at runtime. A test
   fails if a mono variant collapses to its backdrop, or duplicates another icon's.

3. **Register it** in `icons/registry.json`:

   ```jsonc
   {
     "id": "ORCA",                 // chains: uppercase ticker. DEXes: lowercase slug.
     "name": "Orca",
     "file": "orca.svg",
     "colors": ["#FFD15C"],        // brand colours, most significant first
     "website": "https://orca.so",
     "aliases": ["orca-so"],       // anything a user might type
     "chains": ["SOL"],            // DEX entries only
     "evmChainId": 8453,           // chain entries with an EIP-155 id
     "symbol": "SOL",              // chain entries
     "fidelity": "approximate"     // be honest — see below
   }
   ```

4. **Run the pipeline.**

   ```bash
   npm run check     # lint icons, build, test, typecheck
   npm run dev:site  # eyeball it next to the others at http://localhost:4321
   ```

5. **Add a changeset** so the release notes write themselves:

   ```bash
   npx changeset      # "minor" for new icons, "patch" for artwork fixes
   ```

Never edit `packages/*/src/generated.*` or anything in `build/` — they are regenerated from
`icons/` on every build and are not committed.

## The `fidelity` field

Say what the artwork actually is:

- `official-geometry` — geometry matches the brand's published mark.
- `approximate` — your own interpretation in the brand's colours.

Marking an approximation as official is the one thing that will get a PR closed. The site
shows an `approx` badge, and downstream users filter on this field.

## Contributing an official asset

If you work for one of these brands, or the brand publishes assets under terms that allow
redistribution: please open a PR replacing the approximation, flip `fidelity` to
`official-geometry`, and say in the PR description where the asset came from and under what
terms. Those are the most valuable PRs this project can get.

If you own a mark and want it removed, see [TRADEMARKS.md](TRADEMARKS.md) — we act on
takedowns without argument.

## Code style

- Two spaces, no semicolons in TypeScript, single quotes.
- Keep `@crypto-elements/core` dependency-free. That's the point of it.
- Public API changes need a test in `test/` and a note in the README.
