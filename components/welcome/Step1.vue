<script setup lang="ts">
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits<{
  (e: 'showWalletForm'): void
  (e: 'showCategoryForm'): void
}>()

const userStore = useUserStore()
const walletsStore = useWalletsStore()
</script>

<template lang="pug">
.tab
  .tab__content
    .header.grid.gap-3
      .header__desc {{ $t('app.desc') }}
      .header__user(
        @click="userStore.signOut"
      ) {{ $t('userLogout') }} {{ userStore.user?.email }}

    .options
      .options__item
        .options__desc {{ $t('welcome.create.text') }}
        .flex-center
          UiButtonBlue(
            v-if="!walletsStore.hasWallets"
            maxWidth
            @click="emit('showWalletForm')"
          ) {{ $t('wallets.createNewTitle') }}

          UiButtonBlue(
            v-if="walletsStore.hasWallets"
            maxWidth
            @click="emit('showCategoryForm')"
          ) {{ $t('categories.createNewTitle') }}
</template>
