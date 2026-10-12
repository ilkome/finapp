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
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()
const isLaptop = useIsLaptop()
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
  <DefineBody v-slot="{ close }">
    <LoansForm
      :key="loanId ?? 'new'"
      :loanId
      :walletId
      @afterSave="close"
    />
  </DefineBody>

  <template v-if="isShowLoanForm">
    <UModal
      v-if="isLaptop"
      defaultOpen
      :title="loanId ? t('loans.edit') : t('loans.add')"
      :ui="{ content: 'max-w-lg' }"
      @after:leave="isShowLoanForm = false"
    >
      <template #body="{ close }">
        <ReuseBody :close />
      </template>
    </UModal>

    <Drawer
      v-else
      :title="loanId ? t('loans.edit') : t('loans.add')"
      contentClass="min-h-[50dvh]"
      @closed="isShowLoanForm = false"
    >
      <template #default="{ close }">
        <div class="drawer-body">
          <ReuseBody :close />
        </div>
      </template>
    </Drawer>
  </template>
</template>
