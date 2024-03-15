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
            class="text-secondary2"
            @click="$router.push(`/wallets/${walletId}`)"
          >
            <div class="-my-[1px] flex items-center cursor-pointer px-3 py-2 hocus_bg-item-5">
              <div class="flex grow items-center gap-3">
                <div
                  class="border flex-center mt-[2px] w-8 h-6 rounded-md text-2xs leading-none text-icon-primary2"
                  :style="{ borderColor: walletItem.color }"
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
            <div class="mx-2 ml-12 h-[1px] bg-item-5" />
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
