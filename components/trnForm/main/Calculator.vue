<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import { createExpressionString } from '~/components/trnForm/utils/calculate'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  amountRaw: string
}>()

const emit = defineEmits<{
  (e: 'onChange', value: string): string
}>()

const trnFormStore = useTrnFormStore()

const buttons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

function onClick(key: string) {
  const value = createExpressionString(key, props.amountRaw)
  emit('onChange', value)
}

function getClassName(btnIdx: number, rowIdx: number, row: string[]) {
  return {
    'bg-opacity-60': btnIdx === 0 || (rowIdx === row.length - 1 && (btnIdx === 1 || btnIdx === 3)),
  }
}

const deleteBtnRef = ref<HTMLElement | null>(null)

onLongPress(
  deleteBtnRef,
  () => {
    trnFormStore.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['', '', '']
    })
  },
  { modifiers: { prevent: false } },
)
</script>

<template lang="pug">
.px-2.grid.gap-0(class="grid-cols-[auto,1fr,auto]")
  .w-20.flex.flex-col
    TrnFormMainCalculatorButton(@click="onClick('*')"): .mdi.mdi-plus.rotate-45
    TrnFormMainCalculatorButton(@click="onClick('-')"): .mdi.mdi-minus
    TrnFormMainCalculatorButton(@click="onClick('+')"): .mdi.mdi-plus
    TrnFormMainCalculatorButton(@click="onClick('/')"): .mdi.mdi-slash-forward

  .flex.flex-col
    .flex.justify-center(
      v-for="(row, rowIdx) in buttons"
      :key="rowIdx"
    )
      TrnFormMainCalculatorButton(
        v-for="(btn, btnIdx) in row"
        :key="btn"
        :class="getClassName(btnIdx, rowIdx, row)"
        @click="onClick(btn)"
      ) {{ btn }}

    .flex.justify-center
      TrnFormMainCalculatorButton(@click="onClick('.')") .
      TrnFormMainCalculatorButton(@click="onClick('0')") 0
      TrnFormMainCalculatorButton(
        ref="deleteBtnRef"
        @click="onClick('c')"
      ) c

  .w-20.grid.gap-2.justify-items-end(class="grid-rows-[auto,1fr]")
    //- Description
    TrnFormMainCalculatorButton(
      :class="{ 'text-accent-1': !!trnFormStore.values.desc }"
      @click="trnFormStore.openTrnFormModal('description')"
    ): .mdi.mdi-comment-text-outline

    //- Action
    TrnFormMainActionSide
</template>
