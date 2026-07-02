<script setup lang="ts">
import { filterKey } from '~/components/stat/injectionKeys'

const filter = inject(filterKey)!
const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="isOpen"
    :title="t('base.filters')"
    isShowCloseBtn
    @closeModal="isOpen = false"
    @openModal="isOpen = true"
  >
    <template #trigger>
      <UTooltip :text="t('base.filters')">
        <UChip
          :show="filter.isShow.value"
          color="secondary"
          inset
          size="xs"
        >
          <UiActionButton :ariaLabel="t('base.filters')">
            <Icon name="lucide:list-filter" size="20" />
          </UiActionButton>
        </UChip>
      </UTooltip>
    </template>

    <template #custom="{ close }">
      <StatFilterPanel @close="close" />
    </template>
  </BottomSheetOrDropdown>
</template>
