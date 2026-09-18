<script setup lang="ts">
import type { CalculatorKey } from '~/components/trnForm/utils/calculate'

import { useTrnFormSubmit } from '~/components/trnForm/useTrnFormSubmit'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const { isMath, isSubmittable, submit } = useTrnFormSubmit()

const buttons = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

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
  <div class="grid grid-cols-[auto_1fr_auto] justify-between gap-1">
    <div class="flex flex-col gap-1">
      <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('*')">
        <Icon
          name="mdi:plus"
          class="rotate-45"
        />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('-')">
        <Icon name="mdi:minus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('+')">
        <Icon name="mdi:plus" />
      </TrnFormMainCalculatorButton>
      <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('/')">
        <Icon name="mdi:slash-forward" />
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
          @click="() => trnsFormStore.onClickCalculator(btn as CalculatorKey)"
        >
          {{ btn }}
        </TrnFormMainCalculatorButton>
      </div>

      <div class="flex justify-center gap-1">
        <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('.')">
          .
        </TrnFormMainCalculatorButton>
        <TrnFormMainCalculatorButton @click="trnsFormStore.onClickCalculator('0')">
          0
        </TrnFormMainCalculatorButton>
        <TrnFormMainCalculatorButton ref="deleteBtnRef" @click="trnsFormStore.onClickCalculator('c')">
          c
        </TrnFormMainCalculatorButton>
      </div>
    </div>

    <div class="grid grid-rows-[1fr] gap-3">
      <button
        :aria-label="t(isMath ? 'base.apply' : 'base.save')"
        :class="cn(
          'hover:scale-1.02 flex size-full w-12 items-center justify-center rounded-sm p-1 py-4 text-center transition @xs/trnForm:w-14 @sm/trnForm:w-16',
          !isMath && isSubmittable
            ? 'bg-primary/50 text-icon-primary hover:bg-primary/80'
            : 'bg-elevated! text-highlighted hover:bg-elevated/30',
          (!isSubmittable || isMath) && 'text-muted',
        )"
        type="button"
        @click="submit"
      >
        <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
      </button>
    </div>
  </div>
</template>
