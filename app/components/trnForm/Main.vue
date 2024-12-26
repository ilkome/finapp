<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  maxHeight: string
}>(), {
  maxHeight: '60vh',
})

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const { width } = useWindowSize()
const { pointerType } = usePointer()

const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return trnsFormStore.values.walletId ?? walletId
})

const isShow = ref(false)
const initialSlide = ref(0)
function show(slide: number) {
  isShow.value = true
  initialSlide.value = slide
}

const trnsStore = useTrnsStore()
const showModalConfirm = ref(false)

function handleDeleteConfirm() {
  trnsStore.deleteTrn(JSON.parse(JSON.stringify(trnsFormStore.values.trnId)))
  showModalConfirm.value = false
}

const items = computed(() => ({
  duplicate: {
    click: () => {
      if (trnsFormStore.values.trnId) {
        trnsFormStore.trnFormDuplicate(trnsFormStore.values.trnId)
        trnsFormStore.values.trnId = null
      }
    },
    icon: 'mdi:content-copy',
    localeKey: 'base.duplicate',
  },
  // eslint-disable-next-line perfectionist/sort-objects
  delete: {
    click: () => {
      showModalConfirm.value = true
    },
    icon: 'mdi:delete-empty-outline',
    localeKey: 'base.delete',
  },
}))

const actions = computed(() => ({
  no: {
    click: () => {
      showModalConfirm.value = false
    },
    icon: 'mdi:close',
    localeKey: 'base.no',
  },

  yes: {
    click: () => {
      handleDeleteConfirm()
      trnsFormStore.onClose()
    },
    icon: 'mdi:check',
    localeKey: 'base.yes',
  },
}))
</script>

<template>
  <div class="grid pb-0">
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitle3
      class="bg-foreground-1 sticky top-0 z-10 px-3 pb-3 pt-4"
      @click="trnsFormStore.values.trnId = null"
    >
      {{ trnsFormStore.values.trnId ? t("trnForm.titleEditTrn") : t("trnForm.createTrn") }}
    </UiTitle3>

    <div
      v-if="trnsFormStore.values.trnId"
      class="relative mb-2 px-3"
    >
      <TrnsItem
        :trnItem="trnsStore.computeTrnItem(trnsFormStore.values.trnId)"
        class="bg-item-4 group rounded-lg"
        @click="trnsFormStore.values.trnId = null"
      />

      <div
        v-if="showModalConfirm"
        class="absolute -bottom-4 left-0 z-10 w-full px-4"
      >
        <div class="text-1 bg-foreground-4 border-accent-1 z-10 grid h-full content-center gap-4 rounded-lg border p-3">
          {{ t('base.sure') }}

          <div class="flex gap-2">
            <UiElement
              v-for="(item, slug) in actions"
              :key="slug"
              class="grow"
              insideClasses="!min-h-[44px] bg-item-4"
              @click="item.click"
            >
              <template #leftIcon>
                <Icon
                  :name="item.icon"
                  size="22"
                />
              </template>

              <div class="text-2 leading-none">
                {{ t(item.localeKey) }}
              </div>
            </UiElement>
          </div>
        </div>
      </div>

      <!-- Trn actions -->
      <div class="flex gap-2 pt-2">
        <DateLinkItem
          v-for="(item, slug) in items"
          :key="slug"
          @click="item.click"
        >
          <template #leftIcon>
            <Icon
              :name="item.icon"
              size="22"
            />
          </template>

          <div class="text-2 leading-none">
            {{ t(item.localeKey) }}
          </div>
        </DateLinkItem>
      </div>
    </div>

    <TrnFormDate class="px-3 pb-0 " />

    <TrnFormMainInput
      v-if="trnsFormStore.values.trnType !== 2"
      :amount="trnsFormStore.values.amount[trnsFormStore.activeAmountIdx]"
      :amountRaw="trnsFormStore.values.amountRaw[trnsFormStore.activeAmountIdx]"
      :highlight="trnsFormStore.values.trnType === 0 ? 'income' : 'expense'"
      :isShowSum="trnsFormStore.getIsShowSum()"
      class="px-3 pb-2 "
      @onChange="trnsFormStore.onChangeAmount"
    />

    <div class="grid gap-3 px-3 pb-6 ">
      <!-- Selected -->
      <div
        v-if="trnsFormStore.values.trnType !== 2"
        class="grid grid-cols-2 gap-2"
      >
        <TrnFormSelectorWallet
          v-if="walletId"
          :bottomSheetStyle="{ maxHeight: props.maxHeight }"
          :isLaptop
          :title="t('trnForm.wallet.select')"
          :walletId="walletId"
          @onOpen="show(0)"
          @onSelected="(id: WalletId) => trnsFormStore.values.walletId = id"
        />

        <TrnFormSelectorCategory
          v-if="trnsFormStore.values.categoryId"
          :bottomSheetStyle="{ maxHeight: props.maxHeight }"
          :category="categoriesStore.items[trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]]"
          :categoryId="trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          :isLaptop
          :title="t('trnForm.category.select')"
          @onOpen="show(2)"
          @onSelected="(id: CategoryId) => trnsFormStore.values.categoryId = id"
        />
      </div>

      <TrnFormMainAmountTransfer
        v-if="trnsFormStore.values.trnType === 2"
        isLaptop
        @onOpen="show(0)"
      />

      <TrnFormMainCalculator />
      <TrnFormMainTypes />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    trnForm:
      wallet:
        select: Select wallet
      category:
        select: Select category

  ru:
    trnForm:
      wallet:
        select: Выбрать кошелек
      category:
        select: Выбрать категорию
</i18n>
