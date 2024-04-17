<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return $trnForm.values.walletId ?? walletId
})
</script>

<template>
  <div class="py-4">
    <UiTitle class="px-3 pb-2" @click="$trnForm.values.trnId = null">
      <template v-if="$trnForm.values.trnId">
        {{ $t("trnForm.titleEditTrn") }}
      </template>
      <template v-if="!$trnForm.values.trnId">
        {{ $t("trnForm.createTrn") }}
      </template>
    </UiTitle>

    <TrnFormDate />
    <TrnFormMainAmountTrn v-if="$trnForm.values.trnType !== 2" />
    <TrnFormMainAmountTransfer v-if="$trnForm.values.trnType === 2" />

    <TrnFormMainCalculator
      class="pb-2"
      :amountRaw="$trnForm.values.amountRaw[$trnForm.activeAmountIdx]"
      @onChange="$trnForm.onChangeAmount"
    />

    <!-- Selected -->
    <div
      v-if="$trnForm.values.trnType !== 2"
      class="grid grid-cols-2 gap-3 px-2 pb-2"
    >
      <VDropdown v-if="walletId">
        <FilterWalletItem :walletId />
        <template #popper="{ hide }">
          <WalletsSelector
            :hide
            @onSelected="id => $trnForm.values.walletId = id"
          />
        </template>
      </VDropdown>

      <VDropdown
        :overflowPadding="12"
        autoBoundaryMaxSize
      >
        <div>
          <FilterCategoryItem
            :categoryId="$trnForm.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          />
        </div>

        <template #popper="{ hide }">
          <CategoriesSelector
            :hide
            isAllowSelectParentCategory
            @onSelected="id => $trnForm.values.categoryId = id"
          />
        </template>
      </VDropdown>
    </div>

    <TrnFormMainTypes />
  </div>
</template>
