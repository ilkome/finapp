<script setup lang="ts">
import type { StatBlockPayload } from '~/components/stat/blocks/payload'

import { parseStatBlockPayload } from '~/components/stat/blocks/payload'

/** Mounts a pure stat view from a serializable payload; invalid input renders the error, never a broken block. */
const props = defineProps<{
  block: unknown
}>()

const parsed = computed(() => parseStatBlockPayload(props.block))
const block = computed<StatBlockPayload | null>(() => parsed.value.success ? parsed.value.data : null)
const error = computed(() => parsed.value.success ? null : parsed.value.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '))
</script>

<template>
  <div v-if="error" class="rounded-md bg-error/10 p-3 text-sm text-error" data-stat-block-error>
    {{ error }}
  </div>

  <StatSumView v-else-if="block?.type === 'sums'" v-bind="block.props" />

  <StatCategoriesListView v-else-if="block?.type === 'categoriesList'" v-bind="block.props" />

  <StatCategoriesRoundListView v-else-if="block?.type === 'categoriesRound'" v-bind="block.props" />

  <StatCategoriesVerticalListView v-else-if="block?.type === 'categoriesVertical'" v-bind="block.props" />

  <StatChartView v-else-if="block?.type === 'chart'" v-bind="block.props" />

  <StatWalletsView v-else-if="block?.type === 'wallets'" v-bind="block.props" />

  <div v-else-if="block?.type === 'trns'" class="grid" data-stat-block="trns">
    <TrnsItem
      v-for="row in block.props.rows"
      :key="row.trnItem.id"
      :date="row.date"
      :trnItem="row.trnItem"
    />
  </div>

  <FilterChipsView v-else-if="block?.type === 'chips'" :chips="block.props.chips" />
</template>
