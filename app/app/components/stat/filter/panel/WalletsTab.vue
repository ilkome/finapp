<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

defineProps<{
  selectedIds: WalletId[]
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()
</script>

<template>
  <WalletsSelector
    :selectedIds="selectedIds"
    class="px-2"
    hideSearch
    withHeader
    @selected="id => emit('selected', id)"
  />
</template>
