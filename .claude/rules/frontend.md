---
paths:
  - "src/components/**"
  - "src/app/**/page.tsx"
  - "src/app/**/layout.tsx"
  - "src/hooks/**"
---

# Frontend Development Rules

## shadcn/ui First (MANDATORY)
- Before creating ANY UI component, check if shadcn/ui has it: `ls src/components/ui/`
- NEVER create custom implementations of: Button, Input, Select, Checkbox, Switch, Dialog, Modal, Alert, Toast, Table, Tabs, Card, Badge, Dropdown, Popover, Tooltip, Navigation, Sidebar, Breadcrumb
- If a shadcn component is missing, install it: `npx shadcn@latest add <name> --yes`
- Custom components are ONLY for business-specific compositions that internally use shadcn primitives

## Import Pattern
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
```

## Component Standards
- Use Tailwind CSS exclusively (no inline styles, no CSS modules)
- All components must be responsive (mobile 375px, tablet 768px, desktop 1440px)
- Implement loading states, error states, and empty states
- Use semantic HTML and ARIA labels for accessibility
- Keep components small and focused
- Use TypeScript interfaces for all props

## Auth Best Practices (Supabase)
- Use a full page navigation for post-login redirects, not `router.push`. New code uses `window.location.assign(…)`, which the React Compiler lint rules accept
- Always verify `data.session` exists before redirecting
- Always reset loading state in all code paths (success, error, finally)

## Design
- `STYLEGUIDE.md` defines tokens and components. Green is the only action color; shadcn `accent` is a cream hover surface, not an accent color
- When the user criticizes one element, change only that element

## Static Export
- Everything renders on the client: no Server Components, SSR, Server Actions or dynamic route segments. Pass IDs as query params (see `src/lib/group-routes.ts`)
- Find a feature's files in `docs/CODEMAP.md`

## Hook Patterns (React Compiler lint rules, `npm run lint` must stay at 0 errors)
| Pattern | Use for | Instead of |
|---------|---------|------------|
| Derive loading state (`loadedFor !== key`) | Data hooks keyed by group, account or activity | `setLoading(true)` in the effect body |
| Tie the result to its key | Hooks whose key changes | Resetting in the effect (`setX([])`) |
| Define the load function inside the effect | Hooks that only load from the effect | `useCallback` called in the effect |
| Start after an `await` boundary (`void (async () => { await fetchX() })()`) | Load functions also used for refetching | Calling directly in the effect body |
| Adjust state during render | Reset on open, deep-link params | Effects mirroring props to state |
| `useSyncExternalStore` | URL, localStorage (`useTheme`, `useClientValue`) | Reading in a mount effect plus `setState` |
| Mirror refs after commit | Closures such as Tiptap in `ActivityDetailSheet` | `ref.current = x` during render |
