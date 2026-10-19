<script setup lang="ts">
import type { BankReportFields } from '~/components/bankReports/fields'
import type { WalletId } from '~/components/wallets/types'

import { isEmptyReport, pickWalletFields } from '~/components/bankReports/fields'
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
const isLaptop = useIsLaptop()
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()

const wallet = computed(() => walletsStore.items?.[props.walletId])
const stored = computed(() => bankReportsStore.items[props.walletId])

function onSave(fields: BankReportFields, close: () => void) {
  if (!wallet.value)
    return
  const report = pickWalletFields(fields, wallet.value.type)
  if (isEmptyReport(report)) {
    onClear(close)
    return
  }
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
  <DefineBody v-slot="{ close }">
    <BankReportsFormView
      v-if="wallet"
      :currencyCode="wallet.currencyCode"
      :isCreditShown="isLoans"
      :report="stored ?? {}"
      :walletType="wallet.type"
      @clear="onClear(close)"
      @save="(fields: BankReportFields) => onSave(fields, close)"
    />
  </DefineBody>

  <UiModalWrap
    v-if="isLaptop"
    defaultOpen
    :title="t('bankReports.title')"
    @after:leave="emit('closed')"
  >
    <template #default="{ close }">
      <div class="px-3 lg:px-4">
        <ReuseBody :close />
      </div>
    </template>
  </UiModalWrap>

  <Drawer
    v-else
    :title="t('bankReports.title')"
    contentClass="min-h-[50dvh]"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <div class="drawer-body px-3">
        <ReuseBody :close />
      </div>
    </template>
  </Drawer>
</template>
