<script setup lang="ts">
import type { WalletID } from '~/components/wallets/types'
import useFilter from '~/modules/filter/useFilter'

const { $store } = useNuxtApp()
const { setFilterWalletsId } = useFilter()

function setWalletFilter(walletId: WalletID) {
  if ($store.state.filter.walletsIds.includes(walletId)) {
    $store.commit('filter/removeFilterWalletId', walletId)
    return
  }

  setFilterWalletsId(walletId)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}
</script>

<template lang="pug" scoped>
.overflow-y-auto.h-full.bg-skin-layout-main-up
  .p-4.px-5.flex.items-center.justify-between
    .text-xl.font-bold.text-neutral-500.dark_text-neutral-200.font-nunito
      | {{ $t('appName') }}

    .mdi.mdi-palette.cursor-pointer.text-skin-item-base-down.text-xl.hocus_text-skin-item-base-up(
      @click="$store.dispatch('ui/changeTheme')"
    )

  .pt-2.pb-8
    LayoutSidebarMenu

  .pb-12
    WalletsList(
      :limit="6"
      isShowToggle
      @onClick="id => $router.push(`/wallets/${id}`)"
    )
      template(#default="{ walletsItemsLimited }")
        .cursor-pointer.flex.py-2.px-3.border-b.border-skin-item-main-hover.hocus_bg-skin-item-main-hover(
          v-for="(walletItem, walletId) in walletsItemsLimited"
          :key="walletId"
          @click="$router.push(`/wallets/${walletId}`)"
        )
          .grow.gap-x-3.flex.items-center
            .grow.flex-center.gap-x-3
              //- Icon
              .w-6.h-6.rounded-md.flex-center.text-skin-icon-base.text-xs.leading-none(
                :style="{ background: walletItem.color }"
                class="mt-[2px]"
                @click.stop="setWalletFilter(walletId)"
              ) {{ walletItem.name.substring(0, 2) }}
              //- Name
              .grow.text-sm.text-skin-item-base {{ walletItem.name }}

            //- Amount
            .text-skin-item-base
              Amount(
                :amount="walletItem.amount"
                :currency="walletItem.currency"
                :isShowSign="false"
              )

      template(#toggle="{ stateLimit, limit, toggle }")
        .cursor-pointer.py-3.px-3.text-xs.text-center.hocus_text-skin-item-base-up.hocus_bg-skin-item-main-hover(
          @click="toggle"
        )
          template(v-if="stateLimit > 0") {{ $t('wallets.showAll') }}
          template(v-else-if="stateLimit !== limit") {{ $t('wallets.showOnly') }} {{ limit }}
</template>
