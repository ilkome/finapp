import type { InjectionKey } from 'vue'

type AfterDrawerClosed = (fn: () => void) => void

export const afterDrawerClosedKey: InjectionKey<AfterDrawerClosed> = Symbol('afterDrawerClosed')

// Runs `fn` once the surrounding drawer has animated out, so work that re-renders the page behind
// does not drop the exit frames. Outside a drawer (desktop popover) it runs right away.
export function useAfterDrawerClosed(): AfterDrawerClosed {
  return inject(afterDrawerClosedKey, fn => fn())
}
