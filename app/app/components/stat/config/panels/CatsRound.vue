<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isCatsRoundShow = computed(() => statConfig.config.value.categories.round.isShow)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsRoundShow }"
  >
    <StatConfigSwitch
      path="categories.round.isGrouped"
      :title="t('stat.config.categories.rounds.groupByParent')"
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
