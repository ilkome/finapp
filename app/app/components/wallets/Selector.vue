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
  disabledIds?: WalletId[]
  filterAtTop?: boolean
  hide?: () => void
  selectedIds?: WalletId[]
  withHeader?: boolean
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const searchQuery = computed(() => search.value.trim().toLowerCase())

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

onMounted(async () => {
  if (!props.withHeader)
    return
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <div
      v-if="props.withHeader"
      class="bg-default flex items-center gap-2 pt-2 pb-2"
    >
      <input
        ref="searchInput"
        v-model="search"
        type="text"
        class="bg-elevated/30 placeholder:text-muted hover:bg-elevated/50 focus:bg-elevated/50 focus:border-primary m-0 min-h-[42px] w-0 min-w-0 flex-1 rounded-md border border-transparent px-4 py-2 text-base font-normal outline-none"
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
        class="scrollerBlock h-full overflow-y-auto py-px"
        :class="{
          'pb-16': !props.filterAtTop && walletsStore.currenciesUsed.length > 1,
          'pt-12': props.filterAtTop && walletsStore.currenciesUsed.length > 1,
        }"
      >
        <div
          v-if="hasNoMatches"
          class="text-muted p-4 text-center"
        >
          {{ t('search.noResults') }}
        </div>

        <template
          v-for="walletId in selectedWalletsIdsWithCurrency"
          :key="walletId"
        >
          <div
            v-if="props.selectedIds !== undefined"
            class="hover:bg-elevated/50 flex items-center rounded-sm select-none [&_.uiElement:hover]:bg-transparent"
            @click="onClickWallet(walletId)"
          >
            <div
              class="flex-center relative w-10 shrink-0 self-stretch pl-2"
              @click.stop
            >
              <div
                class="absolute inset-0 z-10"
                @click.stop="onClickWallet(walletId)"
              />
              <UCheckbox
                :modelValue="props.selectedIds.includes(walletId)"
                class="pointer-events-none"
              />
            </div>
            <WalletsItem
              :activeItemId="props.activeItemId ?? null"
              :contextMenuItems="getWalletContextMenuItems(walletId)"
              :walletId
              :wallet="walletsStore.itemsComputed[walletId]!"
              :lineWidth="4"
              class="group/item min-w-0 flex-1"
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
          class="pointer-events-none absolute left-0 z-10 h-12 w-full"
          :class="props.filterAtTop ? 'top-0' : 'bottom-0'"
          :style="props.filterAtTop
            ? 'background: linear-gradient(to top, transparent, var(--ui-bg))'
            : 'background: linear-gradient(to bottom, transparent, var(--ui-bg))'"
        />
        <div
          class="pointer-events-none absolute left-0 z-20 w-full px-2"
          :class="props.filterAtTop ? 'top-0' : 'bottom-2'"
        >
          <div class="border-default/80 bg-default/20 pointer-events-auto rounded-2xl border p-1 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50">
            <WalletsCurrencies
              :currencyFiltered
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
