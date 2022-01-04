
<script lang="ts">
import { defineComponent } from '#app'
import useTrn from '~/components/trns/item/useTrn'

export default defineComponent({
  props: {
    actions: { type: Object, required: false, default: () => ({}) },
    trnId: { type: String, required: true }
  },

  setup ({ trnId, actions }) {
    const { formatTrnItem, formatDate } = useTrn()
    const trnItem = formatTrnItem(trnId)
    // @ts-ignore
    const { onOpenDetails, onOpenEdit, onSetFilter } = actions(trnItem)

    return {
      trnItem,
      onOpenDetails,
      onOpenEdit,
      onSetFilter,

      formatDate
    }
  }
})
</script>

<template lang="pug">
.space-x-4.flex.text-neutral-500(
  class="dark:text-neutral-400 hocus:bg-neutral-100 dark:hocus:bg-neutral-800"
  @click="onOpenDetails"
)
  .truncate.shrink-0.text-xs.leading-none(class="pt-[1px] min-w-[32px]") {{ $t(formatDate(trnItem.date, 'trnItem')) }}

  .grow
    .items-center.flex
      .grow
        .space-x-2.items-baseline.flex
          //- Wallet
          .text-xs.leading-none(v-if="trnItem.type !== 2") {{ trnItem.wallet.name }}
          //- Group
          .text-neutral-500.text-xs.leading-none(v-if="trnItem.groups") In group

        //- Transfer info
        .text-sm(v-if="trnItem.type === 2")
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
    .pt-1.text-neutral-500.text-xs(
      v-if="trnItem.description"
    ) {{ trnItem.description }}
</template>
