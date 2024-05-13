<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const filter = useFilter()

useHead({
  title: t('trns.history'),
})

const trnsIds = computed(() => filter.getTrnsIdsWithFilter())

provide('filter', filter)
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>{{ $t("trns.history") }}</UiHeaderTitle2>
    </UiHeader>

    <div class="grid gap-3 px-2">
      <Filter
        class="flex gap-2 rounded-lg bg-item-4"
      />

      <TrnsList2
        isShowFilter
        isShowHeader
        :trnsIds
      />
    </div>
  </UiPage>
</template>
