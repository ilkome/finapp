<script setup lang="ts">
import { categoryGroupingOptions } from '~/components/stat/config/schema'

defineProps<{
  modelValue: typeof categoryGroupingOptions[number]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof categoryGroupingOptions[number]]
}>()

const { t } = useI18n()
const items = computed(() => categoryGroupingOptions.map(value => ({
  label: t(`stat.config.categories.grouping.${value}`),
  value,
})))
</script>

<template>
  <StatConfigFieldRow :title="t('stat.config.categories.grouping.title')">
    <USelect
      class="w-40 shrink-0"
      :aria-label="t('stat.config.categories.grouping.title')"
      :content="{ position: 'item-aligned' }"
      :items
      :modelValue
      :ui="{ content: 'z-[60]' }"
      @update:modelValue="value => emit('update:modelValue', value as typeof categoryGroupingOptions[number])"
    />
  </StatConfigFieldRow>
</template>
