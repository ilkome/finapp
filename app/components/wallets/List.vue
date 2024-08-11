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
    return walletsStore.sortedItems

  return walletsStore.sortedIds
    .slice(0, stateLimit.value)
    .reduce((acc, id) => {
      acc[id] = walletsStore.sortedItems[id]!
      return acc
    }, {} as WalletsWithAmount)
})

function toggle() {
  return stateLimit.value = stateLimit.value > 0 ? 0 : props.limit
}

onMounted(() => stateLimit.value = props.limit)
</script>

<template>
  <div>
    <slot
      :walletsIdsSorted="walletsStore.sortedIds"
      :walletsItemsLimited="walletsItemsLimited"
      :walletsItemsSorted="walletsStore.sortedItems"
    />

    <slot
      v-if="isShowToggle && walletsStore.sortedIds.length > limit"
      name="toggle"
      :stateLimit="stateLimit"
      :limit="limit"
      :toggle="toggle"
    >
      <div
        :class="getStyles('item', ['link', 'rounded', 'minh'])"
        class="flex-center mt-[-1px] px-2 py-2 text-xs"
        @click="toggle"
      >
        <template v-if="stateLimit > 0">
          {{ t("showAll") }}
        </template>

        <template v-else-if="stateLimit !== limit">
          {{ $t("wallets.showOnly") }} {{ limit }}
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
