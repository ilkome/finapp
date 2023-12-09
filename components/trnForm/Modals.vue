<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { CategoryId } from '~/components/categories/types'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()
const { height } = useWindowSize()

function onSelected(id: CategoryId) {
  $trnForm.values.categoryId = id
}
</script>

<template lang="pug">
div
  CategoriesSelector(
    :isShow="$trnForm.ui.catsRootModal"
    @show="value => $trnForm.ui.catsRootModal = value"
    @onSelected="onSelected"
  )

  LazyTrnFormModalCalendar(v-if="$store.state.trnForm.modal.calendar")
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
