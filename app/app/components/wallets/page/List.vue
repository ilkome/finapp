<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { WalletId, WalletsGroupedBy, WalletType } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { canStickStatCategories } from '~/components/stat/statFeed'
import SideMenu from '~/components/ui/SideMenu.vue'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletsCounts } from '~/components/wallets/useWalletsCounts'
import { useWalletsFilter } from '~/components/wallets/useWalletsFilter'
import { useWalletsGrouping } from '~/components/wallets/useWalletsGrouping'
import { useWalletsStatistics } from '~/components/wallets/useWalletsStatistics'
import { provideWalletSheet } from '~/components/wallets/useWalletSheet'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useFeature } from '~/composables/useFeatures'

const { t } = useI18n()
const router = useRouter()
const walletSheet = provideWalletSheet()

useSeoMeta({
  ogTitle: t('wallets.name'),
  title: t('wallets.name'),
})

const walletsStore = useWalletsStore()
const isLoans = useFeature('loans')
const isAnalytics = useFeature('walletsAnalytics')

// Same rule as the statistics page: the side column pins below the sticky header only when it fits whole.
const header = useTemplateRef<{ mainElement: HTMLElement | null }>('header')
const { height: stickyTop } = useElementSize(() => header.value?.mainElement, undefined, { box: 'border-box' })
const sideColumn = useTemplateRef<HTMLElement>('sideColumn')
const { height: sideColumnHeight } = useElementSize(sideColumn)
const { height: viewportHeight } = useWindowSize()
const canStickSideColumn = computed(() => canStickStatCategories(stickyTop.value, sideColumnHeight.value, viewportHeight.value))
// In one column the currency strip pins above the list, so group titles pin below it; it is hidden in two columns.
const currenciesBar = useTemplateRef<HTMLElement>('currenciesBar')
const { height: currenciesBarHeight } = useElementSize(currenciesBar, undefined, { box: 'border-box' })
const currenciesStore = useCurrenciesStore()
const isSorting = ref(false)
// Drags save as they happen; cancel puts back the order the sort started from.
let sortSnapshot: WalletId[] | null = null

function startSorting() {
  sortSnapshot = [...walletsStore.sortedIds]
  isSorting.value = true
}

function cancelSorting() {
  if (sortSnapshot?.some((id, index) => id !== walletsStore.sortedIds[index]))
    walletsStore.saveWalletsOrder(sortSnapshot)
  sortSnapshot = null
  isSorting.value = false
}
const isLaptop = useIsLaptop()
// vueuse types a binding as a prop option, so a function type must stay `any`.
const isOpen = ref(false)
const isStatSideOpen = ref(false)

// Statistics settings are a panel of this same menu, the way the user menu nests its panels -
// a second popover or sheet on top of the menu is neither the house pattern nor safe on touch.
const menuPanel = ref<'root' | 'statistics'>('root')

// Opening a sheet (or routing) before the menu unregisters stacks it above the menu in the drawer
// history, whose cleanup then closes everything above itself - so it would flash open and vanish. Wait for the menu first.
let afterMenuClose: (() => void) | null = null

function closeMenu() {
  isOpen.value = false
  const run = afterMenuClose
  afterMenuClose = null
  // `open` flips before the drawer's watcher unregisters it; wait a tick so the next sheet stacks above nothing.
  if (run)
    nextTick(run)
}

function openAfterMenu(action: () => void, close: () => void) {
  afterMenuClose = action
  close()
}

const { requestDelete } = useWalletDelete()

const groupedBy = useStorage<WalletsGroupedBy>(WALLET_STORAGE_KEYS.groupedBy, 'none')
const showArchived = useStorage<boolean>(WALLET_STORAGE_KEYS.showArchived, false)
const showStatistics = useStorage<boolean>(WALLET_STORAGE_KEYS.showStatistics, true)
const includeArchivedInStats = useStorage<boolean>(WALLET_STORAGE_KEYS.includeArchivedInStats, false)
const includeExcludedInStats = useStorage<boolean>(WALLET_STORAGE_KEYS.includeExcludedInStats, false)
const isShowGroupCount = useStorage<boolean>(WALLET_STORAGE_KEYS.showGroupCount, false, localStorage, {
  mergeDefaults: true,
})

// Archived wallets counted in the sums are listed too.
const {
  currencyFiltered,
  selectedWalletsIds,
  selectedWalletsIdsWithCurrency,
  setWalletViewType,
  walletViewType,
} = useWalletsFilter(groupedBy, computed(() => showArchived.value || includeArchivedInStats.value))

const {
  counts,
  countWalletsSum,
  countWalletsSumInOwnCurrency,
} = useWalletsCounts(selectedWalletsIdsWithCurrency, includeArchivedInStats, includeExcludedInStats)

