<script setup lang="ts">
const props = defineProps<{
  slider: any
}>()

const { $store } = useNuxtApp()
const { nuxt2Context: { i18n } } = useNuxtApp()

function onClickStatMenu(idx) {
  props.slider.slideTo(idx, 0)
}

const menu = computed(() => [{
  idx: 0,
  name: i18n.t('stat.periods'),
}, {
  idx: 1,
  name: i18n.t('money.expense'),
}, {
  idx: 2,
  name: i18n.t('money.income'),
}, {
  idx: 3,
  name: i18n.t('trns.shortTitle'),
}, {
  idx: 4,
  name: i18n.t('trns.history'),
}])
</script>

<template lang="pug">
UiTabs2(v-if="slider")
  UiTabsItem2(
    v-for="item in menu"
    v-if="!item.isPrivate || $store.getters['user/isDevUser']"
    :key="item.name"
    :isActive="slider.activeIndex === item.idx"
    @click="onClickStatMenu(item.idx)"
  ) {{ item.name }}
</template>
