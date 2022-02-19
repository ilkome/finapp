<script lang="ts">
export default defineComponent({
  props: {
    trnId: { type: String, required: true },
    trnItem: { type: Object, required: true },
  },
})
</script>

<template lang="pug">
div(class="hocus:bg-neutral-800")
  .flex.space-x-4.items-center
    div(class="basis-1/12")
      Icon(
        :icon="trnItem.category.icon"
        :background="trnItem.category.color"
        big
        round
      )

    .grow
      .flex.items-center
        .grow
          //- Category
          .pb-1.leading-none.text-sm.flex.items-baseline.space-x-2
            .text-neutral-300 {{ trnItem.category.name }}
            template(v-if="trnItem.category.parentId")
              .text-xs.text-neutral-400 •
              .text-xs.text-neutral-400 {{ trnItem.categoryParent.name }}

          //- Group
          .leading-none(v-if="trnItem.groups") In group

          //- Wallet
          template(v-if="trnItem.type !== 2")
            .leading-none.text-xs.text-neutral-400 {{ trnItem.wallet.name }}

        .leading-none.text-xs.text-neutral-400 {{ trnItem.dateFormated }}

      //- Description
      .pt-2.text-neutral-500.leading-none.text-xs(
        v-if="trnItem.description"
      ) {{ trnItem.description }}

  .pt-4
    //- Amount
    template(v-if="trnItem.type !== 2")
      Amount(
        :currency="trnItem.wallet.currency"
        :type="trnItem.type"
        :value="trnItem.amount"
        isColorize
        isShowPrefix
        size="xl"
        vertical="center"
      )

    //- Transfer Amount
    template(v-if="trnItem.type === 2")
      .gap-x-3.flex.items-center
        .grow.p-3.rounded-md(
          :style="{ background: trnItem.walletFrom.color }"
        )
          div
            .gap-x-1.flex.items-baseline
              .text-2xs.text-neutral-300 {{ $t('trnForm.transfer.from') }}:

              .pb-1.leading-none.text-xs.text-neutral-300 {{ trnItem.walletFrom.name }}
            Amount(
              :currency="trnItem.wallet.currency"
              :isColorize="trnItem.type === 1"
              :type="trnItem.type"
              :value="-trnItem.amount"
              size="lg"
              vertical="left"
            )

        .mdi.mdi-chevron-right.leading-none.text-3xl.text-neutral-400

        .grow.p-3.rounded-md(
          :style="{ background: trnItem.walletTo.color }"
        )
          div
            .gap-x-1.flex.items-baseline
              .text-2xs.text-neutral-300 {{ $t('trnForm.transfer.to') }}:
              .pb-1.leading-none.text-xs.text-neutral-300 {{ trnItem.walletTo.name }}
            Amount(
              :currency="trnItem.wallet.currency"
              :isColorize="trnItem.type === 1"
              :type="trnItem.type"
              :value="trnItem.amount"
              isShowPrefix
              size="lg"
              vertical="left"
            )
</template>
