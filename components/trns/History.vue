<script setup lang="ts">
import type { TrnID } from '~/components/trns/types'

type TrnType = null | 0 | 1 | 2

const props = withDefaults(defineProps<{
  hideTransfers?: boolean
  trnsIds: TrnID[]
  trnType: TrnType
}>(), {
  hideTransfers: false,
})

const emit = defineEmits(['setFilterTrnType'])

const trnsCount = computed(() => props.trnsIds.length)
const setTrnType = (value: TrnType) => emit('setFilterTrnType', value)
</script>

<template lang="pug">
div
  //- Trns: Title
  .pb-2.flex.gap-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base(class="!pb-3")
    div {{ $t('trns.inPeriodTitle') }}:
    div {{ trnsCount }}

  //- Trns: TypeSelector
  .overflow-hidden.rounded-md.scrollbar.mb-4.bg-gray-50.dark_bg-dark4.dark_shadow
    .overflow-hidden.overflow-x-auto.flex.items-center.text-sm.text-center.max-w-md
      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': props.trnType === null }"
        @click="setTrnType(null)"
      ) {{ $t('common.all') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': props.trnType === 0 }"
        @click="setTrnType(0)"
      ) {{ $t('money.expenses') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': props.trnType === 1 }"
        @click="setTrnType(1)"
      ) {{ $t('money.incomes') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        v-if="!hideTransfers"
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': trnType === 2 }"
        @click="setTrnType(2)"
      ) {{ $t('transfer.titleMany') }}

  //- Trns: Nothing
  .py-6.text-center(v-if="trnsCount === 0")
    .text-7xl.mdi.mdi-palm-tree
    .text-md No Transactions

  //- Trns: Items
  .pb-10
    .grid.md_grid-cols-2.md_gap-x-20
      TrnsListHistory(
        :size="50"
        :trnsIds="trnsIds"
        isShowFilter
      )
</template>
