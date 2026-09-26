<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type { StatContextBlockId } from '~/components/stat/config/schema'
import type { TrnId } from '~/components/trns/types'

import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { useLoansStore } from '~/components/loans/useLoansStore'
import LoansWalletActions from '~/components/loans/WalletActions.vue'
import { walletBalanceItems } from '~/components/loans/walletBalanceItems'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { useStatDrilldownPage } from '~/components/stat/page/useStatDrilldownPage'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const route = useRoute('wallets-id')
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const loansStore = useLoansStore()
const { statHeader } = useStatPageHost()

const walletId = computed(() => route.params.id)
const wallet = computed(() => walletsStore.items?.[walletId.value])
const isCredit = computed(() => wallet.value?.type === 'credit')
const contextBlockIds = computed<readonly StatContextBlockId[]>(() => [
  'walletBalance',
  ...(wallet.value?.desc ? ['walletDescription' as const] : []),
  ...(isCredit.value ? ['walletLoan' as const] : []),
])
const walletDetailHistoryPattern = /^\/wallets\/[^/]+$/
const { statSnapshot, storage, storageKey, storageQuery } = useStatDrilldownPage({ id: walletId, kind: 'wallet' })

const { filter, filterTrnsIds } = useStatPageFilter({
  canFilterWallets: false,
  storage,
  storageKey,
})

const trnsIds = computed(() => filterTrnsIds({ walletsIds: [walletId.value] }))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: {
    initialConfig: statSnapshot?.config,
    storage,
    storageKey,
    storageQuery,
  },
  contextBlockIds,
  date: {
    initParams: statSnapshot?.date,
    key: storageKey,
    maxRange,
    queryParams: () => route.query,
    storage,
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
const hasLoan = computed(() => loansStore.loanIdByWalletId.has(walletId.value))
const balanceItems = computed(() => walletBalanceItems({
  creditLimit: walletCreditLimit.value,
  hasLoan: hasLoan.value,
  isCredit: isCredit.value,
  t,
  total: total.value,
}))

function onClickEdit() {
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
function onClickDelete() {
  isShowDeleteConfirm.value = true
}

const loanActions = shallowRef<InstanceType<typeof LoansWalletActions> | null>(null)

const menuItems = computed<DropdownMenuItem[][]>(() => [[
  { icon: 'i-lucide-pencil', label: t('base.edit'), onSelect: onClickEdit },
  ...(loanActions.value?.menuItems ?? []),
], [
  { color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: onClickDelete },
]])

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
      compactBottom
      :menuItems
    >
      <template #title>
        <UiHeaderTitle>
          {{ wallet.name }}
        </UiHeaderTitle>
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

    <LoansWalletActions
      v-if="isCredit"
      ref="loanActions"
      :walletId
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
          <StatSumItemView
            v-for="item in balanceItems"
            :key="item.title"
            :amount="item.amount"
            class="min-w-0 flex-1 basis-0 snap-start snap-always md:w-max md:flex-none md:basis-auto md:snap-none"
            :currencyCode="wallet.currency"
            :title="item.title"
            type="net"
            variant="summary"
          />
        </div>
      </template>

      <template #walletLoan>
        <LoansWalletSection :walletId />
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
