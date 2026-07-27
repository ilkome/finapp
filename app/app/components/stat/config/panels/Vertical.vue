<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isShow = computed(() => statConfig.config.value.categories.bars.isShow)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isShow }"
  >
    <StatConfigSwitch
      path="categories.bars.isGrouped"
      :title="t('stat.config.categories.vertical.groupByParent')"
    />
  </div>
</template>
