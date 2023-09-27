<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
</script>

<template lang="pug">
div
  LazyTrnFormModalCalendar(v-if="$store.state.trnForm.modal.calendar")
  LazyTrnFormModalCats(v-if="$store.state.trnForm.modal.categories")
  LazyTrnFormModalCatsChild(v-if="$store.state.trnForm.modal.categoriesChild")
  LazyTrnFormModalDescription(v-if="$store.state.trnForm.modal.description")

  //- Transaction
  LazyTrnFormModalWallets(
    v-if="$store.state.trnForm.modal.wallets"
    :title="$t('wallets.title')"
    @click="walletId => $trnForm.values.walletId = walletId"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'wallets')"
  )

  //- Transfer: expense
  LazyTrnFormModalWallets(
    v-if="$store.state.trnForm.modal.transferFrom"
    :title="$t('trnForm.transfer.fromLong')"
    @click="id => $trnForm.values.expenseWalletId = id"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'transferFrom')"
  )

  //- Transfer: income
  LazyTrnFormModalWallets(
    v-if="$store.state.trnForm.modal.transferTo"
    :title="$t('trnForm.transfer.toLong')"
    @click="id => $trnForm.values.incomeWalletId = id"
    @closed="$store.commit('trnForm/closeTrnFormModal', 'transferTo')"
  )
</template>
