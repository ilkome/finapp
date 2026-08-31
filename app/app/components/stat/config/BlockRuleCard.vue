<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

import { applyConfigUpdate } from '~/components/stat/config/schema'
import { statBaseConfigKey, statConfigKey } from '~/components/stat/injectionKeys'
import { applyBlockRuleConfig, createBlockRuleOverrides } from '~/components/stat/views/blockRules'

const props = defineProps<{
  isActive: boolean
  isExpanded: boolean
  panel: StatBlockPanelId
  rule: BlockRule
  title: string
}>()

const emit = defineEmits<{
  duplicate: []
  remove: []
  toggleExpanded: []
  update: [rule: BlockRule]
}>()

const baseConfig = inject(statBaseConfigKey)!
const ruleConfig = computed(() => applyBlockRuleConfig(props.panel, baseConfig.config.value, props.rule.overrides))
const ruleProvider = {
  config: ruleConfig,
  updateConfig<K extends keyof MiniItemConfig>(key: K, value: Parameters<typeof applyConfigUpdate<K>>[2]) {
    const edited = applyConfigUpdate(ruleConfig.value, key, value)
    if (!edited)
      return
    emit('update', {
      ...props.rule,
      overrides: createBlockRuleOverrides(props.panel, baseConfig.config.value, edited),
    })
  },
}
provide(statConfigKey, ruleProvider)

function updateCondition(condition: BlockRule['condition']) {
  emit('update', { ...props.rule, condition })
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-default bg-default">
    <div class="flex min-h-12 items-center gap-1 px-2" :class="isActive && 'bg-primary/5'">
      <button type="button" class="flex min-w-0 grow items-center gap-2 px-1 text-left" @click="emit('toggleExpanded')">
        <Icon name="lucide:chevron-right" class="shrink-0 text-muted transition-transform" :class="isExpanded && 'rotate-90'" size="18" />
        <span class="truncate text-sm">{{ title }}</span>
        <span v-if="isActive" class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {{ $t('stat.views.blockRules.active') }}
        </span>
      </button>
      <FormSwitch
        :value="rule.isEnabled"
        @click="emit('update', { ...rule, isEnabled: !rule.isEnabled })"
      />
      <UTooltip :text="$t('base.duplicate')">
        <UiActionButton :ariaLabel="$t('base.duplicate')" @click="emit('duplicate')">
          <Icon name="lucide:copy" size="16" />
        </UiActionButton>
      </UTooltip>
      <UTooltip :text="$t('base.delete')">
        <UiActionButton :ariaLabel="$t('base.delete')" @click="emit('remove')">
          <Icon name="lucide:trash-2" class="text-error" size="16" />
        </UiActionButton>
      </UTooltip>
      <div
        class="blockRuleSortHandle flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted hover:bg-elevated active:cursor-grabbing"
        :aria-label="$t('stat.views.drag')"
      >
        <Icon name="lucide:grip-vertical" size="18" />
      </div>
    </div>

    <UCollapsible :open="isExpanded" :ui="{ content: 'overflow-hidden' }">
      <template #content>
        <div class="grid gap-4 border-t border-default px-3 py-4">
          <div class="grid gap-2">
            <UiEntityName>{{ $t('stat.views.blockRules.if') }}</UiEntityName>
            <StatViewsConditionEditor :modelValue="rule.condition" @update:modelValue="updateCondition" />
          </div>
          <div class="grid gap-2">
            <UiEntityName>{{ $t('stat.views.blockRules.then') }}</UiEntityName>
            <StatConfigPanelContent :panel />
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
