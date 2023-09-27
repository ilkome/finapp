<!-- <script setup lang="ts">
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
const button = ref()

const tooltipRef = ref<HTMLElement>()
const tooltip = ref<{
  isShow: boolean
  show: any
  hide: any
  toggle: any
  update: any
  onClick: any
}>({
  isShow: false,
  show: () => {
    tooltipRef.value?.classList.remove('hidden')
    tooltip.value.update()
  },
  hide: () => tooltipRef.value?.classList.add('hidden'),
  toggle: () => {
    if (tooltipRef.value?.classList.contains('hidden')) {
      tooltip.value.show()
      return
    }
    tooltip.value.hide()
  },
  update: () => {
    if (!tooltipRef.value)
      return

    computePosition(button.value.$el, tooltipRef.value, {
      placement: 'bottom-end',
      middleware: [flip(), shift(), offset(6)],
    })
      .then(({ x, y }) => {
        if (!tooltipRef.value)
          return
        Object.assign(tooltipRef.value?.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
  },
  onClick: (f: Function) => {
    f()
    tooltip.value.hide()
  },
})

onMounted(() => tooltip.value.update())
</script>

<template lang="pug">
TrnFormMainMetaItem(
  ref="button"
  aria-describedby="tooltip"
  @click="tooltip.toggle"
)
  template(#icon)
    .mdi.mdi-menu

    .z-10.hidden.absolute.left-0.top-0.w-60.bg-foreground-main.rounded-xl.shadow-lg(
      ref="tooltipRef"
      role="tooltip"
      @click.stop=""
    )
      TrnFormMainMetaItem.py-3.px-3.gap-3(
        ref="button"
        aria-describedby="tooltip"
        @click="tooltip.onClick($trnForm.calculator.onToggle)"
      )
        template(#icon)
          .mdi.mdi-comment-text-outline
        | Toggle keyboard

      TrnFormMainMetaItem.py-3.px-3.gap-3(
        ref="button"
        aria-describedby="tooltip"
        @click="tooltip.onClick($trnForm.onClear)"
      )
        template(#icon)
          .mdi.mdi-comment-text-outline
        | Reset form
</template> -->
<script setup lang="ts">

</script>

<template lang="pug">

</template>
