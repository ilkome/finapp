<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'
import type { FilterProvider } from '~/components/filter/useFilter'
import { formatDateByPeriod } from '~/components/date/format'

const period = inject('period') as FilterProvider

const { t } = useI18n()
const formattedDate = computed(() => formatDateByPeriod(period.date.value, period.nameWithoutAll.value, {
  current: t('dates.week.current'),
  last: t('dates.week.last'),
}))
</script>

<template>
  <VDropdown>
    <div
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex items-center px-3 py-2 text-base font-medium leading-none text-item-1"
    >
      {{ period.nameWithAll.value === "all" ? $t("dates.all.simple") : formattedDate }}
    </div>

    <template #popper="{ hide }">
      <StatDateModal :hide="hide" />
    </template>
  </VDropdown>
</template>
