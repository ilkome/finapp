import { expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useAutosave } from './useAutosave'

it('saves once after a burst of edits and flushes on demand', async () => {
  vi.useFakeTimers()
  const items = ref(['a', 'b'])
  const save = vi.fn()
  const persist = useAutosave(items, save, 300)

  items.value.reverse()
  await nextTick()
  items.value.push('c')
  await nextTick()
  expect(save).not.toHaveBeenCalled()

  vi.advanceTimersByTime(300)
  expect(save).toHaveBeenCalledTimes(1)

  items.value.push('d')
  await nextTick()
  persist.flush()
  expect(save).toHaveBeenCalledTimes(2)
  vi.useRealTimers()
})
