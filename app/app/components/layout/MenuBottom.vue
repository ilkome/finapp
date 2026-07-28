<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import { useMenuData } from '~/components/layout/useMenuData'

const { checkIsActive, itemsBottom, menuItem, onClick } = useMenuData()
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
      <div class="mx-auto -mt-2 flex max-w-sm items-stretch gap-2">
        <!-- Pill capsule: standard nav items -->
        <div
          class="flex grow items-stretch overflow-hidden rounded-full border border-default/80 bg-default/20 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
        >
          <div
            v-for="(item, menuId) in itemsBottom"
            :key="menuId"
            :class="cn(
              'flex min-h-11 grow basis-0 flex-col items-center justify-center gap-0.5 rounded interactive py-1.5',
              checkIsActive(String(menuId)) ? 'text-primary' : 'text-muted',
            )"
            @click="onClick(String(menuId))"
          >
            <div class="relative flex">
              <Icon
                :name="item.icon"
                class="leading-none"
                :size="isShowMenuLabels ? 22 : 26"
              />
              <span
                v-if="item.badge"
                class="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-expense-1"
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

        <!-- Right block: menu + add, icon-only. Each cell is 1:1 off the capsule height (= pill height). -->
        <div
          class="flex shrink-0 items-stretch overflow-hidden rounded-full border border-default/80 bg-default/20 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
        >
          <div
            class="flex w-11 shrink-0 items-center justify-center interactive text-muted"
            @click="onClick('menu')"
          >
            <div class="relative flex">
              <Icon
                :name="menuItem.icon"
                class="leading-none"
                :size="isShowMenuLabels ? 22 : 26"
              />
              <span
                v-if="menuItem.badge"
                class="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-expense-1"
              />
            </div>
          </div>
          <div
            class="flex w-11 shrink-0 items-center justify-center interactive text-primary"
            @click="onClick('trnForm')"
          >
            <Icon
              name="lucide:plus"
              :size="isShowMenuLabels ? 28 : 32"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
