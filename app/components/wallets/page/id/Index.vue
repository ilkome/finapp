<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/stat/filter/useFilter'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
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
provide(filterKey, filter)

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])

const activeTab = useStorage<StatTabSlug>(`${walletId.value}-tab`, 'summary')
const storageKey = computed(() => `${walletId.value}-${activeTab.value}`)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.categoriesIds.value,
  trnsTypes: getTypesMapping(activeTab.value),
  walletsIds: [walletId.value, ...filter?.walletsIds?.value],
}))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({
  props: {
    isShowEmptyCategories: true,
    wallets: {
      isShow: false,
    },
  },
  storageKey: storageKey.value,
})
provide(statConfigKey, statConfig)

const statDate = useStatDate({
  key: storageKey.value,
  maxRange,
  queryParams: route.query,
})
provide(statDateKey, statDate)

watch(filter.categoriesIds, () => {
  statConfig.config.value.isShowEmptyCategories = filter.categoriesIds.value.length > 0
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
      :config="{}"
      :filter="{ isShowCategories: true }"
    >
      <template #title>
        <UiHeaderTitle>
          <WalletsIcon
            :color="wallet.color"
            :name="wallet.name"
            class="mt-[-2px] mr-1"
          />
          {{ wallet.name }}
        </UiHeaderTitle>
      </template>

      <template #selected>
        <StatMenu
          :active="activeTab"
          @click="(id: StatTabSlug) => activeTab = id"
        />
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
        <StatSumItemWallet
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('money.balance')"
        />
      </div>

      <div v-if="walletCreditLimit" class="flex flex-wrap gap-x-8 gap-y-2 md:max-w-lg">
        <StatSumItemWallet
          :amount="total"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.debt')"
        />
        <StatSumItemWallet
          :amount="walletCreditLimit - (-total)"
          :currencyCode="wallet.currency"
          :title="t('wallets.form.credit.available')"
        />
        <StatSumItemWallet
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

    <StatWrap
      :activeTab
      :range="statDate.range.value"
      :storageKey
      :trnsIds
      :walletId
      hasChildren
    />
  </UiPage>
</template>
