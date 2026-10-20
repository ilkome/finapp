<script setup lang="ts">
import { statDateRangeLabel } from '~/components/stat/date/rangeLabelText'
import { statDateKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  /** A full-width button, styled like the other sheet footer buttons. */
  isBlock?: boolean
  /** The first tap returns to the default period instead of opening the picker. */
  isReset?: boolean
}>()

const { locale, t } = useI18n()
const statDate = inject(statDateKey)!

const isOpen = computed({
  get: () => statDate.modal.value.dateSelector,
  set: (value) => {
    if (value && props.isReset) {
      statDate.goHome()
      return
    }
    statDate.modal.value.dateSelector = value
  },
})

const label = computed(() => statDateRangeLabel({
  intervalsInRange: statDate.intervalsInRange.value,
  params: statDate.params.value,
  range: statDate.range.value,
}, t, locale.value))
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isOpen"
    :title="t('dates.select')"
    popoverContentClass="md:w-max md:max-w-[calc(100vw-1rem)]"
    :unmountOnHide="false"
    :class="props.isBlock ? 'grid' : 'flex gap-1'"
    isShowCloseBtn
    keyboardTrigger
  >
    <template #trigger="{ isActive }">
      <UButton
        v-if="props.isBlock"
        block
        color="neutral"
        size="xl"
        variant="soft"
        :icon="props.isReset ? 'i-lucide-rotate-ccw' : 'i-lucide-calendar-range'"
        class="capitalize"
        data-stat-date-range
      >
        {{ label }}
      </UButton>
      <UiTitleDropdown v-else data-stat-date-range :isActive>
        <Icon v-if="props.isReset" name="lucide:rotate-ccw" size="14" class="shrink-0 text-muted" :aria-label="t('base.reset')" />
        <div class="flex items-center gap-1 leading-none text-nowrap capitalize">
          {{ label }}
        </div>
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <StatDateRangePicker
        class="min-w-0 pb-2 md:min-w-90.5 md:pb-0"
        @close="close"
      />
    </template>
  </DrawerOrDropdown>
</template>
