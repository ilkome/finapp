<script setup lang="ts">
const { $store } = useNuxtApp()

// Expense
const expenseWalletId = computed(() => {
  const expenseWalletId = $store.state.trnForm.values.expenseWalletId
  const walletFromId = $store.state.trnForm.values.walletFromId
  const firstWalletId = $store.getters['wallets/walletsSortedIds'][0]
  return expenseWalletId || walletFromId || firstWalletId
})
const expenseWallet = computed(() => $store.state.wallets.items[expenseWalletId.value])
const expenseWalletTotal = computed(() => $store.getters['wallets/walletsTotal'][expenseWalletId.value].base)

// Income
const incomeWalletId = computed(() => {
  const incomeWalletId = $store.state.trnForm.values.incomeWalletId
  const walletToId = $store.state.trnForm.values.walletToId
  const secondWalletId = $store.getters['wallets/walletsSortedIds'][1]
  return incomeWalletId || walletToId || secondWalletId
})
const incomeWallet = computed(() => $store.state.wallets.items[incomeWalletId.value])
const incomeWalletTotal = computed(() => $store.getters['wallets/walletsTotal'][incomeWalletId.value].base)

if ($store.state.trnForm.values.amountType === 2) {
  $store.commit('trnForm/setTrnFormValues', {
    expenseWalletId: expenseWalletId.value,
    incomeWalletId: incomeWalletId.value,
  })
}

const isSameCurency = computed(() => incomeWallet.value?.currency === expenseWallet.value?.currency)

function changeAmount(tranferType: 'income' | 'expense', event: any) {
  $store.commit('trnForm/setTrnFormValues', {
    [`${tranferType}Amount`]: Number(event.target.value),
  })
}

</script>

<template lang="pug">
div(v-if="$store.getters['wallets/walletsSortedIds'].length > 1")
  //- isSameCurency
  template(v-if="!isSameCurency")
    .pb-8.px-4.grid.gap-6(class="grid-cols-[1fr_auto]")
      .grid.gap-4
        div
          .opacity-80.pb-1.text-xs.leading-none {{ $t('trnForm.transfer.fromLong') }}
          .overflow-hidden.rounded-xl.bg-custom4
            .flex.items-center.gap-4.py-4.px-4.hocus_bg-gray-100.dark_hocus_bg-neutral-800.rounded-xl(
              @click="$store.commit('trnForm/showTrnFormModal', 'transferFrom')"
            )
              .rounded-full.w-8.h-8.flex-center.text-xs.text-neutral-50(
                :style="{ background: expenseWallet.color }"
              ) {{ expenseWallet.currency }}

              .grow.text-neutral-300
                .text-base.leading-none {{ expenseWallet.name }}
                Amount(
                  :currency="expenseWallet.currency"
                  :showBase="showBase"
                  :size="size"
                  :value="expenseWalletTotal"
                  vertical="left"
                  alwaysShowSymbol
                )

              .mdi.mdi-dots-vertical.text-xl.leading-none

            input.w-full.p-3.bg-transparent.text-3xl.text-center.font-unica.text-expense.focus_bg-neutral-800(
              :value="$store.state.trnForm.values.expenseAmount"
              type="number"
              @input="event => changeAmount('expense', event)"
            )

        div
          .opacity-80.pb-2.text-xs.leading-none {{ $t('trnForm.transfer.toLong') }}
          .overflow-hidden.rounded-xl.bg-custom4
            .flex.items-center.gap-4.py-4.px-4.hocus_bg-gray-100.dark_hocus_bg-neutral-800.rounded-xl(
              @click="$store.commit('trnForm/showTrnFormModal', 'transferTo')"
            )
              .rounded-full.w-8.h-8.flex-center.text-xs.text-neutral-50(
                :style="{ background: incomeWallet.color }"
              ) {{ incomeWallet.currency }}

              .grow.text-neutral-300
                .text-base.leading-none {{ incomeWallet.name }}
                Amount(
                  :currency="incomeWallet.currency"
                  :showBase="showBase"
                  :size="size"
                  :value="incomeWalletTotal"
                  vertical="left"
                  alwaysShowSymbol
                )

              .mdi.mdi-dots-vertical.text-xl.leading-none

            input.w-full.p-3.bg-transparent.text-3xl.text-center.font-unica.text-income.focus_bg-neutral-800(
              :value="$store.state.trnForm.values.incomeAmount"
              type="number"
              @input="event => changeAmount('income', event)"
            )

      .grid.gap-2(class="grid-rows-[auto,1fr]")
        .p-3.text-center.rounded-full.opacity-80.hocus_bg-neutral-700(
          :class="['h-[58px]', { 'text-blue1': $store.state.trnForm.values.description }]"
          @click="$store.commit('trnForm/showTrnFormModal', 'description')"
        )
          .mdi.mdi-comment-text-outline.text-2xl

        .cursor-pointer.flex.items-center.justify-center.h-full.bg-blue3.hocus_bg_blue2.rounded-md.text-white.text-3xl(
          class="w-[58px]"
          @click="$emit('onSubmit')"
        )
          .mdi.mdi-equal

  //- Same
  .relative.trnFormHeader(v-if="isSameCurency")
    //- Wallet from
    template(v-if="expenseWallet")
      .trnFormHeaderItem
        .text-xs.text-neutral-400.pb-1 {{ $t('trnForm.transfer.fromLong') }}
        WalletsItemWalletItem(
          :id="expenseWalletId"
          :showBase="false"
          isAltColor
          ui="tile"
          @onClick="$store.commit('trnForm/showTrnFormModal', 'transferFrom')"
        )

    .trnFormHeaderSeparator: .mdi.mdi-chevron-right

    //- Wallet to
    template(v-if="incomeWallet")
      .trnFormHeaderItem
        .text-xs.text-neutral-400.pb-1 {{ $t('trnForm.transfer.toLong') }}
        WalletsItemWalletItem(
          :id="incomeWalletId"
          :showBase="false"
          isAltColor
          ui="tile"
          @onClick="$store.commit('trnForm/showTrnFormModal', 'transferTo')"
        )
</template>

<style lang="stylus" scoped>
.trnFormHeaderSeparator
  z-index 2
  position absolute
  top 28px
  left 50%
  color var(--c-font-3)
  font-size 32px
  transform translate(-50%)
</style>
