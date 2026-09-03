<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

import { applyConfigUpdate } from '~/components/stat/config/schema'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statConfigParameterRemoveKey, statHistoryAvailableKey } from '~/components/stat/injectionKeys'
import { BLOCK_RULE_PARAMETERS, BLOCK_RULE_VISIBILITY_PARAMETER_ID, isBlockRuleParameterAvailable } from '~/components/stat/views/blockParameters'
import { applyBlockRuleConfig, createBlockRuleOverrides, resolveBlockRuleParameterIds } from '~/components/stat/views/blockRules'

const props = defineProps<{
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
const historyAvailable = inject(statHistoryAvailableKey, computed(() => true))
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
const ruleActionItems = computed(() => [[
  {
    icon: 'i-lucide-copy',
    label: t('base.duplicate'),
    onSelect: () => emit('duplicate'),
  },
  {
    color: 'error' as const,
    icon: 'i-lucide-trash-2',
    label: t('base.delete'),
    onSelect: () => emit('remove'),
  },
]])
const popoverContent = { align: 'end' as const, side: 'bottom' as const, sideOffset: 6 }
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
  return isBlockRuleParameterAvailable(props.panel, id, ruleConfig.value, canSplit.value, historyAvailable.value)
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

function setExpanded(open: boolean) {
  if (open !== props.isExpanded)
    emit('toggleExpanded')
}
</script>

<template>
  <UiElement
    insideClasses="group min-h-[46px] gap-0 p-0"
  >
    <div
      class="blockRuleSortHandle sortHandle flex w-12 shrink-0 cursor-grab items-center justify-center self-stretch text-muted hover:bg-accented active:cursor-grabbing"
      :aria-label="$t('stat.views.drag')"
    >
      <Icon name="lucide:grip-vertical" size="20" />
    </div>
    <div class="min-w-0 grow">
      <UPopover
        :open="isExpanded"
        :content="popoverContent"
        :ui="{
          content: 'z-[70] max-h-[calc(100dvh-1rem)] w-85 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain p-0',
        }"
        @update:open="setExpanded"
      >
        <button
          type="button"
          class="flex min-h-[46px] w-full min-w-0 items-center gap-2 px-3 text-left"
        >
          <span class="min-w-0 grow truncate text-sm font-medium">{{ title }}</span>
          <Icon name="lucide:chevron-down" class="size-4 shrink-0 text-muted" />
        </button>

        <template #content>
          <div class="grid gap-4 p-3">
            <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_2.625rem] items-start gap-2">
              <span class="line-clamp-2 min-w-0 py-2 text-sm leading-5 font-medium wrap-break-word">{{ title }}</span>
              <UDropdownMenu :items="ruleActionItems" :content="{ align: 'end' }" :modal="false">
                <StatViewsMoreButton :ariaLabel="$t('base.moreOptions')" />
              </UDropdownMenu>
            </div>
            <StatViewsConditionEditor
              :modelValue="rule.condition"
              @update:modelValue="updateCondition"
            />
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
              <UDropdownMenu :items="[availableParameterItems]">
                <UButton
                  class="w-full justify-start data-[state=open]:bg-elevated/50!"
                  color="neutral"
                  :disabled="!availableParameterItems.length"
                  icon="i-lucide-plus"
                  :label="$t('stat.views.blockRules.addParameter')"
                  size="sm"
                  variant="ghost"
                />
              </UDropdownMenu>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </UiElement>
</template>
