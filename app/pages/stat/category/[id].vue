<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const categoriesStore = useCategoriesStore()
const filter = useFilter()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

provide('filter', filter)

onMounted(() => {
  if (route.query.walletsIds) {
    const walletsIds: WalletId[] = Array.isArray(route.query.walletsIds)
      ? route.query.walletsIds
      : [route.query.walletsIds]

    filter.setWallets(walletsIds)
  }
})

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({ categoriesIds: categoriesIdsOrParent.value }))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statDate = useStatDate({
  key: `finapp-${categoryId.value}-stat`,
  maxRange,
  queryParams: route.query,
})

provide('statDate', statDate)

const statConfig = useStatConfig({
  props: {
    isShowEmptyCategories: false,
  },
  storageKey: categoryId.value,
})
provide('statConfig', statConfig)

const category = computed(() => categoriesStore.items[categoryId.value])
const backLink = computed(() => `/dashboard`)

useHead({ title: category.value?.name })

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = walletsStore.sortedIds.slice(0, statConfig.config.value.showedWallets)
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <UiPage v-if="category">
    <div class="bg-foreground-3 sticky top-0 z-20 grid max-w-6xl gap-2 pb-2 lg:px-4 xl:py-2">
      <RouterLink
        v-slot="{ href, navigate }"
        :to="backLink"
        custom
      >
        <a
          :href="href"
          class="hocus:bg-item-5 grow cursor-default overflow-hidden rounded-lg px-2"
          @click="navigate"
        >
          <CategoriesHeader
            :category="category"
            :parentCategory="categoriesStore.items[category.parentId]"
          />
        </a>
      </RouterLink>

      <div class="_pt-2 grid gap-2 px-2">
        <div class="flex items-center gap-1 overflow-x-auto ">
          <FilterSelector
            isShowWallets
          />
          <!-- <StatMenu
            :active="activeTab"
            @click="id => activeTab = id"
          /> -->

          <div class="ml-auto flex gap-3">
            <template v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)">
              <UiHeaderLink @click="router.push(`/categories/${categoryId}/edit`)">
                <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
              </UiHeaderLink>
            </template>
            <StatConfigPopover isShowWallets />
          </div>
        </div>

        <FilterSelected
          v-if="filter.isShow?.value && filter.catsIds.value.length > 0"
          isShowCategories
          isShowWallets
        />
      </div>
    </div>

    <div class="max-w-6xl gap-2 pb-2 lg:px-4 xl:py-2">
      <div
        v-if="statConfig.config.value.showedWallets > 0 || filter.walletsIds.value.length > 0"
        class="flex gap-1 overflow-x-auto px-2 py-px"
      >
        <WalletsItem
          v-for="walletId in sortedFilterWalletsIds"
          :key="walletId"
          :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
          :walletId
          :wallet="walletsStore.itemsWithAmount?.[walletId]"
          alt
          @click="onClickWallet(walletId)"
        />
      </div>
    </div>

    <StatItemForCategory
      :hasChildren="categoryHasChildren"
      :storageKey="categoryId"
      :preCategoriesIds="statConfig.config.value.isShowEmptyCategories ? childIds : []"
      :trnsIds="trnsIds"
      class="max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
      type="sum"
    />
  </UiPage>
</template>
