<script setup lang="ts">
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const filterStore = useFilterStore()
const trnsStore = useTrnsStore()

const { t } = useI18n()
useHead({
  title: t('trns.history'),
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ $t("trns.history") }}</UiHeaderTitle>
    </UiHeader>

    <div v-if="filterStore.isShow" class="flex gap-2 rounded-lg bg-item-4">
      <LazyStatFilter />
    </div>

    <div class="my-4 max-w-[420px] md_max-w-none">
      <TrnsListWithControl :trnsIds="trnsStore.allTrnsIdsWithFilter" />
    </div>
  </UiPage>
</template>
