<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const isShow = computed(() => statConfig.config.value.vertical.isShow)
const isGrouped = computed(() => statConfig.config.value.vertical.isGrouped)
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isShow }"
  >
    <UiSwitchItem
      :checkboxValue="isGrouped"
      :title="t('stat.config.categories.vertical.groupByParent')"
      @click="statConfig.updateConfig('vertical', { isGrouped: !isGrouped })"
    />
  </div>
</template>
