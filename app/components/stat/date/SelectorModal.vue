<script setup lang="ts">
import type { Range } from '~/components/date/types'

defineProps<{
  maxRange: Range
}>()

const emit = defineEmits<{
  onClose: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseBottomSheet2
    isShow
    drugClassesCustom="bg-foreground-1 max-w-xl grid md:mb-12 max-h-[98dvh]"
    @closed="emit('onClose')"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>

    <template #default="{ close }">
      <div class="scrollerBlock grid max-h-[98dvh] overflow-hidden overflow-y-auto p-2 px-3 pb-4">
        <UiTitle class="px-1 pb-3 pt-2">
          {{ t("dates.select") }}
        </UiTitle>

        <StatDateSelector
          :maxRange
          @onClose="() => { emit('onClose'); close() }"
        />
      </div>
    </template>
  </BaseBottomSheet2>
</template>
