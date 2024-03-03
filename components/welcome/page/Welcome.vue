<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const userStore = useUserStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const state = ref({
  step: 1,
  showCategoryForm: false,
  showWalletForm: false,
})

const newUserData = computed(() => !walletsStore.hasWallets || !categoriesStore.hasCategories)

watch(newUserData, () => {
  // if (!newUserData.value)
  //   useRouter().push('/')
}, { immediate: true })
</script>

<template lang="pug">
.grid.h-full(class="grid-rows-[auto,1fr,auto]")
  .max-w-xl.mx-auto.py-4.p-2.w-full.md_p-6
    .flex.justify-between
      AppLocaleSwitcher
      AppThemeSwitcher

  .h-full.grid.items-center.gap-8.py-4.px-3.h-full.overflow-hidden.overflow-y-auto
    .flex.flex-col.items-center.justify-center
      UiLogo

      .px-3.py-8(
        v-if="newUserData && userStore.user?.uid"
        class="min-w-[280px]"
      )
        Transition(name="fadeIn")
          WelcomeWalletForm(
            v-if="!walletsStore.hasWallets"
            @afterSave="state.showWalletForm = false"
          )

          WelcomeCategoryForm(
            v-else-if="walletsStore.hasWallets"
            @afterSave="state.showCategoryForm = false"
          )

  .p-4.md_p-6.grid.gap-2
    AppCopyright

    .cursor-pointer(
      @click="userStore.signOut"
    ) {{ $t('userLogout') }} {{ userStore.user?.email }}
</template>
