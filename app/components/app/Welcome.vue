<script setup lang="ts">
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnForm = useTrnForm()
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div
      class="flex-center h-full flex-col pt-10"
    >
      <UiTitle class="pb-4">
        {{ t("intro") }}
      </UiTitle>

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
        @click="trnForm.trnFormCreate()"
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
