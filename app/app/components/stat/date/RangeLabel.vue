<script setup lang="ts">
import { statDateRangeLabel } from '~/components/stat/date/rangeLabelText'
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const { locale, t } = useI18n()

const date = computed(() => statDateRangeLabel({
  intervalsInRange: statDate.intervalsInRange.value,
  params: statDate.params.value,
  range: statDate.range.value,
}, t, locale.value))
</script>

<template>
  <div class="flex items-center gap-1 leading-none text-nowrap capitalize">
    {{ date }}
  </div>
</template>
