<script setup lang="ts">
import Draggable from 'vuedraggable'

import { random, successEmo } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits(['closeModal'])

const walletsStore = useWalletsStore()
const { $notify } = useNuxtApp()

const sortedWalletsIds = ref([...walletsStore.walletsSortedIds])

async function saveWalletsOrder() {
  const sortedWallets = {}

  for (const [idx, walletId] of sortedWalletsIds.value.entries())
    sortedWallets[walletId] = idx

  const result = await walletsStore.saveWalletsOrder(sortedWallets)

  if (result.success)
    emit('closeModal')

  // $notify({
  //   type: 'success',
  //   title: random(successEmo),
  //   text: 'Saved',
  // })
}
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto.bg-foreground-3
  //- Header
  //-----------------------------------
  .pb-4.px-2.text-center.text-item-base.text-xl.font-primary.font-semibold
    | {{ $t('wallets.sortTitle') }}

  //- Items
  //-----------------------------------
  Draggable.grid.gap-1(
    v-model="sortedWalletsIds"
    handle=".handle"
    ghost-class="_draggable"
    item-key="id"
  )
    template(#item="{element}")
      .overflow-hidden.py-0.pl-3.flex.items-center.gap-3.rounded-md.bg-item-4(
        :key="element"
      )
        .grow.flex-center.gap-x-3
          .w-6.h-6.rounded-md.flex-center.text-neutral-50.text-xs.leading-none(
            :style="{ background: walletsStore.items[element].color }"
            class="mt-[2px]"
          ) {{ walletsStore.items[element].name.substring(0, 2) }}
          .grow.text-sm.text-neutral-500.dark_text-neutral-400 {{ walletsStore.items[element].name }}

          .cursor-grab.flex-center.w-11.h-11.handle.doNotCloseModal.hocus_bg-item-5
            svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
              path(fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z")

  .flex-center.pt-6
    UiButtonBlue(
      maxWidth
      @click="saveWalletsOrder"
    ) {{ $t('base.save') }}
</template>
