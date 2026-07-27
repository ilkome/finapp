<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isCatsListShow = computed(() => statConfig.config.value.categories.list.isShow)
const isLines = computed(() => statConfig.config.value.categories.list.isLines)
const isRoundIcon = computed(() => statConfig.config.value.categories.list.isRoundIcon)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsListShow }"
  >
    <UiSwitchItem
      :checkboxValue="isLines"
      :title="t('stat.catButtons.isLines')"
      @click="statConfig.updateConfig('categories', { list: { isLines: !isLines } })"
    />
    <UiSwitchItem
      :checkboxValue="isRoundIcon"
      :title="t('stat.catButtons.isRoundIcon')"
      @click="statConfig.updateConfig('categories', { list: { isRoundIcon: !isRoundIcon } })"
    />
  </div>
</template>
