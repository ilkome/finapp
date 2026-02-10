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
    return t('welcome.introWallets')
  }

  if (!categoriesStore.hasItems) {
    return t('welcome.introCategories')
  }

  return t('welcome.intro')
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
        {{ t('welcome.createTrn') }}
      </UiButtonAccent>
    </div>
  </UiPage>
</template>
