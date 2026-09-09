<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

import { applyConfigUpdate } from '~/components/stat/config/schema'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statConfigParameterRemoveKey, statHistoryAvailableKey } from '~/components/stat/injectionKeys'
import { BLOCK_RULE_PARAMETERS, BLOCK_RULE_VISIBILITY_PARAMETER_ID, isBlockRuleParameterAvailable } from '~/components/stat/views/blockParameters'
import { applyBlockRuleConfig, createBlockRuleOverrides, resolveBlockRuleParameterIds } from '~/components/stat/views/blockRules'

const props = defineProps<{
  autoOpenAddParameter?: boolean
  panel: StatBlockPanelId
  rule: BlockRule
}>()

const emit = defineEmits<{
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
const isAddParameterOpen = ref(props.autoOpenAddParameter ?? false)
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
</script>

<template>
  <div class="grid gap-2">
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
    <UDropdownMenu v-model:open="isAddParameterOpen" :items="[availableParameterItems]">
      <StatConfigActionButton
        :disabled="!availableParameterItems.length"
        icon="i-lucide-plus"
        :label="$t('stat.views.blockRules.addParameter')"
      />
    </UDropdownMenu>
  </div>
</template>
