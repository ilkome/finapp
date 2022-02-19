<script lang="ts">
import useTrn from '~/components/trns/item/useTrn'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'

export default defineComponent({
  props: {
    trnId: { type: String, required: true },
  },

  setup({ trnId }) {
    const { $store } = useNuxtApp()
    const { setExpression } = useCalculator()
    const { setCategoryFilter } = useFilter()
    const { formatTrnItem } = useTrn()
    const trnItem = computed(() => formatTrnItem(trnId))

    const actions = {
      onOpenDetails: () => {
        if (!$store.state.trns.modal.show) {
          $store.commit('categories/hideCategoryModal')
          $store.commit('trns/showTrnModal')
          $store.commit('trns/setTrnModalId', trnItem.value.id)
        }
      },

      onOpenEdit: (event) => {
        event.stopPropagation()
        setExpression(trnItem.value.amount)
        $store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId: trnItem.value.id })
        $store.commit('stat/setCategoryModal', { id: null, type: null })
      },

      onSetFilter: (event) => {
        event.stopPropagation()
        setCategoryFilter(trnItem.value.categoryId)
        $store.commit('filter/setFilterDateNow')
        $store.commit('trns/hideTrnModal')
        $store.commit('trns/setTrnModalId', null)
        $store.commit('stat/setCategoryModal', { id: null, type: null })
        $store.dispatch('ui/setActiveTabStat', 'details')
      },
    }

    return {
      actions,
      trnItem,
    }
  },
})
</script>

<template lang="pug">
.space-x-3.flex.cursor-context-menu(
  class="hocus:bg-neutral-100 dark:hocus:bg-neutral-800"
  @click="actions.onOpenDetails"
)
  .cursor-pointer.text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
    :style="{ background: trnItem.category.color }"
    @click="actions.onSetFilter"
  ): div(:class="trnItem.category.icon")

  .grow
    .items-center.flex
      .grow.text-neutral-500(class="dark:text-neutral-400")
        //- Category
        .pb-1.space-x-2.items-baseline.flex
          .text-sm.text-neutral-700(class="dark:text-neutral-300") {{ trnItem.category.name }}

          .text-xs.space-x-2.items-baseline.flex(v-if="trnItem.category.parentId")
            div •
            div {{ trnItem.categoryParent.name }}

        //- Group
        .text-xs.leading-none(v-if="trnItem.groups") In group

        //- Wallet
        .text-xs.leading-none(v-if="trnItem.type !== 2") {{ trnItem.wallet.name }}

        //- Transfer info
        .text-xs(v-if="trnItem.type === 2")
          .space-x-1.items-center.flex
            .text-neutral-600(class="dark:text-neutral-500") {{ $t('trnForm.transfer.from') }}:
            .text-neutral-500(class="dark:text-neutral-400") {{ trnItem.walletFrom.name }}
          .space-x-1.items-center.flex
            .text-neutral-600(class="dark:text-neutral-500") {{ $t('trnForm.transfer.to') }}:
            .text-neutral-500(class="dark:text-neutral-400") {{ trnItem.walletTo.name }}

      //- Amount
      .cursor-pointer
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
