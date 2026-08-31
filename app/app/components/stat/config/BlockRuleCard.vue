<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

import { applyConfigUpdate } from '~/components/stat/config/schema'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statConfigParameterRemoveKey } from '~/components/stat/injectionKeys'
import { BLOCK_RULE_PARAMETERS, BLOCK_RULE_VISIBILITY_PARAMETER_ID, isBlockRuleParameterAvailable } from '~/components/stat/views/blockParameters'
import { applyBlockRuleConfig, createBlockRuleOverrides, resolveBlockRuleParameterIds } from '~/components/stat/views/blockRules'

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

const { t } = useI18n()
const baseConfig = inject(statBaseConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
const ruleConfig = computed(() => applyBlockRuleConfig(props.panel, baseConfig.config.value, props.rule.overrides))
const parameterIds = computed(() => resolveBlockRuleParameterIds(props.panel, props.rule))
const availableSelectedParameterIds = computed(() => parameterIds.value.filter(id => (
  id !== BLOCK_RULE_VISIBILITY_PARAMETER_ID && parameterIsAvailable(id)
)))
const unavailableSelectedParameterIds = computed(() => parameterIds.value.filter(id => (
  id !== BLOCK_RULE_VISIBILITY_PARAMETER_ID && !parameterIsAvailable(id)
)))
const availableParameterItems = computed(() => BLOCK_RULE_PARAMETERS[props.panel]
  .filter(parameter => !parameterIds.value.includes(parameter.id) && parameterIsAvailable(parameter.id))
  .map(parameter => ({
    label: t(parameter.titleKey),
    onSelect: () => addParameter(parameter.id),
  })))
const ruleProvider = {
  config: ruleConfig,
  updateConfig<K extends keyof MiniItemConfig>(key: K, value: Parameters<typeof applyConfigUpdate<K>>[2]) {
    const edited = applyConfigUpdate(ruleConfig.value, key, value)
    if (!edited)
      return
    emit('update', {
      ...props.rule,
      overrides: createBlockRuleOverrides(props.panel, baseConfig.config.value, edited, parameterIds.value),
      parameterIds: parameterIds.value,
    })
  },
}
provide(statConfigKey, ruleProvider)
provide(statConfigParameterRemoveKey, removeParameter)

function updateCondition(condition: BlockRule['condition']) {
  emit('update', { ...props.rule, condition })
}

function parameterIsAvailable(id: string) {
  return isBlockRuleParameterAvailable(props.panel, id, ruleConfig.value, canSplit.value)
}

function addParameter(id: string) {
  const nextIds = [...parameterIds.value, id]
  emit('update', {
    ...props.rule,
    overrides: createBlockRuleOverrides(props.panel, baseConfig.config.value, ruleConfig.value, nextIds),
    parameterIds: nextIds,
  })
}

function removeParameter(id: string) {
  const nextIds = parameterIds.value.filter(parameterId => parameterId !== id)
  emit('update', {
    ...props.rule,
    isHidden: id === BLOCK_RULE_VISIBILITY_PARAMETER_ID ? false : props.rule.isHidden,
    overrides: createBlockRuleOverrides(props.panel, baseConfig.config.value, ruleConfig.value, nextIds),
    parameterIds: nextIds,
  })
}
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border bg-default"
    :class="isActive ? 'border-primary/50' : 'border-default'"
  >
    <div class="flex min-h-12 items-center gap-1 px-2" :class="isActive && 'bg-primary/5'">
      <button
        type="button"
        role="switch"
        :aria-checked="rule.isEnabled"
        :aria-label="title"
        class="flex shrink-0 items-center p-1"
        @click="emit('update', { ...rule, isEnabled: !rule.isEnabled })"
      >
        <FormSwitch :value="rule.isEnabled" />
      </button>
      <button type="button" class="min-w-0 grow px-1 text-left" @click="emit('toggleExpanded')">
        <span class="block truncate text-sm">{{ title }}</span>
        <span class="block truncate text-xs text-muted">
          {{ $t('stat.views.blockRules.parameterCount', { count: parameterIds.length }) }}
        </span>
      </button>
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
        class="blockRuleSortHandle sortHandle flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted hover:bg-elevated active:cursor-grabbing"
        :aria-label="$t('stat.views.drag')"
      >
        <Icon name="lucide:grip-vertical" size="18" />
      </div>
      <UiActionButton :ariaLabel="$t('base.toggleExpand')" @click="emit('toggleExpanded')">
        <Icon
          name="lucide:chevron-right"
          class="shrink-0 text-muted transition-transform"
          :class="isExpanded && 'rotate-90'"
          size="18"
        />
      </UiActionButton>
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
            <div v-if="parameterIds.length" class="grid gap-1">
              <div
                v-if="parameterIds.includes(BLOCK_RULE_VISIBILITY_PARAMETER_ID)"
                class="flex min-w-0 items-center gap-1 rounded-sm pr-2 hover:bg-elevated/50"
              >
                <UiSwitchItem
                  class="hover:bg-transparent!"
                  :checkboxValue="!rule.isHidden"
                  :title="$t('stat.views.blockRules.parameters.visibility')"
                  trailing
                  @click="emit('update', { ...rule, isHidden: !rule.isHidden })"
                />
                <UButton
                  :aria-label="$t('stat.views.blockRules.removeParameter')"
                  color="error"
                  icon="i-lucide-x"
                  size="xs"
                  variant="ghost"
                  @click="removeParameter(BLOCK_RULE_VISIBILITY_PARAMETER_ID)"
                />
              </div>
              <StatConfigPanelContent
                v-if="availableSelectedParameterIds.length"
                :panel
                :parameterIds="availableSelectedParameterIds"
              />
              <div
                v-for="parameterId in unavailableSelectedParameterIds"
                :key="parameterId"
                class="flex min-w-0 items-center gap-1 rounded-sm pr-2 hover:bg-elevated/50"
              >
                <div class="grid min-w-0 grow gap-0.5 px-3 py-2 text-sm">
                  <span class="truncate text-muted">
                    {{ $t(BLOCK_RULE_PARAMETERS[panel].find(parameter => parameter.id === parameterId)?.titleKey ?? '') }}
                  </span>
                  <span class="truncate text-xs text-dimmed">{{ $t('stat.views.blockRules.parameterUnavailable') }}</span>
                </div>
                <UButton
                  :aria-label="$t('stat.views.blockRules.removeParameter')"
                  color="error"
                  icon="i-lucide-x"
                  size="xs"
                  variant="ghost"
                  @click="removeParameter(parameterId)"
                />
              </div>
            </div>
            <div v-else class="rounded-md border border-dashed border-default px-3 py-4 text-center text-sm text-muted">
              {{ $t('stat.views.blockRules.noParameters') }}
            </div>
            <UDropdownMenu :items="[availableParameterItems]">
              <UButton
                class="w-fit"
                color="neutral"
                :disabled="!availableParameterItems.length"
                icon="i-lucide-plus"
                :label="$t('stat.views.blockRules.addParameter')"
                size="xs"
                variant="soft"
              />
            </UDropdownMenu>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
