<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import type { CalculatorKey } from '~/components/trnForm/utils/calculate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const trnsFormStore = useTrnsFormStore()

const buttons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

function onClick(key: CalculatorKey) {
  trnsFormStore.onClickCalculator(key)
}

const deleteBtnRef = ref<HTMLElement | null>(null)

onLongPress(
  deleteBtnRef,
  () => {
    trnsFormStore.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['', '', '']
    })
  },
  {
    delay: 1000,
    distanceThreshold: 24,
  },
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
          v-for="btn in row"
          :key="btn"
          @click="() => onClick(btn as CalculatorKey)"
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
        @click="trnsFormStore.openTrnFormModal('description')"
      >
        <i class="mdi mdi-comment-text-outline" />
        <div
          v-if="!!trnsFormStore.values.desc"
          class="bg-accent-1 absolute right-1 top-1 aspect-square w-2 rounded-full"
        />
      </TrnFormMainCalculatorButton>

      <!-- Action -->
      <TrnFormMainActionSide />
    </div>
  </div>
</template>
