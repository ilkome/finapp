<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useFilter } from '~/components/filter/useFilter'

defineOptions({ name: 'Dashboard' })

const filter = useFilter()
const { t } = useI18n()
const trnsStore = useTrnsStore()
provide('filter', filter)

useHead({
  title: t('stat.title'),
})
</script>

<template>
  <div
    v-if="trnsStore.hasItems"
    class="h-full overflow-hidden overflow-y-auto"
  >
    <StatMini
      :categoriesIds="filter?.catsIds?.value"
      :isShowTotals="filter?.catsIds?.value?.length > 0 || filter?.walletsIds?.value?.length > 0"
      :walletsIds="filter?.walletsIds?.value"
      isShowFilter
      storageKey="stat"
    />
  </div>

  <LazyAppWelcome v-else />
</template>
