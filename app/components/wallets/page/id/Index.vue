<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { random, successEmo } from '~/assets/js/emo'
import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { icons } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const walletStore = useWalletsStore()
const toast = useToast()

const filter = useFilter()
provide('filter', filter)

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
provide('statConfig', statConfig)

const statDate = useStatDate({
  key: storageKey.value,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

watch(filter.categoriesIds, () => {
  statConfig.config.value.isShowEmptyCategories = filter.categoriesIds.value.length > 0
})

useHead({ title: wallet.value?.name })

onActivated(() => trnsFormStore.values.walletId = walletId.value)

const total = computed(() => walletsStore.itemsComputed[walletId.value]?.amount ?? 0)

function onClickEdit() {
  router.push(`/wallets/${walletId.value}/edit`)
}

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `This action will delete ${trnsIds.value.length} trns in this wallet`
  return undefined
})

const isShowDeleteConfirm = ref(false)
function onClickDelete(close: () => void) {
  close()
  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  console.log('onDeleteConfirm')

  const trnsIdsS: TrnId[] = JSON.parse(JSON.stringify(
    trnsStore.getStoreTrnsIds({
      walletsIds: [walletId.value],
    }),
  ))

  router.push('/wallets')
  await walletStore.deleteWallet(JSON.parse(JSON.stringify(walletId.value)), trnsIdsS)

  // Give some time to complete redirect
  setTimeout(async () => {
    toast.add({
      color: 'success',
      description: trnsIdsS?.length > 0
        ? t('wallets.form.delete.okWithTrns', { length: trnsIdsS.length, trns: t('trns.plural', trnsIdsS.length) })
        : t('wallets.form.delete.okWithoutTrns'),
      title: random(successEmo),
    })
  }, 300)
}
</script>

<template>
  <UiPage v-if="wallet">
    <StatHeader
      :config="{
        isShowCategories: true,
      }"
      :filter="{ isShowCategories: true,
      }"
    >
      <template #title>
        <UiHeaderTitle>
          <Icon
            :name="icons[wallet.type]"
            :style="{ color: wallet.color }"
            class="mt-[-2px] size-5"
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
          icon="mdi:pencil-outline"
          @click="onClickEdit"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>

        <UiHeaderLink
          icon="mdi:delete-empty-outline"
          @click="onClickDelete(close)"
        >
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @onConfirm="onDeleteConfirm"
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

      <div v-if="wallet.creditLimit" class="flex flex-wrap gap-x-8 gap-y-2 md:max-w-lg">
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

      <UiTextSm2 v-if="wallet.desc" class="pt-2">
        {{ wallet.desc }}
      </UiTextSm2>
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
