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
  if (!walletsStore.hasItems) {
    return t('introWallets')
  }

  if (!categoriesStore.hasItems) {
    return t('introCategories')
  }

  return t('intro')
})
</script>

<template>
  <UiPage class="flex h-full items-center justify-center">
    <div
      class="flex-center h-full flex-col pt-10"
    >
      <UiTitle3 class="pb-4">
        {{ introText }}
      </UiTitle3>

      <UiButtonAccent
        v-if="!walletsStore.hasItems"
        rounded
        @click="router.push('/wallets/new')"
      >
        {{ t('wallets.new') }}
      </UiButtonAccent>

      <UiButtonAccent
        v-else-if="!categoriesStore.hasItems"
        rounded
        @click="router.push('/categories/new')"
      >
        {{ t('categories.new') }}
      </UiButtonAccent>

      <UiButtonAccent
        v-else
        rounded
        @click="trnsFormStore.trnFormCreate()"
      >
        {{ t('createTrn') }}
      </UiButtonAccent>
    </div>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  intro: To see statistics
  introWallets: To see statistics add your first Wallet
  introCategories: To see statistics add your first Category
  createTrn: Create your first Transaction
  welcome: Start creating

ru:
  intro: Чтобы увидеть статистику
  introWallets: Чтобы увидеть статистику добавьте первый кошелек
  introCategories: Чтобы увидеть статистику добавьте первую категорию
  createTrn: Создайте свою первую Транзакцию
  welcome: Начать создание
</i18n>
