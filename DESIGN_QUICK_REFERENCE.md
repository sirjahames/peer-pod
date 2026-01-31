# PeerPod Design System - Quick Reference

## 🎨 Color Palette

| Usage | Color | Hex | Purpose |
|-------|-------|-----|---------|
| Primary | Green | #22c55e | Growth, success, collaboration |
| Accent | Purple | #9333ea | Action, premium, creativity |
| Background | Light | #e7e9f6 | Subtle backdrop |
| Text | Dark | #171717 | Primary text |
| Border | Light | #e7e9f6 + opacity | Subtle dividers |

## 🎯 Component Classes

### Buttons
```tsx
// Primary action
<button className="btn-primary">Action</button>

// Secondary action
<button className="btn-secondary">Secondary</button>

// Subtle action
<button className="btn-ghost">Ghost</button>
```

### Cards
```tsx
// Standard card
<div className="card">Content</div>

// Interactive card
<div className="card-interactive">Content</div>
```

### Badges
```tsx
<span className="badge-success">Active</span>
<span className="badge-pending">Pending</span>
<span className="badge-neutral">Neutral</span>
```

### Status Indicators
```tsx
<span className="pulse-dot"></span>
```

### Loading States
```tsx
<div className="loading-shimmer">Loading...</div>
```

## 🎬 Animations

| Name | Duration | Use Case |
|------|----------|----------|
| fadeIn | 0.5s | Page/element entry |
| slideInLeft | 0.6s | Content from left |
| slideInRight | 0.6s | Content from right |
| pulse | 2s | Indicator animations |
| shimmer | 2s | Loading states |

## 📐 Spacing System

| Class | Value | Use |
|-------|-------|-----|
| p-6 | 1.5rem | Card padding |
| gap-4 | 1rem | Component spacing |
| mb-8 | 2rem | Section spacing |
| px-4 py-3 | 1rem / 0.75rem | Button padding |

## 📱 Responsive Sizes

| Breakpoint | Min Width | Use |
|------------|-----------|-----|
| sm | 640px | Small devices |
| md | 768px | Tablets |
| lg | 1024px | Desktops |
| xl | 1280px | Large screens |

## ✨ Animation Timings

| Type | Timing | Use |
|------|--------|-----|
| Hover | 200ms | Quick feedback |
| Entry | 300-600ms | Page transitions |
| Loading | 2000ms+ | Repeating cycles |

## 🎨 Gradient Combinations

```tsx
// Primary to accent
className="bg-gradient-to-r from-primary-600 to-accent-600"

// Brand gradient
className="bg-gradient-brand"

// Left to right flow
className="bg-gradient-to-r"

// Diagonal
className="bg-gradient-to-br"
```

## 🔄 State Styles

| State | Style | Visual Change |
|-------|-------|---------------|
| Hover | scale-105 | Button grows |
| Active | scale-95 | Button shrinks |
| Focus | outline-2 outline-offset-2 | Outline appears |
| Disabled | opacity-50 | Faded appearance |

## 📋 Typography

| Element | Classes | Size |
|---------|---------|------|
| Headings h1 | text-4xl font-bold | Large |
| Headings h2 | text-2xl font-bold | Medium |
| Headings h3 | text-xl font-semibold | Small |
| Body | text-base | Regular |
| Small | text-sm | Small text |
| Tiny | text-xs | Smallest text |

## 🎯 Common Patterns

### Page Header
```tsx
<div className="mb-12 animate-fadeIn">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
    Title
  </h1>
  <p className="text-gray-600 mt-2">Subtitle</p>
</div>
```

### Action Card
```tsx
<Link href="/" className="card-interactive animate-fadeIn">
  <h3 className="font-bold text-lg">Title</h3>
  <p className="text-sm text-gray-600 mt-2">Description</p>
  <div className="flex items-center justify-between pt-4 border-t border-light/50">
    <span className="text-sm text-gray-600">Info</span>
    <span className="text-xs font-semibold text-accent-600">Label</span>
  </div>
</Link>
```

### Status Badge
```tsx
<span className="badge-success">
  <span className="pulse-dot"></span>
  Active
</span>
```

### Empty State
```tsx
<div className="card text-center py-16 animate-fadeIn">
  <div className="text-5xl mb-4">🎯</div>
  <p className="text-gray-600 text-lg mb-2">Title</p>
  <p className="text-gray-500 mb-6">Description</p>
  <Link href="/" className="btn-primary">Action</Link>
</div>
```

## 🚀 Performance Tips

1. Use `animate-fadeIn` instead of full opacity transitions
2. Limit simultaneous animations to 2-3 elements
3. Use CSS animations over JavaScript when possible
4. Test on lower-end devices for animation performance

## 📚 Files to Reference

- `src/app/globals.css` - Global styles and animations
- `tailwind.config.ts` - Color and animation configuration
- `src/components/navigation.tsx` - Navigation component example
- `src/app/page.tsx` - Home page design example
- `src/app/login/page.tsx` - Auth page design example

---

**Last Updated**: January 31, 2026
**Version**: 1.0
**Status**: Production Ready ✨
