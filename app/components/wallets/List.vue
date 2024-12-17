<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { WalletsWithAmount } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  isShowToggle?: boolean
  limit?: number
}>(), {
  limit: 0,
})

const { t } = useI18n()
const walletsStore = useWalletsStore()
const stateLimit = ref(0)

const walletsItemsLimited = computed<WalletsWithAmount>(() => {
  if (stateLimit.value === 0)
    return walletsStore.itemsWithAmount

  return walletsStore.sortedIds
    .slice(0, stateLimit.value)
    .reduce((acc, id) => {
      acc[id] = walletsStore.itemsWithAmount[id]!
      return acc
    }, {} as WalletsWithAmount)
})

function toggle() {
  stateLimit.value = stateLimit.value > 0
    ? 0
    : props.limit
}

onMounted(() => stateLimit.value = props.limit)
</script>

<template>
  <div>
    <slot
      :walletsIdsSorted="walletsStore.sortedIds"
      :walletsItemsLimited="walletsItemsLimited"
    />

    <slot
      v-if="isShowToggle && walletsStore.sortedIds.length > limit"
      :stateLimit="stateLimit"
      :limit="limit"
      :toggle="toggle"
      name="toggle"
    >
      <div
        :class="getStyles('item', ['rounded', 'minh1', 'link', 'padding1', 'center3'])"
        class="text-xs"
        @click="toggle"
      >
        <template v-if="stateLimit > 0">
          {{ t("showAll") }}
        </template>

        <template v-else-if="stateLimit !== limit">
          {{ t("wallets.showOnly") }} {{ limit }}
        </template>
      </div>
    </slot>
  </div>
</template>

<i18n lang="yaml">
en:
  showAll: "Show all"

ru:
  showAll: "Показать все"
</i18n>
