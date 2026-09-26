import type { ComponentInternalInstance, EffectScope, VNode } from 'vue'

import { getCurrentInstance, isVNode, onActivated, onDeactivated } from 'vue'

/**
 * A page cached by KeepAlive stays subscribed while hidden, so every store change re-renders and
 * re-runs the watchers of pages nobody sees. Pauses the page's whole subtree while it is hidden:
 * component scopes are detached from their parent's, so pausing only the page root would leave
 * its children running. Effects that went dirty while paused run once on resume.
 */
export function usePauseWhenInactive(): void {
  const instance = getCurrentInstance()
  if (!instance)
    return
  onDeactivated(() => eachScope(instance, scope => scope.pause()))
  onActivated(() => eachScope(instance, scope => scope.resume()))
}

// `scope` is real on every instance but typed @internal.
type Instance = ComponentInternalInstance & { scope: EffectScope }

function eachScope(instance: ComponentInternalInstance, fn: (scope: EffectScope) => void): void {
  fn((instance as Instance).scope)
  eachVNodeScope(instance.subTree, fn)
}

function eachVNodeScope(vnode: VNode | null | undefined, fn: (scope: EffectScope) => void): void {
  if (!vnode)
    return
  if (vnode.component)
    return eachScope(vnode.component, fn)
  if (vnode.suspense)
    return eachVNodeScope(vnode.suspense.activeBranch, fn)
  if (Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (isVNode(child))
        eachVNodeScope(child, fn)
    }
  }
}
