<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import { useMenuData } from '~/components/layout/useMenuData'

const { checkIsActive, itemsBottom, menuItem, onClick } = useMenuData()
const isShowMenuLabels = useStorage('finapp.isShowMenuLabels', true)
const itemInteractionClass = 'interactive transition-colors hover:bg-elevated/50! hover:text-primary active:bg-elevated/50! active:text-primary'
const navItemClass = `flex h-full grow basis-0 flex-col items-center justify-center gap-0.5 rounded ${itemInteractionClass}`
const circleItemClass = `flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-default/80 bg-default/20 text-muted shadow-lg backdrop-blur-xl dark:bg-neutral-800/50 ${itemInteractionClass}`
</script>

<template>
  <div class="pointer-events-none fixed bottom-0 left-0 z-20 w-full px-4 pb-1.5 md:hidden">
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
          class="flex h-12 min-w-0 grow items-stretch overflow-hidden rounded-full border border-default/80 bg-default/20 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
        >
          <div
            v-for="(item, menuId) in itemsBottom"
            :key="menuId"
            :class="cn(
              navItemClass,
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

        <!-- Add circle -->
        <div
          :class="circleItemClass"
          @click="onClick('trnForm')"
        >
          <Icon
            name="lucide:plus"
            :size="isShowMenuLabels ? 28 : 32"
          />
        </div>

        <!-- Menu circle, far right. -->
        <div
          :class="circleItemClass"
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
      </div>
    </div>
  </div>
</template>
