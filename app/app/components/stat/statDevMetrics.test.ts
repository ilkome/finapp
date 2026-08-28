import { describe, expect, it } from 'vitest'
import { computed, nextTick, ref, watchEffect } from 'vue'

import { deferStatDevMetricsUpdate } from '~/components/stat/statDevMetrics'

describe('deferStatDevMetricsUpdate', () => {
  it('does not invalidate the computed value being measured', async () => {
    const metric = ref(0)
    const source = ref('all')
    let evaluationCount = 0
    const measured = computed(() => {
      evaluationCount++
      deferStatDevMetricsUpdate(() => {
        metric.value++
      })
      return source.value
    })
    const stop = watchEffect(() => {
      void metric.value
      void measured.value
    })

    await Promise.resolve()
    await nextTick()
    expect(evaluationCount).toBe(1)
    expect(metric.value).toBe(1)

    source.value = 'home'
    await nextTick()
    await Promise.resolve()
    await nextTick()
    expect(evaluationCount).toBe(2)
    expect(metric.value).toBe(2)

    stop()
  })
})
