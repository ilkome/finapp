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
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const router = useRouter()
const route = useRoute()
const filter = useFilter()
const trnsFormStore = useTrnsFormStore()

provide('filter', filter)
const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  walletsIds: [walletId.value, ...filter?.walletsIds?.value],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statDate = useStatDate({
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

watch(filter.categoriesIds, () => {
  if (filter.categoriesIds.value.length > 0) {
    statConfig.config.value.isShowEmptyCategories = true
  }
  else {
    statConfig.config.value.isShowEmptyCategories = false
  }
})

onMounted(() => {
  trnsFormStore.values.walletId = walletId.value
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

// if (!wallet.value) {
//   router.replace('/wallets')
// }

const total = computed(() => walletsStore.itemsWithAmount[walletId.value]?.amount ?? 0)

function onEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
}

useHead({ title: wallet.value?.name })
</script>

<template>
  <UiPage v-if="wallet">
    <StatHeader>
      <template #title>
        <UiHeaderTitle class="flex items-center gap-2 !px-0 !pl-2">
          <Icon
            :name="icons[wallet.type]"
            :style="{ color: wallet.color }"
            class="size-6"
          />
          <div class="text-item-1 text-xl font-semibold">
            {{ wallet.name }}
          </div>
        </UiHeaderTitle>
      </template>

      <template #actions>
        <UiHeaderLink @click="onEditClick">
          <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
        </UiHeaderLink>
        <StatConfigPopover />
      </template>

      <template #filterSelector>
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
      </template>

      <template #filterSelected>
        <FilterSelected
          v-if="filter.isShow?.value"
          isShowCategories
        />
      </template>
    </StatHeader>

    <div class="statWrapTotals">
      <div
        v-if="wallet.type !== 'credit'"
        class="pt-2 md:max-w-lg"
      >
        <StatSumItemWallet
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('money.balance')"
        />
      </div>

      <div v-if="wallet.creditLimit" class="flex flex-wrap gap-x-8 gap-y-2 pt-2 md:max-w-lg">
        <StatSumItemWallet
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.debt')"
        />
        <StatSumItemWallet
          :amount="wallet.creditLimit - (-total)"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.available')"
        />
        <StatSumItemWallet
          :amount="wallet.creditLimit"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.limit')"
        />
      </div>
    </div>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="statWrapNetIncome"
    >
      <StatItem
        :storageKey="storageKey"
        :trnsIds="trnsIds"
        :walletId
        hasChildren
        type="sum"
      />
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey="storageKey"
        :trnsIds="expenseTrnsIds"
        :walletId
        hasChildren
        type="expense"
      />

      <StatItem
        :storageKey="storageKey"
        :trnsIds="incomeTrnsIds"
        :walletId
        hasChildren
        type="income"
      />
    </div>
  </UiPage>
</template>
