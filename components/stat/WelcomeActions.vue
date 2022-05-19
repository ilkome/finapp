<script setup lang="ts">
const { $store } = useNuxtApp()
const router = useRouter()

if (!$store.getters['wallets/hasWallets'] || !$store.getters['categories/hasCategories'])
  router.replace('/welcome')
</script>

<template lang="pug">
.h-full.p-4.flex-center.flex-col(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  .pb-4.text-skin-item-base-up.text-xl {{ $t('intro') }}

  SharedButton._text-center._blue2(
    :title="$t('create')"
    @onClick="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
  )
</template>

<i18n lang="json5">
{
  "en": {
    "intro": "To see Statistics",
    "create": "Create your first Transaction",
  },

  "ru": {
    "intro": "Чтобы увидеть статистику",
    "create": "Создайте свою первую Транзакцию",
  }
}
</i18n>
