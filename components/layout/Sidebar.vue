<script setup lang="ts">
// import { useCategoriesStore } from '~/components/categories/useCategories'

// const categoriesStore = useCategoriesStore()
import { getStyles } from '~/components/ui/getStyles'

const colorMode = useColorMode()
</script>

<template>
  <div
    class="
    hidden lg_block
    h-full w-64
    overflow-hidden overflow-y-auto
    bg-item-4 border-r border-item-5
  "
  >
    <div class="flex items-center justify-between pb-4 pt-3 pl-4 pr-2">
      <nuxt-link to="/dashboard">
        <UiLogo class="w-16" />
      </nuxt-link>

      <div :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])">
        <Icon
          v-if="colorMode.preference === 'light'"
          name="carbon:light"
          size="18"
          @click="colorMode.preference = 'dark'"
        />
        <Icon
          v-if="colorMode.preference === 'dark'"
          name="carbon:moon"
          size="18"
          @click="colorMode.preference = 'light'"
        />
      </div>
    </div>

    <LayoutMenuSidebar class="pb-6 pt-2 px-2" />

    <!-- <div class="grid gap-1 pb-6 px-2">
      <UiTitle3 class="pl-3">
        {{ $t('categories.title') }}
      </UiTitle3>

      <CategoriesSelector2
        class="!p-0"
        :ids="categoriesStore.categoriesRootIds"
        @onSelected="id => $router.push(`/categories/${id}`)"
      />
    </div> -->

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
