<script setup lang="ts">
import { useTrnForm, useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const router = useRouter()
const $trnForm = useTrnFormStore()
const { trnFormCreate } = useTrnForm()

if (!$store.getters['wallets/hasWallets'] || !$store.getters['categories/hasCategories'])
  router.replace('/welcome')
</script>

<template lang="pug">
.h-full.p-4.flex-center.flex-col(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  .pb-4.text-skin-item-base-up.text-xl {{ $t('intro') }}

  SharedButton._text-center._blue2(
    :title="$t('create')"
    @onClick="trnFormCreate"
  )
</template>

<i18n lang="yaml">
en:
  intro: To see Statistics
  create: Create your first Transaction

ru:
  intro: Чтобы увидеть статистику
  create: Создайте свою первую Транзакцию
</i18n>
