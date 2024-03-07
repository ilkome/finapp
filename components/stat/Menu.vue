<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AppNav } from '~/components/app/types'
import useStatPage from '~/components/stat/useStatPage'
import { useAppNav } from '~/components/app/useAppNav'

const { menu } = useStatPage()
const { activeTabStat } = storeToRefs(useAppNav())

function onClickStatMenu(tabName: AppNav) {
  activeTabStat.value = tabName
  const page = document.querySelector('.js_scroll_page')
  const content = page?.querySelector('[data-scroll-ref="stat"') as HTMLElement | null

  if (!page || !content)
    return

  const h = 78
  if (page.scrollTop > content?.offsetTop - h)
    page.scrollTop = content.offsetTop - h
}
</script>

<template>
  <div class="sticky top-[44px] z-20 my-4 bg-foreground-4 px-2 backdrop-blur">
    <UiTabs>
      <!-- v-if="!item.isPrivate || userStore.isDevUser" -->
      <UiTabsItem
        v-for="item in menu"
        :key="item.id"
        :isActive="item.id === activeTabStat"
        class="!text-md !font-medium"
        @click="onClickStatMenu(item.id)"
      >
        {{ item.name }}
      </UiTabsItem>
    </UiTabs>
  </div>
</template>
