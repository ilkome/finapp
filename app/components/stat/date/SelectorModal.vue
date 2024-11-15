<script setup lang="ts">
import type { DeepPartial } from '~~/utils/types'
import type { Range } from '~/components/date/types'
import type { ViewOptions } from '~/components/stat/types'

defineProps<{
  maxRange: Range
}>()

const emit = defineEmits<{
  changeViewOptions: [o: DeepPartial<ViewOptions>]
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
      <div class="scrollerBlock grid max-h-[98dvh] overflow-hidden overflow-y-auto p-2 pb-4">
        <UiTitle9 class="pb-3 pt-1">
          {{ t("dates.select") }}
        </UiTitle9>

        <StatDateSelector
          :maxRange
          @changeViewOptions="emit('changeViewOptions', $event)"
          @onClose="() => { emit('onClose'); close() }"
        />
      </div>
    </template>
  </BaseBottomSheet2>
</template>
