<script setup lang="ts">
import { statViewControllerKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const controller = inject(statViewControllerKey, null)
const currentLabel = computed(() => controller?.activeView.value?.name ?? t('stat.views.current'))
const items = computed(() => (controller?.store.views ?? []).map(view => ({
  checked: view.id === controller?.activeId.value,
  class: view.id === controller?.activeId.value ? 'text-highlighted before:bg-elevated' : undefined,
  label: view.name,
  onSelect: () => controller?.apply(view),
  type: 'checkbox' as const,
})))
</script>

<template>
  <UFieldGroup v-if="controller" class="items-center rounded-full interactive bg-elevated" size="md">
    <UTooltip :text="currentLabel">
      <UButton
        class="h-10.5 rounded-l-full rounded-r-none bg-elevated px-2.5 text-muted hover:bg-elevated/50!"
        :aria-label="t('stat.views.cycle')"
        color="neutral"
        icon="i-lucide-panels-top-left"
        variant="ghost"
        @click="controller.cycle"
      />
    </UTooltip>
    <div aria-hidden="true" class="relative z-10 h-5 w-px shrink-0 bg-(--ui-border-muted)" />
    <UDropdownMenu :items="items" :content="{ align: 'start' }">
      <UButton class="h-10.5 rounded-l-none rounded-r-full bg-elevated px-2.5 text-muted hover:bg-elevated/50!" :aria-label="t('base.open')" color="neutral" icon="i-lucide-chevron-down" variant="ghost" />
    </UDropdownMenu>
  </UFieldGroup>
</template>
