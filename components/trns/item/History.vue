<script lang="ts">
import { defineComponent } from '#app'
import useTrn from '~/components/trns/item/useTrn'

export default defineComponent({
  props: {
    actions: { type: Object, required: false, default: () => ({}) },
    trnId: { type: String, required: true }
  },

  setup ({ trnId, actions }) {
    const { formatTrnItem } = useTrn()
    const trnItem = formatTrnItem(trnId)
    // @ts-ignore
    const { onOpenDetails, onOpenEdit, onSetFilter } = actions(trnItem)

    return {
      trnItem,
      onOpenDetails,
      onOpenEdit,
      onSetFilter
    }
  }
})
</script>

<template lang="pug">
.space-x-3.flex(
  class="hocus:bg-neutral-100 dark:hocus:bg-neutral-800"
  @click="onOpenDetails"
)
  .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
    :style="{ background: trnItem.category.color }"
    @click="onSetFilter"
  ): div(:class="trnItem.category.icon")

  .grow
    .items-center.flex
      .text-neutral-500.grow(
        class="dark:text-neutral-400"
      )
        //- Category
        .pb-1.text-sm.space-x-2.items-baseline.flex
          .text-neutral-700(class="dark:text-neutral-300") {{ trnItem.category.name }}

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
      Amount2(
        :amount="trnItem.amount"
        :currency="trnItem.wallet.currency"
        :type="trnItem.type"
        colorize="incomes"
        @click="onOpenEdit"
      )

    //- Description
    .pt-2.text-neutral-500.text-xs.leading-none(
      v-if="trnItem.description"
    ) {{ trnItem.description }}
</template>
