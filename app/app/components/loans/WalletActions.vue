<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type { WalletId } from '~/components/wallets/types'

import { useLoansStore } from '~/components/loans/useLoansStore'

const props = defineProps<{
  walletId: WalletId
}>()

const { t } = useI18n()
const loansStore = useLoansStore()

const loanId = computed(() => loansStore.loanIdByWalletId.get(props.walletId))

const isShowLoanForm = ref(false)
const isShowLoanDeleteConfirm = ref(false)

const menuItems = computed<DropdownMenuItem[]>(() => [
  {
    icon: 'i-lucide-landmark',
    label: loanId.value ? t('loans.edit') : t('loans.add'),
    onSelect: () => isShowLoanForm.value = true,
  },
  ...(loanId.value
    ? [{
        color: 'error' as const,
        icon: 'i-lucide-trash-2',
        label: t('loans.delete'),
        onSelect: () => isShowLoanDeleteConfirm.value = true,
      }]
    : []),
])

defineExpose({
  menuItems,
})
</script>

<template>
  <UModal
    v-model:open="isShowLoanForm"
    :title="loanId ? t('loans.edit') : t('loans.add')"
    :ui="{ content: 'max-w-lg' }"
  >
    <template #body>
      <LoansForm
        :key="loanId ?? 'new'"
        :loanId
        :walletId
        @afterSave="isShowLoanForm = false"
      />
    </template>
  </UModal>

  <LayoutConfirmModal
    v-if="isShowLoanDeleteConfirm"
    :title="t('loans.delete')"
    @closed="isShowLoanDeleteConfirm = false"
    @confirm="() => loanId && loansStore.deleteLoan(loanId)"
  />
</template>
