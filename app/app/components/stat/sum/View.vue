<script setup lang="ts">
import type { StatSumRecord } from '~/components/stat/sum/types'
import type { SeriesSlugSelected } from '~/components/stat/types'

const props = defineProps<{
  currencyCode: string
  /** Summary mode with a category focus: the focused type replaces the tiles on narrow layouts. */
  focused?: StatSumRecord | null
  // Without the "Итого" tile there is room for the pie on narrow layouts too.
  isShowPieOnNarrow?: boolean
  /** Summary mode: one tile per record. Single mode: `single` only. */
  items: StatSumRecord[]
  single?: StatSumRecord | null
}>()

const emit = defineEmits<{
  click: [type: SeriesSlugSelected]
  clickAverage: []
}>()

const tileClass = 'flex min-h-10.5 min-w-min flex-1 items-center interactive @2xl/stat:max-w-max'
</script>

<template>
  <div class="overflow-x-auto">
    <template v-if="!props.single">
      <StatSumItemView
        v-if="props.focused"
        :amount="props.focused.amount"
        class="w-full @2xl/stat:hidden"
        :currencyCode="props.currencyCode"
        :type="props.focused.type"
        variant="summary"
        @click="emit('click', props.focused!.type)"
      >
        <UiButtonClose class="top-1/2 right-3 -translate-y-1/2" @click.stop="emit('click', props.focused!.type)" />
        <div class="mr-10 ml-auto flex w-12 shrink-0 items-center justify-center">
          <slot name="focusPie" />
        </div>
      </StatSumItemView>

      <div
        :class="props.focused ? 'hidden @2xl/stat:flex' : 'flex'"
        class="flex-wrap gap-2 @2xl/stat:justify-start"
      >
        <StatSumItemView
          v-for="item in props.items"
          :key="item.type"
          :amount="item.amount"
          :class="tileClass"
          :currencyCode="props.currencyCode"
          :isActive="item.isActive"
          :type="item.type"
          variant="summary"
          @click="emit('click', item.type)"
        >
          <StatSumAverageView
            v-if="item.average !== undefined"
            :amount="item.average"
            :currencyCode="props.currencyCode"
            :type="item.type"
          />

          <div :class="props.isShowPieOnNarrow ? 'flex' : 'hidden @2xl/stat:flex'" class="ml-auto w-12 shrink-0 items-center justify-center">
            <slot name="summaryPie" :type="item.type" />
          </div>
        </StatSumItemView>
      </div>
    </template>

    <div v-else class="flex items-center justify-start">
      <StatSumItemView
        :amount="props.single.amount"
        :averageTotal="props.single.averageByPeriod"
        class="flex min-h-10.5 w-full min-w-min items-center"
        :currencyCode="props.currencyCode"
        :type="props.single.type"
        variant="summary"
        @click="emit('clickAverage')"
      >
        <StatSumAverageView
          v-if="props.single.average !== undefined"
          :amount="props.single.average"
          :currencyCode="props.currencyCode"
          :type="props.single.type"
        />

        <div
          v-if="props.single.type === 'expense' || props.single.type === 'income'"
          class="ml-auto flex w-12 shrink-0 items-center justify-center"
        >
          <slot name="summaryPie" :type="props.single.type" />
        </div>
      </StatSumItemView>
    </div>
  </div>
</template>
