<template lang="pug">
div
  //- Transaction
  TrnFormModalWallets(
    v-if="$store.state.trnForm.modal.wallets"
    :title="$t('wallets.title')"
    @click="walletId => $store.commit('trnForm/setTrnFormValues', { walletId })"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'wallets')"
  )

  //- Transfer: expense
  TrnFormModalWallets(
    v-if="$store.state.trnForm.modal.transferFrom"
    :title="$t('trnForm.transfer.fromLong')"
    @click="walletId => $store.commit('trnForm/setTrnFormValues', { expenseWalletId: walletId })"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'transferFrom')"
  )

  //- Transfer: income
  TrnFormModalWallets(
    v-if="$store.state.trnForm.modal.transferTo"
    :title="$t('trnForm.transfer.toLong')"
    @click="walletId => $store.commit('trnForm/setTrnFormValues', { incomeWalletId: walletId })"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'transferTo')"
  )
</template>
