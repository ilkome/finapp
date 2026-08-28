<script setup lang="ts">
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { generateViewName } from '~/components/stat/views/generateViewName'

const { t } = useI18n()
const isOpen = ref(false)
const mode = ref<'list' | 'settings'>('list')
const controller = inject(statViewControllerKey, null)
const { open: openConfig } = useStatConfigOverlay()

const views = computed(() => controller?.store.views ?? [])
const currentId = computed(() => controller?.activeId.value ?? '')
const comparatorKeys: Record<string, string> = { '<': 'lt', '<=': 'lte', '=': 'eq', '!=': 'neq', '>=': 'gte', '>': 'gt' }
const autoRuleLabels = computed(() => ({
  and: t('stat.views.and'),
  andMore: (count: number) => t('stat.views.andMore', { count }),
  categoryCount: (scope: 'all' | 'parent', comparator: string, value: number) => t('stat.views.categoryCount', { comparator: t(`stat.views.comparators.${comparatorKeys[comparator] ?? 'eq'}`), scope: t(`stat.views.scope.${scope}`), value }),
  fallback: t('stat.views.new'),
  period: (value: number, unit: string) => t(`stat.views.period.${unit}`, { count: value }),
}))

function autoDescription(view: (typeof views.value)[number]) {
  if (!view.isAutoEnabled || !view.autoRule)
    return ''
  return t('stat.views.autoDescription', { rule: generateViewName(view.autoRule, autoRuleLabels.value) })
}

function onClose() {
  isOpen.value = false
  mode.value = 'list'
}

function onOpen() {
  isOpen.value = true
}

function selectView(viewId: string) {
  const view = controller?.store.views.find(item => item.id === viewId)
  if (!view)
    return

  controller?.apply(view)
}

function openSettings() {
  onClose()
  nextTick(() => openConfig())
}

function closeSettings() {
  mode.value = 'list'
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen
    :title="t('stat.views.menu.label')"
    :unmountOnHide="false"
    @openModal="onOpen"
    @closeModal="onClose"
  >
    <template #trigger>
      <UiTriggerButton
        icon="lucide:layout-panel-top"
        :labelMode="false"
        :title="t('stat.views.menu.label')"
      />
    </template>

    <template #content>
      <div v-if="mode === 'list'" class="grid gap-3 pb-4 md:px-1 md:pb-0">
        <div class="grid gap-1">
          <UiElement
            v-for="view in views"
            :key="view.id"
            :isActive="view.id === currentId"
            class="group"
            insideClasses="group relative min-h-[46px] rounded-md bg-elevated/30 pl-4"
            @click="selectView(view.id)"
          >
            <div class="grid grow gap-0.5 overflow-hidden">
              <UiEntityName>
                {{ view.name }}
              </UiEntityName>
              <UiEntityName v-if="autoDescription(view)" variant="secondary">
                {{ autoDescription(view) }}
              </UiEntityName>
            </div>
          </UiElement>
        </div>

        <UButton block size="xl" @click="openSettings">
          {{ t('stat.views.menu.settings') }}
        </UButton>
      </div>

      <div v-else class="grid gap-4">
        <div class="flex items-center justify-between gap-2">
          <UiHeaderTitle class="text-xl">
            {{ t('stat.views.menu.settings') }}
          </UiHeaderTitle>

          <UiButtonClose @click="closeSettings" />
        </div>

        <StatViewsManagement />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
