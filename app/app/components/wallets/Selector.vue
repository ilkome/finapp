<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  autofocus?: boolean
  compactDesktop?: boolean
  currencyAboveAction?: boolean
  disabledIds?: WalletId[]
  filterAtTop?: boolean
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

const {
  cancelDelete,
  confirmDelete,
  deleteInfo,
  deleteWalletId,
  requestDelete,
} = useWalletDelete()

const currencyFiltered = useStorage<CurrencyCode>(WALLET_STORAGE_KEYS.selectorCurrency, 'all')
const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
  const q = searchQuery.value
  return Object.keys(walletsStore.itemsComputed).filter((id) => {
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
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <div
      v-if="props.withHeader && !props.hideHeader"
      class="flex items-center gap-2 bg-default py-2"
      :class="{ 'justify-end': props.hideSearch }"
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
        class="h-full scroller-block overflow-y-auto py-px"
        :class="{
          'space-y-1 px-3 pt-2': props.selectedIds !== undefined,
          'md:px-1': props.selectedIds !== undefined && props.compactDesktop,
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

        <template
          v-for="walletId in selectedWalletsIdsWithCurrency"
          :key="walletId"
        >
          <div
            v-if="props.selectedIds !== undefined"
            :class="cn(
              'flex items-center rounded-md border border-transparent bg-elevated/30 select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent',
              props.selectedIds.includes(walletId) && 'border-primary/40',
            )"
            @click="onClickWallet(walletId)"
          >
            <WalletsItem
              :activeItemId="props.activeItemId ?? null"
              :contextMenuItems="getWalletContextMenuItems(walletId)"
              :walletId
              :wallet="walletsStore.itemsComputed[walletId]!"
              :lineWidth="4"
              bodyClass="group/item min-w-0 flex-1"
              isShowIcon
              isShowCreditLimit
            />
          </div>

          <WalletsItem
            v-else
            :activeItemId="props.activeItemId ?? null"
            :contextMenuItems="getWalletContextMenuItems(walletId)"
            :walletId
            :wallet="walletsStore.itemsComputed[walletId]!"
            :lineWidth="4"
            class="group/item"
            isShowIcon
            isShowCreditLimit
            @click="onClickWallet(walletId)"
          />
        </template>
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
            : props.currencyAboveAction ? 'bottom-14' : 'bottom-2'"
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

    <LayoutConfirmModal
      v-if="deleteWalletId"
      :title="t('wallets.form.delete.title')"
      :description="deleteInfo.descText"
      :highlight="deleteInfo.highlight"
      @closed="cancelDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
