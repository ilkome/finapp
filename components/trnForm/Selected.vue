<template lang="pug">
.px-2.pb-6.grid.grid-cols-2.gap-3(
  v-show="$store.state.trnForm.values.amountType !== 2"
)
  TrnFormSelectedWallet(
    :walletId="$store.state.trnForm.values.walletId"
    @click="$store.commit('trnForm/showTrnFormModal', 'wallets')"
  )

  TrnFormSelectedCategory
</template>
