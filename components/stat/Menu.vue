<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AppNav } from '~/components/app/types'
import useStatPage from '~/components/stat/useStatPage'
import { useAppNav } from '~/components/app/useAppNav'
import { useUserStore } from '~/components/user/useUser'

const { menu } = useStatPage()
const { activeTabStat } = storeToRefs(useAppNav())
const userStore = useUserStore()

function onClickStatMenu(tabName: AppNav) {
  activeTabStat.value = tabName
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
.my-4.px-2.sticky.z-20.backdrop-blur(
  class="top-[44px] bg-white/70 dark_bg-dark3/70"
)
  UiTabs
    //- v-if="!item.isPrivate || userStore.isDevUser"
    UiTabsItem.font-nunito.font-semibold(
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === activeTabStat"
      class="!text-lg"
      @click="onClickStatMenu(item.id)"
    ) {{ item.name }}
</template>
