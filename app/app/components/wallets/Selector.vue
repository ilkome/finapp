<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletSortOrders } from '~/components/wallets/grouping'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { buildWalletGroups, sortWalletGroups } from '~/components/wallets/grouping'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletGroupingOptions } from '~/components/wallets/useWalletGroupingOptions'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsGrouping } from '~/components/wallets/useWalletsGrouping'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  autofocus?: boolean
  currencyAboveAction?: boolean
  disabledIds?: WalletId[]
  filterAtTop?: boolean
  // Group rows by type / currency; the host renders the picker from the exposed `groupingItems`.
  groupingMenu?: boolean
  hide?: () => void
  hideHeader?: boolean
  hideSearch?: boolean
  searchQuery?: string
  selectedIds?: WalletId[]
  withHeader?: boolean
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()

const isLaptop = useIsLaptop()

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const searchQuery = computed(() => (props.searchQuery ?? search.value).trim().toLowerCase())

const editingWalletId = ref<WalletId | null>(null)
const isCreatingNewWallet = ref(false)

const { requestDelete } = useWalletDelete()

const currencyFiltered = useStorage<CurrencyCode>(WALLET_STORAGE_KEYS.selectorCurrency, 'all')
const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
  const q = searchQuery.value
  return walletsStore.sortedIds.filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    if (!wallet || wallet.isArchived || props.disabledIds?.includes(id))
      return false
    if (currencyFiltered.value !== 'all' && currencyFiltered.value !== wallet.currency)
      return false
    if (q && !wallet.name.toLowerCase().includes(q))
      return false
    return true
  })
})

const hasNoMatches = computed(() =>
  !!searchQuery.value && selectedWalletsIdsWithCurrency.value.length === 0,
)

const groupedBy = useStorage<WalletsGroupedBy>(WALLET_STORAGE_KEYS.groupedBy, 'none')
// Same key the page's drag-to-reorder writes to - grouped wallets must sort the same way here.
const sortOrders = useStorage<WalletSortOrders>(WALLET_STORAGE_KEYS.sortOrders, {})
const walletGroups = computed(() => {
  const built = props.groupingMenu
    ? buildWalletGroups(selectedWalletsIdsWithCurrency.value, walletsStore.itemsComputed, groupedBy.value, false)
    : false
  const groups = built ? sortWalletGroups(built, groupedBy.value, sortOrders.value) : false
  return groups
    ? Object.entries(groups).map(([key, group]) => ({
        ids: group.ids,
        key,
        label: groupedBy.value === 'type' ? t(`money.types.${key}`) : key,
      }))
    : [{ ids: selectedWalletsIdsWithCurrency.value, key: 'all', label: '' }]
})
const { toggleMap: toggleGroup, toggleOpened: toggleAllGroups, typeGroupsStatus: groupsStatus, walletsToggledMap: toggledMap }
  = useWalletsGrouping(selectedWalletsIdsWithCurrency, groupedBy)
const isGroupOpen = (key: string) => groupedBy.value === 'none' || (toggledMap.value[groupedBy.value]?.[key]?.show ?? true)
const groupingOptions = useWalletGroupingOptions()
function cycleGrouping() {
  const options = groupingOptions.value
  const index = options.findIndex(option => option.id === groupedBy.value)
  groupedBy.value = options[(index + 1) % options.length]!.id
}
const groupingItems = computed<DropdownMenuItem[][]>(() => [[
  { icon: 'lucide:list-tree', label: t('wallets.page.groupBy'), type: 'label' },
  { class: 'ms-2!', type: 'separator' },
  ...groupingOptions.value.map(option => ({
    checked: groupedBy.value === option.id,
    icon: option.icon,
    label: option.label,
    onSelect: () => { groupedBy.value = option.id },
    type: 'checkbox' as const,
  })),
]])

const walletMenu = useWalletMenuItems()

function getWalletContextMenuItems(walletId: WalletId) {
  if (!props.withHeader)
    return undefined
  const editOpts = isLaptop.value
    ? { returnBack: true }
    : { onEdit: (id: WalletId) => { editingWalletId.value = id } }
  return [
    [walletMenu.edit(walletId, editOpts)],
    [walletMenu.delete(walletId, requestDelete)],
  ]
}

function onClickWallet(walletId: WalletId) {
  emit('selected', walletId)

  if (props.hide)
    props.hide()
}

function onClickNew() {
  if (isLaptop.value) {
    router.push('/wallets/new?returnBack=1')
    props.hide?.()
  }
  else {
    isCreatingNewWallet.value = true
  }
}

