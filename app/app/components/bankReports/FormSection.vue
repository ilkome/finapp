<script setup lang="ts">
import type { BankReportFieldError, BankReportFieldKey, BankReportFields } from '~/components/bankReports/fields'
import type { WalletId } from '~/components/wallets/types'

import { isEmptyReport, pickWalletFields, reportErrors } from '~/components/bankReports/fields'
import { bankReportSchema } from '~/components/bankReports/types'
import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useFeature } from '~/composables/useFeatures'
import { showErrorToast } from '~/composables/useStoreSync'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const bankReportsStore = useBankReportsStore()
const walletsStore = useWalletsStore()
const isLoans = useFeature('loans')

const wallet = computed(() => walletsStore.items?.[props.walletId])
const stored = computed(() => bankReportsStore.items[props.walletId])
const errors = ref<Partial<Record<BankReportFieldKey, BankReportFieldError>>>({})

function onSave(fields: BankReportFields, close: () => void) {
  if (!wallet.value)
    return
  const report = pickWalletFields(fields, wallet.value.type)
  if (isEmptyReport(report)) {
    onClear(close)
    return
  }
  errors.value = reportErrors(report)
  if (Object.keys(errors.value).length)
    return
  const parsed = bankReportSchema.safeParse({ ...report, createdAt: stored.value?.createdAt })
  if (!parsed.success) {
    showErrorToast('bankReports.invalid')
    return
  }
  bankReportsStore.saveBankReport(props.walletId, parsed.data)
  close()
}

function onClear(close: () => void) {
  bankReportsStore.deleteBankReport(props.walletId)
  close()
}
</script>

<template>
  <UiSheet
    :title="t('bankReports.title')"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <BankReportsFormView
        v-if="wallet"
        :currencyCode="wallet.currencyCode"
        :errors
        :isCreditShown="isLoans"
        :report="stored ?? {}"
        :walletType="wallet.type"
        @clear="onClear(close)"
        @save="(fields: BankReportFields) => onSave(fields, close)"
      />
    </template>
  </UiSheet>
</template>
