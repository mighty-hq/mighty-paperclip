# Theme Structure

Centralized style/theme tokens for the MightyHQ app. All CSS custom properties (variables) are defined here and imported from `index.css`.

## Files

| File | Purpose |
|------|---------|
| `colors.css` | Brand colors, semantic colors (status), background/text/border tokens per theme |
| `shadcn.css` | shadcn/ui component tokens (HSL format for Tailwind opacity support) |
| `components.css` | Component-specific overrides grouped by type (forms, scrollbar, focus, etc.) |
| `animations.css` | Shared keyframes and animation utility classes |

## How to change the color palette

### Brand color (accent/CTA)
Edit `colors.css` and change `--brand-hue` and `--brand-sat`:
```css
--brand-hue: 217;   /* Blue (default). Try: 270 for purple, 142 for green */
--brand-sat: 91%;
```

### Dark/Light backgrounds
Edit the `:root, [data-theme="dark"]` and `[data-theme="light"]` sections in `colors.css`.

### shadcn/ui components
Edit `shadcn.css` for HSL tokens consumed by Tailwind classes like `bg-primary`, `text-muted-foreground`, etc.

## Usage in components

Reference theme tokens via CSS variables:
```tsx
<div className="bg-[var(--bg-primary)] text-[var(--text-secondary)]">
```

Or via Tailwind classes mapped in `tailwind.config.js`:
```tsx
<div className="bg-background text-muted-foreground">
```
