<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useDemo } from '~/components/demo/useDemo'
import { getStyles } from '~/components/ui/getStyles'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShow?: boolean
}>()

const colorMode = useColorMode()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isDemo } = useDemo()
const { t } = useI18n()
</script>

<template>
  <div
    :class="{ 'translate-x-20': props.isShow }"
    class="bg-foreground-3 hidden h-full min-w-72 content-start gap-6 overflow-hidden overflow-y-auto transition-all duration-300 ease-in-out md:grid"
  >
    <div class="flex items-center justify-between pl-4 pr-2 pt-5">
      <NuxtLink to="/dashboard" class="cursor-default">
        <UiLogo class="w-16" />
      </NuxtLink>

      <div
        :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
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

    <div
      v-if="isDemo"
      class="px-4"
    >
      <UiButtonBlue @click="userStore.signOut">
        {{ t("demo.exit") }}
      </UiButtonBlue>
    </div>

    <LayoutMenuSidebar class="px-2 pb-2" />

    <div class="px-2 pb-6">
      <UiTitle3 class="pb-2 pl-3">
        {{ t('wallets.title') }}
      </UiTitle3>

      <WalletsList
        :limit="10"
        isShowToggle
        @onClick="(id: WalletId) => router.push(`/wallets/${id}`)"
      >
        <template #default="{ walletsIdsSorted, walletsItemsLimited }">
          <WalletsItem
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            :walletId
            :lineWidth="1"
            :wallet="walletItem"
            :activeItemId="route.params.id as string"
            class="group"
            isShowIcon
            @click="() => walletId === route.params.id ? router.push('/dashboard') : router.push(`/wallets/${walletId}`)"
          />

          <div
            v-if="walletsIdsSorted.length === 0"
            class="px-2"
          >
            <UiButtonBlue @click="router.push('/wallets/new')">
              {{ t("wallets.new") }}
            </UiButtonBlue>
          </div>
        </template>
      </WalletsList>
    </div>
  </div>
</template>
