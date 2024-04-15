<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
import type { WalletsWithAmount } from '~/components/wallets/types'
import { getStyles } from '~/components/ui/classes'

const props = withDefaults(
  defineProps<{
    limit?: number
    isShowToggle?: boolean
  }>(),
  {
    limit: 0,
  },
)
const { t } = useI18n()
const { walletsIdsSorted, walletsItemsSorted } = useWallets()

const stateLimit = ref(0)

const walletsIdsLimited = computed(() => {
  if (stateLimit.value !== 0)
    return walletsIdsSorted.value.slice(0, stateLimit.value)
  return walletsIdsSorted.value
})

const walletsItemsLimited = computed<WalletsWithAmount>(() => {
  // TODO: Reduce
  if (stateLimit.value !== 0) {
    let wallets = {}
    for (const id of walletsIdsLimited.value) {
      wallets = {
        ...wallets,
        [id]: walletsItemsSorted.value[id],
      }
    }
    return wallets
  }

  return walletsItemsSorted.value
})

onMounted(() => {
  stateLimit.value = props.limit
})

function toggle() {
  stateLimit.value > 0
    ? (stateLimit.value = 0)
    : (stateLimit.value = props.limit)
}
</script>

<template>
  <div>
    <slot
      :walletsIdsLimited="walletsIdsLimited"
      :walletsIdsSorted="walletsIdsSorted"
      :walletsItemsLimited="walletsItemsLimited"
      :walletsItemsSorted="walletsItemsSorted"
    />

    <slot
      v-if="isShowToggle && walletsIdsSorted.length > limit"
      name="toggle"
      :stateLimit="stateLimit"
      :limit="limit"
      :toggle="toggle"
    >
      <div
        :class="getStyles('item', ['link', 'rounded', 'minh'])"
        class="mt-[-1px] flex-center text-xs py-2 px-2"
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
