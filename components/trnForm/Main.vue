<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  maxHeight: string
}>(), {
  maxHeight: '60vh',
})

const trnFormStore = useTrnFormStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const { width } = useWindowSize()
const { pointerType } = usePointer()

const isLaptop = computed(() => width.value >= 1024 && pointerType.value === 'mouse')

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
</script>

<template>
  <div class="1">
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitle
      class="pb-2 pt-1.5"
      @click="trnFormStore.values.trnId = null"
    >
      <template v-if="trnFormStore.values.trnId">
        {{ $t("trnForm.titleEditTrn") }}
      </template>
      <template v-if="!trnFormStore.values.trnId">
        {{ $t("trnForm.createTrn") }}
      </template>
    </UiTitle>

    <TrnFormDate class="pb-2" />
    <TrnFormMainAmountTrn v-if="trnFormStore.values.trnType !== 2" />
    <TrnFormMainAmountTransfer v-if="trnFormStore.values.trnType === 2" />

    <TrnFormMainCalculator
      class="pb-3"
      :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
      @onChange="trnFormStore.onChangeAmount"
    />

    <!-- Selected -->
    <div
      v-if="trnFormStore.values.trnType !== 2"
      class="grid grid-cols-2 gap-3 pb-3"
    >
      <!-- Wallet -->
      <div v-if="walletId">
        <WalletsItem
          v-if="!isLaptop"
          :walletId
          :wallet="walletsStore.sortedItems[walletId]"
          alt
          @click="show(0)"
        />

        <VDropdown
          v-else
          :overflowPadding="12"
          autoBoundaryMaxSize
          placement="bottom-start"
        >
          <WalletsItem
            :walletId
            :wallet="walletsStore.sortedItems[walletId]"
            alt
          />

          <template #popper="{ hide }">
            <!-- TODO: combine -->
            <div class="flex items-center px-3 h-12">
              <UiTitle>{{ $t('wallets.title') }}</UiTitle>
              <BaseBottomSheetClose @onClick="hide" />
            </div>
            <WalletsSelector
              :hide
              class="w-[90vw] max-w-xs"
              @onSelected="id => trnFormStore.values.walletId = id"
            />
          </template>
        </VDropdown>
      </div>

      <!-- Category -->
      <div v-if="!isLaptop">
        <CategoriesItem2
          :categoryId="trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          @click="show(2)"
        />
      </div>

      <VDropdown
        v-else
        :overflowPadding="12"
        autoBoundaryMaxSize
        placement="top-start"
      >
        <CategoriesItem2

          :categoryId="trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
        />

        <template #popper="{ hide }">
          <!-- TODO: combine -->
          <div class="flex items-center px-3 h-12">
            <UiTitle>{{ $t('categories.title') }}</UiTitle>
            <BaseBottomSheetClose @onClick="hide" />
          </div>

          <CategoriesSelector
            :hide
            @onSelected="id => trnFormStore.values.categoryId = id"
          />
        </template>
      </VDropdown>
    </div>

    <TrnFormMainTypes />
  </div>
</template>
