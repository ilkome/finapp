<script lang="ts">
import useTrn from '~/components/trns/item/useTrn'

export default defineComponent({
  props: {
    actions: { type: Object, required: false, default: () => ({}) },
    trnId: { type: String, required: true },
  },

  setup(props) {
    const { formatTrnItem, formatDate } = useTrn()
    const trnItem = computed(() => formatTrnItem(props.trnId))
    // @ts-expect-error todo
    const { onOpenDetails, onOpenEdit, onSetFilter } = props.actions(trnItem.value)

    return {
      trnItem,
      onOpenDetails,
      onOpenEdit,
      onSetFilter,

      formatDate,
    }
  },
})
</script>

<template lang="pug">
.cursor-context-menu.space-x-4.flex.text-neutral-500.dark_text-neutral-400.hocus_bg-neutral-100.dark_hocus_bg-neutral-800(
  @click="onOpenDetails"
)
  .truncate.shrink-0.text-xs.leading-none(
    class="pt-[1px] min-w-[32px]"
  ) {{ $t(formatDate(trnItem.date, 'trnItem')) }}

  .grow
    .flex
      .grow
        .space-x-2.items-baseline.flex
          //- Wallet
          .text-xs.leading-none(v-if="trnItem.type !== 2") {{ trnItem.wallet.name }}
          //- Group
          .text-neutral-500.text-xs.leading-none(v-if="trnItem.groups") In group

        //- Transfer info
        .text-sm(v-if="trnItem.type === 2")
          .space-x-1.items-center.flex
            .text-neutral-600.dark_text-neutral-500 {{ $t('trnForm.transfer.from') }}:
            .text-neutral-500.dark_text-neutral-400 {{ trnItem.walletFrom.name }}
          .space-x-1.items-center.flex
            .text-neutral-600.dark_text-neutral-500 {{ $t('trnForm.transfer.to') }}:
            .text-neutral-500.dark_text-neutral-400 {{ trnItem.walletTo.name }}

      //- Amount
      .cursor-pointer
        Amount(
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet.currency"
          :type="trnItem.type"
          colorize="income"
          @click="onOpenEdit"
        )

    //- Description
    .pt-1.text-neutral-500.text-xs(
      v-if="trnItem.desc"
    ) {{ trnItem.desc }}
</template>
