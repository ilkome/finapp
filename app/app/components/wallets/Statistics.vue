<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { StatisticsViewItem } from '~/components/wallets/StatisticsView.vue'
import type { WalletsStatistics } from '~/components/wallets/useWalletsStatistics'

const props = withDefaults(defineProps<{
  activeType?: string | false
  currencyCode: CurrencyCode
  isShowList?: boolean
  state: WalletsStatistics
  storageKey: string
}>(), {
  isShowList: true,
})

const emit = defineEmits<{
  click: [v: string]
  openSettings: []
}>()

const { t } = useI18n()

const isShown = useStoredToggle(props.storageKey, true)

function toItems(items: { id: string, secondValue?: number, value: number }[]): StatisticsViewItem[] {
  return items.map(item => ({ id: item.id, secondValue: item.secondValue, title: t(`money.types.${item.id}`), value: item.value }))
}

const items = computed(() => toItems(props.state.items.value))
const pinnedItems = computed(() => toItems(props.state.pinnedItems.value))
const menuItems = computed(() => Object.fromEntries(
  [...props.state.items.value, ...props.state.pinnedItems.value].map(item => [item.id, props.state.menuItems(item.id, () => emit('openSettings'))]),
))
</script>

<template>
  <WalletsStatisticsView
    v-model:isShown="isShown"
    :activeType="props.activeType"
    :currencyCode="props.currencyCode"
    :isShowList="props.isShowList"
    :items
    :menuItems
    :pinnedItems
    @click="emit('click', $event)"
  />
</template>
