<script setup lang="ts">
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

const props = defineProps<{
  icon?: string
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

function updateCondition(condition: BlockRule['condition']) {
  emit('update', { ...props.rule, condition })
}

function setExpanded(open: boolean) {
  if (open !== props.isExpanded)
    emit('toggleExpanded')
}
</script>

<template>
  <UiElement
    insideClasses="group min-h-10 gap-0 border-0 p-0"
  >
    <div
      class="blockRuleSortHandle sortHandle flex w-12 shrink-0 cursor-grab items-center justify-center self-stretch text-muted hover:bg-accented active:cursor-grabbing"
      :aria-label="$t('stat.views.drag')"
    >
      <Icon name="lucide:grip-vertical" size="20" />
    </div>
    <div class="min-w-0 grow">
      <BottomSheetOrDropdown
        align="end"
        :isOpen="isExpanded"
        popoverBodyClass="p-0!"
        popoverContentClass="z-[70] max-h-[calc(100dvh-1rem)] w-85 max-w-[calc(100vw-1rem)] overscroll-contain"
        @openModal="setExpanded(true)"
        @closeModal="setExpanded(false)"
      >
        <template #trigger>
          <button
            type="button"
            class="flex min-h-10 w-full min-w-0 items-center gap-2 px-3 text-left"
          >
            <Icon v-if="icon" :name="icon" class="size-4 shrink-0 text-muted" />
            <span class="min-w-0 grow text-sm font-medium whitespace-pre-line">{{ title }}</span>
            <Icon name="lucide:chevron-down" class="size-4 shrink-0 text-muted" />
          </button>
        </template>

        <template #content>
          <UiTitleModal class="flex items-center gap-2 py-2 pr-2!">
            <span class="grow">{{ t('stat.views.blockRules.rule') }}</span>
            <UDropdownMenu
              :items="ruleActionItems"
              :content="{ align: 'end' }"
              :modal="false"
            >
              <StatViewsMoreButton class="size-8!" :ariaLabel="$t('base.moreOptions')" />
            </UDropdownMenu>
          </UiTitleModal>

          <div class="grid gap-4 px-3 pb-3 md:pb-2">
            <StatViewsConditionEditor
              :modelValue="rule.condition"
              @update:modelValue="updateCondition"
            />
            <div class="grid gap-2">
              <UiEntityName>{{ $t('stat.views.blockRules.then') }}</UiEntityName>
              <StatConfigBlockRuleParameters
                :panel
                :rule
                @update="emit('update', $event)"
              />
            </div>
          </div>
        </template>
      </BottomSheetOrDropdown>
    </div>
  </UiElement>
</template>
