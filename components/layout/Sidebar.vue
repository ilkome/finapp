<script setup lang="ts">
import { useFilterStore } from '~/components/filter/useFilterStore'
import { getStyles } from '~/components/ui/classes'

const { t } = useI18n()
const filterStore = useFilterStore()
</script>

<template>
  <div>
    <div class="p-4 px-5">
      <nuxt-link to="/dashboard">
        <UiLogo class="w-16" />
      </nuxt-link>
    </div>

    <LayoutSidebarMenu
      variant="sidebar"
      class="pb-6 pt-2 px-2"
    />

    <div class="grid gap-1 pb-6 px-2">
      <UiTitle3 class="pl-3">
        {{ $t('wallets.title') }}
      </UiTitle3>

      <WalletsList
        :limit="10"
        isShowToggle
        @onClick="(id) => $router.push(`/wallets/${id}`)"
      >
        <template #default="{ walletsItemsLimited }">
          <WalletsItem2
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            :walletId
            :wallet="walletItem"
            @click="$router.push(`/wallets/${walletId}`)"
            @filter="filterStore.toggleWalletId(walletId)"
          />
        </template>

        <template #toggle="{ stateLimit, limit, toggle }">
          <div
            :class="getStyles('item', ['link', 'rounded'])"
            class="mt-[-1px] min-h-[36px] flex-center text-xs py-2 px-2"
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
