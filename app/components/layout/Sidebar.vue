<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { WalletId } from '~/components/wallets/types'

const colorMode = useColorMode()
</script>

<template>
  <div
    class="
      hidden lg:grid gap-6 content-start
      h-full min-w-72
      overflow-hidden overflow-y-auto
      bg-foreground-3 -border-r border-item-3
    "
  >
    <div class="flex items-center justify-between pb-0 pt-5 pl-4 pr-2">
      <NuxtLink to="/dashboard">
        <UiLogo class="w-16" />
      </NuxtLink>

      <div
        :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
        class="text-prima"
        @click="() => colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'"
      >
        <Icon
          v-if="colorMode.preference !== 'dark'"
          name="carbon:light"
          size="18"
        />
        <Icon
          v-if="colorMode.preference === 'dark'"
          name="carbon:moon"
          size="18"
        />
      </div>
    </div>

    <!-- <div class="px-2 flex">
      <LayoutMenuSidebarItem
        :item="{ component: 'UiIconAdd', name: $t('trnForm.createTrn') }"
        class="is-trnForm flex-center is-bigger grow"
        menuId="trnForm"
      />
    </div> -->

    <!-- <div class="grid gap-2">
      <UiTitle3 class="pl-3">
        {{ $t('wallets.title') }}
      </UiTitle3>
    </div> -->
    <LayoutMenuSidebar class="px-2" />

    <div class="pb-6 px-2">
      <UiTitle3
        class="pl-3"
        :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
      >
        {{ $t('wallets.title') }}
      </UiTitle3>

      <WalletsList
        :limit="10"
        isShowToggle
        @onClick="(id: WalletId) => $router.push(`/wallets/${id}`)"
      >
        <template #default="{ walletsItemsLimited }">
          <WalletsItem
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            :walletId
            :lineWidth="1"
            :wallet="walletItem"
            @click="$router.push(`/wallets/${walletId}`)"
          />
        </template>
      </WalletsList>
    </div>
  </div>
</template>
