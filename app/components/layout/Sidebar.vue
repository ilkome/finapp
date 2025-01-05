<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import type { WalletId } from '~/components/wallets/types'

import { useDemo } from '~/components/demo/useDemo'
import { getStyles } from '~/components/ui/getStyles'
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
    :class="{ 'translate-x-20': props.isShowTrnForm }"
    class="bg-foreground-3 relative h-full overflow-hidden transition-all duration-300 ease-in-out"
  >
    <div class="absolute bottom-1 left-1 hidden w-full items-center md:flex">
      <UiItem1
        class="text-4 bg-foreground-3 z-10"
        @click="emit('toggleSidebar')"
      >
        <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
      </UiItem1>
    </div>

    <LayoutMenuSidebar
      :isShowTitle="false"
      class="sm:align-center hidden h-full flex-col justify-center gap-1 sm:flex"
      :class="{ 'md:hidden': props.isShowSidebar, '!': !props.isShowSidebar }"
    />

    <div
      v-if="width >= 768 && props.isShowSidebar"
      class="grid h-full min-w-72 content-start gap-6 overflow-hidden overflow-y-auto"
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
  </div>
</template>
