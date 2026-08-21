<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useFilter } from '~/components/filter/useFilter'
import { getStatNavigationSnapshot, getStatSnapshotQueryId, isStatDrilldownQuery } from '~/components/stat/navigation'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
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
const filter = useFilter()
const { statHeader } = useStatPageHost()

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])
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

const { statConfig } = useStatPageProviders({
  config: {
    initialConfig: statSnapshot?.config,
    storageQuery,
    legacyStorageKey,
    legacyTab,
    props: {
      categories: {
        isShowEmpty: true,
      },
      wallets: {
        isShow: false,
      },
    },
    storage: isStatDrilldown ? sessionStorage : localStorage,
    storageKey,
  },
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

watch(filter.categoriesIds, () => {
  statConfig.config.value.categories.isShowEmpty = filter.categoriesIds.value.length > 0
})

useHead({ title: wallet.value?.name })

onActivated(() => trnsFormStore.values.walletId = walletId.value)

const total = computed(() => walletsStore.itemsComputed[walletId.value]?.amount ?? 0)
const walletCreditLimit = computed(() => wallet.value?.type === 'credit' ? wallet.value.creditLimit : 0)

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
      :trnsIds
      configCategories
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

    <div class="px-3 pb-2 lg:gap-8 lg:px-4 2xl:px-8">
      <div
        v-if="wallet.type !== 'credit'"
        class="md:max-w-lg"
      >
        <WalletsSumItem
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('money.balance')"
        />
      </div>

      <div v-if="walletCreditLimit" class="flex flex-wrap gap-x-8 gap-y-2 md:max-w-lg">
        <WalletsSumItem
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.debt')"
        />
        <WalletsSumItem
          :amount="walletCreditLimit - (-total)"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.available')"
        />
        <WalletsSumItem
          :amount="walletCreditLimit"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.limit')"
        />
      </div>

      <UiTextMuted
        v-if="wallet.desc"
        size="sm"
        class="pt-2 whitespace-pre"
      >
        {{ wallet.desc }}
      </UiTextMuted>
    </div>

    <StatLayout
      :storageKey
      :trnsIds
      :walletId
      :reportType="statSnapshot?.reportType"
      hasChildren
    />
  </UiPage>
</template>
