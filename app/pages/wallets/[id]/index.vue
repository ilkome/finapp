<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import { calculateBestIntervalsBy } from '~/components/date/utils'
import { icons } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const router = useRouter()
const route = useRoute()
const filter = useFilter()

provide('filter', filter)
const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  walletsIds: filter?.walletsIds?.value ?? [],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statDate = useStatDate({
  initParams: {
    intervalsBy: calculateBestIntervalsBy(maxRange.value),
    isShowMaxRange: true,
    isSkipEmpty: true,
  },
  key: `finapp-${walletId.value}-${route.query.storageKey}`,
  maxRange,
  queryParams: route.query,
})

provide('statDate', statDate)

const statConfig = useStatConfig({
  props: {
    isCategoryPage: false,
    isShowEmptyCategories: true,
  },
  storageKey: walletId.value,
})
provide('statConfig', statConfig)

watch(filter.catsIds, () => {
  if (filter.catsIds.value.length > 0) {
    statConfig.config.value.isShowEmptyCategories = true
  }
  else {
    statConfig.config.value.isShowEmptyCategories = false
  }
})

const activeTab = useStorage<StatTabs>(`${walletId.value}-tab`, 'netIncome')
const storageKey = computed(() => `${walletId.value}-${activeTab.value}`)

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [1, 2],
}, {
  includesChildCategories: true,
}))

if (!wallet.value)
  router.replace('/wallets')

const total = computed(() => walletsStore.itemsWithAmount[walletId.value]?.amount ?? 0)

function onEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
}

useHead({ title: wallet.value?.name })
</script>

<template>
  <UiPage v-if="wallet">
    <div class="bg-foreground-3 sticky top-0 z-20 grid max-w-6xl gap-2 py-2 lg:px-4 xl:py-2">
      <div class="flex gap-2 px-3">
        <UiHeaderTitle class="flex items-center gap-2 !px-0">
          <Icon
            :name="icons[wallet.type]"
            :style="{ color: wallet.color }"
            class="size-6"
          />
          <div class="text-item-1 text-xl font-semibold">
            {{ wallet.name }}
          </div>
        </UiHeaderTitle>

        <div class="ml-auto flex items-center gap-2">
          <UiHeaderLink @click="onEditClick">
            <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
          </UiHeaderLink>
          <StatConfigPopover />
        </div>
      </div>

      <div class="grid gap-2 px-2">
        <div class="flex items-center gap-1 overflow-x-auto">
          <FilterSelector
            isShowCategories
          />
          <StatMenu
            :active="activeTab"
            isShowNet=""
            isShowIncome=""
            isShowSummary=""
            @click="id => activeTab = id"
          />
        </div>
        <FilterSelected
          v-if="filter.isShow?.value"
          isShowCategories
        />
      </div>
    </div>

    <div
      v-if="wallet.type !== 'credit'"
      class="md:max-w-lg"
    >
      <StatSumWallet
        :amount="total"
        :currencyCode="wallet.currency"
        :title="t('money.balance')"
      />
    </div>

    <div v-if="wallet.creditLimit" class="grid grid-cols-3 gap-1 md:max-w-lg">
      <StatSumWallet
        :amount="total"
        :currencyCode="wallet.currency"
        :title="t('wallets.form.credit.debt')"
      />
      <StatSumWallet
        :amount="wallet.creditLimit - (-total)"
        :currencyCode="wallet.currency"
        :title="t('wallets.form.credit.available')"
      />
      <StatSumWallet
        :amount="wallet.creditLimit"
        :currencyCode="wallet.currency"
        :title="t('wallets.form.credit.limit')"
      />
    </div>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItemForCategory
        :storageKey="storageKey"
        :trnsIds="trnsIds"
        hasChildren
        type="sum"
      />
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItemForCategory
        :storageKey="storageKey"
        :trnsIds="expenseTrnsIds"
        hasChildren
        type="expense"
      />

      <StatItemForCategory
        :storageKey="storageKey"
        :trnsIds="incomeTrnsIds"
        hasChildren
        type="income"
      />
    </div>
  </UiPage>
</template>
