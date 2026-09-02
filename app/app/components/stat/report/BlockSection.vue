<script setup lang="ts">
import type { StatReportBlockId } from '~/components/stat/config/schema'
import type { StatReportContext } from '~/components/stat/report/types'

import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  blocks: StatReportBlockId[]
  contexts: Record<'combined' | 'expense' | 'income', StatReportContext>
}>()

const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
function isBlockVisible(block: StatReportBlockId) {
  if (block === 'catsRound')
    return statConfig.config.value.categories.round.isShow
  if (block === 'vertical')
    return statConfig.config.value.categories.bars.isShow
  if (block === 'catsList') {
    return statConfig.config.value.categories.list.isShow
      || Object.values(props.contexts).some(ctx => ctx.focusedQuickCategoryHasChildren.value)
  }
  return statConfig.config.value.trns.isShow
    || Object.values(props.contexts).some(ctx => ctx.selectedTrnsIds.value.length === 0)
}

const visibleBlocks = computed(() => props.blocks.filter(isBlockVisible))
const combinedGroups = computed(() => {
  const groups: Array<{
    blocks: StatReportBlockId[]
    kind: 'columns' | 'round'
  }> = []

  for (const block of visibleBlocks.value) {
    if (block === 'catsRound') {
      groups.push({ blocks: [block], kind: 'round' })
      continue
    }

    const previous = groups.at(-1)
    if (previous?.kind === 'columns')
      previous.blocks.push(block)
    else groups.push({ blocks: [block], kind: 'columns' })
  }

  return groups
})
</script>

<template>
  <div v-if="visibleBlocks.length" class="grid min-w-0 gap-8" :data-stat-block="visibleBlocks.join(' ')">
    <template v-if="statConfig.config.value.page.layout === 'combined' || !canSplit">
      <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="combined">
        <template v-for="(group, groupIndex) in combinedGroups" :key="`${group.kind}-${groupIndex}`">
          <StatReportDetails
            v-if="group.kind === 'round'"
            block="catsRound"
            :ctx="contexts.combined"
            managedLayout
          />
          <div
            v-else
            class="grid min-w-0 content-start gap-3"
            :class="group.blocks.includes('trns') && group.blocks.some(block => block === 'catsList' || block === 'vertical') && 'stat-responsive-two-column-grid'"
          >
            <div
              v-if="group.blocks.some(block => block === 'catsList' || block === 'vertical')"
              class="grid min-w-0 content-start gap-3"
            >
              <StatReportDetails
                v-for="block in group.blocks.filter(block => block === 'catsList' || block === 'vertical')"
                :key="block"
                :block
                :ctx="contexts.combined"
                :isTwoColumnLayout="group.blocks.includes('trns')"
                managedLayout
              />
            </div>
            <StatReportDetails
              v-if="group.blocks.includes('trns')"
              block="trns"
              :ctx="contexts.combined"
              :isTwoColumnLayout="group.blocks.some(block => block === 'catsList' || block === 'vertical')"
              managedLayout
            />
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="stat-two-column-grid">
        <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="expense">
          <StatReportDetails
            v-for="block in visibleBlocks"
            :key="block"
            :block
            :ctx="contexts.expense"
            :isTwoColumnLayout="false"
            managedLayout
          />
        </div>
        <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="income">
          <StatReportDetails
            v-for="block in visibleBlocks"
            :key="block"
            :block
            :ctx="contexts.income"
            :isTwoColumnLayout="false"
            managedLayout
          />
        </div>
      </div>
    </template>
  </div>
</template>
