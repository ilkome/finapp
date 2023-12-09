<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'

const { $store } = useNuxtApp()
const { menu } = useStatPage()
const activeTabStat = computed(() => $store.state.ui.activeTabStat)

function onClickStatMenu(tabName) {
  $store.dispatch('ui/setActiveTabStat', tabName)
  const page = document.querySelector('.js_scroll_page')
  const content = page?.querySelector('[data-scroll-ref="stat"') as HTMLElement | null

  if (!page && !content)
    return

  const h = 78
  if (page.scrollTop > content?.offsetTop - h)
    page.scrollTop = content.offsetTop - h
}
</script>

<template lang="pug">
.my-4.px-2.sticky.z-20.backdrop-blur.firefoxBackdropFix(
  class="top-[44px] bg-white/70 dark_bg-dark3/70"
)
  UiTabs
    UiTabsItem.font-nunito.font-semibold(
      v-for="item in menu"
      v-if="!item.isPrivate || $store.getters['user/isDevUser']"
      :key="item.id"
      :isActive="item.id === activeTabStat"
      class="!text-lg"
      @click="onClickStatMenu(item.id)"
    ) {{ item.name }}
</template>
