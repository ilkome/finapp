<script setup lang="ts">
defineOptions({ name: 'Wallets' })

onMounted(() => {
  console.log('WalletsList mounted')
})
</script>

<template>
  <WalletsPageList />
</template>