const statisticsStorageKey = computed(() => `${WALLET_STORAGE_KEYS.totalPrefix}${groupedBy.value}`)
const statistics = useWalletsStatistics(statisticsStorageKey, counts)

function showMenuPanel(panel: 'root' | 'statistics') {
  runPanelTransition(panel === 'root' ? 'back' : 'forward', () => {
    menuPanel.value = panel
  })
}

function openStatisticsPanel() {
  menuPanel.value = 'root'
  isOpen.value = true
  if (isLaptop.value)
    nextTick(() => isStatSideOpen.value = true)
  else
    menuPanel.value = 'statistics'
}

const {
  groupedWalletsWithIds,
  primary,
  setSortOrder,
  toggleMap,
  toggleOpened,
  typeGroupsStatus,
  walletsToggledMap,
} = useWalletsGrouping(selectedWalletsIds, groupedBy)

function isFlagGroup(key: string) {
  return key === 'isArchived' || key === 'isExcludedFromTotal'
}

function hasGroups(groups: Record<string, unknown> | undefined) {
  return groups ? Object.keys(groups).length > 0 : false
}
</script>

<template>
  <UiPage>
    <UiHeader ref="header" actionsAfterTitle>
      <UiHeaderTitle>
        {{ t('wallets.name') }}
      </UiHeaderTitle>

      <template #actions>
        <UiSortActions v-if="isSorting" @apply="isSorting = false" @cancel="cancelSorting" />

        <template v-else>
          <UTooltip v-if="groupedBy !== 'none'" :text="$t('base.toggleFolders')">
            <UiActionButton
              :ariaLabel="$t('base.toggleFolders')"
              @click="toggleOpened"
            >
              <Icon
                v-if="typeGroupsStatus.isAllOpen"
                name="lucide:folder-open"
              />
              <Icon
                v-else-if="typeGroupsStatus.isAnyOpen"
                name="lucide:folder-open-dot"
              />
              <Icon
                v-else
                name="lucide:folder"
              />
            </UiActionButton>
          </UTooltip>

          <WalletsGroupMenu
            v-model:groupedBy="groupedBy"
          >
            <UTooltip :text="$t('base.toggleGrouping')">
              <UiActionButton :ariaLabel="$t('base.toggleGrouping')">
                <Icon name="lucide:list-tree" size="20" />
              </UiActionButton>
            </UTooltip>
          </WalletsGroupMenu>

          <DrawerOrDropdown
            align="end"
            isShowCloseBtn
            :open="isOpen"
            popoverBodyClass="[view-transition-name:ui-panel]"
            popoverContentClass="w-88 max-w-[calc(100vw-1rem)]"
            :title="menuPanel === 'statistics' ? t('statistics.title') : undefined"
            bodyClass="[view-transition-name:ui-panel]"
            @update:open="value => value ? (menuPanel = 'root', isOpen = true) : closeMenu()"
          >
            <template #trigger>
              <UTooltip :text="$t('base.moreOptions')">
                <UiActionButton
                  :ariaLabel="$t('base.moreOptions')"
                  @click="menuPanel = 'root'"
                >
                  <Icon name="lucide:ellipsis-vertical" size="20" />
                </UiActionButton>
              </UTooltip>
            </template>

            <template #content="{ close }">
              <div>
                <div v-if="menuPanel === 'statistics'" class="grid gap-3 py-3 md:py-0">
                  <UiPanelBack
                    class="group"
                    :title="t('base.previous')"
                    @back="showMenuPanel('root')"
                  >
                    <WalletsPageStatisticsHint :statistics />
                  </UiPanelBack>

                  <WalletsPageStatisticsSettings v-model:showStatistics="showStatistics" :statistics />
                </div>

                <div v-else class="py-3 md:-mx-2 md:py-1">
                  <UiHeaderLink icon="lucide:plus" @click="() => openAfterMenu(() => router.push('/wallets/new'), close)">
                    {{ t('wallets.new') }}
                  </UiHeaderLink>

                  <UiHeaderLink
                    v-if="isAnalytics"
                    icon="lucide:chart-line"
                    @click="() => openAfterMenu(() => router.push('/wallets/analytics'), close)"
                  >
                    {{ t('wallets.analytics.title') }}
                  </UiHeaderLink>

                  <UiHeaderLink
                    v-if="walletsStore.sortedIds.length > 1"
                    icon="lucide:arrow-down-up"
                    @click="() => { startSorting(); close() }"
                  >
                    {{ t('wallets.sortTitle') }}
                  </UiHeaderLink>

                  <SideMenu v-if="isLaptop" v-model:open="isStatSideOpen" contentClass="w-88">
                    <UiHeaderLink icon="lucide:chart-column" class="data-[state=open]:bg-elevated">
                      {{ t('statistics.title') }}

                      <Icon
                        name="lucide:chevron-right"
                        size="16"
                        class="ml-auto text-muted"
                      />
                    </UiHeaderLink>

                    <template #content>
                      <div class="grid gap-3">
                        <div class="flex items-center px-2">
                          <span class="grow text-sm font-medium text-toned">{{ t('statistics.title') }}</span>
                          <WalletsPageStatisticsHint :statistics />
                        </div>
                        <WalletsPageStatisticsSettings v-model:showStatistics="showStatistics" :statistics />
                      </div>
                    </template>
                  </SideMenu>

                  <UiHeaderLink
                    v-else
                    icon="lucide:chart-column"
                    @click="showMenuPanel('statistics')"
                  >
                    {{ t('statistics.title') }}

                    <Icon
                      name="lucide:chevron-right"
                      size="16"
                      class="ml-auto text-muted"
                    />
                  </UiHeaderLink>

                  <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

                  <WalletsPageListOptions
                    v-model:includeArchivedInStats="includeArchivedInStats"
                    v-model:includeExcludedInStats="includeExcludedInStats"
                    v-model:isShowGroupCount="isShowGroupCount"
                    v-model:showArchived="showArchived"
                  />
                </div>
              </div>
            </template>
          </DrawerOrDropdown>
        </template>
      </template>
    </UiHeader>

    <div
      v-if="!walletsStore.hasItems"
      class="flex grow flex-col items-center justify-center"
    >
      <UiTitleSection class="pb-4">
        {{ t('wallets.new') }}
      </UiTitleSection>
      <NuxtLink to="/wallets/new">
        <UiButtonAccent>
          {{ t('wallets.new') }}
        </UiButtonAccent>
      </NuxtLink>
    </div>

    <div
      v-else
      class="grid max-w-5xl grow px-2 lg:px-4 2xl:px-8 @xl/page:grid-cols-2 @xl/page:gap-6 @3xl/page:gap-12"
    >
      <div
        v-if="walletsStore.currenciesUsed.length > 1 && primary !== 'currency'"
        ref="currenciesBar"
        class="sticky z-19 -mx-2 bg-default px-2 py-1 @xl/page:hidden"
        :style="{ top: `${stickyTop}px` }"
      >
        <WalletsCurrencies
          :currencyFiltered
          @selectFilterCurrency="code => currencyFiltered = code"
        />
      </div>

      <!-- The currency strip scrolls across the whole column so it is not clipped at
           max-w-sm; the blocks below keep that width. -->
      <div
        ref="sideColumn"
        class="grid content-start @xl/page:order-1 @xl/page:self-start @xl/page:pt-1"
        :class="canStickSideColumn && '@xl/page:sticky'"
        :style="canStickSideColumn ? { top: `${stickyTop}px` } : undefined"
      >
        <WalletsCurrencies
          v-if="walletsStore.currenciesUsed.length > 1 && primary !== 'currency'"
          :currencyFiltered
          class="mb-2 hidden @xl/page:block"
          @selectFilterCurrency="code => currencyFiltered = code"
        />

        <div class="grid content-start gap-3 @xl/page:gap-4 @3xl/main:max-w-sm">
          <LoansDueThisMonth v-if="isLoans" />
          <WalletsAnalyticsPreviewSection v-if="isAnalytics" />
          <WalletsStatistics
            :isShowList="showStatistics"
            :storageKey="statisticsStorageKey"
            :activeType="walletViewType"
            :currencyCode="currenciesStore.base"
            :state="statistics"
            @click="(v: string) => setWalletViewType(v as WalletType | 'total')"
            @openSettings="openStatisticsPanel"
          />
        </div>
      </div>

      <div class="@xl/page:pt-1 @3xl/main:max-w-sm">
        <div class="pb-6 md:max-w-lg @xl/page:max-w-lg">
          <WalletsSortableList
            v-if="groupedBy === 'none'"
            :ids="selectedWalletsIds"
            class="grid gap-1 py-1 md:max-w-lg"
            @update="ids => walletsStore.saveWalletsOrder(ids)"
          >
            <template #default="{ id: walletId }">
              <WalletsPageListItem
                :walletId
                :isSort="isSorting"
                @delete="requestDelete"
              />
            </template>
          </WalletsSortableList>

          <WalletsSortableList
            v-if="groupedBy !== 'none' && groupedWalletsWithIds"
            :ids="Object.keys(groupedWalletsWithIds)"
            class="grid gap-1"
            @update="keys => setSortOrder([], keys)"
          >
            <template #default="{ id: groupPrimary }">
              <UCollapsible
                :open="walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true"
              >
                <div class="sticky z-18 flex items-stretch bg-default" :style="{ top: `${stickyTop + currenciesBarHeight}px` }">
                  <WalletsSortHandle v-if="isSorting" />
                  <UiTitleDropRight
                    :isShown="walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true"
                    :title="primary === 'type' ? t(`money.types.${groupPrimary}`) : groupPrimary"
                    @click="toggleMap(groupPrimary)"
                  >
                    <div
                      v-if="isShowGroupCount"
                      class="text-xs leading-none tracking-wide text-dimmed"
                    >
                      {{ groupedWalletsWithIds[groupPrimary]!.ids.length }}
                    </div>

                    <template #after>
                      <div class="ml-auto opacity-60">
                        <Amount
                          :amount="countWalletsSum(groupedWalletsWithIds[groupPrimary]!.ids, isFlagGroup(groupPrimary))"
                          :currencyCode="currenciesStore.base"
                          :isShowBaseRate="false"
                          variant="row"
                        />
                        <Amount
                          v-if="primary === 'currency' && currenciesStore.base !== groupPrimary"
                          :amount="countWalletsSumInOwnCurrency(groupedWalletsWithIds[groupPrimary]!.ids, isFlagGroup(groupPrimary))"
                          :currencyCode="groupPrimary"
                          :isShowBaseRate="false"
                          variant="secondary"
                        />
                      </div>
                    </template>
                  </UiTitleDropRight>
                </div>

                <template #content>
                  <WalletsSortableList
                    v-if="hasGroups(groupedWalletsWithIds[groupPrimary]!.groups)"
                    :ids="Object.keys(groupedWalletsWithIds[groupPrimary]!.groups!)"
                    class="grid pb-4.5 pl-6"
                    @update="keys => setSortOrder([groupPrimary], keys)"
                  >
                    <template #default="{ id: groupSecondary }">
                      <UCollapsible
                        :open="walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true"
                        class="group grid"
                      >
                        <div class="flex items-stretch">
                          <WalletsSortHandle v-if="isSorting" />
                          <UiTitleDropRight
                            :isShown="walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true"
                            isNested
                            :title="primary === 'currency' ? t(`money.types.${groupSecondary}`) : groupSecondary"
                            @click="toggleMap(groupPrimary, groupSecondary)"
                          >
                            <div
                              v-if="isShowGroupCount"
                              class="text-xs leading-none tracking-wide text-dimmed"
                            >
                              {{ groupedWalletsWithIds[groupPrimary]!.groups![groupSecondary]!.length }}
                            </div>
                            <template #after>
                              <div class="ml-auto">
                                <Amount
                                  :amount="countWalletsSum(groupedWalletsWithIds[groupPrimary]!.groups![groupSecondary]!)"
                                  :currencyCode="currenciesStore.base"
                                  :isShowBaseRate="false"
                                />
                                <Amount
                                  v-if="primary === 'currency' && currenciesStore.base !== groupPrimary"
                                  :amount="countWalletsSumInOwnCurrency(groupedWalletsWithIds[groupPrimary]!.groups![groupSecondary]!)"
                                  :currencyCode="groupPrimary"
                                  :isShowBaseRate="false"
                                  variant="secondary"
                                />
                              </div>
                            </template>
                          </UiTitleDropRight>
                        </div>

                        <template #content>
                          <WalletsSortableList
                            :ids="groupedWalletsWithIds[groupPrimary]!.groups![groupSecondary]!"
                            class="grid gap-1 py-1"
                            @update="ids => setSortOrder([groupPrimary, groupSecondary], ids)"
                          >
                            <template #default="{ id: walletId }">
                              <WalletsPageListItem
                                :walletId
                                :isSort="isSorting"
                                @delete="requestDelete"
                              />
                            </template>
                          </WalletsSortableList>
                        </template>
                      </UCollapsible>
                    </template>
                  </WalletsSortableList>

                  <WalletsSortableList
                    v-else
                    :ids="groupedWalletsWithIds[groupPrimary]!.ids"
                    class="grid gap-1 pt-1.5 pb-6"
                    @update="ids => setSortOrder([groupPrimary], ids)"
                  >
                    <template #default="{ id: walletId }">
                      <WalletsPageListItem
                        :walletId
                        :isSort="isSorting"
                        @delete="requestDelete"
                      />
                    </template>
                  </WalletsSortableList>
                </template>
              </UCollapsible>
            </template>
          </WalletsSortableList>
        </div>
      </div>
    </div>

    <WalletsSheet
      v-if="walletSheet"
      :key="walletSheet"
      :walletId="walletSheet"
      @closed="walletSheet = null"
    />
  </UiPage>
</template>
