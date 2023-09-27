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

const $trnForm = useTrnFormStore()

const buttons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

// ['*', '7', '8', '9'],
//   ['+', '4', '5', '6'],
//   ['-', '1', '2', '3'],
//   ['/', '.', '0', 'c'],

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
    $trnForm.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['0', '0', '0']
    })
  },
  { modifiers: { prevent: false } },
)
</script>

<template lang="pug">
.px-2.grid.gap-0(class="grid-cols-[auto,1fr,auto]")
  .w-20.flex.flex-col.gap-2
    TrnFormMainCalculatorButton(@click="onClick('*')"): .mdi.mdi-plus.rotate-45
    TrnFormMainCalculatorButton(@click="onClick('-')"): .mdi.mdi-minus
    TrnFormMainCalculatorButton(@click="onClick('+')"): .mdi.mdi-plus
    TrnFormMainCalculatorButton(@click="onClick('/')"): .mdi.mdi-slash-forward

  .flex.flex-col.gap-2
    .flex.gap-2.justify-center(
      v-for="(row, rowIdx) in buttons"
      :key="rowIdx"
    )
      TrnFormMainCalculatorButton(
        v-for="(btn, btnIdx) in row"
        :key="btn"
        :class="getClassName(btnIdx, rowIdx, row)"
        @click="onClick(btn)"
      ) {{ btn }}

    .flex.gap-2.justify-center
      TrnFormMainCalculatorButton(@click="onClick('.')") .
      TrnFormMainCalculatorButton(@click="onClick('0')") 0
      TrnFormMainCalculatorButton(
        ref="deleteBtnRef"
        @click="onClick('c')"
      ) c

  .w-20.grid.gap-2.justify-items-end(class="grid-rows-[auto,1fr]")
    //- Description
    TrnFormMainCalculatorButton(
      @click="$store.commit('trnForm/showTrnFormModal', 'description')"
    ): .mdi.mdi-comment-text-outline

    //- Action
    TrnFormMainActionSide
</template>
