<script setup lang="ts">
import { historyFiltersKey } from '~/components/trns/history/injectionKeys'

const filters = inject(historyFiltersKey)!
const { t } = useI18n()
const isOpen = ref(false)
const minimum = ref('')
const maximum = ref('')
const hasAmount = computed(() => !!filters.amountMin.value || !!filters.amountMax.value)

watch([filters.amountMin, filters.amountMax], ([minimumValue, maximumValue]) => {
  minimum.value = minimumValue
  maximum.value = maximumValue
}, { immediate: true })

function onOpen() {
  isOpen.value = true
}

function apply(close: () => void) {
  filters.setAmountRange(minimum.value, maximum.value)
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="isOpen"
    :title="t('trns.historyTable.filters.amount')"
    isShowCloseBtn
    @closeModal="isOpen = false"
    @openModal="onOpen"
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :isActive>
        <span class="text-nowrap">{{ t('trns.historyTable.filters.amount') }}</span>
        <span v-if="hasAmount" class="size-1.5 rounded-full bg-primary" />
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <div class="grid min-w-72 gap-3 p-3">
        <div class="grid grid-cols-2 gap-2">
          <UInput
            v-model="minimum"
            inputmode="decimal"
            :placeholder="t('trns.historyTable.filters.minimum')"
            size="xl"
            type="number"
          />
          <UInput
            v-model="maximum"
            inputmode="decimal"
            :placeholder="t('trns.historyTable.filters.maximum')"
            size="xl"
            type="number"
          />
        </div>
        <UiButtonAccent @click="apply(close)">
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
