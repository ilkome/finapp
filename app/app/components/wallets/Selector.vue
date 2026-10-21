<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS, walletStorageKey } from '~/components/wallets/constants'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsGrouping } from '~/components/wallets/useWalletsGrouping'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  autofocus?: boolean
  disabledIds?: WalletId[]
  // Group rows by type / currency; the host renders `WalletsGroupMenu` and drives `setGroupedBy`.
  groupingMenu?: boolean
  hide?: () => void
  hideHeader?: boolean
  hideSearch?: boolean
  searchQuery?: string
  selectedIds?: WalletId[]
  // Own grouping / expand state per host (trn form, filter, ...); the wallets page owns the unscoped one.
  storageScope?: string
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
    if (currencyFiltered.value !== 'all' && currencyFiltered.value !== wallet.currencyCode)
      return false
    if (q && !wallet.name.toLowerCase().includes(q))
      return false
    return true
  })
})

const hasNoMatches = computed(() =>
  !!searchQuery.value && selectedWalletsIdsWithCurrency.value.length === 0,
)

const groupedBy = useStorage<WalletsGroupedBy>(walletStorageKey(WALLET_STORAGE_KEYS.groupedBy, props.storageScope), 'none')
const activeGroupedBy = computed<WalletsGroupedBy>(() => props.groupingMenu ? groupedBy.value : 'none')
const {
  groupedWalletsWithIds,
  primary,
  toggleMap: toggleGroup,
  toggleOpened: toggleAllGroups,
  typeGroupsStatus: groupsStatus,
  walletsToggledMap: toggledMap,
} = useWalletsGrouping(selectedWalletsIdsWithCurrency, activeGroupedBy, props.storageScope)

const walletGroups = computed(() => {
  const groups = groupedWalletsWithIds.value
  if (!groups)
    return [{ ids: selectedWalletsIdsWithCurrency.value, key: 'all', label: '', subgroups: [] }]
  const primaryLabel = (key: string) => primary.value === 'type' ? t(`money.types.${key}`) : key
  const secondaryLabel = (key: string) => primary.value === 'currency' ? t(`money.types.${key}`) : key
  return Object.entries(groups).map(([key, group]) => ({
    ids: group.ids,
    key,
    label: primaryLabel(key),
    subgroups: Object.entries(group.groups ?? {}).map(([subKey, ids]) => ({ ids, key: subKey, label: secondaryLabel(subKey) })),
  }))
})
function isGroupOpen(key: string, subKey?: string) {
  if (activeGroupedBy.value === 'none')
    return true
  const group = toggledMap.value[activeGroupedBy.value]?.[key]
  return (subKey ? group?.groups?.[subKey] : group?.show) ?? true
}

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

defineExpose({
  currencyFiltered,
  groupedBy,
  groupsStatus,
  setGroupedBy: (value: WalletsGroupedBy) => { groupedBy.value = value },
  toggleAllGroups,
})
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
      <WalletsCurrencyButton
        v-if="walletsStore.currenciesUsed.length > 1"
        :currenciesUsed="walletsStore.currenciesUsed"
        :currencyFiltered
        @select="code => currencyFiltered = code"
      />
      <UiActionButton
        :ariaLabel="t('wallets.new')"
        @click="onClickNew"
      >
        <Icon name="lucide:plus" size="20" />
      </UiActionButton>
    </div>

    <div class="relative grid min-h-0 flex-1 overflow-hidden">
      <div
        class="h-full scroller-block space-y-1 overflow-y-auto px-3 py-px pt-2"
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
            :title="group.label"
            @click="toggleGroup(group.key)"
          />

          <template #content>
            <div v-if="group.subgroups.length" class="grid gap-1 pl-4">
              <UCollapsible
                v-for="sub in group.subgroups"
                :key="sub.key"
                :open="isGroupOpen(group.key, sub.key)"
                class="grid"
              >
                <UiTitleDropRight
                  :isShown="isGroupOpen(group.key, sub.key)"
                  isNested
                  :title="sub.label"
                  @click="toggleGroup(group.key, sub.key)"
                />

                <template #content>
                  <div class="grid gap-1 py-1">
                    <WalletsItem
                      v-for="walletId in sub.ids"
                      :key="walletId"
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
                  </div>
                </template>
              </UCollapsible>
            </div>
            <div v-else class="grid gap-1" :class="group.label && 'py-1'">
              <WalletsItem
                v-for="walletId in group.ids"
                :key="walletId"
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
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>

    <WalletsEditModal
      v-if="props.withHeader && (editingWalletId || isCreatingNewWallet) && !isLaptop"
      :walletId="editingWalletId ?? undefined"
      @closed="editingWalletId = null; isCreatingNewWallet = false"
    />
  </div>
</template>
