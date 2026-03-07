<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletContextMenu } from '~/components/wallets/useWalletContextMenu'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import type { WalletId } from '../wallets/types'

const props = defineProps<{
  isShowSidebar?: boolean
}>()

const emit = defineEmits(['toggleSidebar'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isDemo } = useDemo()
const { t } = useI18n()
const { width } = useWindowSize()
const walletsStore = useWalletsStore()

const isShowLogoMenu = ref(false)
const { getWalletContextMenuItems } = useWalletContextMenu()
</script>

<template>
  <aside
    :class="{
      'w-72': props.isShowSidebar && width >= 767,
      'w-12': !props.isShowSidebar || width < 767,
    }"
    class="fixed inset-y-0 left-0 z-40 hidden h-dvh overflow-hidden transition-all duration-300 ease-in-out sm:block"
  >
    <div class="relative h-full overflow-hidden overflow-y-auto overscroll-contain">
      <!-- Small menu -->
      <LayoutSidebarMenu
        :isShowText="false"
        :class="{ 'md:hidden': props.isShowSidebar }"
        class="sm:align-center hidden h-full flex-col justify-center gap-1 sm:flex"
      />

      <div
        v-if="width >= 768 && props.isShowSidebar"
        class="grid h-full content-start gap-8 overflow-hidden overflow-y-auto"
      >
        <div class="px-2 pt-5">
          <BottomSheetOrDropdown
            :isOpen="isShowLogoMenu"
            isShowCloseBtn
            @openModal="isShowLogoMenu = true"
            @closeModal="isShowLogoMenu = false"
          >
            <template #trigger>
              <div
                class="interactive group-data-[state='open']:!bg-item-4 block cursor-default rounded-sm px-3 py-2"
              >
                <UiLogo />
              </div>
            </template>

            <template #content>
              <div class="grid gap-2 px-1 py-3 md:px-3">
                <UserViewLogout isShowSignOut />

                <div class="flex items-center gap-2">
                  <LocaleSwitcher />
                  <ThemeSwitcher />
                  <ThemePicker />
                </div>
              </div>
            </template>
          </BottomSheetOrDropdown>
        </div>

        <LayoutSidebarMenu class="px-2 pb-2" />

        <div v-if="walletsStore.sortedIds.length > 0" class="px-2 pb-6">
          <UiTitleSection class="!text-4 pb-2 pl-3">
            {{ t('wallets.title') }}
          </UiTitleSection>

          <WalletsList
            :limit="10"
            isShowToggle
          >
            <template #default="{ walletsIdsSorted, walletsItemsLimited }">
              <WalletsItem
                v-for="(walletItem, walletId) in walletsItemsLimited"
                :key="walletId"
                :activeItemId="(route.params.id as string)"
                :contextMenuItems="getWalletContextMenuItems(walletId as WalletId)"
                :lineWidth="1"
                :wallet="walletItem"
                :walletId
                class="group"
                isShowCreditLimit
                isShowRate
                isShowIcon
                @click="() => walletId === route.params.id ? router.push('/dashboard') : router.push(`/wallets/${walletId}`)"
              />

              <div
                v-if="walletsIdsSorted.length === 0"
                class="flex-center flex-col py-4"
              >
                <UiButtonAccent
                  rounded
                  @click="router.push('/wallets/new')"
                >
                  {{ t('wallets.new') }}
                </UiButtonAccent>
              </div>
            </template>
          </WalletsList>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 hidden w-full flex-col gap-2 md:flex">
        <div
          v-if="isDemo && props.isShowSidebar"
          class="px-4"
        >
          <UiButtonAccent @click="userStore.signOut">
            {{ t('demo.exit') }}
          </UiButtonAccent>
        </div>

        <UTooltip
          :text="t('app.toggleSidebar')"
          :kbds="['Meta', '\\']"
        >
          <UiActionButton
            class="text-4 z-10"
            @click="emit('toggleSidebar')"
          >
            <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
          </UiActionButton>
        </UTooltip>
      </div>
    </div>
  </aside>
</template>