async function focusSearch() {
  // Autofocus is a mouse-only convenience: on touch it just pops the keyboard over the sheet.
  if (!isLaptop.value)
    return

  if (!props.withHeader || props.hideHeader || props.hideSearch || props.autofocus === false)
    return
  await nextTick()
  const focus = () => {
    if (props.autofocus !== false)
      searchInput.value?.focus()
  }
  requestAnimationFrame(focus)
  // The kept-mounted filter sheet restores focus to its trigger after opening.
  setTimeout(focus, 250)
}

onMounted(focusSearch)
watch(() => props.autofocus, focusSearch)

defineExpose({ cycleGrouping, groupedBy, groupingItems, groupsStatus, toggleAllGroups })
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <div
      v-if="props.withHeader && !props.hideHeader"
      class="flex items-center gap-2 bg-default px-3 py-2"
      :class="{
        'justify-end': props.hideSearch,
      }"
    >
      <input
        v-if="!props.hideSearch"
        ref="searchInput"
        v-model="search"
        type="text"
        class="m-0 min-h-10.5 w-0 min-w-0 flex-1 rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
        :placeholder="t('wallets.search.placeholder')"
      >
      <UiActionButton
        :ariaLabel="t('wallets.new')"
        @click="onClickNew"
      >
        <Icon name="lucide:plus" size="20" />
      </UiActionButton>
    </div>

    <div class="relative grid min-h-0 flex-1 overflow-hidden">
      <div
        class="h-full scroller-block space-y-1 overflow-y-auto px-3 py-px"
        :class="{
          'pt-2': !(props.filterAtTop && walletsStore.currenciesUsed.length > 1),
          'pb-28!': props.currencyAboveAction && !props.filterAtTop && walletsStore.currenciesUsed.length > 1,
          'pb-16': !props.currencyAboveAction && !props.filterAtTop && walletsStore.currenciesUsed.length > 1,
          'pt-12': props.filterAtTop && walletsStore.currenciesUsed.length > 1,
        }"
      >
        <div
          v-if="hasNoMatches"
          class="p-4 text-center text-muted"
        >
          {{ t('search.noResults') }}
        </div>

        <UCollapsible
          v-for="group in walletGroups"
          :key="group.key"
          :open="isGroupOpen(group.key)"
          class="grid"
        >
          <UiTitleDropRight
            v-if="group.label"
            :isShown="isGroupOpen(group.key)"
            @click="toggleGroup(group.key)"
          >
            <div class="font-tertiary text-base leading-none font-semibold text-toned!">
              {{ group.label }}
            </div>
          </UiTitleDropRight>

          <template #content>
            <div class="grid gap-1" :class="group.label && 'py-1'">
              <template
                v-for="walletId in group.ids"
                :key="walletId"
              >
                <WalletsItem
                  :activeItemId="props.activeItemId ?? null"
                  :contextMenuItems="getWalletContextMenuItems(walletId)"
                  :isSelected="props.selectedIds?.includes(walletId)"
                  :walletId
                  :wallet="walletsStore.itemsComputed[walletId]!"
                  isShowIcon
                  isShowCreditLimit
                  withBackground
                  @click="onClickWallet(walletId)"
                />
              </template>
            </div>
          </template>
        </UCollapsible>
      </div>

      <template v-if="walletsStore.currenciesUsed.length > 1">
        <div
          v-if="!props.currencyAboveAction"
          class="pointer-events-none absolute left-0 z-10 h-12 w-full"
          :class="props.filterAtTop
            ? 'top-0'
            : props.currencyAboveAction ? 'bottom-14' : 'bottom-0'"
          :style="props.filterAtTop
            ? 'background: linear-gradient(to top, transparent, var(--ui-bg))'
            : 'background: linear-gradient(to bottom, transparent, var(--ui-bg))'"
        />
        <div
          class="pointer-events-none absolute left-0 z-20 w-full"
          :class="props.filterAtTop
            ? 'top-0'
            : props.currencyAboveAction ? 'bottom-14 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]' : 'bottom-2'"
          :style="props.currencyAboveAction && !props.filterAtTop ? 'transform: translateY(calc(-1 * var(--drawer-snap-lift, 0px)))' : undefined"
        >
          <div class="swiper-no-swiping pointer-events-auto w-full touch-pan-x scrollbar-none overflow-x-auto overscroll-x-contain px-2 [&::-webkit-scrollbar]:hidden">
            <WalletsCurrencies
              :currencyFiltered
              menuStyle
              @selectFilterCurrency="code => currencyFiltered = code"
            />
          </div>
        </div>
      </template>
    </div>

    <WalletsEditModal
      v-if="props.withHeader && (editingWalletId || isCreatingNewWallet) && !isLaptop"
      :walletId="editingWalletId ?? undefined"
      @closed="editingWalletId = null; isCreatingNewWallet = false"
    />
  </div>
</template>
