<script setup lang="ts">
defineOptions({ name: 'Categories' })

onMounted(() => {
  console.log('cats')
})
</script>

<template>
  <CategoriesPageList />
</template>
