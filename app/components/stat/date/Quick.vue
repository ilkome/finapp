<script setup lang="ts">
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const isExpanded = ref(false)
</script>

<template>
  <div class="flex items-center overflow-x-auto">
    <DateRanges
      :itemProps="{ variant: 'small' }"
      :statDate
      view="periods"
    />

    <template v-if="isExpanded">
      <DateRanges
        :itemProps="{ variant: 'small' }"
        :statDate
        view="presets"
      />

      <DateRanges
        :itemProps="{ variant: 'small' }"
        :statDate
        view="maximum"
      />
    </template>

    <button
      type="button"
      class="interactive text-muted flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-sm"
      @click="isExpanded = !isExpanded"
    >
      <Icon
        :name="isExpanded ? 'lucide:chevron-left' : 'lucide:chevron-right'"
        size="16"
      />
    </button>
  </div>
</template>
