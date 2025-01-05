<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div
      class="flex-center h-full flex-col pt-10"
    >
      <UiTitle3 class="pb-4">
        {{ t('intro') }}
      </UiTitle3>

      <UiButtonBlue
        v-if="!walletsStore.hasItems"
        rounded
        @click="router.push('/wallets/new')"
      >
        {{ t("wallets.new") }}
      </UiButtonBlue>

      <UiButtonBlue
        v-else-if="!categoriesStore.hasItems"
        rounded
        @click="router.push('/categories/new')"
      >
        {{ t("categories.new") }}
      </UiButtonBlue>

      <UiButtonBlue
        v-else
        rounded
        @click="trnsFormStore.trnFormCreate()"
      >
        {{ t("createTrn") }}
      </UiButtonBlue>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  intro: To see statistics
  createTrn: Create your first Transaction
  welcome: Start creating

ru:
  intro: Чтобы увидеть статистику
  createTrn: Создайте свою первую Транзакцию
  welcome: Начать создание
</i18n>
