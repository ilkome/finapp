<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isCatsRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isCatsRoundGrouped = computed(() => statConfig.config.value.catsRound.isGrouped)
const isShowFavorites = computed(() => statConfig.config.value.catsRound.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.catsRound.isShowRecent)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsRoundShow }"
  >
    <UiSwitchItem
      :checkboxValue="isCatsRoundGrouped"
      :title="t('stat.config.categories.rounds.groupByParent')"
      @click="statConfig.updateConfig('catsRound', { isGrouped: !isCatsRoundGrouped })"
    />
    <UiSwitchItem
      :checkboxValue="isShowFavorites"
      :title="t('stat.config.categories.rounds.showFavorites')"
      @click="statConfig.updateConfig('catsRound', { isShowFavorites: !isShowFavorites })"
    />
    <UiSwitchItem
      :checkboxValue="isShowRecent"
      :title="t('stat.config.categories.rounds.showRecent')"
      @click="statConfig.updateConfig('catsRound', { isShowRecent: !isShowRecent })"
    />
    <StatConfigSwitch
      configKey="catsRound"
      field="isIconBg"
      :title="t('stat.catButtons.isRoundIcon')"
    />
  </div>
</template>
