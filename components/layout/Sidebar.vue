<template>
  <div
    class="
    hidden lg_block
    h-full w-64
    overflow-hidden overflow-y-auto
    bg-item-4 border-r border-item-5
  "
  >
    <div class="py-4 px-5">
      <nuxt-link to="/dashboard">
        <UiLogo class="w-16" />
      </nuxt-link>
    </div>

    <LayoutMenuSidebar class="pb-6 pt-2 px-2" />

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
