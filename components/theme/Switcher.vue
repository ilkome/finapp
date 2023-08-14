<script setup lang="ts">
const items = [
  {
    name: 'Light',
    slug: 'light',
  }, {
    name: 'Dark',
    slug: 'dark',
  }, {
    name: 'System',
    slug: 'system',
  },
]
</script>

<template lang="pug">
UiTabs2
  UiTabsItem2(
    v-for="item in items"
    :key="item.name"
    :isActive="$colorMode.preference === item.slug"
    @click="$store.dispatch('ui/setTheme', item.slug)"
  ).
    {{ item.name }}
</template>
