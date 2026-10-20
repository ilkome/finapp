<script setup lang="ts">
import type { useWalletsStatistics } from '~/components/wallets/useWalletsStatistics'

const props = defineProps<{
  statistics: ReturnType<typeof useWalletsStatistics>
}>()

const showStatistics = defineModel<boolean>('showStatistics', { required: true })

const { t } = useI18n()
</script>

<template>
  <UiSwitchItem
    :checkboxValue="showStatistics"
    :title="t('wallets.options.showStatistics')"
    trailing
    @toggle="showStatistics = !showStatistics"
  />

  <div v-if="props.statistics.pinnedRows.value.length" class="grid gap-1">
    <UiText variant="meta" class="px-2">
      {{ t('props.statistics.pinned') }}
    </UiText>

    <WalletsStatisticsSortGroup
      :items="props.statistics.pinnedRows.value"
      :pinnedIds="props.statistics.pinnedIds.value"
      showPin
      @togglePinned="props.statistics.togglePinned"
      @update="props.statistics.reorderPinned"
    />
  </div>

  <div class="grid gap-1">
    <UiText variant="meta" class="px-2">
      {{ t('props.statistics.list') }}
    </UiText>

    <WalletsStatisticsSortGroup
      :hiddenIds="props.statistics.hiddenIds.value"
      :items="props.statistics.listRows.value"
      :pinnedIds="props.statistics.pinnedIds.value"
      showHide
      showPin
      @toggleHidden="props.statistics.toggleHidden"
      @togglePinned="props.statistics.togglePinned"
      @update="props.statistics.reorderList"
    />
  </div>
</template>
