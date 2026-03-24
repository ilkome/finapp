---
name: nuxt4-patterns
description: Nuxt 4 app patterns for performance, route rules, lazy loading, and data fetching. Note - Finapp runs in SPA mode (ssr false), so SSR/hydration sections are reference only.
---

# Nuxt 4 Patterns

Use when building or debugging the Nuxt 4 app. Finapp runs in SPA mode (`ssr: false`), so hydration and SSR data fetching do not apply directly - but these patterns are documented for reference if SSR is ever enabled.

## When to Activate

- Performance work around lazy loading or payload size
- Route-level rendering decisions
- Data fetching patterns
- Component organization and auto-imports
- Build optimization

## SPA Mode Notes (Finapp-Specific)

Since `ssr: false`:
- No hydration mismatches to worry about
- `useFetch` / `useAsyncData` still work but fetch only on client
- No server-side rendering of components
- All browser APIs available immediately (no `onMounted` guard needed for DOM)
- PWA with `generateSW` strategy handles offline caching

## Data Fetching

Finapp uses Convex client directly (not Nuxt's `useFetch`):

```typescript
// Stores use imperative client.query() for their own caching + offline merge
const { client, api } = useConvexClientWithApi()
const data = await client.query(api.trns.list, { userId })
```

For non-Convex API calls (e.g., exchange rates), use `$fetch`:
```typescript
const rates = await $fetch('https://api.example.com/rates', {
  query: { base: 'USD' },
})
```

## Lazy Loading and Performance

Nuxt auto-splits pages by route. Additional optimization:

```vue
<template>
  <!-- Lazy prefix dynamically imports the component -->
  <LazyStatChart v-if="showChart" :data="chartData" />

  <!-- Use v-if (not v-show) with Lazy to defer chunk loading -->
  <LazySettingsPanel v-if="settingsOpen" />
</template>
```

### When to Use Lazy
- Heavy components (charts, echarts, complex forms)
- Below-the-fold content
- Components behind user interaction (modals, drawers, settings)
- Bottom sheets that aren't visible on initial load

### When NOT to Use Lazy
- Core layout components (always visible)
- Small, lightweight components (overhead > benefit)
- Components needed for initial paint

## Component Organization

```
app/components/
  [feature]/           # Feature-grouped components
    ComponentName.vue
    useComposable.ts
    helpers.ts
    __tests__/
  ui/                  # Shared UI primitives
  layout/              # Layout components
```

Auto-imports resolve components by name. Use PascalCase:
```vue
<template>
  <!-- Auto-imported from components/stat/categories/RoundSection.vue -->
  <StatCategoriesRoundSection />
</template>
```

## Composables

```typescript
// composables/useX.ts - auto-imported
export function useWalletsList() {
  const walletsStore = useWalletsStore()
  return computed(() => Object.values(walletsStore.items))
}
```

### Rules
- Prefix with `use`
- Place in `composables/` for auto-import or co-locate with feature
- Use `shallowRef` for large objects (performance)
- Use `computed` for derived state (not `watch` + manual update)

## Pinia Store Pattern

Finapp stores use `shallowRef` for performance:

```typescript
export const useTrnsStore = defineStore('trns', () => {
  const items = shallowRef<Record<string, Trn>>({})

  function set(data: Record<string, Trn>) {
    items.value = data
    debouncedPersist()
  }

  // Trigger reactivity by replacing the whole ref
  // WRONG: items.value[id] = newTrn (won't trigger with shallowRef)
  // CORRECT: items.value = { ...items.value, [id]: newTrn }

  return { items, set }
})
```

## Build Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            echarts: ['echarts'],
          },
        },
      },
    },
  },
})
```

## Review Checklist

- Large interactive components are lazy-loaded
- `shallowRef` used for large data objects in stores
- Composables are pure and side-effect free where possible
- Auto-imports used (no manual imports for components/composables)
- No blocking operations in app initialization path
