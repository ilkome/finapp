<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { WalletId } from '~/components/wallets/types'

const colorMode = useColorMode()

const props = defineProps<{
  isShow?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div
    :class="{ 'w-96': props.isShow }"
    class="hidden h-full min-w-72 content-start gap-6 overflow-hidden overflow-y-auto bg-foreground-3 lg:grid"
  >
    <div class="flex items-center justify-between pl-4 pr-2 pt-5">
      <NuxtLink to="/dashboard">
        <UiLogo class="w-16" />
      </NuxtLink>

      <div
        :class="getStyles('item', ['link', 'rounded', 'padding1', 'menu'])"
        @click="
          () =>
            (colorMode.preference =
              colorMode.preference === 'dark' ? 'light' : 'dark')
        "
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

    <LayoutMenuSidebar class="px-2" />

    <div class="px-2 pb-6">
      <UiTitle3 class="pb-2 pl-3">
        {{ t('wallets.title') }}
      </UiTitle3>

      <WalletsList
        :limit="10"
        isShowToggle
        @onClick="(id: WalletId) => router.push(`/wallets/${id}`)"
      >
        <template #default="{ walletsItemsLimited }">
          <WalletsItem
            v-for="(walletItem, walletId) in walletsItemsLimited"
            :key="walletId"
            :walletId
            :lineWidth="1"
            :wallet="walletItem"
            :activeItemId="route.params.id"
            isShowIcons
            @click="router.push(`/wallets/${walletId}`)"
          />
        </template>
      </WalletsList>
    </div>
  </div>
</template>
