<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useFilter } from '~/components/filter/useFilter'
import { useAppNav } from '~/components/app/useAppNav'
import useTrn from '~/components/trns/item/useTrn'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'

const { trnFormEdit, trnFormDuplicate } = useTrnForm()
const filterStore = useFilter()
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
const showModalGroups = ref(false)

const trnId = computed(() => trnsStore.editId)
const category = computed(() => categoriesStore.items[trnsStore.items[trnId.value].categoryId])

const wallet = computed(() => walletsStore.items?.[trnsStore.items[trnId.value].walletId])

function handleSetFilterCategory() {
  filterStore.setCategoryId(trnsStore.items[trnId.value].categoryId)
  filterStore.setDateNow()
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
  activeTabStat.value = 'summary'
}

function handleSetFilterWallet() {
  filterStore.setWalletId(trnsStore.items[trnId.value].walletId)
  trnsStore.hideTrnModal()
  trnsStore.setTrnModalId(null)
  filterStore.setDateNow()
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

<template lang="pug">
Teleport(
  v-if="trnsStore.isShownModal"
  to="body"
)
  LazyBaseBottomSheet(
    v-if="trnsStore.isShownModal"
    key="TrnsItemModal"
    @closed="closed"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .header
        TrnsItemDetails(
          :category="category"
          :trn="trnItem"
          :trnId="trnId"
          :wallet="wallet"
          ui="detailed"
        )

    template(#default="{ close }")
      .content.pb-4
        .tools
          .modalLinks
            ModalButton(
              :name="$t('base.delete')"
              icon="mdi mdi-delete-empty-outline"
              @onClick="handleDeleteClick"
            )

            ModalButton(
              :name="$t('base.edit')"
              icon="mdi mdi-pencil-outline"
              @onClick="handleEditClick"
            )

            ModalButton(
              :name="$t('base.duplicate')"
              icon="mdi mdi-content-copy"
              @onClick="handleDuplicateTrn"
            )

            ModalButton(
              :name="`${$t('base.setFilter')} ${category.name}`"
              @onClick="handleSetFilterCategory"
            )
              template(#icon)
                Icon(
                  :icon="category.icon"
                  :background="category.color"
                  round
                )

            ModalButton(
              v-if="wallet"
              :name="`${$t('base.setFilter')} ${wallet.name}`"
              @onClick="handleSetFilterWallet"
            )
              template(#icon)
                Icon(
                  :abbr="wallet.name"
                  :background="wallet.color"
                )

        .pt-4.px-4.flex-center
          .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-4.hocus_bg-item-5(
            class="basis-1/2 max-w-[280px]"
            @click="close()"
          ) {{ $t('close') }}

  //- delete confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    @closed="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
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
