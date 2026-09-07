<script setup lang="ts">
import { statViewControllerKey } from '~/components/stat/injectionKeys'

import type { ConditionGroup } from './types'

import { ConditionGroupSchema } from './schema'

function createDefaultAutoRule(): ConditionGroup {
  return { children: [], operator: 'and' }
}

const controller = inject(statViewControllerKey, null)
const autoRule = ref<ConditionGroup>(createDefaultAutoRule())

const current = computed(() => controller?.activeView.value ?? null)
const hasChanges = computed(() => !!current.value
  && JSON.stringify(autoRule.value) !== JSON.stringify(current.value.autoRule ?? createDefaultAutoRule()))

watch(current, (view) => {
  autoRule.value = view?.autoRule ? ConditionGroupSchema.parse(toRaw(view.autoRule)) : createDefaultAutoRule()
}, { immediate: true })

// Serialized so a rule edit landing while the previous save is in flight does not race it.
let saveQueue = Promise.resolve()
watch(hasChanges, () => {
  saveQueue = saveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!controller?.activeView.value || !hasChanges.value)
        return
      await controller.updateMetadata({ autoRule: autoRule.value })
    })
}, { immediate: true })
</script>

<template>
  <StatViewsConditionEditor v-model="autoRule" pageScoped />
</template>
