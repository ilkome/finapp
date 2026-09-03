<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { generateViewName } from '~/components/stat/views/generateViewName'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import type { ConditionGroup } from './types'

import { ConditionGroupSchema } from './schema'

function createDefaultAutoRule(): ConditionGroup {
  return { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }
}

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const controller = inject(statViewControllerKey, null)
const { isOpen } = useStatConfigOverlay()
const name = ref('')
const isCustomName = ref(false)
const isAutoEnabled = ref(false)
const isAutoExpanded = ref(false)
const isViewsExpanded = ref(true)
const autoRule = ref<ConditionGroup>(createDefaultAutoRule())

const current = computed(() => controller?.activeView.value ?? null)
const suggestion = computed(() => generateViewName(current.value?.autoRule ?? null, {
  and: t('stat.views.and'),
  andMore: count => t('stat.views.andMore', { count }),
  categoryCount: (scope, comparator, value) => t('stat.views.categoryCount', { comparator, scope: t(`stat.views.scope.${scope}`), value }),
  categorySelection: (mode, ids) => selectionName('category', mode, ids),
  contentWidth: (comparator, value) => t('stat.views.contentWidth', { comparator, value }),
  fallback: t('stat.views.new'),
  period: (value, unit) => t(`stat.views.period.${unit}`, { count: value }),
  walletSelection: (mode, ids) => selectionName('wallet', mode, ids),
}, controller?.store.views.map(view => view.name) ?? []))
const effectiveName = computed(() => name.value.trim() || suggestion.value)

function selectionName(entity: 'category' | 'wallet', mode: 'all' | 'none' | 'selected', ids: string[]) {
  if (mode !== 'selected')
    return t(`stat.views.conditions.selection.${entity}.${mode}`)
  const names = ids.map(id => entity === 'wallet' ? walletsStore.itemsComputed[id]?.name : categoriesStore.items[id]?.name).filter((value): value is string => !!value)
  return names.length <= 2 ? names.join(', ') : t('stat.views.conditions.selection.multiple', { count: names.length })
}
const hasMetadataChanges = computed(() => {
  if (!current.value)
    return false
  const ruleChanged = (isAutoEnabled.value || current.value.isAutoEnabled)
    && JSON.stringify(autoRule.value) !== JSON.stringify(current.value.autoRule ?? createDefaultAutoRule())
  return effectiveName.value !== current.value.name
    || isAutoEnabled.value !== current.value.isAutoEnabled
    || ruleChanged
})

function syncEditorFromView(view: typeof current.value) {
  name.value = view?.name ?? ''
  isCustomName.value = !!view
  isAutoEnabled.value = view?.isAutoEnabled ?? false
  autoRule.value = view?.autoRule ? ConditionGroupSchema.parse(toRaw(view.autoRule)) : createDefaultAutoRule()
}

watch(current, (view) => {
  syncEditorFromView(view)
}, { immediate: true })
watch(suggestion, (value) => {
  if (!isCustomName.value)
    name.value = value
}, { immediate: true })
watch([isOpen, () => controller?.store.isLoaded, () => controller?.activeView.value], ([open, loaded, active]) => {
  if (open && loaded && !active)
    controller?.selectForCurrentContext()
}, { immediate: true })
let autoSaveQueue = Promise.resolve()

function scheduleAutoSave() {
  autoSaveQueue = autoSaveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!controller?.activeView.value || !hasMetadataChanges.value)
        return
      await controller.updateMetadata({
        autoRule: autoRule.value,
        isAutoEnabled: isAutoEnabled.value,
        name: effectiveName.value,
      })
    })
}

watch(hasMetadataChanges, scheduleAutoSave, { immediate: true })

function onNameInput() {
  isCustomName.value = true
}

function toggleAutoEnabled() {
  isAutoEnabled.value = !isAutoEnabled.value
  if (isAutoEnabled.value)
    isAutoExpanded.value = true
}
</script>

<template>
  <section v-if="controller" class="grid">
    <div class="grid gap-3 px-1 pb-4">
      <StatConfigExpandableBlock
        dataKey="views"
        icon="lucide:layout-panel-top"
        :isExpanded="isViewsExpanded"
        :overlapTop="false"
        :title="$t('stat.views.menu.label')"
        @activate="isViewsExpanded = !isViewsExpanded"
      >
        <StatViewsList class="px-2 pb-3" />
      </StatConfigExpandableBlock>

      <div class="flex min-w-0 items-center px-2">
        <UInput
          v-model="name"
          class="min-w-0 flex-1 border-b border-transparent transition-colors focus-within:border-primary hover:border-default"
          :disabled="!current"
          :placeholder="suggestion"
          size="xl"
          :ui="{ base: 'rounded-none px-0 py-2 text-xl font-semibold' }"
          variant="none"
          @update:modelValue="onNameInput"
        />
      </div>
    </div>

    <div
      class="rounded-lg border"
      :class="isAutoExpanded
        ? 'mb-3 overflow-hidden border-default'
        : 'border-transparent'"
    >
      <StatConfigRow
        data-stat-config-row="auto"
        hasPanel
        hasToggle
        icon="lucide:wand-sparkles"
        :isExpanded="isAutoExpanded"
        :isShow="isAutoEnabled"
        :title="$t('stat.views.auto')"
        @activate="isAutoExpanded = !isAutoExpanded"
        @toggle="toggleAutoEnabled"
      />
      <UCollapsible :open="isAutoExpanded" :ui="{ content: 'overflow-hidden' }">
        <template #content>
          <div class="px-3 pb-4">
            <StatViewsConditionEditor v-model="autoRule" />
          </div>
        </template>
      </UCollapsible>
    </div>
    <div v-if="!isAutoExpanded" aria-hidden="true" class="mx-2 -my-px h-px bg-elevated/50" />
  </section>
</template>
