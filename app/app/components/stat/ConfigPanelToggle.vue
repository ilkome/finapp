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
    class="hover:bg-elevated/50 bg-elevated/30 flex w-full items-center gap-3 rounded-lg px-4 py-3"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <span class="text-toned grow text-sm font-medium">
      {{ value ? t('base.on') : t('base.off') }}
    </span>
    <FormSwitch :value="value" />
  </div>
  <p
    v-if="description"
    class="text-dimmed mt-2 mb-3 px-2 text-xs leading-snug whitespace-pre-line"
  >
    {{ description }}
  </p>
</template>
