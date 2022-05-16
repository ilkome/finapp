<script setup lang="ts">
import type { TrnID } from '~/components/trns/types'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'
import useTrn from '~/components/trns/item/useTrn'

const props = defineProps<{
  trnId: TrnID
  slider: any
}>()

const { $store } = useNuxtApp()
const { setExpression } = useCalculator()
const { setFilterCatsId } = useFilter()
const { formatTrnItem } = useTrn()
const trnItem = computed(() => formatTrnItem(props.trnId))

const actions = {
  onOpenDetails: () => {
    if (!$store.state.trns.modal.show) {
      $store.commit('trns/showTrnModal')
      $store.commit('trns/setTrnModalId', trnItem.value.id)
    }
  },

  onOpenEdit: (event) => {
    event.stopPropagation()

    if (props.slider)
      props.slider.slideTo(1)

    setExpression(trnItem.value.type === 2 && trnItem.value.incomeAmount ? trnItem.value.incomeAmount : trnItem.value.amount)
    $store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId: trnItem.value.id })
    $store.commit('stat/setCategoryModal', { id: null, type: null })
  },

  onSetFilter: (event) => {
    if (props.slider)
      return

    event.stopPropagation()
    setFilterCatsId(trnItem.value.categoryId)
    $store.commit('filter/setFilterDateNow')
    $store.commit('trns/hideTrnModal')
    $store.commit('trns/setTrnModalId', null)
    $store.commit('stat/setCategoryModal', { id: null, type: null })
    if ($store.state.ui.activeTabStat !== 'trns')
      $store.dispatch('ui/setActiveTabStat', 'details')
  },
}
</script>

<template lang="pug">
.space-x-3.flex.cursor-context-menu.hocus_bg-neutral-100.dark_hocus_bg-neutral-800(
  @click="actions.onOpenDetails"
)
  .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
    :style="{ background: trnItem.category.color }"
    :class="[{ 'cursor-pointer': !slider }]"
    @click="actions.onSetFilter"
  ): div(:class="trnItem.category.icon")

  .grow
    .items-center.flex
      .grow.text-neutral-500(class="dark_text-neutral-500")
        //- Category
        .pb-1.space-x-2.items-baseline.flex.flex-wrap
          .text-sm.text-neutral-700(class="dark_text-neutral-300") {{ trnItem.category.name }}

          .text-xs.space-x-2.items-baseline.flex(v-if="trnItem.category.parentId")
            div •
            div {{ trnItem.categoryParent.name }}

        //- Group
        .text-xs.leading-none(v-if="trnItem.groups") In group

        //- Wallet
        .text-xs.leading-none(v-if="trnItem.type !== 2") {{ trnItem.wallet.name }}

        //- Transfer
        .flex.wrap.gap-4.text-xs.text-left(v-if="trnItem.type === 2")
          //- Expense
          div
            .space-x-1.items-center.flex
              div {{ $t('trnForm.transfer.from') }}:
              .text-neutral-500(class="dark_text-neutral-400") {{ trnItem.expenseWallet.name }}

            Amount2.text-base(
              :amount="trnItem.expenseAmount || trnItem.amount"
              :currency="trnItem.expenseWallet.currency"
              :type="0"
              verti
              colorize="expenses"
              @click="actions.onOpenEdit"
            )
          div
            //- Income
            .space-x-1.items-center.flex
              div {{ $t('trnForm.transfer.to') }}:
              .text-neutral-500(class="dark_text-neutral-400") {{ trnItem.incomeWallet.name }}

            Amount2.text-base(
              :amount="trnItem.incomeAmount || trnItem.amount"
              :currency="trnItem.incomeWallet.currency"
              :type="1"
              colorize="incomes"
              @click="actions.onOpenEdit"
            )

      //- Amount
      .cursor-pointer(v-if="trnItem.type !== 2")
        Amount2(
          :amount="trnItem.amount"
          :currency="trnItem.wallet.currency"
          :type="trnItem.type"
          colorize="incomes"
          @click="actions.onOpenEdit"
        )

    //- Description
    .pt-2.text-neutral-500.text-xs.leading-none(
      v-if="trnItem.description"
    ) {{ trnItem.description }}
</template>
