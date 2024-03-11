<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
</script>

<template lang="pug">
div
  //- Categories
  CategoriesSelector(
    :isShow="$trnForm.ui.catsRootModal"
    @onClose="$trnForm.ui.catsRootModal = false"
    @onSelected="id => $trnForm.values.categoryId = id"
  )

  LazyTrnFormModalCalendar(v-if="$trnForm.modal.calendar")
  LazyTrnFormModalDescription(v-if="$trnForm.modal.description")

  //- Transaction
  WalletsSelector(
    v-if="$trnForm.modal.wallets"
    :title="$t('wallets.title')"
    @onSelected="walletId => $trnForm.values.walletId = walletId"
    @onClose="$trnForm.closeTrnFormModal('wallets')"
  )

  //- Transfer: expense
  WalletsSelector(
    v-if="$trnForm.modal.transferFrom"
    :title="$t('trnForm.transfer.fromLong')"
    @onClose="$trnForm.closeTrnFormModal('transferFrom')"
    @onSelected="id => $trnForm.values.expenseWalletId = id"
  )

  //- Transfer: income
  WalletsSelector(
    v-if="$trnForm.modal.transferTo"
    :title="$t('trnForm.transfer.toLong')"
    @onClose="$trnForm.closeTrnFormModal('transferTo')"
    @onSelected="id => $trnForm.values.incomeWalletId = id"
  )
</template>
