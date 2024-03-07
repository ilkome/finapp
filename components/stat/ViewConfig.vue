<script setup lang="ts">
import useUIView from '~/components/layout/useUIView'
import { getStyles } from '~/components/ui/classes'

const { ui, setUI } = useUIView()
function toggleView(name) {
  setUI({ name, value: !ui[name] })
}
</script>

<template>
  <div class="mx-2 inline-flex rounded-md bg-item-4">
    <div
      class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-5"
      :class="[
        ...getStyles('item', ['link', 'rounded']),
        { '!text-item-1': ui.showCatsVerticalChart },
      ]"
      @click="toggleView('showCatsVerticalChart')"
    >
      <i class="mdi mdi-poll" />
    </div>

    <div
      class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-5"
      :class="[
        ...getStyles('item', ['link', 'rounded']),
        { '!text-item-1': ui.showRoundCats },
      ]"
      @click="toggleView('showRoundCats')"
    >
      <i class="mdi mdi-chart-bubble" />
    </div>

    <div
      class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-5"
      :class="[
        ...getStyles('item', ['link', 'rounded']),
        { '!text-item-1': ui.showCatsHorizontalList },
      ]"
      @click="toggleView('showCatsHorizontalList')"
    >
      <i class="mdi mdi-chart-timeline" />
    </div>
  </div>
</template>
