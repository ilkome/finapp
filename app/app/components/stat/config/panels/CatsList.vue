<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const trendTypeItems = computed(() => ['hidden', 'bar', 'bar-plus', 'line'].map(value => ({
  label: t(`stat.config.categories.list.trendTypes.${value}`),
  value,
})))
const backgroundTypeItems = computed(() => ['none', 'category', 'standard'].map(value => ({
  label: t(`stat.config.categories.list.backgroundTypes.${value}`),
  value,
})))
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <StatConfigCategoryGroupingSelect
      :modelValue="statConfig.config.value.categories.list.grouping"
      @update:modelValue="value => statConfig.updateConfig('categories', { list: { grouping: value } })"
    />
    <StatConfigFieldRow :title="t('stat.config.categories.list.trendType')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.config.categories.list.trendType')"
        :content="{ position: 'item-aligned' }"
        :items="trendTypeItems"
        :modelValue="statConfig.config.value.categories.list.trendType"
        :ui="{ content: 'z-[60]' }"
        @update:modelValue="value => statConfig.updateConfig('categories', { list: { trendType: value as 'bar' | 'bar-plus' | 'hidden' | 'line' } })"
      />
    </StatConfigFieldRow>
    <StatConfigFieldRow
      :title="t('stat.config.categories.list.backgroundType')"
    >
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.config.categories.list.backgroundType')"
        :content="{ position: 'item-aligned' }"
        :items="backgroundTypeItems"
        :modelValue="statConfig.config.value.categories.list.backgroundType"
        :ui="{ content: 'z-[60]' }"
        @update:modelValue="value => statConfig.updateConfig('categories', { list: { backgroundType: value as 'category' | 'none' | 'standard' } })"
      />
    </StatConfigFieldRow>
    <StatConfigSwitch
      path="categories.list.isShowTitle"
      :title="t('stat.config.trns.showTitle')"
    />
    <StatConfigSwitch
      path="categories.list.isLines"
      :title="t('stat.catButtons.isLines')"
    />
    <StatConfigSwitch
      path="categories.list.isRoundIcon"
      :title="t('stat.catButtons.isRoundIcon')"
    />
  </div>
</template>
