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
  { delay: 300, modifiers: { prevent: false } },
)
</script>

<template>
  <div class="grid grid-cols-[.26fr,1fr,.26fr] justify-between gap-0">
    <div class="flex flex-col gap-1">
      <TrnFormMainCalculatorButton @click="onClick('*')">
        <i class="mdi mdi-plus rotate-45" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('-')">
        <i class="mdi mdi-minus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('+')">
        <i class="mdi mdi-plus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('/')">
        <i class="mdi mdi-slash-forward" />
      </TrnFormMainCalculatorButton>
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-for="(row, rowIdx) in buttons"
        :key="rowIdx"
        class="flex justify-center gap-1"
      >
        <TrnFormMainCalculatorButton
          v-for="(btn, btnIdx) in row"
          :key="btn"
          :class="getClassName(btnIdx, rowIdx, row)"
          @click="onClick(btn)"
        >
          {{ btn }}
        </TrnFormMainCalculatorButton>
      </div>

      <div class="flex justify-center gap-1">
        <TrnFormMainCalculatorButton @click="onClick('.')">
          .
        </TrnFormMainCalculatorButton>
        <TrnFormMainCalculatorButton @click="onClick('0')">
          0
        </TrnFormMainCalculatorButton>
        <TrnFormMainCalculatorButton ref="deleteBtnRef" @click="onClick('c')">
          c
        </TrnFormMainCalculatorButton>
      </div>
    </div>

    <div class="grid grid-rows-[auto,1fr] gap-3">
      <!-- Description -->
      <TrnFormMainCalculatorButton
        class="relative"
        @click="trnFormStore.openTrnFormModal('description')"
      >
        <i class="mdi mdi-comment-text-outline" />
        <div
          v-if="!!trnFormStore.values.desc"
          class="bg-accent-1 absolute right-1 top-1 aspect-square w-2 rounded-full"
        />
      </TrnFormMainCalculatorButton>

      <!-- Action -->
      <TrnFormMainActionSide />
    </div>
  </div>
</template>
