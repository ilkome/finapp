<script lang="ts" setup>
import { useUserStore } from '~/components/user/useUserStore'

const userStore = useUserStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <div
      v-if="userStore.currentUser"
      class="flex items-center gap-3 pb-4 text-sm text-item-2"
    >
      <img
        :src="userStore.currentUser?.photoURL"
        class="size-10 rounded-full"
      >

      {{ userStore.currentUser?.displayName }}<br>
      {{ userStore.currentUser?.email }}
    </div>
    <UiElement
      insideClasses="bg-item-4 min-h-[44px] max-w-lg"
      @click="userStore.signOut"
    >
      <template #leftIcon>
        <Icon name="lucide:log-out" size="20" />
      </template>
      <div>{{ t('userLogout') }}</div>
    </UiElement>
  </div>
</template>
