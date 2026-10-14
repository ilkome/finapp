<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { closeAllContextMenus } from '~/composables/useContextMenuRegistry'

const trnsFormStore = useTrnsFormStore()
const isShow = computed(() => trnsFormStore.ui.isShow)

watch(isShow, (v) => {
  if (v)
    closeAllContextMenus()
})
</script>

<template>
  <Transition name="fadeIn" appear>
    <div
      v-if="isShow"
      class="trnForm @container/trnForm fixed inset-y-0 right-0 z-50 h-dvh w-90 py-4"
    >
      <div class="relative h-full overflow-hidden rounded-l-xl border border-accented shadow-2xl lg:rounded-l-lg">
        <div class="absolute top-2 right-2">
          <UiButtonClose @click="trnsFormStore.onClose()" />
        </div>

        <div class="grid h-full scroller-block grid-rows-[auto_1fr] items-start gap-4 overflow-y-auto overscroll-contain bg-default">
          <TrnFormMain
            maxHeight="100vh"
            sidebarHeader
            class="pb-0!"
          />
          <div
            v-if="trnsFormStore.values.trnType !== TrnType.Transfer"
            class="grid gap-2 pb-6"
          >
            <TrnFormSelectionCategoriesFast
              isCollapsible
              @selectCategory="id => trnsFormStore.values.categoryId = id"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
@reference '../../assets/css/main.css';

.fadeIn-enter-active,
.fadeIn-leave-active {
  @apply opacity-100 translate-x-0 transition-all duration-300 ease-in-out;
}

.fadeIn-enter-from,
.fadeIn-leave-to {
  @apply opacity-0 translate-x-full;
}
</style>
