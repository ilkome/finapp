<script setup lang="ts">
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const isExpanded = ref(false)
</script>

<template>
  <div class="flex min-w-0 items-center">
    <div class="flex min-w-0 items-center overflow-x-auto">
      <StatDateRanges
        size="xs"
        :statDate
        view="periods"
      />

      <template v-if="isExpanded">
        <StatDateRanges
          size="xs"
          :statDate
          view="presets"
        />

        <StatDateRanges
          size="xs"
          :statDate
          view="maximum"
        />
      </template>
    </div>

    <button
      type="button"
      class="flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-sm interactive text-muted"
      @click="isExpanded = !isExpanded"
    >
      <Icon
        :name="isExpanded ? 'lucide:chevron-left' : 'lucide:chevron-right'"
        size="16"
      />
    </button>
  </div>
</template>
