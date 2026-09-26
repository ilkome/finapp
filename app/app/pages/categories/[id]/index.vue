<script setup lang="ts">
defineOptions({ name: 'CategoriesId' })

definePageMeta({
  key: (route) => {
    const context = typeof route.query.statSnapshot === 'string'
      ? route.query.statSnapshot
      : route.query.statDrilldown === 'true' ? 'drilldown' : 'persistent'
    return `${'id' in route.params ? route.params.id : ''}:${context}`
  },
})
</script>

<template>
  <CategoriesPageId />
</template>
