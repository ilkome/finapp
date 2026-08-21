<script setup lang="ts">
defineProps<{
  description?: string
  value?: boolean
}>()

defineEmits<{
  toggle: []
}>()

const { t } = useI18n()
</script>

<template>
  <div
    v-if="value !== undefined"
    role="switch"
    tabindex="0"
    :aria-checked="value"
    class="flex w-full items-center gap-3 rounded-lg bg-elevated/30 px-4 py-3 hover:bg-elevated/50"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <span class="grow text-sm font-medium text-toned">
      {{ value ? t('base.on') : t('base.off') }}
    </span>
    <FormSwitch :value="value" />
  </div>
  <p
    v-if="description"
    class="mt-2 mb-3 px-2 text-xs leading-snug whitespace-pre-line text-dimmed"
  >
    {{ description }}
  </p>
</template>
