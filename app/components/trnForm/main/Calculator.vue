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
    delay: 300,
    distanceThreshold: 24,
  },
)
</script>

<template>
  <div
    class="
    _@sm/trnForm:bg-blue-500
    _@md/trnForm:bg-red-500
    _@lg/trnForm:bg-green-500
    _@xs/trnForm:bg-yellow-500
    grid grid-cols-[auto,1fr,auto] justify-between gap-0"
  >
    <div class="flex flex-col gap-1">
      <TrnFormMainCalculatorButton @click="onClick('*')">
        <Icon
          name="mdi:plus"
          class="rotate-45"
        />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('-')">
        <Icon name="mdi:minus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('+')">
        <Icon name="mdi:plus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="onClick('/')">
        <Icon name="mdi:slash-forward" />
      </TrnFormMainCalculatorButton>
    </div>

    <div class="flex flex-col gap-1 px-3">
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
      <TrnFormMainDescription />
      <TrnFormMainActionSide />
    </div>
  </div>
</template>
