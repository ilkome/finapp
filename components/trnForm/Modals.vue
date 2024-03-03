<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
</script>

<template lang="pug">
div
  CategoriesSelector(
    :isShow="$trnForm.ui.catsRootModal"
    @show="value => $trnForm.ui.catsRootModal = value"
    @onSelected="id => $trnForm.values.categoryId = id"
  )

  LazyTrnFormModalCalendar(v-if="$trnForm.modal.calendar")
  LazyTrnFormModalDescription(v-if="$trnForm.modal.description")

  //- Transaction
  LazyTrnFormModalWallets(
    v-if="$trnForm.modal.wallets"
    :title="$t('wallets.title')"
    @click="walletId => $trnForm.values.walletId = walletId"
    @closed="$trnForm.closeTrnFormModal('wallets')"
  )

  //- Transfer: expense
  LazyTrnFormModalWallets(
    v-if="$trnForm.modal.transferFrom"
    :title="$t('trnForm.transfer.fromLong')"
    @click="id => $trnForm.values.expenseWalletId = id"
    @closed="$trnForm.closeTrnFormModal('transferFrom')"
  )

  //- Transfer: income
  LazyTrnFormModalWallets(
    v-if="$trnForm.modal.transferTo"
    :title="$t('trnForm.transfer.toLong')"
    @click="id => $trnForm.values.incomeWalletId = id"
    @closed="$trnForm.closeTrnFormModal('transferTo')"
  )
</template>
