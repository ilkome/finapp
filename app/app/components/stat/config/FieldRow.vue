<script setup lang="ts">
import { statConfigParameterIdsKey, statConfigParameterRemoveKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  parameterId?: string
  title: string
}>()

const parameterIds = inject(statConfigParameterIdsKey, computed(() => null))
const removeParameter = inject(statConfigParameterRemoveKey, null)
const isVisible = computed(() => !parameterIds.value || !props.parameterId || parameterIds.value.has(props.parameterId))
const row = useTemplateRef<HTMLElement>('row')

function openSelect(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('[role="combobox"], button[data-slot="base"]'))
    return

  row.value?.querySelector<HTMLElement>('[role="combobox"], button[data-slot="base"]')?.click()
}
</script>

<template>
  <div v-if="isVisible" ref="row" class="flex cursor-pointer items-center gap-3 rounded-sm py-2 pr-2 pl-3 text-sm hover:bg-elevated/50" @click="openSelect">
    <div class="min-w-0 grow text-muted">
      {{ title }}
    </div>
    <slot />
    <UButton
      v-if="removeParameter && props.parameterId"
      :aria-label="$t('stat.views.blockRules.removeParameter')"
      color="error"
      icon="i-lucide-x"
      size="xs"
      variant="ghost"
      @click.stop="removeParameter(props.parameterId)"
    />
  </div>
</template>
