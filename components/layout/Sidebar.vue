<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'

const { toggleWalletId } = useFilter()
</script>

<template lang="pug" scoped>
.overflow-y-auto.h-full.bg-foreground-3-up
  .p-4.px-5.text-xl.font-bold.text-neutral-500.dark_text-neutral-200.font-primary
    | {{ $t('appName') }}

  .pt-2.pb-8
    LayoutSidebarMenu(variant="sidebar")

  .pb-12
    WalletsList(
      :limit="6"
      isShowToggle
      @onClick="id => $router.push(`/wallets/${id}`)"
    )
      template(#default="{ walletsItemsLimited }")
        .cursor-pointer.flex.py-2.px-3.border-b.border-item-5.hocus_bg-item-5(
          v-for="(walletItem, walletId) in walletsItemsLimited"
          :key="walletId"
          @click="$router.push(`/wallets/${walletId}`)"
        )
          .grow.gap-x-3.flex.items-center
            .grow.flex-center.gap-x-3
              //- Icon
              .w-6.h-6.rounded-md.flex-center.text-icon-primary.text-xs.leading-none(
                :style="{ background: walletItem.color }"
                class="mt-[2px]"
                @click.stop="toggleWalletId(walletId)"
              ) {{ walletItem.name.substring(0, 2) }}
              //- Name
              .grow.text-sm.text-item-base {{ walletItem.name }}

            //- Amount
            .text-item-base
              Amount(
                :amount="walletItem.amount"
                :currencyCode="walletItem.currency"
              )

      template(#toggle="{ stateLimit, limit, toggle }")
        .cursor-pointer.py-3.px-3.text-xs.text-center.hocus_text-item-1.hocus_bg-item-5(
          @click="toggle"
        )
          template(v-if="stateLimit > 0") {{ $t('wallets.showAll') }}
          template(v-else-if="stateLimit !== limit") {{ $t('wallets.showOnly') }} {{ limit }}
</template>
