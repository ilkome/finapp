<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useAppNav } from '~/components/app/useAppNav'

const { trnFormCreate } = useTrnForm()
const { openModal, isModalOpen } = useAppNav()
const { onClick, checkIsActive } = useMenuData()
</script>

<template>
  <LazyAppMenuModal v-if="isModalOpen('menu')" />

  <div
    class="absolute bottom-0 left-0 z-10 w-full bg-foreground-4 backdrop-blur lg_hidden"
  >
    <div class="mx-auto grid max-w-xl">
      <div class="menu__row">
        <!-- Wallets -->
        <div
          class="menu__item group"
          :class="{ _active: checkIsActive('wallets') }"
          @click="onClick('wallets')"
        >
          <UiIconWallet
            class="md:w-8 md:h-8 h-6 w-6"
            :class="{
              'dark:text-white text-accent-4': checkIsActive('wallets'),
              'group-hover:text-white': !checkIsActive('wallets'),
            }"
          />
        </div>

        <!-- Categories -->
        <div
          class="menu__item group"
          :class="{ _active: checkIsActive('categories') }"
          @click="onClick('categories')"
        >
          <UiIconCategory
            class="md:w-8 md:h-8 h-6 w-6"
            :class="{
              'dark:text-white text-accent-4': checkIsActive('categories'),
              'group-hover:text-white': !checkIsActive('categories'),
            }"
          />
        </div>

        <div class="openTrnForm" @click="() => trnFormCreate()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z"
            />
          </svg>
        </div>

        <!-- Stat -->
        <div
          class="menu__item group"
          :class="{ _active: checkIsActive('dashboard') }"
          @click="onClick('dashboard')"
        >
          <UiIconStat
            class="md:w-8 md:h-8 h-6 w-6"
            :class="{
              'dark:text-white text-accent-4': checkIsActive('index'),
              'group-hover:text-white': !checkIsActive('index'),
            }"
          />
        </div>

        <!-- Menu -->
        <div
          class="menu__item group"
          :class="{ _active: checkIsActive('menu') }"
          @click="openModal('menu')"
        >
          <UiIconMenu class="md:w-8 md:h-8 group-hover:text-white h-6 w-6" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.menu
  &__row
    display flex
    align-items center
    justify-content center

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    flex-flow column
    padding 10px 0
    color var(--c-font-4)
    anim()

    +media(600px)
      border-radius 8px

    +media-hover()
      &:not(._active)
        cursor pointer
        color var(--c-font-1)
        background var(--c-blue-1)

    &:active
      color var(--c-font-2)
      background var(--c-blue-1)

.openTrnForm
  flex-grow 1
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding 10px 0
  anim()

  +media(600px)
    border-radius 8px

  +media-hover()
    background var(--c-blue-1)

    svg
      fill var(--c-font-1)

  svg
    width 24px
    height 24px
    fill var(--c-blue-1)
    anim()
</style>
