import type { PropType } from 'vue'

import type { StatReportContext, StatSplitContexts } from '~/components/stat/report/types'

/**
 * Renderless host for the expense / income report contexts. Mounted only while a split layout
 * is visible, so on narrow screens two of the three contexts are never built; unmounting
 * disposes their scope (watchers, dev counters) the normal Vue way.
 */
export default defineComponent({
  emits: {
    dispose: () => true,
    ready: (_split: StatSplitContexts) => true,
  },
  name: 'StatSplitContexts',
  props: {
    create: { required: true, type: Function as PropType<(type: 'expense' | 'income') => StatReportContext> },
  },
  setup(props, { emit }) {
    emit('ready', { expense: props.create('expense'), income: props.create('income') })
    onUnmounted(() => emit('dispose'))
    return () => null
  },
})
