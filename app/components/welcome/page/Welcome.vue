<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

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
  if (!newUserData.value)
    useRouter().push('/dashboard')
}, { immediate: true })
</script>

<template>
  <div
    class="mx-auto grid h-full w-full max-w-xl grid-rows-[auto,1fr,auto] p-2 py-4 md_p-6 gap-4"
  >
    <div class="flex flex-wrap gap-2 justify-between items-start">
      <AppLocaleSwitcher />
      <AppThemeSwitcher class="justify-end" />
    </div>

    <div
      class="grid h-full gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="pb-10">
        <UiLogo />

        <div
          v-if="newUserData && userStore.user?.uid"
          class="grow w-full py-8"
        >
          <WelcomeWalletForm
            v-if="!walletsStore.hasItems"
            @afterSave="state.showWalletForm = false"
          />
          <WelcomeCategoryForm
            v-else-if="walletsStore.hasItems"
            @afterSave="state.showCategoryForm = false"
          />
        </div>
      </div>
    </div>

    <div class="flex-center">
      <div
        @click="userStore.signOut"
      >
        {{ $t('userLogout') }} {{ userStore.user?.email }}
      </div>
    </div>
  </div>
</template>
