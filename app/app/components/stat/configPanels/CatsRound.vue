<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isCatsRoundShow = computed(() => statConfig.config.value.categories.round.isShow)
const isCatsRoundGrouped = computed(() => statConfig.config.value.categories.round.isGrouped)
const isShowFavorites = computed(() => statConfig.config.value.categories.round.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.categories.round.isShowRecent)
const isIconBg = computed(() => statConfig.config.value.categories.round.isIconBg)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsRoundShow }"
  >
    <UiSwitchItem
      :checkboxValue="isCatsRoundGrouped"
      :title="t('stat.config.categories.rounds.groupByParent')"
      @click="statConfig.updateConfig('categories', { round: { isGrouped: !isCatsRoundGrouped } })"
    />
    <UiSwitchItem
      :checkboxValue="isShowFavorites"
      :title="t('stat.config.categories.rounds.showFavorites')"
      @click="statConfig.updateConfig('categories', { round: { isShowFavorites: !isShowFavorites } })"
    />
    <UiSwitchItem
      :checkboxValue="isShowRecent"
      :title="t('stat.config.categories.rounds.showRecent')"
      @click="statConfig.updateConfig('categories', { round: { isShowRecent: !isShowRecent } })"
    />
    <UiSwitchItem
      :checkboxValue="isIconBg"
      :title="t('stat.catButtons.isRoundIcon')"
      @click="statConfig.updateConfig('categories', { round: { isIconBg: !isIconBg } })"
    />
  </div>
</template>
