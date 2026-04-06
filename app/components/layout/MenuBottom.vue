<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import { useMenuData } from '~/components/layout/useMenuData'

const { checkIsActive, itemsBottom, onClick } = useMenuData()
const isShowMenuLabels = useStorage('finapp.isShowMenuLabels', true)
</script>

<template>
  <div class="pointer-events-none fixed bottom-0 left-0 z-20 w-full px-4 md:hidden">
    <div
      class="absolute bottom-0 left-0 h-12 w-full"
      style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
    />
    <div
      class="pointer-events-auto w-full"
      :style="{ paddingBottom: `max(8px, calc(env(safe-area-inset-bottom) - 12px))` }"
    >
      <div
        class="border-default/80 bg-default/10 mx-auto flex max-w-sm items-stretch rounded-2xl border shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
      >
        <div
          v-for="(item, menuId) in itemsBottom"
          :key="menuId"
          :class="cn(
            'interactive flex min-h-[44px] basis-0 grow cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5',
            checkIsActive(String(menuId)) ? 'text-primary' : 'text-muted',
          )"
          @click="onClick(String(menuId))"
        >
          <Icon
            :name="item.icon"
            class="leading-none"
            size="22"
          />
          <span
            v-if="isShowMenuLabels"
            class="text-2xs leading-tight font-medium"
          >
            {{ item.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
