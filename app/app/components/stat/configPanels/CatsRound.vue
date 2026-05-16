<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'
import { resolveGrouped } from '~/components/stat/useStatConfig'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const grouping = computed(() => statConfig.config.value.grouping)
const isAutoGrouping = computed(() => grouping.value === 'auto')
const isCatsRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isCatsRoundGrouped = computed(() => resolveGrouped(statConfig.config.value.catsRound.isGrouped, grouping.value))
const isShowFavorites = computed(() => statConfig.config.value.catsRound.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.catsRound.isShowRecent)

function toggleGroupedWithReset(currentEffective: boolean) {
  if (!isAutoGrouping.value) {
    statConfig.updateConfig('grouping', 'auto')
    return
  }
  statConfig.updateConfig('catsRound', { isGrouped: !currentEffective })
}
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsRoundShow }"
  >
    <UiSwitchItem
      :checkboxValue="isCatsRoundGrouped"
      :title="t('stat.config.categories.rounds.groupByParent')"
      @click="toggleGroupedWithReset(isCatsRoundGrouped)"
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
