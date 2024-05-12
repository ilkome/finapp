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

    <div class="px-2">
      <TrnsList2
        :trnsIds="trnsStore.allTrnsIdsWithFilter.slice(0, 5)"
      />
    </div>
  </UiPage>
</template>
