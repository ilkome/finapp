<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import type { WalletId } from '~/components/wallets/types'

import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShowSidebar?: boolean
  isShowTrnForm?: boolean
}>()

const emit = defineEmits(['toggleSidebar'])

const colorMode = useColorMode()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isDemo } = useDemo()
const { t } = useI18n()
const { width } = useWindowSize()
</script>

<template>
  <div
    :class="{
      '': props.isShowTrnForm && props.isShowSidebar && width >= 767,
      'block w-72': props.isShowSidebar && width >= 767,
    }"
    class="fixed inset-y-0 left-0 z-10 hidden h-full w-12 overflow-hidden sm:block"
  >
    <!-- Small menu -->
    <LayoutSidebarMenu
      :isShowText="false"
      :class="{ 'md:hidden': props.isShowSidebar }"
      class="sm:align-center hidden h-full flex-col justify-center gap-1 sm:flex"
    />

    <div
      v-if="width >= 768 && props.isShowSidebar"
      class="grid h-full content-start gap-6 overflow-hidden overflow-y-auto"
    >
      <div class="flex items-center justify-between pl-4 pr-2 pt-5">
        <NuxtLink to="/dashboard" class="block cursor-default">
          <UiLogo class="w-16" />
        </NuxtLink>

        <UiItem1
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
        </UiItem1>
      </div>

      <div
        v-if="isDemo"
        class="px-4"
      >
        <UiButtonBlue @click="userStore.signOut">
          {{ t("demo.exit") }}
        </UiButtonBlue>
      </div>

      <LayoutSidebarMenu class="px-2 pb-2" />

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
              :activeItemId="(route.params.id as string)"
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

    <div class="absolute bottom-1 left-1 hidden w-full items-center md:flex">
      <UiItem1
        class="z-10 bg-foreground-2 text-4"
        @click="emit('toggleSidebar')"
      >
        <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
      </UiItem1>
    </div>
  </div>
</template>
