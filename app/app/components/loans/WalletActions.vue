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
const confirm = useConfirm()

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
        onSelect: async () => {
          if (loanId.value && await confirm.ask({ title: t('loans.delete') }))
            loansStore.deleteLoan(loanId.value)
        },
      }]
    : []),
])

defineExpose({
  menuItems,
})
</script>

<template>
  <BottomSheetOrModal
    v-if="isShowLoanForm"
    :title="loanId ? t('loans.edit') : t('loans.add')"
    @closed="isShowLoanForm = false"
  >
    <template #default="{ close }">
      <LoansForm
        :key="loanId ?? 'new'"
        :loanId
        :walletId
        @afterSave="close"
      />
    </template>
  </BottomSheetOrModal>
</template>
