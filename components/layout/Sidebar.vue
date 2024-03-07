<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'

const { toggleWalletId } = useFilter()
</script>

<template>
  <div class="h-full overflow-y-auto bg-foreground-5">
    <div
      class="p-4 px-5 font-primary text-xl font-bold text-neutral-500 dark_text-neutral-200"
    >
      {{ $t("appName") }}
    </div>

    <div class="pb-8 pt-2">
      <LayoutSidebarMenu variant="sidebar" />
    </div>

    <div class="pb-12">
      <WalletsList
        :limit="6"
        isShowToggle
        @onClick="(id) => $router.push(`/wallets/${id}`)"
      >
        <template #default="{ walletsItemsLimited }">
          <div
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            class="flex cursor-pointer border-b border-item-5 px-3 py-2 hocus_bg-item-5"
            @click="$router.push(`/wallets/${walletId}`)"
          >
            <div class="flex grow items-center gap-x-3">
              <div
                class="flex-center mt-[2px] h-6 w-6 gap-x-3 rounded-md text-xs leading-none text-icon-primary"
                :style="{ background: walletItem.color }"
                @click.stop="toggleWalletId(walletId)"
              >
                {{ walletItem.name.substring(0, 2) }}
              </div>
              <div class="text-item-base grow text-sm">
                {{ walletItem.name }}
              </div>
            </div>
            <div class="text-item-base">
              <Amount
                :amount="walletItem.amount"
                :currencyCode="walletItem.currency"
              />
            </div>
          </div>
        </template>

        <template #toggle="{ stateLimit, limit, toggle }">
          <div
            class="cursor-pointer px-3 py-3 text-center text-xs hocus_bg-item-5 hocus_text-item-1"
            @click="toggle"
          >
            <template v-if="stateLimit > 0">
              {{ $t("wallets.showAll") }}
            </template>
            <template v-else-if="stateLimit !== limit">
              {{ $t("wallets.showOnly") }} {{ limit }}
            </template>
          </div>
        </template>
      </WalletsList>
    </div>
  </div>
</template>
