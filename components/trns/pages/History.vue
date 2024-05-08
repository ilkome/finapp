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
      <UiHeaderTitle2>{{ $t("trns.history") }}</UiHeaderTitle2>
    </UiHeader>

    <Filter
      v-if="filterStore.isShow"
      class="flex gap-2 rounded-lg bg-item-4"
    />

    <TrnsListWithControl
      :trnsIds="trnsStore.allTrnsIdsWithFilter"
      class="my-4 max-w-[420px] md_max-w-none"
    />
  </UiPage>
</template>
