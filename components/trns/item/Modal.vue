<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useAppNav } from '~/components/app/useAppNav'
import useTrn from '~/components/trns/item/useTrn'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('filter') as PeriodProvider
const { trnFormEdit, trnFormDuplicate } = useTrnForm()
const { activeTabStat } = storeToRefs(useAppNav())
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

function closed() {
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
}

const { formatTrnItem } = useTrn()
const trnItem = computed(() => formatTrnItem(trnsStore.editId))

const showModalConfirm = ref(false)

const trnId = computed(() => trnsStore.editId)
const category = computed(
  () => categoriesStore.items[trnsStore.items[trnId.value].categoryId],
)

const wallet = computed(
  () => walletsStore.items?.[trnsStore.items[trnId.value].walletId],
)

function handleSetFilterCategory() {
  period.setCategoryId(trnsStore.items[trnId.value].categoryId)
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
  activeTabStat.value = 'summary'
}

function handleSetFilterWallet() {
  period.setWalletId(trnsStore.items[trnId.value].walletId)
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
  activeTabStat.value = 'summary'
}

function handleDuplicateTrn() {
  trnFormDuplicate(trnId.value)
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
}

function handleEditClick() {
  trnFormEdit(trnId.value)
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
}

function handleDeleteClick() {
  showModalConfirm.value = true
}

function handleDeleteConfirm() {
  // Stringify to avoid reactivity
  const id = JSON.parse(JSON.stringify(trnId.value))
  setTimeout(() => trnsStore.deleteTrn(id), 100)

  showModalConfirm.value = false
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
}
</script>

<template>
  <Teleport v-if="trnsStore.isShownModal" to="body">
    <LazyBaseBottomSheet
      v-if="trnsStore.isShownModal"
      key="TrnsItemModal"
      @closed="closed"
    >
      <template #handler="{ close }">
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #header>
        <div class="header">
          <TrnsItemDetails
            :category="category"
            :trn="trnItem"
            :trnId="trnId"
            :wallet="wallet"
            ui="detailed"
          />
        </div>
      </template>

      <template #default="{ close }">
        <div class="content pb-4">
          <div class="tools">
            <div class="div">
              <ModalButton
                :name="$t('base.delete')"
                icon="mdi mdi-delete-empty-outline"
                @onClick="handleDeleteClick"
              />
              <ModalButton
                :name="$t('base.edit')"
                icon="mdi mdi-pencil-outline"
                @onClick="handleEditClick"
              />
              <ModalButton
                :name="$t('base.duplicate')"
                icon="mdi mdi-content-copy"
                @onClick="handleDuplicateTrn"
              />
              <ModalButton
                :name="`${$t('base.setFilter')} ${category.name}`"
                @onClick="handleSetFilterCategory"
              >
                <template #icon>
                  <Icon
                    :icon="category.icon"
                    :background="category.color"
                    round
                  />
                </template>
              </ModalButton>
              <ModalButton
                v-if="wallet"
                :name="`${$t('base.setFilter')} ${wallet.name}`"
                @onClick="handleSetFilterWallet"
              >
                <template #icon>
                  <Icon :abbr="wallet.name" :background="wallet.color" />
                </template>
              </ModalButton>
            </div>
          </div>
          <div class="flex-center px-4 pt-4">
            <div
              class="flex-center max-w-[280px] grow basis-1/2 rounded-full bg-item-4 px-5 py-3 text-sm hocus_bg-item-5"
              @click="close()"
            >
              {{ $t("close") }}
            </div>
          </div>
        </div>
      </template>
    </LazyBaseBottomSheet>

    <!-- delete confirm -->
    <ModalBottomConfirm
      :show="showModalConfirm"
      @closed="showModalConfirm = false"
      @onConfirm="handleDeleteConfirm"
    />
  </Teleport>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.header
  flex-grow 1
  position relative
  display flex
  align-items center
  justify-content center
  padding 16px
  padding-bottom 26px
  color var(--c-font-2)
  font-secondary()
  background var(--c-bg-3)
  border-radius 16px 16px 0 0

.content
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 16px 16px
</style>
