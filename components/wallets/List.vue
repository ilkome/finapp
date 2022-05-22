<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'

const props = withDefaults(
  defineProps<{
    limit?: number
    isShowToggle?: boolean
  }>(),
  {
    limit: 0,
  },
)

const stateLimit = ref(0)
const { walletsIdsSorted, walletsItemsSorted } = useWallets()

const walletsIdsLimited = computed(() => {
  if (stateLimit.value !== 0)
    return walletsIdsSorted.value.slice(0, stateLimit.value)
  return walletsIdsSorted.value
})

const walletsItemsLimited = computed(() => {
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
  stateLimit.value > 0 ? (stateLimit.value = 0) : (stateLimit.value = props.limit)
}
</script>

<template lang="pug">
div
  slot(
    :walletsIdsLimited="walletsIdsLimited"
    :walletsIdsSorted="walletsIdsSorted"
    :walletsItemsLimited="walletsItemsLimited"
    :walletsItemsSorted="walletsItemsSorted"
  )

  slot(
    v-if="isShowToggle && walletsIdsSorted.length > limit"
    name="toggle"
    :stateLimit="stateLimit"
    :limit="limit"
    :toggle="toggle"
  )
</template>
