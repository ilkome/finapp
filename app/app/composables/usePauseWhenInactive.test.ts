// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { defineComponent, h, KeepAlive, nextTick, ref, watch } from 'vue'

import { usePauseWhenInactive } from './usePauseWhenInactive'

it('stops a hidden kept-alive subtree from reacting and catches it up on return', async () => {
  const source = ref(0)
  const runs = { render: 0, watch: 0 }

  const Child = defineComponent({
    setup() {
      watch(source, () => runs.watch++)
      return () => {
        runs.render++
        return h('span', source.value)
      }
    },
  })
  const Page = defineComponent({
    name: 'Page',
    setup() {
      usePauseWhenInactive()
      return () => h('div', [h(Child)])
    },
  })
  const Other = defineComponent({ render: () => h('p') })

  const isPage = ref(true)
  const wrapper = mount(() => h(KeepAlive, null, [isPage.value ? h(Page) : h(Other)]))
  source.value++
  await nextTick()
  expect(runs).toEqual({ render: 2, watch: 1 })

  isPage.value = false
  await nextTick()
  source.value++
  await nextTick()
  source.value++
  await nextTick()
  expect(runs).toEqual({ render: 2, watch: 1 })

  isPage.value = true
  await nextTick()
  await nextTick()
  expect(runs).toEqual({ render: 3, watch: 2 })
  expect(wrapper.text()).toBe('3')
})
