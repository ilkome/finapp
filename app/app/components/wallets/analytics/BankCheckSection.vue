<script setup lang="ts">
import { formatDateWithOptionalYear } from '~~/utils/date/civil'

import type { BankCheckRow } from '~/components/wallets/analytics/BankCheckView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { bankMismatches } from '~/components/wallets/analytics/bankCheck'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const router = useRouter()
const dateLocale = useDateLocale()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const bankReportsStore = useBankReportsStore()

const rows = computed<BankCheckRow[]>(() => {
  const wallets = walletsStore.items ?? {}
  return bankMismatches(trnsStore.items ?? {}, wallets, bankReportsStore.items, props.base.walletIds.value).map(({ diff, walletId }) => ({
    color: wallets[walletId]!.color,
    currencyCode: wallets[walletId]!.currencyCode,
    dateLabel: formatDateWithOptionalYear(bankReportsStore.items[walletId]!.balanceDate!, 'd MMM', dateLocale.value),
    diff,
    id: walletId,
    name: wallets[walletId]!.name,
  }))
})
</script>

<template>
  <section v-if="rows.length" class="grid min-w-0 content-start gap-3" data-analytics-bank-section>
    <UiTitleSection>
      {{ t('wallets.analytics.bankCheck.title') }}
    </UiTitleSection>
    <UiText variant="meta" class="px-2">
      {{ t('wallets.analytics.bankCheck.caption') }}
    </UiText>
    <WalletsAnalyticsBankCheckView :items="rows" @select="id => router.push(`/wallets/${id}`)" />
  </section>
</template>
