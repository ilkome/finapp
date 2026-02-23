<script setup lang="ts">
import type { WalletsComputed } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { isShowToggle, limit = 0 } = defineProps<{
  isShowToggle?: boolean
  limit?: number
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const stateLimit = ref(0)

const walletsItemsLimited = computed<WalletsComputed>(() => {
  if (stateLimit.value === 0)
    return walletsStore.itemsComputed

  return walletsStore.sortedIds
    .slice(0, stateLimit.value)
    .reduce((acc, id) => {
      acc[id] = walletsStore.itemsComputed[id]!
      return acc
    }, {} as WalletsComputed)
})

function toggle() {
  stateLimit.value = stateLimit.value > 0
    ? 0
    : limit
}

onMounted(() => stateLimit.value = limit)
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
        class="interactive flex-center text-muted -mt-px min-h-[42px] rounded-sm px-2 py-1.5 text-xs"
        @click="toggle"
      >
        <template v-if="stateLimit > 0">
          {{ t('wallets.showAll') }}
        </template>

        <template v-else-if="stateLimit !== limit">
          {{ t('wallets.showOnly') }} {{ limit }}
        </template>
      </div>
    </slot>
  </div>
</template>
