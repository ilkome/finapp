<script setup lang="ts">
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

const { t } = useI18n()
const { trnFormCreate } = useTrnForm()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    v-if="walletsStore.hasWallets && categoriesStore.hasCategories"
    class="flex-center h-full flex-col"
  >
    <UiTitle class="pb-2">
      {{ t("intro") }}
    </UiTitle>

    <UiButtonBlue maxWidth @click="() => trnFormCreate()">
      {{ t("create") }}
    </UiButtonBlue>
  </div>
</template>

<i18n lang="yaml">
en:
  intro: To see Statistics
  create: Create your first Transaction

ru:
  intro: Чтобы увидеть статистику
  create: Создайте свою первую Транзакцию
</i18n>
