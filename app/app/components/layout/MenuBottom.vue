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
        class="border-default/80 bg-default/20 mx-auto -mt-2 flex max-w-sm items-stretch overflow-hidden rounded-full border shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
      >
        <div
          v-for="(item, menuId) in itemsBottom"
          :key="menuId"
          :class="cn(
            'interactive flex min-h-[44px] basis-0 grow flex-col items-center justify-center gap-0.5 rounded py-1.5',
            checkIsActive(String(menuId)) ? 'text-primary' : 'text-muted',
          )"
          @click="onClick(String(menuId))"
        >
          <div class="relative">
            <Icon
              :name="item.icon"
              class="leading-none"
              size="22"
            />
            <span
              v-if="item.badge"
              class="bg-expense-1 absolute -top-0.5 -right-1 size-1.5 rounded-full"
            />
          </div>
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
