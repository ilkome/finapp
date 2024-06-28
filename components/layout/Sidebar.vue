<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const colorMode = useColorMode()
</script>

<template>
  <div
    class="
      hidden lg:block
      h-full min-w-72
      overflow-hidden overflow-y-auto
      bg-item-4 border-r border-item-5
    "
  >
    <div class="flex items-center justify-between pb-4 pt-3 pl-4 pr-2">
      <NuxtLink to="/dashboard">
        <UiLogo class="w-16" />
      </NuxtLink>

      <div>
        <Icon
          v-if="colorMode.preference !== 'dark'"
          :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
          name="carbon:light"
          size="18"
          @click="colorMode.preference = 'dark'"
        />
        <Icon
          v-if="colorMode.preference === 'dark'"
          :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
          name="carbon:moon"
          size="18"
          @click="colorMode.preference = 'light'"
        />
      </div>
    </div>

    <LayoutMenuSidebar class="pb-6 pt-4 px-2" />

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
          <WalletsItem
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            :walletId
            :wallet="walletItem"
            @click="$router.push(`/wallets/${walletId}`)"
          />
        </template>
      </WalletsList>
    </div>
  </div>
</template>
