<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useFilter } from '~/components/filter/useFilter'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { getStatNavigationSnapshot, getStatSnapshotQueryId, isStatDrilldownQuery } from '~/components/stat/navigation'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const filter = useFilter({ canFilterWallets: false })
const { statHeader } = useStatPageHost()

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])
const contextBlockIds = computed(() => wallet.value?.desc
  ? ['walletBalance', 'walletDescription'] as const
  : ['walletBalance'] as const)
const walletDetailHistoryPattern = /^\/wallets\/[^/]+$/
const statSnapshotId = getStatSnapshotQueryId(route.query.statSnapshot)
const statSnapshot = getStatNavigationSnapshot(statSnapshotId)
const isStatDrilldown = statSnapshotId !== null || isStatDrilldownQuery(route.query.statDrilldown)
const storageQuery = computed(() => isStatDrilldown ? {} : undefined)

const storageKey = computed(() => isStatDrilldown ? `stat-drilldown-wallet-${walletId.value}` : `${walletId.value}`)
const legacyTab = localStorage.getItem(`${walletId.value}-tab`)?.replaceAll('"', '')
const legacyStorageKey = computed(() => !isStatDrilldown && legacyTab ? `${walletId.value}-${legacyTab}` : undefined)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.categoriesIds.value,
  walletsIds: [walletId.value],
}))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: {
    initialConfig: statSnapshot?.config,
    legacyStorageKey,
    legacyTab,
    storage: isStatDrilldown ? sessionStorage : localStorage,
    storageKey,
    storageQuery,
  },
  contextBlockIds,
  date: {
    initParams: statSnapshot?.date,
    key: storageKey,
    legacyKey: legacyStorageKey,
    maxRange,
    queryParams: route.query,
    storage: isStatDrilldown ? sessionStorage : localStorage,
  },
  filter,
  initialTrnsViewState: statSnapshot?.trns,
})

const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))
const { hiddenPanels } = useStatPageViews({
  contentWidth,
  filter,
  range: contextRange,
  statConfig,
  trnsIds,
  walletId,
})

watch(filter.categoriesIds, () => {
  statConfig.config.value.categories.isShowEmpty = filter.categoriesIds.value.length > 0
})

useHead({ title: wallet.value?.name })

onActivated(() => trnsFormStore.values.walletId = walletId.value)

const total = computed(() => walletsStore.itemsComputed[walletId.value]?.amount ?? 0)
const walletCreditLimit = computed(() => wallet.value?.type === 'credit' ? wallet.value.creditLimit : 0)
const walletBalanceItems = computed(() => wallet.value?.type === 'credit'
  ? [
      { amount: total.value, title: t('wallets.form.credit.debt') },
      { amount: walletCreditLimit.value - (-total.value), title: t('wallets.form.credit.available') },
      { amount: walletCreditLimit.value, title: t('wallets.form.credit.limit') },
    ]
  : [{ amount: total.value, title: t('money.balance') }])

function onClickEdit(close: () => void) {
  close()
  router.push(`/wallets/${walletId.value}/edit`)
}

const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return t('wallets.form.delete.alertWithTrns')
  return undefined
})

const deleteHighlight = computed(() => {
  if (trnsIds.value.length > 0)
    return t('trns.plural', trnsIds.value.length)
  return undefined
})

const isShowDeleteConfirm = ref(false)
function onClickDelete(close: () => void) {
  close()
  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  const deleteTrnsIds: TrnId[] = [...trnsStore.getStoreTrnsIds({
    walletsIds: [walletId.value],
  })]

  router.push('/wallets')
  await walletsStore.deleteWallet(walletId.value, deleteTrnsIds)

  // Give some time to complete redirect
  setTimeout(() => {
    showSuccessToast(deleteTrnsIds.length > 0
      ? 'wallets.form.delete.okWithTrns'
      : 'wallets.form.delete.okWithoutTrns', deleteTrnsIds.length > 0
      ? { length: deleteTrnsIds.length, trns: t('trns.plural', deleteTrnsIds.length) }
      : undefined)
  }, 300)
}
</script>

<template>
  <UiPage v-if="wallet">
    <StatHeader
      ref="statHeader"
      :backSkipPattern="walletDetailHistoryPattern"
      backTo="/wallets"
    >
      <template #title>
        <UiHeaderTitle>
          {{ wallet.name }}
        </UiHeaderTitle>
      </template>

      <template #popover="{ close }">
        <UiHeaderLink
          icon="lucide:pencil"
          @click="onClickEdit(close)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>

        <UiHeaderLink
          icon="lucide:trash-2"
          @click="onClickDelete(close)"
        >
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :title="t('wallets.form.delete.title')"
      :description="deleteDescText"
      :highlight="deleteHighlight"
      @closed="isShowDeleteConfirm = false"
      @confirm="onDeleteConfirm"
    />

    <StatLayout
      :hiddenPanels
      :storageKey
      :trnsIds
      :walletId
      :reportType="statSnapshot?.reportType"
      hasChildren
    >
      <template #walletBalance>
        <div class="wallet-balance-summary -mx-2 flex snap-x snap-mandatory scroll-px-2 gap-2 overflow-x-auto px-2 md:mx-0 md:scroll-px-0 md:flex-wrap md:overflow-visible md:px-0">
          <StatSumItem
            v-for="item in walletBalanceItems"
            :key="item.title"
            :amount="item.amount"
            class="w-max flex-none snap-start snap-always md:snap-none"
            :currencyCode="wallet.currency"
            :title="item.title"
            type="net"
            variant="summary"
          />
        </div>
      </template>

      <template #walletDescription>
        <UiText
          class="px-1 font-primary whitespace-pre text-muted lg:px-0"
          variant="navigation"
        >
          {{ wallet.desc }}
        </UiText>
      </template>
    </StatLayout>
  </UiPage>
</template>

<style scoped>
.wallet-balance-summary {
  scrollbar-width: none;
}

.wallet-balance-summary::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
