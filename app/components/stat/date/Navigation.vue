<script setup lang="ts">
import type { Range, StatDateProvider } from '~/components/date/types'

const props = defineProps<{
  maxRange: Range
}>()

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider

const isShowNavNext = computed(() => {
  return !statDate.params.value.isShowMaxRange && (statDate.range.value.start < new Date().getTime() || (statDate.range.value.start !== props.maxRange.start && statDate.range.value.end !== props.maxRange.end))
})
</script>

<template>
  <div class="items-top grid grid-cols-[1fr,auto] gap-2 md:max-w-lg">
    <BottomSheetOrDropdown
      :title="t('dates.select')"
      :isOpen="statDate.modals.value.dateSelector"
      @onOpenModal="statDate.modals.value.dateSelector = true"
      @onCloseModal="statDate.modals.value.dateSelector = false"
    >
      <template #trigger>
        <UiTitle10 class="_mt-1">
          <StatDateRange />
        </UiTitle10>
      </template>

      <template #content="{ close }">
        <StatDateSelector
          class="min-w-[350px] px-3"
          :maxRange
          @onClose="close"
        />
      </template>
    </BottomSheetOrDropdown>

    <div
      v-if="!statDate.params.value.customDate"
      class="flex gap-1"
    >
      <DateNav
        v-if="isShowNavNext"
        :maxRange
      />
    </div>
  </div>
</template>
