<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const userStore = useUserStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const state = ref({
  showCategoryForm: false,
  showWalletForm: false,
  step: 1,
})

const newUserData = computed(() => !walletsStore.hasItems || !categoriesStore.hasCategories)

watch(newUserData, () => {
  // if (!newUserData.value)
  //   useRouter().push('/')
}, { immediate: true })
</script>

<template lang="html">
  <div class="grid h-full grid-rows-[auto,1fr,auto]">
    <div class="max-w-xl mx-auto py-4 p-2 w-full md:p-6">
      <div class="flex justify-between">
        <AppLocaleSwitcher />
        <AppThemeSwitcher />
      </div>
    </div>

    <div class="h-full grid items-center gap-8 py-4 px-3 overflow-hidden overflow-y-auto">
      <div class="flex flex-col items-center justify-center">
        <UiLogo />

        <div
          v-if="newUserData && userStore.user?.uid"
          class="px-3 py-8 min-w-[280px]"
        >
          <Transition name="fadeIn">
            <WelcomeWalletForm
              v-if="!walletsStore.hasItems"
              @afterSave="state.showWalletForm = false"
            />
            <WelcomeCategoryForm
              v-else-if="walletsStore.hasItems"
              @afterSave="state.showCategoryForm = false"
            />
          </Transition>
        </div>
      </div>
    </div>

    <div class="p-4 md:p-6 grid gap-2">
      <AppCopyright />
      <div
        class="cursor-pointer"
        @click="userStore.signOut"
      >
        {{ $t('userLogout') }} {{ userStore.user?.email }}
      </div>
    </div>
  </div>
</template>
