<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'

const { t } = useI18n()
const { toggleWalletId } = useFilter()
</script>

<template>
  <div class="h-full overflow-y-auto bg-foreground-5">
    <div class="p-4 px-5">
      <nuxt-link to="/dashboard">
        <UiLogo class="w-16" />
      </nuxt-link>
    </div>

    <div class="pb-8 pt-2">
      <LayoutSidebarMenu variant="sidebar" />
    </div>

    <div class="pb-12">
      <WalletsList
        :limit="10"
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
            <div
              class="-my-[1px] flex cursor-pointer items-center px-3 py-2 hocus_bg-item-5"
            >
              <div class="flex grow items-center gap-3">
                <WalletsIcon
                  :color="walletItem.color"
                  :name="walletItem.name"
                  :walletId
                  @click="toggleWalletId(walletId)"
                />

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
            class="cursor-pointer px-3 py-3 text-center text-xs text-secondary hocus_bg-item-5"
            @click="toggle"
          >
            <template v-if="stateLimit > 0">
              {{ t("showAll") }}
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

<i18n lang="yaml">
  en:
    showAll: "Show all"

  ru:
    showAll: "Показать все"
</i18n>
