<script setup lang="ts">
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const isExpanded = ref(false)
</script>

<template>
  <div class="flex items-center overflow-x-auto">
    <StatDateRanges
      :itemProps="{ variant: 'small' }"
      :statDate
      view="periods"
    />

    <template v-if="isExpanded">
      <StatDateRanges
        :itemProps="{ variant: 'small' }"
        :statDate
        view="presets"
      />

      <StatDateRanges
        :itemProps="{ variant: 'small' }"
        :statDate
        view="maximum"
      />
    </template>

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
