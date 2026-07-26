<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

defineProps<{
  filterAtTop?: boolean
  selectedIds: WalletId[]
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()
</script>

<template>
  <WalletsSelector
    :filterAtTop="filterAtTop"
    :selectedIds="selectedIds"
    class="px-2"
    hideSearch
    withHeader
    @selected="id => emit('selected', id)"
  />
</template>
