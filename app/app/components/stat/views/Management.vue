<script setup lang="ts">
import type { EntitySelectionMode } from '~/components/stat/views/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatConfigNav } from '~/components/stat/config/useStatConfigNav'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { generateViewName } from '~/components/stat/views/generateViewName'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const controller = inject(statViewControllerKey, null)
const { open: openPanel } = useStatConfigNav()
const name = ref('')
const isCustomName = ref(false)
const isAutoEnabled = ref(false)
const isViewsExpanded = ref(true)

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

function selectionName(entity: 'category' | 'wallet', mode: EntitySelectionMode, ids: string[]) {
  if (mode !== 'selected')
    return t(`stat.views.conditions.selection.${entity}.${mode}`)
  const names = ids.map(id => entity === 'wallet' ? walletsStore.itemsComputed[id]?.name : categoriesStore.items[id]?.name).filter((value): value is string => !!value)
  return names.length <= 2 ? names.join(', ') : t('stat.views.conditions.selection.multiple', { count: names.length })
}
const hasMetadataChanges = computed(() => !!current.value && (
  effectiveName.value !== current.value.name
  || isAutoEnabled.value !== current.value.isAutoEnabled
))

function syncEditorFromView(view: typeof current.value) {
  name.value = view?.name ?? ''
  isCustomName.value = !!view
  isAutoEnabled.value = view?.isAutoEnabled ?? false
}

watch(current, (view) => {
  syncEditorFromView(view)
}, { immediate: true })
watch(suggestion, (value) => {
  if (!isCustomName.value)
    name.value = value
}, { immediate: true })
let autoSaveQueue = Promise.resolve()

function scheduleAutoSave() {
  autoSaveQueue = autoSaveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!controller?.activeView.value || !hasMetadataChanges.value)
        return
      await controller.updateMetadata({
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
}
</script>

<template>
  <section v-if="controller" class="grid">
    <div class="grid gap-3 px-1 pb-4">
      <StatConfigExpandableBlock
        dataKey="views"
        icon="lucide:layout-panel-top"
        :isExpanded="isViewsExpanded"
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

    <div class="rounded-lg border border-transparent">
      <StatConfigRow
        data-stat-config-row="auto"
        hasPanel
        hasToggle
        icon="lucide:wand-sparkles"
        :isShow="isAutoEnabled"
        :title="$t('stat.views.auto')"
        @activate="openPanel('auto')"
        @toggle="toggleAutoEnabled"
      />
    </div>
    <div aria-hidden="true" class="mx-2 -my-px h-px bg-elevated/50" />
  </section>
</template>
