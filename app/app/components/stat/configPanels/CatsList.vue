<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isCatsListShow = computed(() => statConfig.config.value.catsList.isShow)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isCatsListShow }"
  >
    <StatConfigSwitch
      configKey="catsList"
      field="isLines"
      :title="t('stat.catButtons.isLines')"
    />
    <StatConfigSwitch
      configKey="catsList"
      field="isRoundIcon"
      :title="t('stat.catButtons.isRoundIcon')"
    />
  </div>
</template>
