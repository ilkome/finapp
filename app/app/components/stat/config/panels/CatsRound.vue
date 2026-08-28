<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <StatConfigCategoryGroupingSelect
      :modelValue="statConfig.config.value.categories.round.grouping"
      @update:modelValue="value => statConfig.updateConfig('categories', { round: { grouping: value } })"
    />
    <StatConfigSwitch
      path="categories.round.isShowFavorites"
      :title="t('stat.config.categories.rounds.showFavorites')"
    />
    <StatConfigSwitch
      path="categories.round.isShowRecent"
      :title="t('stat.config.categories.rounds.showRecent')"
    />
    <StatConfigSwitch
      path="categories.round.isIconBg"
      :title="t('stat.catButtons.isRoundIcon')"
    />
    <StatConfigSwitch
      path="categories.round.isInlineAmount"
      :title="t('stat.config.categories.rounds.inlineAmount')"
    />
  </div>
</template>
