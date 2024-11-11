<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'
import type { WalletId } from '~/components/wallets/types'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(defineProps<{
  maxHeight: string
}>(), {
  maxHeight: '60vh',
})

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnFormStore = useTrnFormStore()
const walletsStore = useWalletsStore()
const { width } = useWindowSize()
const { pointerType } = usePointer()

const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return trnFormStore.values.walletId ?? walletId
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
  trnsStore.deleteTrn(JSON.parse(JSON.stringify(trnFormStore.values.trnId)))
  showModalConfirm.value = false
}

const items = computed(() => ({
  duplicate: {
    click: () => {
      if (trnFormStore.values.trnId) {
        trnFormStore.trnFormDuplicate(trnFormStore.values.trnId)
        trnFormStore.values.trnId = null
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

const items2 = computed(() => ({
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
      trnFormStore.onClose()
    },
    icon: 'mdi:check',
    localeKey: 'base.yes',
  },
}))
</script>

<template>
  <div class="grid pb-6">
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitle3
      class="bg-foreground-1 sticky top-0 z-10 px-3 pb-3 pt-4"
      @click="trnFormStore.values.trnId = null"
    >
      {{ trnFormStore.values.trnId ? t("trnForm.titleEditTrn") : t("trnForm.createTrn") }}
    </UiTitle3>

    <div
      v-if="trnFormStore.values.trnId"
      class="px-3 pb-2"
    >
      <TrnsItem
        :trnItem="trnsStore.computeTrnItem(trnFormStore.values.trnId)"
        class="bg-item-4 group rounded-lg"
        @click="trnFormStore.values.trnId = null"
      />

      <div
        v-if="showModalConfirm"
        class="fixed inset-0 z-10 size-full p-px"
      >
        <div class="bg-foreground-1 text-1 z-10 grid h-full content-center gap-4 rounded-xl px-4">
          <div>
            {{ t('base.sure') }}
          </div>

          <div class="flex flex-col gap-2">
            <UiElement
              v-for="(item, slug) in items2"
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

              <div class="text-secondary leading-none">
                {{ t(item.localeKey) }}
              </div>
            </UiElement>
          </div>
        </div>
      </div>

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

          <div class="text-secondary leading-none">
            {{ t(item.localeKey) }}
          </div>
        </DateLinkItem>
      </div>
    </div>

    <TrnFormDate class="px-3 pb-0 " />

    <TrnFormMainInput
      v-if="trnFormStore.values.trnType !== 2"
      :amount="trnFormStore.values.amount[trnFormStore.activeAmountIdx]"
      :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
      :highlight="trnFormStore.values.trnType === 0 ? 'income' : 'expense'"
      :isShowSum="trnFormStore.getIsShowSum()"
      class="px-3 pb-2 "
      @onChange="trnFormStore.onChangeAmount"
    />

    <div class="grid gap-3 px-3 pb-6 ">
      <!-- Selected -->
      <div
        v-if="trnFormStore.values.trnType !== 2"
        class="grid grid-cols-2 gap-2"
      >
        <TrnFormSelectorWallet
          v-if="walletId"
          :walletId
          :isLaptop
          @onOpen="show(0)"
          @onSelected="(id: WalletId) => trnFormStore.values.walletId = id"
        />

        <TrnFormSelectorCategory
          v-if="trnFormStore.values.categoryId"
          :categoryId="trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          :category="categoriesStore.items[trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]]"
          :isLaptop
          @onOpen="show(2)"
          @onSelected="(id: CategoryId) => trnFormStore.values.categoryId = id"
        />
      </div>

      <TrnFormMainAmountTransfer
        v-if="trnFormStore.values.trnType === 2"
        isLaptop
        @onOpen="show(0)"
      />

      <TrnFormMainCalculator
        :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
        @onChange="trnFormStore.onChangeAmount"
      />

      <TrnFormMainTypes />
    </div>
  </div>
</template>
