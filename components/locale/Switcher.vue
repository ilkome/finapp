<script setup lang="ts">
const locales = [{
  slug: 'ru',
  name: 'Русский',
}, {
  slug: 'en',
  name: 'English',
}]
</script>

<template lang="pug">
UiTabs2
  UiTabsItem2.text-secondary(
    v-for="item in locales"
    :key="item.slug"
    :isActive="$store.state.lang.lang === item.slug"
    @click="$store.dispatch('lang/setLang', item.slug)"
  ) {{ item.name }}
</template>
