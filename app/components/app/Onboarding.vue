<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()

const introText = computed(() => {
  if (!walletsStore.hasItems)
    return t('onboarding.introWallets')

  if (!categoriesStore.hasItems)
    return t('onboarding.introCategories')

  return t('onboarding.intro')
})
</script>

<template>
  <div class="onboarding flex min-h-svh items-center justify-center">
    <div class="flex-center flex-col gap-6 px-4 text-center">
      <UiLogo size="lg" />

      <div class="flex flex-col gap-2">
        <p class="text-muted">
          {{ introText }}
        </p>
      </div>

      <UButton
        v-if="!walletsStore.hasItems"
        size="xl"
        class="min-w-52 justify-center rounded-full px-8 py-3"
        @click="router.push('/wallets/new?onboarding')"
      >
        {{ t('onboarding.actionWallet') }}
      </UButton>

      <UButton
        v-else-if="!categoriesStore.hasItems"
        size="xl"
        class="min-w-52 justify-center rounded-full px-8 py-3"
        @click="router.push('/categories/new?onboarding')"
      >
        {{ t('onboarding.actionCategory') }}
      </UButton>

      <UButton
        v-else
        size="xl"
        class="min-w-52 justify-center rounded-full px-8 py-3"
        @click="trnsFormStore.openFormForCreate()"
      >
        {{ t('onboarding.actionTrn') }}
      </UButton>
    </div>
  </div>
</template>

<style>
.bg-default:has(.onboarding) {
  background: transparent !important;
  border: none !important;
}
</style>
