import type { Component } from 'vue'

// Extension points for layers built on top of this app (e.g. premium). A layer
// registers components into a named slot from a plugin; host pages render the
// slot via <ExtensionSlot name="..." />. The base app ships no extensions, so a
// slot renders nothing unless a layer fills it.

export type Extension = {
  component: Component
  // Stable id - registration is idempotent (survives HMR / plugin re-runs).
  id: string
  // Lower renders first. Native cards aren't in the registry; pick a value
  // relative to where the <ExtensionSlot> sits on the page. Default 100.
  order?: number
  // Optional extra gate, evaluated reactively. The component's own per-user
  // gating (if any) still applies on top of this.
  visible?: () => boolean
}

// Session-lifetime singleton (SPA, one client). reactive() so a registration
// that lands after a slot has mounted still updates the view.
const registry = reactive(new Map<string, Map<string, Extension>>())

export function registerExtension(slot: string, extension: Extension): void {
  if (!registry.has(slot))
    registry.set(slot, new Map())
  // Keyed by id, so registering the same extension twice is a no-op overwrite.
  registry.get(slot)!.set(extension.id, extension)
}

export function useExtensions(slot: string) {
  return computed<Extension[]>(() => {
    const bucket = registry.get(slot)
    if (!bucket)
      return []
    return [...bucket.values()]
      .filter(e => (e.visible ? e.visible() : true))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  })
}
