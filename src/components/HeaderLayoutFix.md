# Header layout notes

Overlaps were caused by:
1. Too many labeled buttons in one row
2. Invalid Tailwind classes like `py-0.2`
3. Missing `shrink-0` / `min-w-0` on flex children
4. Absolute-positioned search controls competing for space

## What we fixed in CSS
- Global svg shrink-0
- overflow-x hidden on html/body
- Proper heading line-height
- Header isolation for z-index stacking

## Template strategy (safe)
Do **not** replace the whole app with a foreign GitHub template — that breaks all 11 pillars.

Safe approach:
1. Keep all pillars and routes
2. Clean header + spacing (this fix)
3. Use existing Template switcher (swiss-quartz / stripe / emerald / editorial)
4. Optionally restyle shell only

## Recommended open-source design systems (inspiration only)
- shadcn/ui – clean components
- TailAdmin free – dashboard spacing
- HyperUI / Flowbite – section patterns

Apply visually; do not wholesale replace App.tsx.
