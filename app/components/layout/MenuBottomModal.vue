<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
import { useUserStore } from '~/components/user/useUser'

const { closeAllModals, isModalOpen } = useAppNav()
const { t } = useI18n()
const userStore = useUserStore()
const isDemo = useCookie('finapp.isDemo')

function stopDemoMode() {
  isDemo.value = 'false'
  useRouter().push('/login')
}
</script>

<template>
  <Teleport to="body">
    <LazyBaseBottomSheet2
      v-if="isModalOpen('menu')"
      isShow
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <div class="grid gap-3 bg-foreground-1 px-1 py-3">
        <!-- User -->
        <div
          v-if="isDemo"
          class="px-4 pt-2 pb-2"
          @click="stopDemoMode"
        >
          <div class="text-xl font-primary font-semibold">
            {{ t('demo.mode') }}
          </div>
        </div>

        <div
          v-if="userStore.user"
          class="px-4 pb-2"
        >
          <div class="text-xl font-primary font-semibold">
            {{ userStore.user?.displayName }}
          </div>
          <div class="text-sm">
            {{ userStore.user?.email }}
          </div>
        </div>

        <LayoutMenuSidebar />

        <div class="pl-2">
          <AppThemeSwitcher isShowSystem />
        </div>
      </div>
    </LazyBaseBottomSheet2>
  </Teleport>
</template>
