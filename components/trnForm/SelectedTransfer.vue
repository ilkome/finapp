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

function changeAmount(TransferType: 'income' | 'expense', event: any) {
  $store.commit('trnForm/setTrnFormValues', {
    [`${TransferType}Amount`]: Number(event.target.value),
  })
}
</script>

<template lang="pug">
div(v-if="$store.getters['wallets/walletsSortedIds'].length > 1")
  //- isSameCurency
  template(v-if="!isSameCurency")
    .pb-8.px-4.grid.gap-6(class="grid-cols-[1fr_auto]")
      .grid.gap-6
        div
          .opacity-80.pb-1.text-xs.leading-none {{ $t('trnForm.transfer.fromLong') }}
          .overflow-hidden.rounded-xl.bg-skin-layout-main-up
            TrnFormSelectedWallet(
              :walletId="expenseWalletId"
              @click="$store.commit('trnForm/showTrnFormModal', 'transferFrom')"
            )

            input.w-full.p-3.bg-transparent.text-3xl.text-center.font-unica.text-expense.focus_bg-neutral-800(
              :value="$store.state.trnForm.values.expenseAmount"
              type="number"
              @input="event => changeAmount('expense', event)"
            )

        div
          .opacity-80.pb-2.text-xs.leading-none {{ $t('trnForm.transfer.toLong') }}
          .overflow-hidden.rounded-xl.bg-skin-layout-main-up
            TrnFormSelectedWallet(
              :walletId="incomeWalletId"
              @click="$store.commit('trnForm/showTrnFormModal', 'transferTo')"
            )

            input.w-full.p-3.bg-transparent.text-3xl.text-center.font-unica.text-income.focus_bg-neutral-800(
              :value="$store.state.trnForm.values.incomeAmount"
              type="number"
              @input="event => changeAmount('income', event)"
            )

      //- Right
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
  .relative.px-3.pb-6.grid.grid-cols-2.gap-3(v-if="isSameCurency")
    //- Transfer expense
    div(
      v-if="expenseWallet"
      @click="$store.commit('trnForm/showTrnFormModal', 'transferFrom')"
    )
      .text-xs.text-neutral-400.pb-1 {{ $t('trnForm.transfer.fromLong') }}
      TrnFormSelectedWallet(:walletId="expenseWalletId")

    .mdi.mdi-chevron-right.absolute.text-xl(
      class="top-[30px] left-1/2 -translate-x-1/2"
    )

    //- Transfer income
    .cursor-pointer(
      v-if="incomeWallet"
      @click="$store.commit('trnForm/showTrnFormModal', 'transferTo')"
    )
      .text-xs.text-neutral-400.pb-1 {{ $t('trnForm.transfer.toLong') }}
      TrnFormSelectedWallet(:walletId="incomeWalletId")
</template>
