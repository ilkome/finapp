<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { useStorage } from '@vueuse/core'

import type { WalletsGroupedBy, WalletType } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletsCounts } from '~/components/wallets/useWalletsCounts'
import { useWalletsFilter } from '~/components/wallets/useWalletsFilter'
import { useWalletsGrouping } from '~/components/wallets/useWalletsGrouping'
import { useWalletsStatistics } from '~/components/wallets/useWalletsStatistics'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()

useSeoMeta({
  ogTitle: t('wallets.name'),
  title: t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const isSortModalOpen = ref(false)
const isOpen = ref(false)

// Statistics settings are a panel of this same menu, the way the user menu nests its panels -
// a second popover or sheet on top of the menu is neither the house pattern nor safe on touch.
const menuPanel = ref<'root' | 'statistics'>('root')

const {
  cancelDelete,
  confirmDelete,
  deleteInfo,
  deleteWalletId,
  requestDelete,
} = useWalletDelete()

const groupedBy = useStorage<WalletsGroupedBy>(WALLET_STORAGE_KEYS.groupedBy, 'none')
const showArchived = useStorage<boolean>(WALLET_STORAGE_KEYS.showArchived, false)
const includeArchivedInStats = useStorage<boolean>(WALLET_STORAGE_KEYS.includeArchivedInStats, false)
const includeExcludedInStats = useStorage<boolean>(WALLET_STORAGE_KEYS.includeExcludedInStats, false)
const isShowGroupCount = useStorage<boolean>('finapp.walletsShowGroupCount', false, localStorage, {
  mergeDefaults: true,
})

const {
  currencyFiltered,
  selectedWalletsIds,
  selectedWalletsIdsWithCurrency,
  setWalletViewType,
  walletViewType,
} = useWalletsFilter(groupedBy, showArchived)

const {
  counts,
  countWalletsSum,
} = useWalletsCounts(selectedWalletsIdsWithCurrency, includeArchivedInStats, includeExcludedInStats)

const statisticsStorageKey = computed(() => `${WALLET_STORAGE_KEYS.totalPrefix}${groupedBy.value}`)
const statistics = useWalletsStatistics(statisticsStorageKey, counts)

function openStatisticsPanel() {
  menuPanel.value = 'statistics'
  isOpen.value = true
}

const {
  groupedWalletsWithIds,
  groupTabs,
  isSecondaryGroupingActive,
  toggleMap,
  toggleOpened,
  toggleSecondaryGrouping,
  typeGroupsStatus,
  walletsToggledMap,
} = useWalletsGrouping(selectedWalletsIds, groupedBy)

function hasGroups(groups: Record<string, unknown> | undefined) {
  return groups ? Object.keys(groups).length > 0 : false
}

const groupNavItems = computed<TabsItem[]>(() =>
  groupTabs.value.map(item => ({
    label: item.label,
    value: item.id,
  })),
)
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>

      <template #actions>
        <NuxtLink to="/wallets/new">
          <UiActionButton :ariaLabel="$t('wallets.new')">
            <Icon name="lucide:plus" size="24" />
          </UiActionButton>
        </NuxtLink>

        <BottomSheetOrDropdown
          v-if="walletsStore.sortedIds.length > 1"
          align="end"
          :isOpen="isOpen"
          popoverBodyClass="md:py-2"
          popoverContentClass="w-88 max-w-[calc(100vw-1rem)]"
          @closeModal="isOpen = false"
          @openModal="() => { menuPanel = 'root'; isOpen = true }"
        >
          <template #trigger>
            <UiActionButton
              :ariaLabel="$t('base.moreOptions')"
              @click="menuPanel = 'root'"
            >
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiActionButton>
          </template>

          <template #content="{ close }">
            <div v-if="menuPanel === 'statistics'" class="grid gap-3 pt-4 pb-2 md:py-0">
              <UiHeaderLink
                class="group"
                icon="lucide:chevron-left"
                :iconSize="20"
                @click="menuPanel = 'root'"
              >
                {{ t('statistics.title') }}

                <UPopover
                  :content="{ align: 'end', avoidCollisions: false, collisionPadding: 8, side: 'bottom', sideOffset: 4 }"
                  :ui="{ content: 'z-[80] w-80 max-w-[calc(100vw-1rem)]' }"
                >
                  <button
                    type="button"
                    :aria-label="t('statistics.hints')"
                    class="ml-auto flex size-8 items-center justify-center rounded-sm text-muted group-hover:bg-accented hover:bg-accented"
                    @click.stop
                  >
                    <Icon name="lucide:info" size="18" />
                  </button>

                  <template #content>
                    <div
                      class="scroller grid gap-3 overflow-y-auto p-3"
                      style="max-height: var(--reka-popper-available-height, 60dvh)"
                    >
                      <div v-for="row in statistics.hintRows.value" :key="row.id">
                        <UiText variant="navigation">
                          {{ row.title }}
                        </UiText>

                        <UiText variant="meta" class="pt-1 leading-snug!">
                          {{ row.hint }}
                        </UiText>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </UiHeaderLink>

              <div v-if="statistics.pinnedRows.value.length" class="grid gap-1">
                <UiText variant="meta" class="px-2">
                  {{ t('statistics.pinned') }}
                </UiText>

                <WalletsStatisticsSortGroup
                  :items="statistics.pinnedRows.value"
                  :pinnedIds="statistics.pinnedIds.value"
                  showPin
                  @togglePinned="statistics.togglePinned"
                  @update="statistics.reorderPinned"
                />
              </div>

              <div class="grid gap-1">
                <UiText variant="meta" class="px-2">
                  {{ t('statistics.list') }}
                </UiText>

                <WalletsStatisticsSortGroup
                  :hiddenIds="statistics.hiddenIds.value"
                  :items="statistics.listRows.value"
                  :pinnedIds="statistics.pinnedIds.value"
                  showHide
                  showPin
                  @toggleHidden="statistics.toggleHidden"
                  @togglePinned="statistics.togglePinned"
                  @update="statistics.reorderList"
                />
              </div>
            </div>

            <div v-else class="pt-4 pb-3 md:py-0">
              <UiHeaderLink
                icon="lucide:arrow-down-up"
                @click="() => { isSortModalOpen = true; close() }"
              >
                {{ t('wallets.sortTitle') }}
              </UiHeaderLink>

              <UiHeaderLink
                icon="lucide:chart-column"
                @click="menuPanel = 'statistics'"
              >
                {{ t('statistics.title') }}

                <Icon
                  name="lucide:chevron-right"
                  size="16"
                  class="ml-auto text-muted"
                />
              </UiHeaderLink>

              <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

              <div>
                <UiSwitchItem
                  :checkboxValue="showArchived"
                  :title="t('wallets.options.showArchived')"
                  trailing
                  @click="showArchived = !showArchived"
                />
                <UiSwitchItem
                  :checkboxValue="includeArchivedInStats"
                  :title="t('wallets.options.includeArchivedInStats')"
                  trailing
                  @click="includeArchivedInStats = !includeArchivedInStats"
                />
                <UiSwitchItem
                  :checkboxValue="includeExcludedInStats"
                  :title="t('wallets.options.includeExcludedInStats')"
                  trailing
                  @click="includeExcludedInStats = !includeExcludedInStats"
                />
                <UiSwitchItem
                  :checkboxValue="isShowGroupCount"
                  :title="t('wallets.options.showGroupCount')"
                  trailing
                  @click="isShowGroupCount = !isShowGroupCount"
                />
              </div>
            </div>
          </template>
        </BottomSheetOrDropdown>
      </template>
    </UiHeader>

    <div
      v-if="!walletsStore.hasItems"
      class="flex-center grow flex-col"
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
      <!-- The currency strip scrolls across the whole column so it is not clipped at
           max-w-sm; the blocks below keep that width. -->
      <div class="grid content-start @xl/page:order-1 @xl/page:pt-1">
        <WalletsCurrencies
          v-if="walletsStore.currenciesUsed.length > 1 && groupedBy !== 'currency'"
          :currencyFiltered
          @selectFilterCurrency="code => currencyFiltered = code"
        />

        <div class="grid content-start gap-3 pt-2 @xl/page:gap-4 @3xl/main:max-w-sm">
          <WalletsStatistics
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
        <div class="mb-2 flex min-h-12 items-center gap-2">
          <UiTabs
            :items="groupNavItems"
            :modelValue="groupedBy"
            class="w-full"
            @update:modelValue="(v) => groupedBy = v as WalletsGroupedBy"
          />

          <div
            v-if="groupedBy !== 'none'"
            class="ml-auto flex items-center gap-1"
          >
            <UiActionButton
              :ariaLabel="$t('base.toggleGrouping')"
              @click="toggleSecondaryGrouping"
            >
              <Icon
                :name="isSecondaryGroupingActive ? 'lucide:network' : 'lucide:folder-tree'"
                size="18"
              />
            </UiActionButton>

            <UiActionButton :ariaLabel="$t('base.toggleFolders')" @click="toggleOpened">
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
          </div>
        </div>

        <div class="pb-6 md:max-w-lg @xl/page:max-w-lg">
          <div
            v-if="groupedBy === 'none'"
            class="grid gap-1 py-1 md:max-w-lg"
          >
            <WalletsPageListItem
              v-for="walletId in selectedWalletsIds"
              :key="walletId"
              :walletId
              @delete="requestDelete"
            />
          </div>

          <div
            v-if="groupedBy !== 'none' && groupedWalletsWithIds"
            class="grid"
          >
            <UCollapsible
              v-for="(content, groupPrimary) in groupedWalletsWithIds"
              :key="groupPrimary"
              :open="walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true"
            >
              <UiTitleDropRight
                :isShown="walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true"
                @click="toggleMap(groupPrimary)"
              >
                <div class="font-tertiary text-base leading-none font-semibold text-toned!">
                  {{ groupedBy === 'type' ? t(`money.types.${groupPrimary}`) : groupPrimary }}
                </div>

                <div
                  v-if="isShowGroupCount"
                  class="text-xs leading-none tracking-wide text-dimmed"
                >
                  {{ content.ids.length }}
                </div>

                <template #after>
                  <div class="ml-auto opacity-60">
                    <Amount
                      :amount="countWalletsSum(content.ids)"
                      :currencyCode="currenciesStore.base"
                      :isShowBaseRate="false"
                      variant="row"
                    />
                    <Amount
                      v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                      :amount="countWalletsSum(content.ids, false)"
                      :currencyCode="groupPrimary"
                      :isShowBaseRate="false"
                      variant="secondary"
                    />
                  </div>
                </template>
              </UiTitleDropRight>

              <template #content>
                <div
                  v-if="hasGroups(content.groups)"
                  class="grid pl-6"
                >
                  <UCollapsible
                    v-for="(ids, groupSecondary) in content.groups"
                    :key="groupSecondary"
                    :open="walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true"
                    class="group grid"
                  >
                    <UiTitleDropRight
                      :isShown="walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true"
                      @click="toggleMap(groupPrimary, groupSecondary)"
                    >
                      <div class="font-tertiary text-base leading-none font-semibold">
                        {{ groupedBy === 'currency' ? t(`money.types.${groupSecondary}`) : groupSecondary }}
                      </div>

                      <div
                        v-if="isShowGroupCount"
                        class="text-xs leading-none tracking-wide text-dimmed"
                      >
                        {{ ids.length }}
                      </div>
                      <template #after>
                        <div class="ml-auto">
                          <Amount
                            :amount="countWalletsSum(ids)"
                            :currencyCode="currenciesStore.base"
                            :isShowBaseRate="false"
                          />
                          <Amount
                            v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                            :amount="countWalletsSum(ids, false)"
                            :currencyCode="groupPrimary"
                            :isShowBaseRate="false"
                            variant="secondary"
                          />
                        </div>
                      </template>
                    </UiTitleDropRight>

                    <template #content>
                      <div class="grid gap-1 py-1">
                        <WalletsPageListItem
                          v-for="walletId in ids"
                          :key="walletId"
                          :walletId
                          @delete="requestDelete"
                        />
                      </div>
                    </template>
                  </UCollapsible>
                </div>

                <div v-else class="grid gap-1 py-1">
                  <WalletsPageListItem
                    v-for="walletId in content.ids"
                    :key="walletId"
                    :walletId
                    @delete="requestDelete"
                  />
                </div>
              </template>
            </UCollapsible>
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <LayoutConfirmModal
    v-if="deleteWalletId"
    :title="t('wallets.form.delete.title')"
    :description="deleteInfo.descText"
    :highlight="deleteInfo.highlight"
    @closed="cancelDelete"
    @confirm="confirmDelete"
  />

  <WalletsSortModal v-if="isSortModalOpen" @close="isSortModalOpen = false" />
</template>
