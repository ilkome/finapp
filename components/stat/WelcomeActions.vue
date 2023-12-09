<script setup lang="ts">
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const { trnFormCreate } = useTrnForm()
</script>

<template lang="pug">
.h-full.flex-center.flex-col(
  v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
)
  UiTitle.pb-2 {{ $t('intro') }}

  UiButtonBlue(
    @click="trnFormCreate"
    maxWidth
  ) {{ $t('create')}}
</template>

<i18n lang="yaml">
en:
  intro: To see Statistics
  create: Create your first Transaction

ru:
  intro: Чтобы увидеть статистику
  create: Создайте свою первую Транзакцию
</i18n>
